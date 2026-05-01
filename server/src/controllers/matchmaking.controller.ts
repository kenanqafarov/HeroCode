import { Request, Response } from 'express';
import Match from '../models/Match';
import Question from '../models/Question';
import { AuthRequest } from '../middleware/auth.middleware';

const waitingQueue: string[] = [];
const QUESTION_COUNT = 5;

const toClientQuestion = (question: any) => ({
  id: String(question._id ?? question.id ?? ''),
  title: question.title,
  description: question.description,
  functionSignature: question.functionSignature,
  testCases: question.testCases,
  difficulty: question.difficulty,
  hint: question.hint
});

const fetchOrderedQuestions = async (questionIds: Array<string | any>) => {
  if (!questionIds.length) return [];
  const ids = questionIds.map((id) => String(id));
  const docs = await Question.find({ _id: { $in: ids } }).lean();
  const docMap = new Map(docs.map((doc: any) => [String(doc._id), doc]));
  return ids.map((id) => docMap.get(id)).filter(Boolean);
};

const sampleQuestions = async () => {
  return Question.aggregate([{ $sample: { size: QUESTION_COUNT } }]);
};

export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const activeMatch = await Match.findOne({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: { $in: ['Waiting', 'Active'] }
    });

    if (activeMatch) {
      return res.json({ success: true, data: activeMatch, message: 'Artıq aktiv matçınız var.' });
    }

    if (waitingQueue.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Artıq növbədəsiniz' });
    }

    const opponentId = waitingQueue.find((id) => id !== userId);
    if (opponentId) {
      const idx = waitingQueue.indexOf(opponentId);
      if (idx !== -1) waitingQueue.splice(idx, 1);

      const match = await Match.create({
        player1Id: opponentId,
        player2Id: userId,
        status: 'Active',
      });

      return res.json({ success: true, data: match, message: 'Match tapıldı' });
    }

    waitingQueue.push(userId);
    return res.json({ success: true, message: 'Queue-yə qoşuldunuz. Rəqib gözlənilir.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveQueue = async (req: AuthRequest, res: Response) => {
  const idx = waitingQueue.indexOf(req.user!.id);
  if (idx !== -1) waitingQueue.splice(idx, 1);

  res.json({ success: true, message: 'Queue-dən çıxdınız' });
};

export const getMyMatch = async (req: AuthRequest, res: Response) => {
  try {
    const matchId = typeof req.query.matchId === 'string' ? req.query.matchId : undefined;
    const match = await Match.findOne({
      ...(matchId ? { _id: matchId } : {}),
      $or: [
        { player1Id: req.user!.id },
        { player2Id: req.user!.id }
      ],
      status: { $in: ['Waiting', 'Active'] }
    });

    if (!match) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: match });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const attack = async (req: AuthRequest, res: Response) => {
  try {
    const { damage = 10 } = req.body;
    const userId = req.user!.id;

    const match = await Match.findOne({
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: 'Active'
    });

    if (!match) {
      return res.status(404).json({ success: false, message: 'Aktiv matç tapılmadı' });
    }

    if (match.player1Id.toString() === userId) {
      match.player2Health = Math.max(0, match.player2Health - damage);
    } else {
      match.player1Health = Math.max(0, match.player1Health - damage);
    }

    if (match.player1Health <= 0 || match.player2Health <= 0) {
      match.status = 'Finished';
      match.winnerId = match.player1Health > 0 ? match.player1Id : match.player2Id;
      match.endedAt = new Date();
    }

    await match.save();

    res.json({ success: true, data: match });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveMatch = async (req: AuthRequest, res: Response) => {
  try {
    const match = await Match.findOneAndUpdate(
      { $or: [{ player1Id: req.user!.id }, { player2Id: req.user!.id }], status: 'Active' },
      {
        status: 'Finished',
        endedAt: new Date(),
        winnerId: null // Bu endpoint-ə socket event emit etmiş tərəfdən soruşturulmadığından winnerId dəyişməyəcəkdir
      },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ success: false, message: 'Aktiv matç tapılmadı' });
    }

    res.json({ success: true, message: 'Matçdan çıxdınız' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const startGameQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const matchId = typeof req.query.matchId === 'string' ? req.query.matchId : undefined;
    const mockQuestions = [
      { id: "q1", description: "Verilmiş ədədi 2-yə vur", functionSignature: "function attack(a) {}", testCases: [{ input: 5, output: 10 }] },
      { id: "q2", description: "Ən böyük ədədi tap", functionSignature: "function attack(arr)", testCases: [{ input: [3, 1, 4], output: 4 }] }
    ];

    const match = await Match.findOne({
      ...(matchId ? { _id: matchId } : {}),
      $or: [{ player1Id: userId }, { player2Id: userId }],
      status: 'Active'
    });

    if (!match) {
      if (matchId) {
        return res.status(404).json({ success: false, message: 'Matç tapılmadı' });
      }
      return res.json({ success: true, data: mockQuestions });
    }

    const existingIds = match.questions || [];
    let resolvedQuestions = await fetchOrderedQuestions(existingIds);

    if (existingIds.length === 0 || resolvedQuestions.length !== existingIds.length) {
      const sampled = await sampleQuestions();
      if (sampled.length > 0) {
        const newIds = sampled.map((q: any) => String(q._id));
        const updateFilter = existingIds.length
          ? { _id: match._id, questions: existingIds }
          : { _id: match._id, $or: [{ questions: { $exists: false } }, { questions: { $size: 0 } }] };

        const updated = await Match.findOneAndUpdate(
          updateFilter,
          { $set: { questions: newIds } },
          { new: true }
        );

        if (updated) {
          resolvedQuestions = sampled;
        } else {
          const refreshed = await Match.findById(match._id).lean();
          const refreshedIds = refreshed?.questions || [];
          if (refreshedIds.length > 0) {
            resolvedQuestions = await fetchOrderedQuestions(refreshedIds);
          } else {
            resolvedQuestions = sampled;
          }
        }
      }
    }

    const data = resolvedQuestions.length > 0
      ? resolvedQuestions.map(toClientQuestion)
      : mockQuestions;

    return res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

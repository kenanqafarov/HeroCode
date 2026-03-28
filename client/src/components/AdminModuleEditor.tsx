import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Save, Eye, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ModuleFormProps {
  onClose: () => void;
  onSave: (module: any) => void;
  initialData?: any;
}

const AdminModuleEditor = ({ onClose, onSave, initialData }: ModuleFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    language: initialData?.language || 'JavaScript',
    difficulty: initialData?.difficulty || 'beginner',
    description: initialData?.description || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    questions: initialData?.questions || []
  });

  const [newTag, setNewTag] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });
  const [preview, setPreview] = useState(false);

  const languages = ['JavaScript', 'Python', 'Rust', 'Go', 'TypeScript', 'Java', 'C++', 'C#', 'Ruby', 'PHP'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleAddQuestion = () => {
    if (editingQuestion !== null) {
      const updated = [...formData.questions];
      updated[editingQuestion] = currentQuestion;
      setFormData({ ...formData, questions: updated });
    } else {
      setFormData({
        ...formData,
        questions: [...formData.questions, currentQuestion]
      });
    }
    resetQuestion();
  };

  const resetQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(formData.questions[index]);
    setEditingQuestion(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `${API_BASE}/modules/${initialData._id}` : `${API_BASE}/modules`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save module');

      const data = await response.json();
      toast.success(initialData ? 'Module updated!' : 'Module created!');
      onSave(data.data);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving module');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0f1713] border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0c120f] border-b border-white/10 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? 'Edit Module' : 'Create New Module'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Module Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., SQL JOINs & Aggregation"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-all"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none transition-all"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the module..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300">Content (HTML/Markdown) *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter lesson content here..."
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all font-mono text-sm"
            />
            <p className="text-xs text-gray-500">Support HTML and Markdown formatting</p>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={handleAddTag}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 border-t border-white/10 pt-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Quiz Questions</h3>
              <span className="text-sm text-gray-400">{formData.questions.length} questions</span>
            </div>

            {/* Question Form */}
            <div className="bg-black/20 border border-white/10 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="Enter question..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">Options</label>
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === idx}
                      onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[idx] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Explanation</label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddQuestion}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingQuestion !== null ? 'Update Question' : 'Add Question'}
                </button>
                {editingQuestion !== null && (
                  <button
                    onClick={resetQuestion}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              {formData.questions.map((q: Question, idx: number) => (
                <div
                  key={idx}
                  className="bg-black/20 border border-white/10 rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Q{idx + 1}: {q.question.substring(0, 60)}...</p>
                    <p className="text-sm text-gray-400">
                      Correct answer: {String.fromCharCode(65 + q.correctAnswer)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(idx)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0c120f] border-t border-white/10 px-8 py-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <Save size={16} />
            {initialData ? 'Update Module' : 'Create Module'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminModuleEditor;

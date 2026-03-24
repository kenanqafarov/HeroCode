import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';
import { blogAPI } from '../../services/api';
import { toast } from 'sonner';

interface CommentProps {
  comment: Comment;
  blogId: string;
  onReplyAdded: () => void; // refresh üçün
}

const CommentItem: React.FC<CommentProps> = ({ comment, blogId, onReplyAdded }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);

    try {
      await blogAPI.addComment(blogId, { text: replyText, parentId: comment._id });
      toast.success('Reply added!');
      setReplyText('');
      setShowReplyInput(false);
      onReplyAdded(); // parent-i refresh et
    } catch (err) {
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-6 border-l-2 border-gray-200 dark:border-slate-700 pl-4 mt-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {comment.user[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{comment.user}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.text}</p>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
          >
            <MessageCircle size={14} /> Reply
          </button>

          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-4 py-2 text-sm rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleReply}
                disabled={loading || !replyText.trim()}
                className="px-4 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recursive replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              blogId={blogId}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentSectionProps {
  blogId: string;
  comments: Comment[];
  onCommentsUpdated: (newComments: Comment[]) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ blogId, comments, onCommentsUpdated }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);

    try {
      const res = await blogAPI.addComment(blogId, { text: newComment, parentId: null });
      if (res.success) {
        onCommentsUpdated(res.data);
        setNewComment('');
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle /> Comments ({comments.length})
      </h3>

      {/* New Comment Input */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          className="px-6 bg-primary text-white rounded-2xl font-medium disabled:opacity-50"
        >
          Post
        </button>
      </div>

      {/* Comments Tree */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            blogId={blogId}
            onReplyAdded={() => {
              // Blog-u yenidən fetch et və ya parent-dən props ilə yenilə
              // Sadəlik üçün bütün blog-u yenidən fetch etməyi tövsiyə edirəm
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
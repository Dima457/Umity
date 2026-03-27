// components/CommentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { LikesAPIComment } from '@/lib/api';

interface Comment {
  id: string;
  text: string;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;      
  isLikedByMe: boolean;    
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
}

export default function CommentModal({ isOpen, onClose, postId, postAuthor }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLikeComment = async (commentId: string, index: number) => {
    const comment = comments[index];
    const oldIsLiked = comment.isLikedByMe;
    const oldLikesCount = comment.likesCount;

    const updatedComments = [...comments];
    updatedComments[index] = {
      ...comment,
      isLikedByMe: !oldIsLiked,
      likesCount: oldIsLiked ? oldLikesCount - 1 : oldLikesCount + 1
    };
    setComments(updatedComments);
    
    try {
      if (oldIsLiked) {
        await LikesAPIComment.unLikeComment(commentId);
      } else {
        await LikesAPIComment.LikeComment(commentId);
      }
    } catch (error) {
      setComments(comments);
      console.error('Ошибка:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const commentsData = await response.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId));
      } else {
        alert('Ошибка при удалении комментария');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Ошибка при удалении комментария');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D85D3F]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        Комментарии @{postAuthor}
      </h3>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-[#D85D3F] transition-colors p-1 hover:bg-gray-100 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div className="space-y-4 mb-6">
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={comment.id} className="bg-[#FDF8F6] rounded-xl p-4 transition-all duration-200 hover:shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-[#D85D3F] hover:underline cursor-pointer">@{comment.author.username}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.text}</p>
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
              <button 
                onClick={() => handleLikeComment(comment.id, index)}
                className="flex items-center space-x-1 group transition-all duration-200"
              >
                <span className="text-xl transform group-hover:scale-110 transition-transform">
                  {comment.isLikedByMe ? '❤️' : '🤍'}
                </span>
                <span className={`text-sm font-medium ${comment.isLikedByMe ? 'text-[#D85D3F]' : 'text-gray-500'}`}>
                  {comment.likesCount}
                </span>
              </button>
              
              <button 
                onClick={() => deleteComment(comment.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                title="Удалить комментарий"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Пока нет комментариев</p>
          <p className="text-sm mt-1">Будьте первым!</p>
        </div>
      )}
    </div>

    <div className="flex space-x-3 pt-4 border-t border-gray-100">
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Напишите комментарий..."
        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-transparent transition-all duration-200"
        onKeyPress={(e) => e.key === 'Enter' && addComment()}
      />
      <button 
        onClick={addComment}
        disabled={loading || !newComment.trim()}
        className="bg-[#D85D3F] hover:bg-[#C24D32] disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Отпр</span>
          </>
        )}
      </button>
    </div>
  </div>
</div>
  );
}
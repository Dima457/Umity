// components/CommentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Comment {
  id: string;
  text: string;
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
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

  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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
        fetchComments(); // Обновляем комментарии
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Комментарии к посту @{postAuthor}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        {/* Список комментариев */}
        <div className="space-y-4 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="border-b pb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">@{comment.author.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center">Пока нет комментариев</p>
          )}
        </div>

        {/* Форма добавления комментария */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите комментарий..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && addComment()}
          />
          <button 
            onClick={addComment}
            disabled={loading || !newComment.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? '...' : 'Отпр'}
          </button>
        </div>
      </div>
    </div>
  );
}
// components/CommentModal.tsx
'use client';

import { useState, useEffect, SetStateAction } from 'react';
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
  

  const handleLikeComment = async (commentId:string, index:number) => {
      const comment = comments[index];
      const oldIsLiked = comment.isLikedByMe;
      const oldLikesCount = comment.likesCount;

      const updatedComments = [...comments];  // копия массива
updatedComments[index] = {              // замена по индексу
    ...comment,                          // копия старого коммента
    isLikedByMe: !oldIsLiked,            // новое значение
    likesCount: oldIsLiked ? oldLikesCount - 1 : oldLikesCount + 1  // новое значение
};
setComments(updatedComments);
      try{
        if(oldIsLiked){
          await LikesAPIComment.unLikeComment(commentId);
        }else{
          await LikesAPIComment.LikeComment(commentId);
        }
      }catch(error){
        setComments(comments);
        console.error('Ошибка:', error);
      }
    };

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
         {comments.map((comment,index) => (
  <div key={comment.id} className="border-b pb-3">
    <div className="flex justify-between items-start mb-1">
      <span className="font-medium">@{comment.author.username}</span>
      <span className="text-xs text-gray-500">
        {new Date(comment.createdAt).toLocaleDateString()}
      </span>
    </div>
    <p className="text-gray-700">{comment.text}</p>
    
    {/* Блок лайков и удаления */}
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center space-x-2">
        <button onClick={() => handleLikeComment(comment.id, index)}>
    {comment.isLikedByMe ? '❤️' : '🤍'}
  
  
          
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          
        </button>
        <span className="text-sm text-gray-600">{comment.likesCount}</span>
      </div>
      
      <button 
        className="text-gray-400 hover:text-red-600 transition-colors"
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
))}
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
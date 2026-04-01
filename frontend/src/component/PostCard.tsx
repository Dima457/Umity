// components/PostCard.tsx
'use client'

import { useState, useEffect } from 'react';
import CommentModal from './CommentModal';
import { likesApI } from '@/lib/api';
import { isMfcUser } from '../../mfc.config';

export interface Post {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likesCount: number;      
  isLikedByMe: boolean;    
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void; 
  showDeleteButton?: boolean;
  onUserClick?: (userId: string) => void 
}
 
export default function PostCard({ post, onDelete, showDeleteButton = false, onUserClick }: PostCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);

  const isMfcPost = isMfcUser(post.author.username);

  useEffect(() => {
    setLikesCount(post.likesCount);
    setIsLiked(post.isLikedByMe);
  }, [post.likesCount, post.isLikedByMe]);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  }

  const handleLike = async () => {
    const oldIsLiked = isLiked;
    const oldLikesCount = likesCount;

    setIsLiked(!oldIsLiked);
    setLikesCount(oldIsLiked ? oldLikesCount - 1 : oldLikesCount + 1);

    try {
      if (oldIsLiked) {
        await likesApI.unlikePost(post.id);
      } else {
        await likesApI.likesPost(post.id);
      }
    } catch (error) {
      setIsLiked(oldIsLiked);
      setLikesCount(oldLikesCount);
      console.error('Ошибка:', error);
    }
  };

  const handleUserProfileClick = () => {
    if (onUserClick) {
      onUserClick(post.author.id);
    }
  };

  return (
    <div className={`group bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-md mx-auto relative ${
      isMfcPost 
        ? 'border-blue-400 border-l-4 shadow-blue-100 hover:shadow-blue-200' 
        : 'border-[#E5E5E5] hover:border-[#D85D3F]/30'
    }`}>
      
      {showDeleteButton && (
        <div 
          className="absolute top-3 right-3 z-50"
          onMouseEnter={() => setShowDeleteBtn(true)}
          onMouseLeave={() => setShowDeleteBtn(false)}
          onClick={() => setShowDeleteBtn(!showDeleteBtn)}
        >
          <button 
            onClick={handleDelete}
            className={`bg-[#2D2D2D] bg-opacity-70 hover:bg-[#D85D3F] text-white w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
              showDeleteBtn ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
            }`}
            title="Удалить пост"
          >
            ✕
          </button>
        </div>
      )}
      
      {post.image && (
        <img 
          src={post.image} 
          alt="Post image" 
          className="w-full h-full object-cover"
        />
      )}
      
      <div className={`p-6 ${isMfcPost ? 'bg-blue-50/30' : ''}`}>
        {post.title && (
          <h3 className="text-xl font-semibold text-[#2D2D2D] mb-3 line-clamp-2">
            {post.title}
          </h3>
        )}
        
        {post.content && (
          <p className="text-[#6B6B6B] mb-4 line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserProfileClick}
          >
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E5E5E5]"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isMfcPost ? 'bg-blue-500' : 'bg-gradient-to-r from-[#D85D3F] to-[#E87A5F]'
              }`}>
                <span className="text-white text-sm font-medium">
                  {post.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isMfcPost ? 'text-blue-600' : 'text-[#2D2D2D]'}`}>
                @{post.author.username}
              </span>
              {isMfcPost && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  МФЦ
                </span>
              )}
            </div>
          </div>
          
          <span className="text-xs text-[#9B9B9B]">
            {new Date(post.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 pt-4 border-t border-[#E5E5E5]">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-[#FEF2F0] text-[#D85D3F] border border-[#D85D3F]' 
                : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#EBEBEB] hover:text-[#D85D3F]'
            }`}
          >
            <span className={`text-lg ${isLiked ? 'text-[#D85D3F]' : 'text-[#9B9B9B]'}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          
          <button 
            onClick={() => {
              console.log('open comments for post', post.id);  
              setIsCommentModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#EBEBEB] hover:text-[#D85D3F] transition-colors duration-200"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">Комментировать</span>
          </button>
        </div>
      </div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post.id}
        postAuthor={post.author.username}
      />
    </div>
  );
}
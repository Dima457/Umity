'use client'
//* и без подробних коментов я знаю все здесь
import { useState,useEffect } from 'react';
import CommentModal from './CommentModal';
import { likesApI } from '@/lib/api';

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
  onUserClick?: (userId:string)=>void 
}
 
export default function PostCard({ post ,onDelete,showDeleteButton=false,onUserClick }: PostCardProps) {
  
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe);


  //useEffect(() => {
 // setLikesCount(post.likesCount);
 // setIsLiked(post.isLikedByMe);
//}, [post.likesCount, post.isLikedByMe]);


  const handleDelete= ()=>{
    if(onDelete){
      onDelete(post.id);
    }
  }

  const handleLike = async () => {
    const oldIsLiked = isLiked;
    const oldLikesCount = likesCount;

    setIsLiked(!oldIsLiked);
    setLikesCount(oldIsLiked?oldLikesCount-1:oldLikesCount+1);

    try{
      if(oldIsLiked){
        await likesApI.unlikePost(post.id);
      }else{
        await likesApI.likesPost(post.id);
      }
    }catch(error){
      setIsLiked(oldIsLiked);
      setLikesCount(oldLikesCount);
      console.error('Ошибка:', error);
    }
  };
  const handleUserProfileClick = ()=>{
    if(onUserClick){
      onUserClick(post.author.id);
    }
  };
  return (
    <div className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full max-w-md mx-auto relative">
      
      {/* Кнопка удаления (только в своем профиле) */}
      {showDeleteButton && (
        <div 
            className="absolute top-3 right-3 z-50"
            onMouseEnter={() => setShowDeleteBtn(true)}
            onMouseLeave={() => setShowDeleteBtn(false)}
            onClick={() => setShowDeleteBtn(!showDeleteBtn)}>
          <button 
            onClick={handleDelete}
           className={`bg-black bg-opacity-50 text-white w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${
      showDeleteBtn ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
    }`}
            title="Удалить пост"
          >
            ✕
          </button>
        </div>
      )}
      {/* Изображение */}
      {post.image && (
        <img 
          src={post.image} 
          alt="Post image" 
          className="w-full h-full object-cover"
        />
      )}
      
      <div className="p-6">
        {/* Заголовок */}
        {post.title && (
          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
            {post.title}
          </h3>
        )}
        
        {/* Описание */}
        {post.content && (
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        )}
        
        {/* Автор и дата */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserProfileClick}
          >
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {post.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              @{post.author.username}
            </span>
          </div>
          
          <span className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
        
        {/* Действия */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className={`text-lg ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
          
          {/* 🔥 ОБНОВЛЕННАЯ кнопка комментариев */}
          <button 

            onClick={() => {console.log('open comments for post', post.id);  setIsCommentModalOpen(true)}}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">Комментировать</span>
          </button>
        </div>
        
      </div>

      {/* 🔥 ДОБАВИМ модалку комментариев */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post.id}
        postAuthor={post.author.username}
      />
        
      </div>
      
    
  );
}

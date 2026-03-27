// app/users/[userId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/component/PostCard';
import { Post } from '@/component/PostCard';
import { API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
}

export default function PublicProfile() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
      fetchUserPosts(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${id}/profile`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserPosts = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user/${id}`);
      const userPosts = await response.json();
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F6] py-8">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Шапка профиля */}
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D85D3F] to-[#C24D32] flex items-center justify-center overflow-hidden shadow-md">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
          {user.bio ? (
            <p className="text-gray-600 mt-1">{user.bio}</p>
          ) : (
            <p className="text-gray-400 mt-1 italic">Нет описания</p>
          )}
        </div>
      </div>
    </div>

    {/* Посты пользователя */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D85D3F]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        Посты пользователя
      </h2>
      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
        {posts.length} {posts.length === 1 ? 'пост' : posts.length < 5 ? 'поста' : 'постов'}
      </span>
    </div>
    
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post}
            showDeleteButton={false}
          />
        ))
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500">У пользователя пока нет постов</p>
        </div>
      )}
    </div>
  </div>
</div>
  );
}
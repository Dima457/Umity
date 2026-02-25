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
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Шапка профиля */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">@{user.username}</h1>
              {user.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* Посты пользователя */}
        <h2 className="text-xl font-semibold mb-4">Посты пользователя</h2>
        <div>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              showDeleteButton={false} // ← В публичном профиле нельзя удалять
            />
          ))}
        </div>
      </div>
    </div>
  );
}
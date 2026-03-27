'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/component/PostCard';
import PostCard from '@/component/PostCard';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import StoriesBar from '@/component/StoriesBar';
import StoryViewer from '@/component/StoryViewer';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState<{ userId: string; username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('🟡 Загружаю посты...');
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      console.log('🔗 URL запроса:', `${API_BASE_URL}/posts`);
      const response = await fetch(`${API_BASE_URL}/posts`);
      console.log('📡 Статус ответа:', response.status);
      const allPosts = await response.json();
      console.log('📊 Получено постов:', allPosts.length);
      setPosts(allPosts);
    } catch (error) {
      console.error('error fetching post', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] py-8">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* StoriesBar с отступом снизу */}
    <div className="mb-8">
      <StoriesBar onStoryClick={(userId, username) => setViewingStory({ userId, username })} />
    </div>

    {loading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D85D3F] mb-4"></div>
        <p className="text-gray-600">Загрузка ленты...</p>
      </div>
    ) : (
      <div className="space-y-6">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              showDeleteButton={false}
              onUserClick={handleUserClick}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-[#FDF8F6] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#D85D3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Лента пуста</h3>
            <p className="text-gray-500">Подпишитесь на пользователей, чтобы видеть их посты</p>
            <button 
              onClick={() => router.push('/users')}
              className="mt-4 bg-[#D85D3F] hover:bg-[#C24D32] text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Найти пользователей
            </button>
          </div>
        )}
      </div>
    )}

    {viewingStory && (
      <StoryViewer
        userId={viewingStory.userId}
        username={viewingStory.username}
        onClose={() => setViewingStory(null)}
      />
    )}
  </div>
</div>
  );
}
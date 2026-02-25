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
    <div className="min-h-screen bg-gray-100 py-8">
  <div className="max-w-4xl mx-auto px-4">
    {/* StoriesBar с отступом снизу */}
    <div className="mb-8">
      <StoriesBar onStoryClick={(userId, username) => setViewingStory({ userId, username })} />
    </div>

    {loading ? (
      <div className="text-center py-8">Загрузка...</div>
    ) : (
      <div className="space-y-6"> {/* space-y-6 создает отступы между постами */}
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
          <div className="text-center text-gray-500 py-8">Постов пока нет</div>
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
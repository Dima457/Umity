'use client';

import { useEffect, useState } from 'react';
import { storiesAPI } from '@/lib/api';
import CreateStoryMobal from './CreateStoryMobal';

interface Story {
  id: string;
  image: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface StoriesBarProps {
  onStoryClick: (userId: string, username: string) => void;
}

export default function StoriesBar({ onStoryClick }: StoriesBarProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<Map<string, Story[]>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await storiesAPI.getAll();
      setStories(data);
      
      // Группируем по пользователям (берём последнюю историю каждого)
      const grouped = new Map<string, Story[]>();
      data.forEach((story: Story) => {
        if (!grouped.has(story.user.id)) {
          grouped.set(story.user.id, []);
        }
        grouped.get(story.user.id)!.push(story);
      });
      setGroupedStories(grouped);
    } catch (err) {
      console.error('Failed to load stories:', err);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 py-4">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
        {/* Кнопка "Добавить историю" */}
        <button 
        onClick={()=>setIsModalOpen(true)}
        className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-2xl text-gray-400">+</span>
          </div>
          <span className="text-xs text-gray-500">Добавить</span>
        </button>

        {/* Истории пользователей */}
        {Array.from(groupedStories.entries()).map(([userId, userStories]) => {
          const lastStory = userStories[userStories.length - 1];
          return (
            <button
              key={userId}
              onClick={() => onStoryClick(userId, lastStory.user.username)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={lastStory.user.avatar || '/default-avatar.png'}
                    alt={lastStory.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-700 truncate max-w-[64px]">
                {lastStory.user.username}
              </span>
            </button>
          );
        })}
      </div>
      <CreateStoryMobal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadStories}
      />
    </div>
    
  );
}
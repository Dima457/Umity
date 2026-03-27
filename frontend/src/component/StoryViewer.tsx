'use client';

import { useEffect, useState, useRef } from 'react';
import { storiesAPI } from '@/lib/api';

interface Story {
  id: string;
  image: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface StoryViewerProps {
  userId: string;
  username: string;
  onClose: () => void;
}

export default function StoryViewer({ userId, username, onClose }: StoryViewerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const STORY_DURATION = 5000;
  
  // Используем ref для доступа к актуальным значениям внутри interval
  const currentIndexRef = useRef(currentIndex);
  const storiesRef = useRef(stories);
  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  
  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  useEffect(() => {
    loadStories();
  }, [userId]);

  // Основной таймер прогресса
  useEffect(() => {
    if (stories.length === 0) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Используем ref для актуальных значений
          const idx = currentIndexRef.current;
          const len = storiesRef.current.length;
          
          if (idx < len - 1) {
            setCurrentIndex(idx + 1);
            return 0;
          } else {
            onClose();
            return 0;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stories.length, onClose]); // Убрали stories и currentIndex из зависимостей!

  // Сброс прогресса при смене индекса
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const loadStories = async () => {
    try {
      const data = await storiesAPI.getByUser(userId);
      setStories(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load stories:', err);
      onClose();
    }
  };

  const nextStory = () => {
    setProgress(0); // Сбросим сразу
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    setProgress(0); // Сбросим сразу
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  if (stories.length === 0) {
    // Используем useEffect для закрытия, а не прямой вызов при рендере
    return null;
  }

  const currentStory = stories[currentIndex];
  
  // Защита от undefined
  if (!currentStory) {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#2D2D2D] z-50 flex flex-col">
      {/* Прогресс-бары */}
      <div className="flex gap-1 p-2 pt-8">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-[#6B6B6B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D85D3F] transition-all duration-100 ease-linear"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Хедер */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-3">
          <img
            src={currentStory.user?.avatar || '/default-avatar.png'}
            alt={username}
            className="w-8 h-8 rounded-full ring-2 ring-[#D85D3F]"
          />
          <span className="font-semibold">{username}</span>
          <span className="text-[#B0B0B0] text-sm">
            {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button onClick={onClose} className="text-2xl text-[#B0B0B0] hover:text-[#D85D3F] transition-colors">&times;</button>
      </div>

      {/* Изображение */}
      <div className="flex-1 relative flex items-center justify-center">
        <img
          src={currentStory.image}
          alt="Story"
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Зоны клика для навигации */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={prevStory} />
          <div className="w-1/2 h-full cursor-pointer" onClick={nextStory} />
        </div>
      </div>
    </div>
  );
}
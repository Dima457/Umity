'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/component/SearchBar';
import CreatePostModal from '@/component/CreatePostModal';
import { API_BASE_URL, userAPI } from '@/lib/api';
import PostCard from '@/component/PostCard';
import { Post } from '@/component/PostCard';
import EditProfileModal from '@/component/EditProfileModal';
import { useCallback } from 'react';



interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [ isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const handleSaveProfile = async (data: {bio: string; avatar: string}) => {
    console.log('🔵 START handleSaveProfile', data);
    
    const token = localStorage.getItem('token');
    console.log('🔑 Token:', token ? 'exists' : 'missing');

    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const updateUser = await response.json();
        console.log('✅ Success! Updated user:', updateUser);
        setUser(updateUser);
        setIsEditModalOpen(false);

    } catch (error) {
        console.error('💥 Fetch error:', error);
        throw error;
    }
}

  const getUserIdFromToken = (token: string): string | null => {
  try {
    // * atob() - встроенная браузерная функция для декодирования base64
    // * token.split('.')[1] - JWT состоит из 3 частей: header.payload.signature
    // * Берём вторую часть (payload) где хранятся данные пользователя
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // * payload.userId || payload.sub - пытаемся получить ID пользователя
    // * sub (subject) - стандартное поле в JWT для хранения идентификатора
    return payload.userId || payload.sub;
  } catch (error) {
    // * try-catch обрабатывает ошибки декодирования
    console.error('Error decoding token:', error);
    return null;
  }
};

  const fetchUserProfile = async (token: string) => {
  try {
    // * fetch() - нативная браузерная функция для HTTP запросов
    // * ${API_BASE_URL} - базовый URL API (например: http://localhost:3001)
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET', // * HTTP метод GET для получения данных
      headers: {
        'Content-Type': 'application/json', // * Указываем тип данных
        'Authorization': `Bearer ${token}`, // * JWT токен для аутентификации
      }
    });
    
    // * response.ok - проверяем успешность запроса (status 200-299)
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    // * response.json() - парсим JSON ответ от сервера
    const userData = await response.json();
    
    // * setUser() - обновляем состояние пользователя
    setUser(userData);
    
    // * setIsAuthenticated(true) - помечаем пользователя как аутентифицированного
    setIsAuthenticated(true);
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    
    // * localStorage.removeItem('token') - удаляем невалидный токен
    localStorage.removeItem('token');
  } finally {
    // * finally выполняется в любом случае (успех или ошибка)
    // * setLoading(false) - убираем индикатор загрузки
    setLoading(false);
  }
};

  const fetchUserPosts = async (userId: string) => {
  try {
    // * localStorage.getItem('token') - получаем токен из локального хранилища
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`, // * Добавляем токен для авторизации
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const userPosts = await response.json();
    
    // * setPosts() - обновляем состояние с постами пользователя
    setPosts(userPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

  useEffect(() => {
  // * localStorage.getItem('token') - проверяем наличие токена
  const token = localStorage.getItem('token');
  console.log('Token from storage:', token);
  
  if (token) {
    // * Декодируем токен чтобы получить ID пользователя
    const userId = getUserIdFromToken(token);
    console.log('User ID from token:', userId);
    
    if (userId) {
      // * Загружаем профиль и посты пользователя
      fetchUserProfile(token);
      fetchUserPosts(userId);
    } else {
      console.error('User ID not found in token');
      setLoading(false);
    }
  } else {
    console.log('No token found, redirecting to login');
    setLoading(false);
  }
}, []); // * Пустой массив зависимостей = выполняется только при монтировании

  const handleSearch = useCallback((query: string) => {
  console.log('🔍 Searching for:', query);
  
  setSearchQuery(query);
  
  if (!query.trim()) {
    setFilteredPosts(posts);
    return;
  }

  const filtered = posts.filter(post => 
    post.title?.toLowerCase().includes(query.toLowerCase()) ||
    post.content?.toLowerCase().includes(query.toLowerCase()) ||
    post.author?.username?.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredPosts(filtered);
}, [posts]); // ✅ Зависимость только от posts
   useEffect(()=>{
    if(searchQuery.trim()){
      handleSearch(searchQuery);
    }else{
      setFilteredPosts(posts);
    }
   },[posts, searchQuery, handleSearch]);

   
const deletePost = async (postId: string) => {
  if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // Удаляем пост из состояния
      setPosts(posts.filter(post => post.id !== postId));
      setFilteredPosts(filteredPosts.filter(post => post.id !== postId));
      alert('Пост удален!');
    } else {
      alert('Ошибка при удалении поста');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Ошибка при удалении поста');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  // Дальше идет return который не трогаем...

  return (
    <div className="min-h-screen bg-[#FDF8F6] py-8">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      {/* Заголовок профиля */}
      <div className="flex flex-col md:flex-row items-center mb-8">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#D85D3F] to-[#C24D32] flex items-center justify-center overflow-hidden shadow-md">
            {user?.avatar ? (
              <img src={user.avatar} alt="Аватар" className="h-full w-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.username || 'Пользователь'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.bio || 'Нет описания профиля'}
          </p>
        </div>
      </div>

      {/* Поисковая строка */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Контент для аутентифицированных пользователей */}
      {isAuthenticated ? (
        
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Мои посты</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="bg-[#D85D3F] hover:bg-[#C24D32] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                onClick={() => setIsPostOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Добавить пост
              </button>
              <CreatePostModal 
                isOpen={isPostOpen} 
                onClose={()=>setIsPostOpen(false)}
              />
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white border-2 border-[#D85D3F] text-[#D85D3F] hover:bg-[#D85D3F] hover:text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Редактировать профиль
              </button>

              <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={{bio:user?.bio, avatar:user?.avatar}}
                onSave={handleSaveProfile}
              />
            </div>
          </div>
         
          <div className="mt-4 p-4 bg-[#FDF8F6] rounded-xl border border-gray-100">
            {filteredPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                showDeleteButton={true} 
                onDelete={deletePost}  
              />
            ))}
          </div>
        </div>
      ) : (
        // Контент для неаутентифицированных пользователей
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-[#FDF8F6] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#D85D3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">Для просмотра профиля необходимо войти в систему</p>
          </div>
          <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button 
              onClick={() => router.push('/auth/register')}
              className="w-full sm:w-auto bg-[#D85D3F] hover:bg-[#C24D32] text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Зарегистрироваться
            </button>
            <button 
              onClick={() => router.push('/auth/login')}
              className="w-full sm:w-auto bg-white border-2 border-[#D85D3F] text-[#D85D3F] hover:bg-[#D85D3F] hover:text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
            >
              Войти
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
  }
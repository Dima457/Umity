// frontend/src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  // * e.target.name - имя поля которое изменилось (email, password, etc.)
  // * e.target.value - новое значение поля
  
  setFormData({
    ...formData, // * spread оператор - сохраняем предыдущие значения
    [e.target.name]: e.target.value // * Обновляем только измененное поле
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // * Предотвращаем стандартную отправку формы
  setLoading(true); // * Включаем состояние загрузки
  setError(''); // * Сбрасываем ошибки

  try {
    // * Вызов API регистрации через authAPI
    const data = await authAPI.register(formData);
    console.log('Registration successful:', data);

    // * Проверяем наличие токена в ответе
    if(data.access_token){
      // * Сохраняем JWT токен в localStorage
      localStorage.setItem('token', data.access_token);
      console.log('Token saved to local');
    } else {
      console.log('No access_token') // * Логируем если токена нет
    }
    
    // * Перенаправляем пользователя на страницу профиля
    router.push('/profile');
  } catch (err: any) {
    // * Обрабатываем ошибки регистрации
    setError(err.message || 'Ошибка регистрации');
  } finally {
    // * Выполняется в любом случае (успех или ошибка)
    setLoading(false); // * Выключаем состояние загрузки
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Имя пользователя"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <textarea
                name="bio"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Расскажите о себе (необязательно)"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </div>

          <div><button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
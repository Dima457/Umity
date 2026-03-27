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
    <div className="min-h-screen bg-[#FDF8F6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-[#D85D3F]">
        Регистрация
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Создайте аккаунт для доступа к услугам
      </p>
    </div>

    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <input
            name="username"
            type="text"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200"
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
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200"
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
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <textarea
            name="bio"
            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200 resize-none"
            placeholder="Расскажите о себе (необязательно)"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#D85D3F] hover:bg-[#C24D32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D85D3F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Регистрация...
            </span>
          ) : (
            'Зарегистрироваться'
          )}
        </button>
      </div>

      <div className="text-center pt-4 border-t border-gray-200">
        <Link 
          href="/auth/login" 
          className="text-[#D85D3F] hover:text-[#C24D32] font-medium transition-colors duration-200"
        >
          Уже есть аккаунт? Войти
        </Link>
      </div>
    </form>
  </div>
</div>
  );
}
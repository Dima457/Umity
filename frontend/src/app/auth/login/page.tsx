// frontend/src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  // * e: React.FormEvent - объект события формы
  e.preventDefault(); // * Предотвращаем стандартную отправку формы и перезагрузку страницы
  setLoading(true);   // * Включаем состояние загрузки (показывает индикатор)
  setError('');       // * Сбрасываем предыдущие ошибки

  try {
    // * Вызов API входа через authAPI.login()
    // * Передаем объект с email и password
    const data = await authAPI.login({ email, password });
    console.log('Login successful:', data); // * Логируем успешный ответ

    // * Проверяем наличие access_token в ответе сервера
    if (data.access_token) {
      // * Сохраняем JWT токен в localStorage браузера
      // * localStorage сохраняет данные между сессиями
      localStorage.setItem('token', data.access_token);
      console.log('saved token'); // * Подтверждение сохранения
    } else {
      console.log('no save token') // * Логируем если токена нет в ответе
    }
    
    // * Перенаправляем пользователя на страницу профиля
    // * useRouter из next/navigation для клиентской навигации
    router.push('/profile');
  } catch (err: any) {
    // * Обрабатываем ошибки аутентификации
    // * err.message - сообщение об ошибке от сервера
    // * || 'Ошибка входа' - fallback сообщение если нет ошибки от сервера
    setError(err.message || 'Ошибка входа');
  } finally {
    // * Блок finally выполняется в любом случае (успех или ошибка)
    setLoading(false); // * Выключаем индикатор загрузки
  }
};

  return (
   <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-md w-full space-y-8">
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2D2D2D]">
        Вход в аккаунт
      </h2>
    </div>

    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#E5E5E5] placeholder-[#666666] text-[#2D2D2D] rounded-t-md focus:outline-none focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#E5E5E5] placeholder-[#666666] text-[#2D2D2D] rounded-b-md focus:outline-none focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#D85D3F] hover:bg-[#C24E32] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D85D3F] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </div>

      <div className="text-center">
        <Link href="/auth/register" className="text-[#D85D3F] hover:text-[#C24E32]">
          Нет аккаунта? Зарегистрироваться
        </Link>
      </div>
    </form>
  </div>
</div>
  );
}
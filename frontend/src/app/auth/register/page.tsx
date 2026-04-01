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
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Функция валидации email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Функция валидации пароля
  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    if (password.length > 50) {
      return { isValid: false, message: 'Пароль не должен превышать 50 символов' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
    }
    return { isValid: true };
  };

  // Функция валидации имени пользователя
  const validateUsername = (username: string): { isValid: boolean; message?: string } => {
    if (username.length < 3) {
      return { isValid: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
    }
    if (username.length > 30) {
      return { isValid: false, message: 'Имя пользователя не должно превышать 30 символов' };
    }
    if (!/^[a-zA-Z0-9_\u0400-\u04FF]+$/.test(username)) {
      return { isValid: false, message: 'Имя пользователя может содержать только буквы, цифры и знак подчеркивания' };
    }
    return { isValid: true };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Очищаем ошибку для конкретного поля при вводе
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Валидация всех полей
    const newErrors: typeof errors = {};
    
    // Валидация имени пользователя
    if (!formData.username.trim()) {
      newErrors.username = 'Введите имя пользователя';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.message;
      }
    }

    // Валидация email
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email (например: name@domain.com)';
    }

    // Валидация пароля
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    // Если есть ошибки, отображаем их и прерываем отправку
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.register(formData);
      console.log('Registration successful:', data);

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        console.log('Token saved to local');
      } else {
        console.log('No access_token');
      }
      
      router.push('/profile');
    } catch (err: any) {
      setErrors({ general: err.message || 'Ошибка регистрации' });
    } finally {
      setLoading(false);
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
          {/* Общая ошибка */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            {/* Поле имени пользователя */}
            <div>
              <input
                name="username"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Имя пользователя (минимум 3 символа)"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Поле email */}
            <div>
              <input
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Поле пароля */}
            <div>
              <input
                name="password"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Пароль (минимум 6 символов, заглавная буква и цифра)"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Пароль должен содержать минимум 6 символов, хотя бы одну заглавную букву и одну цифру
              </p>
            </div>

            {/* Поле bio (необязательное) */}
            <div>
              <textarea
                name="bio"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-[#D85D3F] focus:z-10 sm:text-sm transition-colors duration-200 resize-none"
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
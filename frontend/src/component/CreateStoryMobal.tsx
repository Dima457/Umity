'use client';

import { useState, useEffect } from 'react';
import { storiesAPI } from '@/lib/api';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStoryModal({isOpen, onClose, onSuccess}: CreateStoryModalProps){
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Логируем полученные пропсы при каждом изменении
    useEffect(() => {
        console.log('🎯 CreateStoryModal получил пропсы:', { 
            isOpen, 
            onClose: typeof onClose,
            onSuccess: typeof onSuccess
        });
    }, [isOpen, onClose, onSuccess]);

    // Логируем изменение состояния открытия
    useEffect(() => {
        console.log(`🔴 Модальное окно ${isOpen ? 'открыто' : 'закрыто'}`);
        
        // Сбрасываем состояние при открытии
        if (isOpen) {
            console.log('🔄 Сброс состояния при открытии');
            setImage('');
            setError('');
            setLoading(false);
        }
    }, [isOpen]);

    // Логирование монтирования/размонтирования
    useEffect(() => {
        console.log('🎯 CreateStoryModal смонтирован');
        
        return () => {
            console.log('🗑️ CreateStoryModal размонтирован');
        };
    }, []);

    // Если модальное окно закрыто - не рендерим ничего
    if(!isOpen) {
        console.log('🚫 Модальное окно закрыто, рендеринг null');
        return null;
    }

    console.log('✅ Модальное окно открыто, рендерим форму');

    // Функция для валидации URL изображения
    const validateImageUrl = (url: string): { isValid: boolean; reason?: string } => {
        console.log('🔍 Валидация URL:', url);
        
        if (!url || !url.trim()) {
            console.log('❌ URL пустой');
            return { isValid: false, reason: 'empty' };
        }

        try {
            const parsedUrl = new URL(url);
            console.log('📝 Распарсенный URL:', {
                protocol: parsedUrl.protocol,
                hostname: parsedUrl.hostname,
                pathname: parsedUrl.pathname
            });

            // Проверка протокола
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                console.log('❌ Неподдерживаемый протокол:', parsedUrl.protocol);
                return { isValid: false, reason: 'invalid_protocol' };
            }

            // Проверка расширения файла
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
            const hasImageExtension = imageExtensions.some(ext => 
                parsedUrl.pathname.toLowerCase().endsWith(ext)
            );
            
            if (!hasImageExtension) {
                console.log('⚠️ URL не имеет стандартного расширения изображения:', parsedUrl.pathname);
                // Не блокируем, но предупреждаем
            }

            console.log('✅ URL прошел валидацию');
            return { isValid: true };
        } catch (err) {
            console.log('❌ Ошибка парсинга URL:', err);
            return { isValid: false, reason: 'invalid_url' };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📤 Начало отправки формы');
        console.log('📸 Значение image:', image);

        if (!image || !image.trim()) {
            console.log('❌ URL пустой');
            setError('Введите URL изображения');
            return;
        }

        // Валидация URL
        const validation = validateImageUrl(image);
        console.log('🔎 Результат валидации:', validation);

        if(!validation.isValid) {
            let errorMessage = 'Введите корректный URL изображения';
            
            switch(validation.reason) {
                case 'empty':
                    errorMessage = 'Введите URL изображения';
                    break;
                case 'invalid_url':
                    errorMessage = 'Некорректный формат URL';
                    break;
                case 'invalid_protocol':
                    errorMessage = 'URL должен начинаться с http:// или https://';
                    break;
            }
            
            console.log('❌ Ошибка валидации:', errorMessage);
            setError(errorMessage);
            return;
        }

        setLoading(true);
        setError('');
        
        console.log('🔄 Начало отправки запроса к API');
        console.log('📦 Данные для отправки:', { image });

        try {
            console.time('API Request');
            console.log('🚀 Вызов storiesAPI.create с image:', image.substring(0, 50) + '...');
            
            const response = await storiesAPI.create(image);
            
            console.timeEnd('API Request');
            console.log('✅ Успешный ответ от API:', response);
            
            console.log('📝 Очистка формы');
            setImage('');
            
            console.log('🎉 Вызов onSuccess()');
            onSuccess();
            
            console.log('🚪 Вызов onClose()');
            onClose();
            
        } catch(err: any) {
            console.timeEnd('API Request');
            console.log('❌ Ошибка при создании истории:');
            console.error('📋 Детали ошибки:', err);
            
            // Детальное логирование ошибки
            if (err.name === 'BadRequestError') {
                setError(err.message);
            } else if (err.name === 'UnauthorizedError') {
                setError('Требуется авторизация. Пожалуйста, войдите снова.');
            } else if (err.name === 'ForbiddenError') {
                setError('Нет прав для создания истории');
            } else if (err.name === 'NotFoundError') {
                setError('Сервер не найден. Проверьте подключение к интернету.');
            } else if (err.name === 'ServerError') {
                setError('Ошибка сервера. Попробуйте позже.');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Не удалось создать историю');
            }
        } finally {
            console.log('🏁 Завершение отправки, loading = false');
            setLoading(false);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.log('🖼️ Ошибка загрузки изображения в предпросмотре:', {
            src: e.currentTarget.src,
            naturalWidth: e.currentTarget.naturalWidth,
            naturalHeight: e.currentTarget.naturalHeight,
            complete: e.currentTarget.complete
        });
        
        // Проверяем, не пустой ли это был URL
        if (!image || image.trim() === '') {
            console.log('⚠️ Попытка загрузить пустой URL');
            return;
        }
        
        setError('Не удалось загрузить изображение для предпросмотра. Проверьте URL и доступность изображения.');
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.log('✅ Изображение успешно загружено:', {
            src: e.currentTarget.src,
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight,
            aspectRatio: (e.currentTarget.naturalWidth / e.currentTarget.naturalHeight).toFixed(2)
        });
        
        // Очищаем ошибку если была
        if (error) {
            setError('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        console.log('✏️ Изменение URL:', {
            oldValue: image,
            newValue: newValue.substring(0, 50) + (newValue.length > 50 ? '...' : ''),
            length: newValue.length
        });
        setImage(newValue);
        
        // Сбрасываем ошибку при изменении
        if (error) {
            console.log('🔄 Сброс ошибки при изменении ввода');
            setError('');
        }
    };

    const handleClose = () => {
        console.log('🚪 Закрытие модального окна, текущее состояние:', {
            image: image.substring(0, 30) + (image.length > 30 ? '...' : ''),
            loading,
            hadError: !!error
        });
        onClose();
    };

    console.log('🎨 Рендеринг содержимого модального окна');

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#2D2D2D]">Новая история</h2>
            <button 
                onClick={handleClose} 
                className="text-[#6B6B6B] hover:text-[#D85D3F] text-2xl transition-colors"
                disabled={loading}
                type="button"
            >
                &times;
            </button>
        </div>

        {error && (
            <div className="bg-[#FEF2F0] border border-[#D85D3F] text-[#D85D3F] px-4 py-2 rounded mb-4">
                <strong className="font-bold">Ошибка: </strong>
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-[#2D2D2D] text-sm font-bold mb-2">
                    URL изображения
                </label>
                <input
                    type="url"
                    value={image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#D85D3F] focus:ring-1 focus:ring-[#D85D3F] ${
                        error ? 'border-[#D85D3F]' : 'border-[#E5E5E5]'
                    }`}
                    disabled={loading}
                    autoFocus
                />
                {image && !error && (
                    <p className="text-xs text-[#6B6B6B] mt-1">
                        Длина URL: {image.length} символов
                    </p>
                )}
            </div>

            {image && (
                <div className="mb-4">
                    <p className="text-sm text-[#6B6B6B] mb-2">Предпросмотр:</p>
                    <img
                        src={image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-[#E5E5E5]"
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                    />
                </div>
            )}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#2D2D2D] hover:bg-[#F5F5F5] disabled:opacity-50 transition-colors"
                    disabled={loading}
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#D85D3F] text-white rounded-lg hover:bg-[#C04B2F] disabled:opacity-50 flex items-center justify-center transition-colors"
                    disabled={loading || !image.trim()}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Создание...
                        </>
                    ) : 'Опубликовать'}
                </button>
            </div>
        </form>
    </div>
</div>
    );
}
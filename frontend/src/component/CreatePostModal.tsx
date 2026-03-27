import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface PropsCPM {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: PropsCPM) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('📡 URL запроса:', `${API_BASE_URL}/posts`);
            await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content, image }),
            });
            onClose();
            window.location.reload(); // Перезагружаем чтобы увидеть новый пост
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-[#FDF8F6] rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#D85D3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">Создать пост</h2>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
        <input
          placeholder="Введите название поста"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-transparent transition-all duration-200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
        <textarea
          placeholder="Расскажите о чём ваш пост..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-transparent transition-all duration-200 resize-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
        <div className="relative">
          <input
            placeholder="https://example.com/image.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D85D3F] focus:border-transparent transition-all duration-200"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xs text-gray-500 mt-1">Необязательно. Поддерживаются прямые ссылки на изображения</p>
      </div>
    </div>
    
    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={onClose}
        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
      >
        Отмена
      </button>
      
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || !content.trim()}
        className="flex-1 bg-[#D85D3F] text-white py-3 px-4 rounded-xl hover:bg-[#C24D32] transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Опубликовать
      </button>
    </div>
  </div>
</div>
    );
}
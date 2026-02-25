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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4">Создать пост</h2>
                
                <input
                    placeholder="Название поста"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <textarea
                    placeholder="Описание поста"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                    placeholder="URL изображения (необязательно)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        Опубликовать
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}
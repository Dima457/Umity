// frontend/lib/api.ts

// *Определяем базовый URL нашего бэкенд-сервера (Nest.js приложение)
//* Nest.js по умолчанию запускается на порту 3001, Next.js на порту 3000
// *Это позволяет им работать одновременно без конфликтов портов
// frontend/lib/api.ts

// Определяем базовый URL бэкенда
// При локальной разработке: localhost
// При Wi-Fi доступе: IP машины в сети :3001
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    // SSR — fallback
    return 'http://localhost:3001';
  }

  const { hostname } = window.location;
  
  // Если открыто НЕ через localhost — значит через IP в сети (Wi-Fi)
  // Бэкенд на той же машине, тот же IP, порт 3001
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${hostname}:3001`;
  }
  
  // Локальная разработка
  return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();

//* Создаем объект authAPI для работы с аутентификацией
//* Инкапсуляция: все методы аутентификации в одном месте
export const authAPI = {
  
  //* Метод для входа пользователя в систему
  //* Принимает credentials - объект с email и password
  login: async (credentials: { email: string; password: string }) => {
    // *Отправляем POST-запрос на эндпоинт /auth/login нашего бэкенда
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST', // *HTTP метод POST для создания сессии
      headers: {
        'Content-Type': 'application/json', // *Указываем, что отправляем JSON данные
      },
      // *Преобразуем объект credentials в JSON строку для отправки
      body: JSON.stringify(credentials),
    });
    
    // *Проверяем статус ответа (200-299 = успех, 400-499 = ошибка клиента, 500-599 = ошибка сервера)
    if (!response.ok) {
      // *Если ошибка, выбрасываем исключение с понятным сообщением
      throw new Error('Login failed');
    }
    
    //* Парсим JSON ответ от сервера (Nest.js возвращает { access_token: string, user: User })
    const data = await response.json();
    
    //* Сохраняем JWT токен в localStorage браузера
    // *localStorage сохраняет данные даже после закрытия браузера
    localStorage.setItem('token', data.access_token);
    
    // *Сохраняем данные пользователя в localStorage как JSON строку
    localStorage.setItem('user', JSON.stringify(data.user));
    
    //* Возвращаем данные для дальнейшего использования в компонентах
    return data;
  },
  
  //* Метод для регистрации нового пользователя
  // *Принимает userData - объект с данными пользователя
  register: async (userData: { email: string; password: string; username: string; bio?: string }) => {
    // *Отправляем POST-запрос на эндпоинт /auth/register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST', // *HTTP метод POST для создания нового ресурса (пользователя)
      headers: {
        'Content-Type': 'application/json', // *Указываем формат данных
      },
      //* Преобразуем объект userData в JSON строку
      body: JSON.stringify(userData),
    });
    
    //* Проверяем успешность запроса
    if (!response.ok) {
      // *Пытаемся получить детальную ошибку от сервера
      try {
        const errorData = await response.json();
        //* Если сервер вернул сообщение об ошибке, используем его
        throw new Error(errorData.message || 'Registration error');
      } catch {
        //* Если не удалось распарсить ошибку, используем общее сообщение
        throw new Error('Registration error');
      }
    }
    
    // *Парсим JSON ответ от сервера
    const data = await response.json();
    
    // *Сохраняем полученный JWT токен в localStorage
    localStorage.setItem('token', data.access_token);
    
    // *Сохраняем данные пользователя
    localStorage.setItem('user', JSON.stringify(data.user));
    
    //* Возвращаем данные для обработки в компоненте
    return data;
  },
};

// *Создаем объект userAPI для работы с данными пользователя
export const userAPI = {
  
  //* Метод для получения профиля пользователя
  // *Требует JWT токен для аутентификации
  getProfile: async (token: string) => {
    // *Отправляем GET-запрос на эндпоинт /user/profile
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: {
        // *Передаем JWT токен в заголовке Authorization в формате Bearer token
        // *Это стандартный способ передачи токенов в HTTP запросах
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // *Проверяем успешность запроса
    if (!response.ok) {
      //* Если токен недействителен или нет доступа, выбрасываем ошибку
      throw new Error('Failed to fetch profile');
    }
    
    // *Возвращаем данные профиля пользователя
    return response.json();
  },
};

// Stories API
export const storiesAPI = {
  getAll: () => fetch(`${API_BASE_URL}/stories`).then(r => r.json()),
  
  getByUser: (userId: string) => 
    fetch(`${API_BASE_URL}/stories/user/${userId}`).then(r => r.json()),
  
  create: (image: string) => fetch(`${API_BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ image }),
  }).then(async r => {
    // Сначала получаем текст — это безопасно
    let text: string;
    try {
      text = await r.text();
    } catch (e) {
      throw new Error('Network error: failed to read response');
    }

    
    if (!r.ok) {
      let errorMessage = `HTTP ${r.status}: ${r.statusText}`;
      try {
        const error = JSON.parse(text);
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Если успех но пустое тело
    if (!text || text.trim() === '') {
      
      return null;
    }

    // Парсим JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  }),
};

//Likes API

export const likesApI = {
  likesPost:async(postId:string)=>{
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method:'POST',
      headers:{
         'Authorization': `Bearer ${token}`,
      }
    } )
    if(!response.ok){
      throw new Error('Ошибка при лайке');

    }
    return response.json();
  },

  unlikePost:async (postId:string)=>{
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`,{
      method:'DELETE',
      headers:{
        'Authorization': `Bearer ${token}`,
      }
    })
    if(!response.ok){
      throw new Error('Ошибка при снятии лайка')
    }
    return response.json();
  }
};

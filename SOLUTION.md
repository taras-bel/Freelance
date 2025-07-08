# Решение проблем с аутентификацией и WebSocket

## ✅ Что уже исправлено:

### 1. **Backend сервер запущен правильно**
- Сервер запущен из правильной директории (`backend/`)
- Используется виртуальное окружение
- Сервер доступен на `http://localhost:8000`

### 2. **Исправлены проблемы с токенами**
- Все файлы теперь используют единый ключ `access_token`
- Исправлены файлы: `client.ts`, `useNotifications.ts`, `reviews.ts`

### 3. **Исправлены проблемы с WebSocket**
- Убрана дублирующая WebSocket связь в `useNotifications.ts`
- Теперь используется единый `useWebSocket` хук
- Исправлены импорты JWTError в backend

### 4. **Добавлен недостающий endpoint**
- Добавлен `/achievements/unlocked` endpoint

## 🔧 Что нужно сделать пользователю:

### Шаг 1: Очистить старые токены
1. Откройте файл `frontend/clear-auth.html` в браузере
2. Нажмите кнопку **"Очистить старые токены"**
3. Это удалит старые токены и оставит только `access_token`

### Шаг 2: Войти заново
1. Перейдите на `http://localhost:5173` (фронтенд)
2. Войдите в систему заново с вашими учетными данными
3. Это создаст новый токен с правильным ключом

### Шаг 3: Проверить работу
1. После входа проверьте, что WebSocket соединение установлено
2. Проверьте, что уведомления работают
3. Проверьте, что все API вызовы проходят успешно

## 🐛 Возможные проблемы и решения:

### Проблема: "WebSocket connection failed"
**Решение:** Убедитесь, что:
- Backend сервер запущен на порту 8000
- Вы вошли в систему заново после очистки токенов
- В консоли браузера нет ошибок 401/403

### Проблема: "401 Unauthorized" на API вызовах
**Решение:** 
- Очистите localStorage и войдите заново
- Проверьте, что токен сохраняется под ключом `access_token`

### Проблема: "422 Unprocessable Content"
**Решение:**
- Это может быть связано с неправильными данными в запросе
- Проверьте, что все обязательные поля заполнены

## 📁 Файлы, которые были изменены:

### Backend:
- `backend/app/utils/jwt.py` - исправлены импорты JWTError
- `backend/app/api/endpoints/achievements.py` - добавлен `/unlocked` endpoint

### Frontend:
- `frontend/src/api/client.ts` - исправлен ключ токена
- `frontend/src/hooks/useNotifications.ts` - убрана дублирующая WebSocket связь
- `frontend/src/api/reviews.ts` - исправлены ключи токенов
- `frontend/clear-auth.html` - создан инструмент для очистки токенов

## 🚀 Команды для запуска:

### Backend:
```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```bash
cd frontend
npm run dev
```

## ✅ Проверка работоспособности:

1. **Backend health check:** `http://localhost:8000/health`
2. **Frontend:** `http://localhost:5173`
3. **API docs:** `http://localhost:8000/docs`

После выполнения всех шагов система должна работать корректно! 
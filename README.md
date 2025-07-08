# 🚀 Freelance Platform

Современная платформа для фрилансеров с AI-помощником, системой достижений и полным функционалом для работы с задачами.

## ✨ Особенности

### 🎯 Основной функционал
- **Система аутентификации** - регистрация и вход через email
- **Управление задачами** - создание, поиск, фильтрация и подача заявок
- **Система заявок** - подача заявок на задачи и управление ими
- **Чат система** - общение между клиентами и фрилансерами
- **Система платежей** - управление транзакциями и методами оплаты
- **Уведомления** - real-time уведомления о важных событиях
- **Система достижений** - геймификация с уровнями и наградами

### 🤖 AI-функции
- **AI-анализ задач** - автоматическая оценка сложности и бюджета
- **Рекомендации** - персональные рекомендации задач
- **Умный поиск** - поиск с учетом навыков и уровня пользователя

### 🎨 Современный UI/UX
- **Адаптивный дизайн** - работает на всех устройствах
- **Темная тема** - современный темный интерфейс
- **Анимации** - плавные переходы и микро-взаимодействия
- **Glass morphism** - стеклянные панели и эффекты

## 🛠 Технологии

### Backend
- **FastAPI** - современный Python веб-фреймворк
- **SQLAlchemy** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Alembic** - миграции базы данных
- **JWT** - аутентификация
- **Pydantic** - валидация данных

### Frontend
- **React 18** - современная библиотека для UI
- **TypeScript** - типизированный JavaScript
- **Tailwind CSS** - utility-first CSS фреймворк
- **Lucide React** - красивые иконки
- **React Router** - навигация
- **Zustand** - управление состоянием

### Дополнительно
- **Electron** - десктопное приложение
- **WebSocket** - real-time коммуникация
- **Docker** - контейнеризация

## 🚀 Быстрый старт

### Предварительные требования
- Python 3.11 или 3.12
- Node.js 18+
- PostgreSQL 13+
- Git

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd freelance
```

### 2. Настройка Backend

#### Создание виртуального окружения
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### Установка зависимостей
```bash
pip install -r requirements.txt
```

#### Настройка базы данных
```bash
# Создание .env файла
cp env.example .env

# Редактирование .env файла
# Укажите параметры подключения к PostgreSQL
```

#### Запуск миграций
```bash
alembic upgrade head
```

#### Создание тестовых данных
```bash
python seed_data.py
```

#### Запуск сервера
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Настройка Frontend

#### Установка зависимостей
```bash
cd frontend
npm install
```

#### Запуск в режиме разработки
```bash
npm run dev
```

#### Сборка для продакшена
```bash
npm run build
```

### 4. Запуск Electron приложения
```bash
npm run electron:dev
```

## 📁 Структура проекта

```
freelance/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Конфигурация и настройки
│   │   ├── crud/           # CRUD операции
│   │   ├── db_models/      # SQLAlchemy модели
│   │   ├── schemas/        # Pydantic схемы
│   │   └── services/       # Бизнес-логика
│   ├── alembic/            # Миграции БД
│   └── tests/              # Тесты
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Страницы приложения
│   │   ├── store/          # Zustand store
│   │   └── utils/          # Утилиты
│   └── electron/           # Electron конфигурация
├── mobile/                 # React Native мобильное приложение
└── docs/                   # Документация
```

## 🔧 API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/me` - Информация о пользователе

### Задачи
- `GET /tasks/` - Список задач
- `POST /tasks/` - Создание задачи
- `GET /tasks/{id}` - Детали задачи
- `PUT /tasks/{id}` - Обновление задачи
- `DELETE /tasks/{id}` - Удаление задачи

### Заявки
- `GET /applications/` - Список заявок
- `POST /applications/task/{task_id}` - Подача заявки
- `PUT /applications/{id}/status` - Обновление статуса

### Чаты
- `GET /chats/` - Список чатов
- `POST /chats/` - Создание чата
- `GET /chats/{id}/messages` - Сообщения чата
- `POST /chats/{id}/messages` - Отправка сообщения

### Платежи
- `GET /payments/` - Список платежей
- `POST /payments/` - Создание платежа
- `GET /payments/methods/` - Методы оплаты

### Достижения
- `GET /achievements/` - Список достижений
- `GET /achievements/user/{user_id}` - Достижения пользователя

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
pytest
```

### Frontend тесты
```bash
cd frontend
npm test
```

## 🐳 Docker

### Запуск с Docker Compose
```bash
docker-compose up -d
```

### Сборка образов
```bash
docker build -t freelance-backend ./backend
docker build -t freelance-frontend ./frontend
```

## 📱 Мобильное приложение

### Установка зависимостей
```bash
cd mobile
npm install
```

### Запуск
```bash
npx expo start
```

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- CORS настройки
- Валидация входных данных
- Rate limiting

## 🚀 Деплой

### Backend (Heroku)
```bash
# Создание приложения
heroku create your-app-name

# Настройка переменных окружения
heroku config:set DATABASE_URL=your_postgres_url

# Деплой
git push heroku main
```

### Frontend (Vercel)
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

- Создайте Issue в GitHub
- Напишите на email: support@freelance-platform.com
- Присоединитесь к нашему Discord серверу

## 🎉 Благодарности

- FastAPI сообществу за отличный фреймворк
- React команде за потрясающую библиотеку
- Tailwind CSS за современный CSS фреймворк
- Всем контрибьюторам проекта

---

**Сделано с ❤️ для фрилансеров всего мира** 
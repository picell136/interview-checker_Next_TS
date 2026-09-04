# Interview Checker

Веб-приложение для подготовки к собеседованию: викторины по основам веб-разработки с таймером, разбором ответов и сохранением результатов.

Демо: [interview-checker-next-ts.vercel.app](https://interview-checker-next-ts.vercel.app)

## Возможности

- Темы: **HTML/CSS**, **JavaScript**, **TypeScript**, **React**, **Next.js**
- 12 случайных вопросов из банка (~70 на тему), без повторов в одной попытке
- 60 секунд на вопрос, перемешанные варианты ответов
- Подсветка правильного/неправильного ответа и краткий разбор
- Регистрация и вход (Auth.js + bcrypt)
- Страница последних результатов по темам
- Светлая и тёмная тема

## Стек

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Auth.js (`next-auth` v5)
- Postgres (Neon) на продакшене; локально — JSON-файлы в `data/`

## Требования

- Node.js 20+
- npm

## Установка

1. Клонируйте репозиторий и перейдите в каталог проекта:

```bash
git clone https://github.com/picell136/interview-checker_Next_TS.git
cd interview-checker_Next_TS
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env.local` на основе примера:

```bash
cp .env.example .env.local
```

4. Заполните переменные окружения в `.env.local`:

| Переменная       | Обязательно | Описание |
|------------------|-------------|---------|
| `AUTH_SECRET`    | да          | Секрет для подписи сессий Auth.js. Сгенерируйте, например: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST`| рекомендуется | Обычно `true` (нужно за прокси / на Vercel) |
| `DATABASE_URL`   | для продакшена | Connection string Postgres (Neon). Локально можно не задавать — аккаунты и результаты пишутся в `data/users.json` и `data/results.json` |

Пример `.env.local` для локальной разработки:

```env
AUTH_SECRET=замените_на_случайную_строку
AUTH_TRUST_HOST=true
```

5. Запустите dev-сервер:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда       | Описание              |
|---------------|-----------------------|
| `npm run dev` | Режим разработки      |
| `npm run build` | Сборка для продакшена |
| `npm start`   | Запуск собранного приложения |
| `npm run lint` | ESLint                 |

## Деплой на Vercel

На Vercel файловая система только для чтения, поэтому JSON-хранилище не работает. Нужен Postgres.

1. Создайте базу в [Neon](https://neon.tech) (или Vercel Postgres).
2. В проекте Vercel: **Settings → Environment Variables** добавьте:
   - `AUTH_SECRET` — тот же или новый секрет
   - `AUTH_TRUST_HOST=true`
   - `DATABASE_URL` — connection string (лучше pooled URL с `-pooler` в хосте)
3. Задеплойте (или сделайте **Redeploy** после сохранения переменных).

Таблицы `users` и `results` создаются автоматически при первом обращении к базе.

## Структура проекта

```
src/
  app/           # страницы и server actions
  components/    # UI (викторина, шапка, тема, формы)
  data/questions # банки вопросов по темам
  lib/           # auth, db, пользователи, результаты
```

## Лицензия

Приватный учебный проект.

# Firebase Cloud Functions - Telegram Notifications

Этот модуль содержит Cloud Functions для отправки уведомлений в Telegram при появлении новых записей в коллекции Firestore `diary_posts`.

## Установка и конфигурация

### 1. Установка зависимостей

```bash
cd functions
npm install
```

### 2. Конфигурация переменных окружения

Существует два способа передачи конфигурации:

#### Способ 1: Через `process.env` (для локального разработки)

Создай файл `.env` в папке `functions/` (см. `.env.example`):

```bash
TELEGRAM_BOT_TOKEN=8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk
TELEGRAM_CHAT_ID=-5180269549
```

Для локального тестирования используй:
```bash
npm run serve
```

#### Способ 2: Через `functions.config()` (для production в Firebase)

Установи конфигурацию через Firebase CLI:

```bash
firebase functions:config:set telegram.bot_token="8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk"
firebase functions:config:set telegram.chat_id="-5180269549"
```

Проверь конфигурацию:
```bash
firebase functions:config:get
```

### 3. Сборка и развертывание

#### Локально (эмулятор)

```bash
npm run serve
```

Затем в другом терминале создай новую запись в Firestore коллекции `diary_posts` через консоль Firebase.

#### Production развертывание

```bash
npm run build
npm run deploy
```

или сразу:

```bash
firebase deploy --only functions
```

## Структура проекта

- `src/index.ts` — основная функция `onDiaryPostCreated`, триггер на создание записей
- `src/telegram.ts` — утилита `sendTelegramMessage()` для отправки сообщений в Telegram
- `tsconfig.json` — конфигурация TypeScript
- `lib/` — скомпилированный JavaScript (создается при сборке)

## Как это работает

1. Когда в коллекцию `diary_posts` добавляется новый документ, срабатывает триггер `onDiaryPostCreated`
2. Функция форматирует данные записи в красивое сообщение
3. Отправляет сообщение в Telegram группу через Telegram Bot API

## Формат записи в diary_posts

Ожидаемые поля:
```typescript
{
  title: string;        // Заголовок записи
  content: string;      // Содержание записи
  author: string;       // Автор записи
  createdAt: Timestamp; // Дата создания (Firestore Timestamp)
}
```

## Логирование

Логи функций доступны через:
```bash
npm run logs
```

или в Firebase Console > Functions > Logs

## Безопасность

- ✅ Токены не хардкодятся в коде
- ✅ Используются переменные окружения (`process.env` или `functions.config()`)
- ✅ Чувствительные данные передаются через Firebase CLI конфигурацию
- ✅ Используется HTML escape для предотвращения XSS в Telegram
- ✅ Контент обрезается до 200 символов для оптимального отображения

## Troubleshooting

### Функция не срабатывает
- Проверь, что функция развернута: `firebase functions:list`
- Убедись, что коллекция называется `diary_posts`
- Проверь логи: `npm run logs`

### Сообщение не отправляется
- Проверь конфигурацию токена и ID чата
- Убедись, что бот добавлен в группу
- Проверь лимиты API Telegram (100 сообщений/сек на чат)

### Ошибка при развертывании
- Установи Firebase CLI: `npm install -g firebase-tools`
- Авторизуйся: `firebase login`
- Убедись, что проект задан: `firebase use <project-id>`

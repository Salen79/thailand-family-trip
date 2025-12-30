# 📚 Примеры использования

## Пример 1: Создание записи в Firestore через JavaScript

```javascript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

async function createDiaryPost() {
  try {
    const docRef = await addDoc(collection(db, 'diary_posts'), {
      title: 'Наш день в Бангкоке',
      content: 'Сегодня посетили Grand Palace. Невероятно красиво!',
      author: 'Сергей',
      createdAt: Timestamp.now()
    });
    
    console.log('✅ Запись создана:', docRef.id);
    // Cloud Function автоматически отправит сообщение в Telegram!
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}
```

## Пример 2: Использование в React компоненте

```typescript
// spa-app/src/services/diaryService.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function createDiaryPost(
  title: string,
  content: string,
  author: string
) {
  const docRef = await addDoc(collection(db, 'diary_posts'), {
    title,
    content,
    author,
    createdAt: Timestamp.now()
  });
  
  return docRef.id;
}
```

```typescript
// spa-app/src/screens/DiaryScreen.tsx
import React, { useState } from 'react';
import { createDiaryPost } from '../services/diaryService';

export function DiaryScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await createDiaryPost(title, content, author);
      
      // Очистить форму после успешного создания
      setTitle('');
      setContent('');
      setAuthor('');
      
      alert('✅ Запись добавлена! Сообщение отправлено в Telegram');
    } catch (error) {
      alert('❌ Ошибка при создании записи');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diary-screen">
      <h1>📝 Добавить запись</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Заголовок записи"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
        
        <textarea
          placeholder="Содержание записи"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
          rows={5}
        />
        
        <input
          type="text"
          placeholder="Ваше имя"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? '⏳ Отправка...' : '📤 Добавить запись'}
        </button>
      </form>
    </div>
  );
}
```

## Пример 3: Локальное тестирование с эмулятором

```bash
# Терминал 1: Запустить эмулятор
firebase emulators:start --only firestore,functions

# Терминал 2: Создать документ через Node.js скрипт
cat > test-diary.js << 'SCRIPT'
const admin = require('firebase-admin');

// Инициализировать Firebase Admin с эмулятором
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = admin.initializeApp({
  projectId: 'thailand-family-trip'
});

const db = admin.firestore();

async function testCreate() {
  try {
    const docRef = await db.collection('diary_posts').add({
      title: 'Тестовая запись 🎉',
      content: 'Это сообщение должно попасть в Telegram!',
      author: 'Тестер',
      createdAt: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ Документ создан:', docRef.id);
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testCreate();
SCRIPT

# Запустить скрипт
node test-diary.js
```

## Пример 4: Батч операции (создание нескольких записей)

```typescript
import { writeBatch, collection, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

async function createMultiplePosts() {
  const batch = writeBatch(db);
  
  const posts = [
    {
      title: 'День 1: Прибытие',
      content: 'Прилетели в Бангкок',
      author: 'Сергей'
    },
    {
      title: 'День 2: Дворец',
      content: 'Посетили Grand Palace',
      author: 'Виктория'
    },
    {
      title: 'День 3: Острова',
      content: 'Поездка на Пхукет',
      author: 'Дарья'
    }
  ];
  
  posts.forEach((post) => {
    const docRef = doc(collection(db, 'diary_posts'));
    batch.set(docRef, {
      ...post,
      createdAt: Timestamp.now()
    });
  });
  
  await batch.commit();
  console.log('✅ Все 3 записи созданы!');
  // Каждая запись отправит отдельное сообщение в Telegram
}
```

## Пример 5: Проверка логов функции

```bash
# Просмотреть последние логи
firebase functions:log

# Просмотреть логи в реальном времени
firebase functions:log --follow

# Фильтровать по функции
firebase functions:log | grep "onDiaryPostCreated"

# Экспортировать логи в файл
firebase functions:log > function-logs.txt
```

Ожидаемый вывод:
```
i  functions: New diary post created {
  postId: "abc123def456",
  data: {
    title: "День 1",
    content: "Содержание...",
    author: "Сергей",
    createdAt: { _seconds: 1735569600, _nanoseconds: 0 }
  }
}
✔  functions: Telegram message sent successfully {
  messageId: 98765432
}
```

## Пример 6: Обработка ошибок при отправке в Telegram

```typescript
// functions/src/index.ts

export const onDiaryPostCreated = functions.firestore.onDocumentCreated(
  "diary_posts/{postId}",
  async (event) => {
    try {
      const postData = event.data!.data();
      const postId = event.params.postId;

      functions.logger.log("Processing post", { postId });

      const message = formatDiaryPostMessage(postData, postId);
      await sendTelegramMessage(message);

      return { success: true };

    } catch (error) {
      functions.logger.error("Error in onDiaryPostCreated", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Важно: выбросить ошибку, чтобы Firebase повторил попытку
      throw error;
    }
  }
);
```

## Пример 7: Отправка дополнительной информации в Telegram

Кастомизировать формат сообщения:

```typescript
function formatDiaryPostMessage(
  postData: admin.firestore.DocumentData,
  postId: string
): string {
  const title = postData.title || "Новая запись";
  const content = postData.content || "";
  const author = postData.author || "Неизвестный";
  const location = postData.location || "Неизвестное место";
  const date = postData.createdAt
    ? new Date(postData.createdAt.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    `📝 <b>${escapeHtml(title)}</b>\n` +
    `👤 <b>Автор:</b> ${escapeHtml(author)}\n` +
    `📍 <b>Место:</b> ${escapeHtml(location)}\n` +
    `📅 <b>Дата:</b> ${date}\n\n` +
    `<i>${escapeHtml(truncatedContent)}</i>\n\n` +
    `🔗 <a href="https://yourapp.com/posts/${postId}">Читать полностью</a>\n\n` +
    `#thailand #diary #${postId}`
  );
}
```

## Пример 8: Отправка медиа в Telegram (расширение)

```typescript
// Если нужно отправлять фотографии с записями

export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string
): Promise<void> {
  const config = getConfig();
  const telegramApiUrl =
    `https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`;

  const response = await axios.post(telegramApiUrl, {
    chat_id: config.telegramChatId,
    photo: photoUrl,
    caption: caption,
    parse_mode: "HTML"
  });

  if (!response.data.ok) {
    throw new Error(`Telegram API error: ${response.data.description}`);
  }
}
```

## Пример 9: Условная отправка (только если важная запись)

```typescript
export const onDiaryPostCreated = functions.firestore.onDocumentCreated(
  "diary_posts/{postId}",
  async (event) => {
    try {
      const postData = event.data!.data();
      const postId = event.params.postId;

      // Отправлять только если отмечено как важное
      if (postData.isImportant === false) {
        functions.logger.log("Skipping non-important post", { postId });
        return;
      }

      const message = formatDiaryPostMessage(postData, postId);
      await sendTelegramMessage(message);

      return { success: true };

    } catch (error) {
      functions.logger.error("Error processing post", { error });
      throw error;
    }
  }
);
```

## Пример 10: Развертывание на production

```bash
# 1. Установить конфигурацию (одноразово)
firebase functions:config:set telegram.bot_token="8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk"
firebase functions:config:set telegram.chat_id="-5180269549"

# 2. Проверить конфигурацию
firebase functions:config:get

# 3. Пересобрать функции
cd functions
npm run build

# 4. Развернуть
firebase deploy --only functions

# 5. Проверить логи
firebase functions:log --follow

# 6. Создать тестовую запись в Firestore Console и проверить Telegram
```

## Чек-лист перед production

- [ ] Конфигурация установлена: `firebase functions:config:get`
- [ ] Функция скомпилирована: `npm run build` без ошибок
- [ ] Функция развернута: `firebase functions:list` содержит `onDiaryPostCreated`
- [ ] Логи читаемы: `firebase functions:log`
- [ ] Тестовая запись отправлена в Telegram успешно
- [ ] Бот добавлен в группу
- [ ] ID группы корректен (отрицательное число)
- [ ] Токен корректен и не истекает

---

**Все примеры готовы к использованию!** 🚀

# Интеграция Telegram уведомлений в React приложение

## Обзор

Cloud Function `onDiaryPostCreated` автоматически отправляет сообщение в Telegram при создании новой записи в коллекции `diary_posts`. Тебе просто нужно создавать записи через обычный Firestore API.

## Добавление функции создания записи в DiaryScreen

Открой файл `spa-app/src/screens/DiaryScreen.tsx` и добавь функцию для создания записи:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Функция для создания новой записи в дневнике
export async function createDiaryPost(
  title: string,
  content: string,
  author: string = 'Anonymous'
) {
  try {
    const docRef = await addDoc(collection(db, 'diary_posts'), {
      title,
      content,
      author,
      createdAt: Timestamp.now()
    });
    
    console.log('✅ Запись создана в Firestore:', docRef.id);
    // Cloud Function автоматически отправит уведомление в Telegram
    return docRef.id;
  } catch (error) {
    console.error('❌ Ошибка при создании записи:', error);
    throw error;
  }
}
```

## Использование в компоненте

```typescript
import React, { useState } from 'react';
import { createDiaryPost } from '../services/diaryService';

function DiaryPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setMessage('❌ Заполни заголовок и содержание');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await createDiaryPost(title, content, author || 'Anonymous');
      setMessage('✅ Запись добавлена и отправлена в Telegram!');
      
      // Очистить форму
      setTitle('');
      setContent('');
      setAuthor('');
      
      // Скрыть сообщение через 3 секунды
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка при создании записи');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Заголовок записи"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      
      <textarea
        placeholder="Содержание записи"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      
      <input
        type="text"
        placeholder="Ваше имя (опционально)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        disabled={loading}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Добавить запись'}
      </button>
      
      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default DiaryPostForm;
```

## Требования к данным

Каждая запись в коллекции `diary_posts` должна содержать:

```typescript
interface DiaryPost {
  title: string;           // Обязательно - заголовок записи
  content: string;         // Обязательно - содержание записи
  author?: string;         // Опционально - имя автора
  createdAt: Timestamp;    // Обязательно - дата создания
}
```

## Как работает процесс

1. 📝 Пользователь заполняет форму и нажимает "Добавить запись"
2. 💾 Запись сохраняется в Firestore коллекцию `diary_posts`
3. 🔔 **Cloud Function автоматически срабатывает** при создании документа
4. 📤 Функция отправляет отформатированное сообщение в Telegram
5. 📱 Сообщение появляется в Telegram группе

## Пример сообщения в Telegram

```
📝 Название записи
Автор: Иван
Дата: 30.12.2025

Содержание записи...

#diarypost #doc123abc
```

## Правила Firestore

Убедись, что в `firestore.rules` есть правило для создания записей в `diary_posts`:

```
match /diary_posts/{document=**} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth.uid == resource.data.authorId;
  allow delete: if request.auth.uid == resource.data.authorId;
}
```

## Мониторинг

Для контроля отправок в Telegram:

1. **В Firebase Console:**
   - Перейди в Functions > Logs
   - Ищи функцию `onDiaryPostCreated`
   - Проверь статус выполнения (успех/ошибка)

2. **В Telegram:**
   - Проверь, что группа получила сообщение
   - Если ошибка - проверь логи функции

3. **Через CLI:**
   ```bash
   firebase functions:log --follow
   ```

## Troubleshooting

### Запись создается, но сообщение не приходит

1. Проверь, что функция развернута:
   ```bash
   firebase functions:list | grep onDiaryPostCreated
   ```

2. Посмотри логи:
   ```bash
   firebase functions:log
   ```

3. Убедись, что конфигурация установлена:
   ```bash
   firebase functions:config:get telegram
   ```

### Сообщение содержит странные символы

Функция автоматически экранирует HTML спецсимволы. Если видишь `&amp;` вместо `&` - это нормально для HTML parse_mode в Telegram.

### Функция выполняется слишком долго

Timeout по умолчанию 60 секунд. Если нужно больше:

```bash
firebase functions:config:set functions.timeout="300"
firebase deploy --only functions
```

## Безопасность

✅ Все чувствительные данные хранятся в Firebase конфигурации, не в коде
✅ Токены передаются только через environment переменные
✅ HTML автоматически экранируется для безопасности
✅ Используются правила Firestore для контроля доступа

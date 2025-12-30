# Тестирование Cloud Functions локально

## Локальное тестирование с эмулятором

### 1. Подготовка

Убедись, что у тебя установлены эмуляторы Firebase:

```bash
npm install -g firebase-tools
firebase emulators:start --only firestore,functions
```

### 2. Запуск эмулятора в отдельном терминале

```bash
cd /Users/sergey/Documents/thailand-family-trip
firebase emulators:start --only firestore,functions
```

Эмулятор должен стартовать на `http://localhost:4000`

### 3. Тестирование функции

В другом терминале используй одну из этих команд:

#### Вариант А: Через Node.js скрипт

Создай файл `test-function.js` в папке `functions`:

```javascript
const admin = require('firebase-admin');

const serviceAccount = require('./path-to-your-serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'your-project-id'
});

const db = admin.firestore();

// Подключись к локальному эмулятору
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Firestore emulator at', process.env.FIRESTORE_EMULATOR_HOST);
}

async function testDiaryPostCreation() {
  try {
    const docRef = await db.collection('diary_posts').add({
      title: 'Тестовая запись 🎉',
      content: 'Это тестовое сообщение для проверки функции отправки в Telegram',
      author: 'Тестовый пользователь',
      createdAt: new Date()
    });
    
    console.log('✅ Документ создан:', docRef.id);
    console.log('Проверь Telegram группу и логи функции');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testDiaryPostCreation();
```

Запусти скрипт:
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 node test-function.js
```

#### Вариант Б: Через Firebase Console UI

1. Открой http://localhost:4000 в браузере
2. Перейди на Firestore
3. Создай коллекцию `diary_posts`
4. Добавь документ с полями:
   - `title`: "Тестовая запись"
   - `content`: "Содержание записи"
   - `author`: "Автор"
   - `createdAt`: текущая дата

### 4. Проверка логов

Логи функции выводятся в консоли, где запущен эмулятор:

```
i  functions: Beginning execution of "onDiaryPostCreated"
i  functions: New diary post created postId=xxx
i  functions: Telegram message sent successfully
```

или проверь через команду:

```bash
firebase functions:log --follow
```

## Тестирование на Production

### 1. Развертывание

```bash
firebase deploy --only functions
```

### 2. Создание записи через приложение

В твоем React приложении добавь функцию для создания записи:

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

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
  
  console.log('Post created:', docRef.id);
}
```

### 3. Проверка логов

```bash
firebase functions:log
```

или в Firebase Console > Functions > Logs

## Troubleshooting

### Функция не срабатывает при создании документа

1. Проверь имя коллекции - должно быть ровно `diary_posts`
2. Убедись, что функция развернута:
   ```bash
   firebase functions:list
   ```
3. Проверь логи эмулятора в консоли

### Ошибка конфигурации

Убедись, что .env.local существует в папке `functions`:

```bash
cat functions/.env.local
# Должен вывести:
# TELEGRAM_BOT_TOKEN=...
# TELEGRAM_CHAT_ID=...
```

### Сообщение не отправляется в Telegram

1. Проверь токен бота - он должен быть корректным
2. Убедись, что бот добавлен в группу
3. Проверь ID группы - должен быть отрицательным числом
4. Проверь логи функции на ошибки API Telegram

### Ошибка сертификата при подключении к Firestore

Если используешь эмулятор, убедись что задана переменная:

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 node script.js
```

## Полезные команды

```bash
# Запустить эмулятор
firebase emulators:start --only firestore,functions

# Посмотреть логи
firebase functions:log

# Развернуть только функции
firebase deploy --only functions

# Список всех функций
firebase functions:list

# Удалить функцию
firebase functions:delete onDiaryPostCreated

# Очистить кэш и пересобрать
cd functions && rm -rf lib && npm run build
```

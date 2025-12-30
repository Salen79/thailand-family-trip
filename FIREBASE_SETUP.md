# Настройка Firebase для Telegram уведомлений

## Шаг 1: Установка Firebase CLI

Убедитесь, что у вас установлен Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

## Шаг 2: Выбор проекта

```bash
firebase use your-project-id
```

## Шаг 3: Установка переменных окружения (для Production)

### Способ A: Через Firebase CLI конфигурацию

Установи переменные окружения для Cloud Functions:

```bash
firebase functions:config:set telegram.bot_token="8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk"
firebase functions:config:set telegram.chat_id="-5180269549"
```

Проверь, что конфигурация установлена:

```bash
firebase functions:config:get
```

**Важно:** Эти переменные будут доступны через `functions.config().telegram.bot_token` (старый API) или как environment переменные в контексте функции.

### Способ B: Через Environment переменные (.env.local)

Для локальной разработки создай файл `functions/.env.local`:

```
TELEGRAM_BOT_TOKEN=8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk
TELEGRAM_CHAT_ID=-5180269549
```

Запусти эмулятор:

```bash
cd functions
npm run serve
```

## Шаг 4: Развертывание Functions

### Вариант 1: Развернуть только Functions

```bash
firebase deploy --only functions
```

### Вариант 2: Развернуть всё (Functions + Hosting + Firestore)

```bash
firebase deploy
```

## Шаг 5: Проверка развертывания

Проверь список развернутых функций:

```bash
firebase functions:list
```

Просмотри логи:

```bash
firebase functions:log
```

или в реальном времени:

```bash
firebase functions:log --follow
```

## Шаг 6: Тестирование

Создай документ в Firestore коллекции `diary_posts`:

```javascript
// Через Firebase Console или через код
db.collection('diary_posts').add({
  title: 'Тестовая запись',
  content: 'Содержание записи для проверки',
  author: 'Тестовый автор',
  createdAt: new Date()
})
```

Проверь Telegram группу - должно прийти уведомление!

## Безопасность

✅ **Никогда не коммитьте секретные ключи в Git!**

- Токены хранятся в Firebase функциях конфигурации, не в коде
- `.env.local` файл должен быть в `.gitignore`
- Используй `process.env` для доступа к переменным

## Troubleshooting

### Функция не срабатывает

1. Проверь, что функция развернута:
   ```bash
   firebase functions:list
   ```

2. Убедись в правильном имени коллекции (`diary_posts`)

3. Проверь логи:
   ```bash
   firebase functions:log
   ```

### Сообщение не отправляется в Telegram

1. Проверь конфигурацию:
   ```bash
   firebase functions:config:get
   ```

2. Убедись, что бот добавлен в группу

3. Проверь логи ошибок в Firebase Console > Functions

4. Проверь, что Telegram Bot Token корректен

### Ошибка при развертывании

```bash
# Очистить кэш и пересобрать
cd functions
rm -rf lib node_modules
npm install
npm run build
firebase deploy --only functions
```

## Переменные окружения для разных окружений

Для разработки используй `.env.local`:
```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=yyy
```

Для production используй Firebase конфигурацию:
```bash
firebase functions:config:set telegram.bot_token="xxx"
firebase functions:config:set telegram.chat_id="yyy"
```

Код автоматически выберет `process.env` если переменная есть, иначе попробует `functions.config()`.

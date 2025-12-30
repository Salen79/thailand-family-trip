#!/bin/bash

# Тест отправки в реальный Telegram
BOT_TOKEN="8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk"
CHAT_ID="-5180269549"

echo "=== ТЕСТ 1: Отправка текстового сообщения ==="
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "'$CHAT_ID'",
    "text": "📝 <b>Тест функции</b>\n�� 30.12.2025\n\nЭто тестовое сообщение от Cloud Function\n\n<i>#test</i>",
    "parse_mode": "HTML"
  }' 2>&1 | head -20

echo -e "\n=== ТЕСТ 2: Отправка фото с подписью ==="
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "'$CHAT_ID'",
    "photo": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600",
    "caption": "😍 <b>Сергей</b>\n📅 30.12.2025\n\nНевероятный закат!",
    "parse_mode": "HTML"
  }' 2>&1 | head -20

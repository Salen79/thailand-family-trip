/**
 * Локальный тест Cloud Function
 * Симулирует создание документа в Firestore и вызов функции
 */

const axios = require('axios');

// Константы
const BOT_TOKEN = "8110733520:AAHmTrG8NXm1DwFeSrA5POaiDpgu2gKHaUk";
const CHAT_ID = "-5180269549";

// Mock функции из telegram.ts
async function sendTelegramMessage(message) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(telegramApiUrl, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    console.log("✅ sendMessage успешно:", response.data.result.message_id);
    return response.data.result;
  } catch (error) {
    console.error("❌ sendMessage ошибка:", error.message);
    throw error;
  }
}

async function sendTelegramPhoto(photoUrl, caption) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const response = await axios.post(telegramApiUrl, {
      chat_id: CHAT_ID,
      photo: photoUrl,
      caption: caption,
      parse_mode: "HTML",
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    console.log("✅ sendPhoto успешно:", response.data.result.message_id);
    return response.data.result;
  } catch (error) {
    console.error("❌ sendPhoto ошибка:", error.message);
    throw error;
  }
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function formatDiaryPostCaption(postData, postId) {
  const emoji = postData.emoji || "📷";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    (truncatedContent ? `${escapeHtml(truncatedContent)}\n\n` : "") +
    `<i>#photo #${postId}</i>`
  );
}

function formatDiaryPostMessage(postData, postId) {
  const emoji = postData.emoji || "📝";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 200 ? content.substring(0, 197) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    `${escapeHtml(truncatedContent)}\n\n` +
    `<i>#diary #${postId}</i>`
  );
}

// Симуляция Cloud Function логики
async function simulateOnDiaryPostCreated(postData, postId) {
  console.log(`\n📨 Симуляция: Новая запись ${postId}`);
  console.log("Данные:", JSON.stringify(postData, null, 2));

  try {
    if (postData.media?.url) {
      console.log("\n🖼️  Обнаружено фото, отправляем sendPhoto...");
      const caption = formatDiaryPostCaption(postData, postId);
      await sendTelegramPhoto(postData.media.url, caption);
    } else {
      console.log("\n📝 Нет фото, отправляем sendMessage...");
      const message = formatDiaryPostMessage(postData, postId);
      await sendTelegramMessage(message);
    }
    console.log("✅ Функция выполнена успешно");
  } catch (error) {
    console.error("❌ Ошибка в функции:", error.message);
  }
}

// Тесты
(async () => {
  console.log("═══════════════════════════════════════");
  console.log("🧪 ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ CLOUD FUNCTION");
  console.log("═══════════════════════════════════════");

  // Тест 1: Запись с фото
  console.log("\n\n📌 ТЕСТ 1: Запись с фото");
  console.log("─────────────────────────");
  const postWithPhoto = {
    emoji: "😍",
    author: {
      id: "0",
      name: "Сергей",
      avatar: "👨",
    },
    content: "Невероятный закат над Чао Прайя! Просто магия!",
    media: {
      url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600",
      type: "image",
    },
  };

  await simulateOnDiaryPostCreated(postWithPhoto, "photo_test_001");

  // Тест 2: Запись без фото
  console.log("\n\n📌 ТЕСТ 2: Запись без фото (только текст)");
  console.log("─────────────────────────────────────────");
  const postWithoutPhoto = {
    emoji: "📝",
    author: {
      id: "1",
      name: "Алена",
      avatar: "👩",
    },
    content: "Сегодня посетили Grand Palace. Потрясающе красиво и величественно!",
    media: null,
  };

  await simulateOnDiaryPostCreated(postWithoutPhoto, "text_test_001");

  console.log("\n\n═══════════════════════════════════════");
  console.log("✅ Тестирование завершено!");
  console.log("═══════════════════════════════════════\n");
})();

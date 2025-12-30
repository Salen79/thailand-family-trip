import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { sendTelegramMessage } from "./telegram";

// Инициализируем Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function, которая срабатывает при создании новой записи в коллекции diary_posts
 * и отправляет уведомление в Telegram группу
 */
export const onDiaryPostCreated = functions.firestore.onDocumentCreated(
  "diary_posts/{postId}",
  async (event) => {
    try {
      const snap = event.data;
      const postId = event.params.postId;

      if (!snap) {
        functions.logger.error("No data in snapshot");
        return;
      }

      const postData = snap.data();

      functions.logger.log("New diary post created", { postId, data: postData });

      // Если есть фото, отправляем фото с подписью
      if (postData.media && postData.media.url) {
        await sendTelegramPhoto(postData, postId);
      } else {
        // Иначе отправляем текстовое сообщение
        const message = formatDiaryPostMessage(postData, postId);
        await sendTelegramMessage(message);
      }

      return { success: true, postId };
    } catch (error) {
      functions.logger.error("Error processing diary post", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

/**
 * Отправляет фото с подписью в Telegram
 */
async function sendTelegramPhoto(
  postData: admin.firestore.DocumentData,
  postId: string
): Promise<void> {
  try {
    const caption = formatDiaryPostCaption(postData, postId);
    const axios = await import("axios");
    const { getConfig, validateConfig } = await import("./config");

    validateConfig();
    const config = getConfig();

    const telegramApiUrl =
      `https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`;

    const response = await axios.default.post(telegramApiUrl, {
      chat_id: config.telegramChatId,
      photo: postData.media.url,
      caption: caption,
      parse_mode: "HTML",
    });

    if (!response.data.ok) {
      throw new Error(
        `Telegram API error: ${response.data.description || "Unknown error"}`
      );
    }

    functions.logger.log("Telegram photo sent successfully", {
      messageId: response.data.result.message_id,
    });
  } catch (error) {
    functions.logger.error("Failed to send Telegram photo", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Форматирует подпись для фото в Telegram
 */
function formatDiaryPostCaption(
  postData: admin.firestore.DocumentData,
  postId: string
): string {
  const emoji = postData.emoji || "📷";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  // Обрезаем контент если он слишком длинный
  const truncatedContent =
    content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    (truncatedContent ? `${escapeHtml(truncatedContent)}\n\n` : "") +
    `<i>#photo #${postId}</i>`
  );
}

/**
 * Форматирует данные записи дневника в сообщение для Telegram
 */
function formatDiaryPostMessage(
  postData: admin.firestore.DocumentData,
  postId: string
): string {
  const emoji = postData.emoji || "📝";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  // Обрезаем контент если он слишком длинный
  const truncatedContent =
    content.length > 200 ? content.substring(0, 197) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    `${escapeHtml(truncatedContent)}\n\n` +
    `<i>#diary #${postId}</i>`
  );
}

/**
 * Экранирует HTML спецсимволы для использования в Telegram HTML parse_mode
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

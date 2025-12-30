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

      // Формируем сообщение для Telegram
      const message = formatDiaryPostMessage(postData, postId);

      // Отправляем сообщение в Telegram
      await sendTelegramMessage(message);

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
 * Форматирует данные записи дневника в сообщение для Telegram
 */
function formatDiaryPostMessage(
  postData: admin.firestore.DocumentData,
  postId: string
): string {
  const title = postData.title || "Новая запись";
  const content = postData.content || "";
  const author = postData.author || "Неизвестный автор";
  const date = postData.createdAt
    ? new Date(postData.createdAt.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  // Обрезаем контент если он слишком длинный (Telegram имеет лимит)
  const truncatedContent =
    content.length > 200 ? content.substring(0, 197) + "..." : content;

  return (
    `📝 <b>${escapeHtml(title)}</b>\n` +
    `<b>Автор:</b> ${escapeHtml(author)}\n` +
    `<b>Дата:</b> ${date}\n\n` +
    `${escapeHtml(truncatedContent)}\n\n` +
    `<i>#diarypost #${postId}</i>`
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

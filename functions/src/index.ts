import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { sendTelegramMessage, sendTelegramPhoto } from "./telegram";

// Инициализируем Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Cloud Function, которая срабатывает при создании новой записи в коллекции diary_posts
 * и отправляет уведомление в Telegram группу
 */
export const onDiaryPostCreated = onDocumentCreated(
  {
    document: "diary_posts/{postId}",
    region: "asia-east1",
  },
  async (event) => {
    try {
      const snap = event.data;
      const postId = event.params.postId;

      if (!snap) {
        logger.error("No data in snapshot");
        return;
      }

      const postData = snap.data();

      // === ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ===
      logger.log("📝 New diary post created", {
        postId,
        hasMedia: !!postData.media,
        mediaUrl: postData.media?.url?.substring(0, 50),
      });

      // Проверяем структуру
      if (!postData.author) {
        logger.error("❌ Missing author field", { postId });
        return;
      }

      // === ОСНОВНАЯ ЛОГИКА ===
      const hasMediaUrl = postData.media && postData.media.url;

      if (hasMediaUrl) {
        logger.log("🖼️ Sending photo", { postId });
        const caption = formatDiaryPostCaption(postData, postId);
        await sendTelegramPhoto(postData.media.url, caption);
      } else {
        logger.log("📄 Sending message", { postId });
        const message = formatDiaryPostMessage(postData, postId);
        await sendTelegramMessage(message);
      }

      logger.log("✅ Successfully processed post", { postId });
    } catch (error) {
      logger.error("❌ Error processing diary post", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Cloud Function, которая срабатывает при создании нового ответа в квизе
 */
export const onQuizAnswerCreated = onDocumentCreated(
  {
    document: "quiz_answers/{answerId}",
    region: "asia-east1",
  },
  async (event) => {
    try {
      const snap = event.data;
      if (!snap) {
        logger.error("No data in snapshot");
        return;
      }

      const data = snap.data();
      const userName = data.userName || "Кто-то";
      const questionNum = data.questionId;
      const points = data.points || 0;
      const isCorrect = data.isCorrect;

      let message = "";
      if (isCorrect) {
        message = 
          `✅ <b>${escapeHtml(userName)}</b> правильно ответил(а) на ${questionNum}-й вопрос!\n` +
          `💰 Получено очков: <b>${points}</b>\n\n` +
          `🔗 <a href="https://secret-bangkog.web.app">Открыть приложение</a>`;
      } else {
        message = 
          `❌ <b>${escapeHtml(userName)}</b> ошибся в ${questionNum}-м вопросе. ` +
          `Пробует еще раз...\n\n` +
          `🔗 <a href="https://secret-bangkog.web.app">Открыть приложение</a>`;
      }

      await sendTelegramMessage(message);
      logger.log("✅ Quiz notification sent", { questionId: questionNum, user: userName, points });
    } catch (error) {
      logger.error("❌ Error processing quiz answer notification", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * Форматирует подпись для фото в Telegram
 */
function formatDiaryPostCaption(
  postData: admin.firestore.DocumentData,
  postId: string
): string {
  const emoji = postData.emoji || "📷";
  const author = postData.author?.name || "Пользователь";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b> запостил(а) новое фото в наш дневник!\n` +
    `📅 ${date}\n\n` +
    (truncatedContent ? `${escapeHtml(truncatedContent)}\n\n` : "") +
    `🔗 <a href="https://secret-bangkog.web.app">Открыть дневник</a>\n\n` +
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
  const author = postData.author?.name || "Пользователь";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 200 ? content.substring(0, 197) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b> запостил(а) новую запись в наш дневник!\n` +
    `📅 ${date}\n\n` +
    `${escapeHtml(truncatedContent)}\n\n` +
    `🔗 <a href="https://secret-bangkog.web.app">Открыть дневник</a>\n\n` +
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

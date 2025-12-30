// Локальный тест функции без эмулятора
import * as admin from "firebase-admin";

// Mock Firestore Timestamp
const mockTimestamp = {
  toDate: () => new Date("2025-12-30"),
  seconds: 1735603200,
  nanoseconds: 0,
};

// Mock данные для тестирования
const mockPostWithPhoto = {
  emoji: "😍",
  author: {
    id: "0",
    name: "Сергей",
    avatar: "👨",
  },
  content: "Невероятный закат над Чао Прайя!",
  media: {
    url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600",
    type: "image",
  },
  timestamp: mockTimestamp,
};

const mockPostWithoutPhoto = {
  emoji: "📝",
  author: {
    id: "0",
    name: "Алена",
    avatar: "👩",
  },
  content: "Сегодня посетили Grand Palace. Потрясающе красиво!",
  media: null,
  timestamp: mockTimestamp,
};

// Функции форматирования (скопированы из index.ts)
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

function formatDiaryPostCaption(
  postData: Record<string, any>,
  postId: string
): string {
  const emoji = postData.emoji || "📷";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    (truncatedContent ? `${escapeHtml(truncatedContent)}\n\n` : "") +
    `<i>#photo #${postId}</i>`
  );
}

function formatDiaryPostMessage(
  postData: Record<string, any>,
  postId: string
): string {
  const emoji = postData.emoji || "📝";
  const author = postData.author?.name || "Неизвестный автор";
  const content = postData.content || "";
  const date = postData.timestamp
    ? new Date(postData.timestamp.toDate()).toLocaleDateString("ru-RU")
    : new Date().toLocaleDateString("ru-RU");

  const truncatedContent =
    content.length > 200 ? content.substring(0, 197) + "..." : content;

  return (
    `${emoji} <b>${escapeHtml(author)}</b>\n` +
    `📅 ${date}\n\n` +
    `${escapeHtml(truncatedContent)}\n\n` +
    `<i>#diary #${postId}</i>`
  );
}

// Тестирование
console.log("=== ТЕСТ 1: Запись с фото ===");
const postId1 = "post_with_photo_123";
const caption = formatDiaryPostCaption(mockPostWithPhoto, postId1);
console.log("Подпись для Telegram:");
console.log(caption);
console.log("\nURL фото:", mockPostWithPhoto.media.url);
console.log("\n✅ Telegram.sendPhoto будет вызван с:");
console.log({
  chat_id: "-5180269549",
  photo: mockPostWithPhoto.media.url,
  caption: caption,
  parse_mode: "HTML",
});

console.log("\n=== ТЕСТ 2: Запись без фото ===");
const postId2 = "post_without_photo_456";
const message = formatDiaryPostMessage(mockPostWithoutPhoto, postId2);
console.log("Сообщение для Telegram:");
console.log(message);
console.log("\n✅ Telegram.sendMessage будет вызван с:");
console.log({
  chat_id: "-5180269549",
  text: message,
  parse_mode: "HTML",
});

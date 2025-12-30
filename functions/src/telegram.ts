import axios from "axios";
import * as functions from "firebase-functions/v2";
import { getConfig, validateConfig } from "./config";

/**
 * Отправляет сообщение в Telegram группу
 * @param message Текст сообщения
 */
export async function sendTelegramMessage(message: string): Promise<void> {
  try {
    validateConfig();
    const config = getConfig();
    const telegramApiUrl =
      `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

    const response = await axios.post(telegramApiUrl, {
      chat_id: config.telegramChatId,
      text: message,
      parse_mode: "HTML",
    });

    if (!response.data.ok) {
      throw new Error(
        `Telegram API error: ${response.data.description || "Unknown error"}`
      );
    }

    functions.logger.log("Telegram message sent successfully", {
      messageId: response.data.result.message_id,
    });
  } catch (error) {
    functions.logger.error("Failed to send Telegram message", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Отправляет фото с подписью в Telegram
 * @param photoUrl URL фото
 * @param caption Подпись к фото
 */
export async function sendTelegramPhoto(
  photoUrl: string,
  caption: string
): Promise<void> {
  try {
    validateConfig();
    const config = getConfig();
    const telegramApiUrl =
      `https://api.telegram.org/bot${config.telegramBotToken}/sendPhoto`;

    const response = await axios.post(telegramApiUrl, {
      chat_id: config.telegramChatId,
      photo: photoUrl,
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

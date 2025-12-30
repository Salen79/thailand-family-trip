import axios from "axios";
import * as functions from "firebase-functions/v2";
import { getConfig, validateConfig } from "./config";

/**
 * Отправляет сообщение в Telegram группу
 * @param message Текст сообщения
 */
export async function sendTelegramMessage(message: string): Promise<void> {
  try {
    // Проверяем конфигурацию перед отправкой
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

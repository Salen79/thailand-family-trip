/**
 * Загружает конфигурацию из environment переменных или functions.config()
 * Для локальной разработки используй .env.local
 */

export function getConfig() {
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.telegram_bot_token ||
    "";

  const chatId =
    process.env.TELEGRAM_CHAT_ID ||
    process.env.telegram_chat_id ||
    "";

  return {
    telegramBotToken: botToken,
    telegramChatId: chatId,
  };
}

export function validateConfig(): void {
  const config = getConfig();

  if (!config.telegramBotToken) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN not configured. " +
      "Set it via: firebase functions:config:set telegram.bot_token='...' " +
      "or TELEGRAM_BOT_TOKEN environment variable"
    );
  }

  if (!config.telegramChatId) {
    throw new Error(
      "TELEGRAM_CHAT_ID not configured. " +
      "Set it via: firebase functions:config:set telegram.chat_id='...' " +
      "or TELEGRAM_CHAT_ID environment variable"
    );
  }
}

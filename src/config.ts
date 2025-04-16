// src/config.ts
import dotenv from "dotenv";
dotenv.config();

interface Config {
  botToken: string;
  mongoUri: string;
  adminBotUserIds: number[];
  // Новые параметры:
  port: number; // Локальный порт для Express
  webhookDomain: string; // Публичный домен (например, https://asiancar25.ru)
  webhookPath: string; // Секретный путь для вебхука (например, /webhook/bot1)
}

// Функция для парсинга порта с fallback значением
function parsePort(portStr: string | undefined, defaultPort: number): number {
  if (portStr) {
    const parsed = parseInt(portStr, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
      return parsed;
    }
  }
  return defaultPort;
}

export const config: Config = {
  botToken: process.env.BOT_TOKEN || "",
  mongoUri: process.env.MONGO_URI || "",
  adminBotUserIds: process.env.ADMIN_BOT_USER_IDS
    ? process.env.ADMIN_BOT_USER_IDS.split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    : [],
  // --- Новые параметры ---
  // Используем порт 5000 по умолчанию для первого бота
  port: parsePort(process.env.PORT, 5000),
  // Важно: Домен должен включать https://
  webhookDomain: process.env.WEBHOOK_DOMAIN || "",
  // Путь должен начинаться со слеша /
  webhookPath: process.env.WEBHOOK_PATH || "",
};

// --- Проверки ---
if (!config.botToken) {
  console.error("ERROR: BOT_TOKEN is not defined in .env file!");
  process.exit(1);
}
if (!config.mongoUri) {
  console.error("ERROR: MONGO_URI is not defined in .env file!");
  process.exit(1);
}
if (config.adminBotUserIds.length === 0) {
  console.warn(
    "WARNING: ADMIN_BOT_USER_IDS is not defined. NO ONE can use the admin bot!"
  );
} else {
  console.log("Admin bot allowed user IDs:", config.adminBotUserIds);
}

// --- Новые проверки ---
if (!config.webhookDomain) {
  console.error(
    "ERROR: WEBHOOK_DOMAIN is not defined in .env file! (e.g., https://yourdomain.com)"
  );
  process.exit(1);
}
if (!config.webhookPath || !config.webhookPath.startsWith("/")) {
  console.error(
    "ERROR: WEBHOOK_PATH is not defined or invalid in .env file! (e.g., /your-secret-webhook-path)"
  );
  process.exit(1);
}

console.log(
  `Webhook will be set to: ${config.webhookDomain}${config.webhookPath}`
);
console.log(`Express server will listen on port: ${config.port}`);

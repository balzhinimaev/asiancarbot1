"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Функция для парсинга порта с fallback значением
function parsePort(portStr, defaultPort) {
    if (portStr) {
        const parsed = parseInt(portStr, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < 65536) {
            return parsed;
        }
    }
    return defaultPort;
}
exports.config = {
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
if (!exports.config.botToken) {
    console.error("ERROR: BOT_TOKEN is not defined in .env file!");
    process.exit(1);
}
if (!exports.config.mongoUri) {
    console.error("ERROR: MONGO_URI is not defined in .env file!");
    process.exit(1);
}
if (exports.config.adminBotUserIds.length === 0) {
    console.warn("WARNING: ADMIN_BOT_USER_IDS is not defined. NO ONE can use the admin bot!");
}
else {
    console.log("Admin bot allowed user IDs:", exports.config.adminBotUserIds);
}
// --- Новые проверки ---
if (!exports.config.webhookDomain) {
    console.error("ERROR: WEBHOOK_DOMAIN is not defined in .env file! (e.g., https://yourdomain.com)");
    process.exit(1);
}
if (!exports.config.webhookPath || !exports.config.webhookPath.startsWith("/")) {
    console.error("ERROR: WEBHOOK_PATH is not defined or invalid in .env file! (e.g., /your-secret-webhook-path)");
    process.exit(1);
}
console.log(`Webhook will be set to: ${exports.config.webhookDomain}${exports.config.webhookPath}`);
console.log(`Express server will listen on port: ${exports.config.port}`);
//# sourceMappingURL=config.js.map
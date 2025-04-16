"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
// --- src/services/database.service.ts (АДМИН-БОТ) ---
const mongoose_1 = __importDefault(require("mongoose"));
// Импортируем конфигурацию АДМИН-БОТА, чтобы получить строку подключения к БД
// Убедитесь, что путь правильный (может быть '../config' или '@/config')
const config_1 = require("@/config"); // Используем '@/config' для примера
/**
 * Функция для установления соединения с базой данных MongoDB.
 * Использует строку подключения из конфигурационного файла админ-бота.
 * Обрабатывает ошибки подключения и логирует статус.
 */
const connectDB = async () => {
    try {
        // Проверяем, есть ли уже активное соединение
        if (mongoose_1.default.connection.readyState >= 1) {
            console.log("[Admin Bot DB] MongoDB is already connected.");
            return;
        }
        console.log(`[Admin Bot DB] Attempting to connect to MongoDB at ${config_1.config.mongoUri}...`);
        // Устанавливаем соединение
        await mongoose_1.default.connect(config_1.config.mongoUri, {
            dbName: "raschet"
        });
        console.log("✅ [Admin Bot DB] MongoDB Connected Successfully.");
        // --- Настройка обработчиков событий соединения ---
        mongoose_1.default.connection.on("reconnected", () => {
            console.info("[Admin Bot DB] MongoDB reconnected.");
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("[Admin Bot DB] MongoDB disconnected.");
        });
        mongoose_1.default.connection.on("error", (error) => {
            console.error("[Admin Bot DB] MongoDB connection error after initial connect:", error);
        });
    }
    catch (err) {
        // Обработка ошибки при ПЕРВОМ подключении
        console.error("❌ [Admin Bot DB] MongoDB initial connection error:", err.message);
        console.error("   Ensure MongoDB is running and MONGO_URI in .env is correct.");
        process.exit(1); // Завершаем процесс админ-бота при ошибке подключения
    }
};
exports.connectDB = connectDB;
/**
 * Функция для корректного закрытия соединения с MongoDB.
 */
const disconnectDB = async () => {
    try {
        if (mongoose_1.default.connection.readyState !== 0) {
            console.log("[Admin Bot DB] Disconnecting from MongoDB...");
            await mongoose_1.default.disconnect();
            console.log("[Admin Bot DB] MongoDB disconnected.");
        }
    }
    catch (error) {
        console.error("[Admin Bot DB] Error disconnecting from MongoDB:", error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.service.js.map
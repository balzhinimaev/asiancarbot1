// --- src/app.ts (АДМИН-БОТ) ---
import express from "express";
import { bot } from "./bot"; // Импортируем инстанс бота
import { config } from "./config"; // Импортируем конфигурацию
import { connectDB } from "./services/database.service";
import http from "http"; // Для graceful shutdown

async function startAdminBotWithWebhook() {
  console.log("Starting Admin Rates Bot with Webhook support...");

  try {
    // 1. Подключаемся к БД
    await connectDB();
    console.log("Database connected successfully.");

    // 2. Создаем Express приложение
    const app = express();
    app.use(express.json()); // Middleware для парсинга JSON тела запроса (Telegram отправляет JSON)

    // 3. Генерируем URL вебхука
    const webhookUrl = `${config.webhookDomain}${config.webhookPath}`;
    console.log(`Setting webhook to: ${webhookUrl}`);

    // 4. Устанавливаем вебхук в Telegram
    // Это нужно делать при старте, Telegram будет отправлять обновления на этот URL
    const webhookSet = await bot.telegram.setWebhook(webhookUrl);
    if (!webhookSet) {
      throw new Error("Failed to set webhook");
    }
    console.log(`Webhook set successfully to ${webhookUrl}`);

    // 5. Настраиваем Express роут для приема обновлений от Telegram
    // Telegraf предоставляет middleware `webhookCallback`, которое обрабатывает запросы
    // Путь должен совпадать с тем, что указали в setWebhook и в конфиге Nginx
    app.use(bot.webhookCallback(config.webhookPath));

    // (Опционально) Добавим корневой роут для проверки, что сервер работает
    app.get("/", (req, res) => {
      res.send("Admin Bot is running with webhooks!");
    });

    // 6. Запускаем Express сервер
    const server = app.listen(config.port, () => {
      console.log(`✅ Admin Rates Bot server listening on port ${config.port}`);
      console.log(`Webhook endpoint available at path: ${config.webhookPath}`);
    });

    // 7. Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log("HTTP server closed.");
        // (Опционально, но рекомендуется) Удалить вебхук при остановке
        try {
          await bot.telegram.deleteWebhook({ drop_pending_updates: true });
          console.log("Webhook deleted successfully.");
        } catch (error) {
          console.error("Error deleting webhook:", error);
        }
        // Здесь можно добавить закрытие соединения с БД, если нужно
        // await mongoose.connection.close();
        console.log("Admin Bot shut down complete.");
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(
      "❌ Failed to start the Admin Rates Bot with webhook:",
      error
    );
    process.exit(1);
  }
}

startAdminBotWithWebhook();

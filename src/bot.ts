// --- src/bot.ts (АДМИН-БОТ) ---
import { Telegraf, Context } from "telegraf";
import { config } from "./config";
import { isAdmin } from "./middleware/isAdmin";
import { setRateHandler, getRatesHandler } from "./handlers/adminCommands";

// Используем базовый Context, т.к. сцены и сессии не нужны
export const bot = new Telegraf<Context>(config.botToken); // Экспортируем bot

// Логгирование (опционально)
bot.use(async (ctx, next) => {
  // Можно добавить проверку, что обновление пришло через вебхук, если нужно
  // console.log(ctx.request); // Содержит информацию о запросе
  console.log(
    `Admin bot received update: ${ctx.updateType} from ${ctx.from?.id} via webhook`
  );
  await next();
});

// Команды (защищенные middleware isAdmin)
bot.command("setrate", isAdmin, setRateHandler);
bot.command("getrates", isAdmin, getRatesHandler);
bot.command("start", (ctx) =>
  ctx.reply(
    "Админ-бот для управления курсами. Доступные команды:\n/setrate КОД ЗНАЧЕНИЕ\n/getrates"
  )
);
bot.help((ctx) =>
  ctx.reply("Доступные команды:\n/setrate КОД ЗНАЧЕНИЕ\n/getrates")
);

// Обработка ошибок (простая)
bot.catch((err, ctx) => {
  console.error(`Admin bot error for ${ctx.updateType}`, err);
  // Не пытаемся ответить, если ошибка произошла вне контекста ответа
  // (например, при установке вебхука)
  if (ctx.reply) {
    try {
      ctx.reply("Произошла ошибка при обработке вашего запроса.");
    } catch (e) {
      console.error("Error sending error message in admin bot:", e);
    }
  } else {
    console.error("Admin bot error occurred outside of a reply context.");
  }
});

// bot.launch() НЕ ВЫЗЫВАЕМ ЗДЕСЬ

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
// --- src/bot.ts (АДМИН-БОТ) ---
const telegraf_1 = require("telegraf");
const config_1 = require("./config");
const isAdmin_1 = require("./middleware/isAdmin");
const adminCommands_1 = require("./handlers/adminCommands");
// Используем базовый Context, т.к. сцены и сессии не нужны
exports.bot = new telegraf_1.Telegraf(config_1.config.botToken); // Экспортируем bot
// Логгирование (опционально)
exports.bot.use(async (ctx, next) => {
    // Можно добавить проверку, что обновление пришло через вебхук, если нужно
    // console.log(ctx.request); // Содержит информацию о запросе
    console.log(`Admin bot received update: ${ctx.updateType} from ${ctx.from?.id} via webhook`);
    await next();
});
// Команды (защищенные middleware isAdmin)
exports.bot.command("setrate", isAdmin_1.isAdmin, adminCommands_1.setRateHandler);
exports.bot.command("getrates", isAdmin_1.isAdmin, adminCommands_1.getRatesHandler);
exports.bot.command("start", (ctx) => ctx.reply("Админ-бот для управления курсами. Доступные команды:\n/setrate КОД ЗНАЧЕНИЕ\n/getrates"));
exports.bot.help((ctx) => ctx.reply("Доступные команды:\n/setrate КОД ЗНАЧЕНИЕ\n/getrates"));
// Обработка ошибок (простая)
exports.bot.catch((err, ctx) => {
    console.error(`Admin bot error for ${ctx.updateType}`, err);
    // Не пытаемся ответить, если ошибка произошла вне контекста ответа
    // (например, при установке вебхука)
    if (ctx.reply) {
        try {
            ctx.reply("Произошла ошибка при обработке вашего запроса.");
        }
        catch (e) {
            console.error("Error sending error message in admin bot:", e);
        }
    }
    else {
        console.error("Admin bot error occurred outside of a reply context.");
    }
});
// bot.launch() НЕ ВЫЗЫВАЕМ ЗДЕСЬ
//# sourceMappingURL=bot.js.map
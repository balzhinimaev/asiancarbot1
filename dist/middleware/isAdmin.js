"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
// Импортируем конфигурацию АДМИН-БОТА, чтобы получить список разрешенных ID
// Убедитесь, что путь правильный (может быть '../config' или '@/config')
const config_1 = require("@/config");
/**
 * Middleware для проверки, имеет ли пользователь право использовать админ-бота.
 * Пропускает дальше только если ctx.from.id есть в списке config.adminBotUserIds.
 */
const isAdmin = async (ctx, next) => {
    const userId = ctx.from?.id; // Получаем ID пользователя из контекста
    // Проверяем, есть ли ID пользователя и входит ли он в список разрешенных
    if (userId && config_1.config.adminBotUserIds.includes(userId)) {
        // Пользователь авторизован, передаем управление следующему обработчику (команде)
        // console.log(`[Admin Bot Auth] User ${userId} authorized.`); // Лог для отладки (можно убрать)
        return next();
    }
    else {
        // Пользователь не авторизован
        console.warn(`[Admin Bot Auth] Unauthorized access attempt by user ${userId || "unknown ID"}.`);
        // Отправляем сообщение об отказе в доступе
        await ctx.reply("🚫 У вас нет прав для использования этого бота или выполнения этой команды.");
        // НЕ вызываем next(), чтобы обработчик команды не выполнился
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=isAdmin.js.map
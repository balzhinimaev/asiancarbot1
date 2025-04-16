// --- src/middleware/isAdmin.ts (АДМИН-БОТ) ---
import { Context } from "telegraf";
// Импортируем конфигурацию АДМИН-БОТА, чтобы получить список разрешенных ID
// Убедитесь, что путь правильный (может быть '../config' или '@/config')
import { config } from '../config'
/**
 * Middleware для проверки, имеет ли пользователь право использовать админ-бота.
 * Пропускает дальше только если ctx.from.id есть в списке config.adminBotUserIds.
 */
export const isAdmin = async (ctx: Context, next: () => Promise<void>) => {
  const userId = ctx.from?.id; // Получаем ID пользователя из контекста

  // Проверяем, есть ли ID пользователя и входит ли он в список разрешенных
  if (userId && config.adminBotUserIds.includes(userId)) {
    // Пользователь авторизован, передаем управление следующему обработчику (команде)
    // console.log(`[Admin Bot Auth] User ${userId} authorized.`); // Лог для отладки (можно убрать)
    return next();
  } else {
    // Пользователь не авторизован
    console.warn(
      `[Admin Bot Auth] Unauthorized access attempt by user ${
        userId || "unknown ID"
      }.`
    );
    // Отправляем сообщение об отказе в доступе
    await ctx.reply(
      "🚫 У вас нет прав для использования этого бота или выполнения этой команды."
    );
    // НЕ вызываем next(), чтобы обработчик команды не выполнился
  }
};

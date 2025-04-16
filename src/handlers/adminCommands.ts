// --- src/handlers/adminCommands.ts ---
// Этот файл содержит обработчики команд, доступных только администраторам
// (тем, кто прошел проверку в middleware isAdmin).
// Он используется в админ-боте (asiancar-rates-admin).

import CurrencyRateModel, { CurrencyCode } from "../models/CurrencyRate.model";
import { Context } from "telegraf";
// Импортируем модель для работы с базой данных курсов
// import CurrencyRateModel, { CurrencyCode } from "@/models/CurrencyRate.model";
// Импортируем стандартные сообщения (например, для ошибок), если нужно
// import { messages } from '@/constants/messages'; // Если есть общие сообщения

// --- Команда /setrate ---
// Предназначена для установки или обновления курса конкретной валюты.
// Ожидаемый формат ввода от админа: /setrate КОД_ВАЛЮТЫ ЗНАЧЕНИЕ_КУРСА
// Пример: /setrate EUR 99.50
// Пример: /setrate KRW 0.071
export const setRateHandler = async (ctx: Context) => {
  // Middleware isAdmin уже проверил права доступа.

  // Убедимся, что контекст содержит текстовое сообщение (для command handler это так)
  if (!ctx.message || !("text" in ctx.message)) {
    console.warn("setRateHandler called without text message context.");
    return; // Не должно произойти для команды
  }

  // Разбиваем текст сообщения на части по пробелу, чтобы получить аргументы
  // ['/setrate', 'KRW', '0.075']
  // slice(1) убирает саму команду '/setrate'
  const args = ctx.message.text.split(" ").slice(1);

  // Проверяем, что передано ровно два аргумента (код валюты и значение)
  if (args.length !== 2) {
    await ctx.replyWithHTML(
      // Используем HTML для форматирования
      "<b>Ошибка: Неверный формат команды.</b>\n\n" +
        "Используйте: <code>/setrate КОД ЗНАЧЕНИЕ</code>\n" +
        "<i>Пример:</i> <code>/setrate KRW 0.075</code>\n\n" +
        "Допустимые коды валют: <b>KRW, CNY, JPY, EUR</b>"
    );
    return; // Прерываем выполнение обработчика
  }

  // Извлекаем код валюты и значение курса из аргументов
  const code = args[0].toUpperCase() as CurrencyCode; // Приводим код к верхнему регистру
  const rateStr = args[1].replace(",", "."); // Позволяем использовать запятую как разделитель
  const rate = parseFloat(rateStr); // Преобразуем строку в число

  // Валидация кода валюты: проверяем, входит ли он в список допустимых
  const allowedCodes: CurrencyCode[] = ["KRW", "CNY", "JPY", "EUR"];
  if (!allowedCodes.includes(code)) {
    await ctx.reply(
      `🚫 Неверный код валюты "<b>${code}</b>".\n` +
        `Допустимые коды: <b>${allowedCodes.join(", ")}</b>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Валидация значения курса: проверяем, что это положительное число
  if (isNaN(rate) || rate <= 0) {
    await ctx.reply(
      `🚫 Неверное значение курса "<b>${args[1]}</b>".\n` +
        `Укажите положительное число (можно с точкой или запятой).`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Пытаемся обновить или создать запись в базе данных
  try {
    console.log(
      `[Admin Bot] Attempting to set rate for ${code} to ${rate} by user ${ctx.from?.id}`
    );

    // Ищем документ с указанным кодом валюты.
    // Если найден - обновляем поле 'rate'.
    // Если не найден - создаем новый документ с указанным кодом и курсом (благодаря опции upsert: true).
    const updatedRateDoc = await CurrencyRateModel.findOneAndUpdate(
      { code: code }, // Условие поиска: найти по коду валюты
      { $set: { rate: rate } }, // Данные для обновления: установить новое значение курса
      {
        upsert: true, // Создать документ, если он не найден
        new: true, // Вернуть обновленный/созданный документ, а не старый
        setDefaultsOnInsert: true, // Применить значения по умолчанию из схемы при создании (если есть)
      }
    ).exec(); // Выполняем запрос

    // Проверка на случай, если upsert по какой-то причине не сработал
    if (!updatedRateDoc) {
      throw new Error("Не удалось обновить или создать запись курса в БД.");
    }

    // Логируем успешное действие
    console.log(
      `[Admin Bot] Successfully set rate for ${updatedRateDoc.code} to ${updatedRateDoc.rate}. Updated at: ${updatedRateDoc.updatedAt}`
    );

    // Отправляем подтверждение пользователю
    await ctx.replyWithHTML(
      `✅ Курс для <b>${updatedRateDoc.code}</b> успешно установлен: <b>${updatedRateDoc.rate}</b>\n` +
        `<i>Последнее обновление: ${updatedRateDoc.updatedAt.toLocaleString(
          "ru-RU"
        )}</i>`
    );
  } catch (error: any) {
    // Обработка ошибок при работе с базой данных
    console.error(
      `[Admin Bot] Error setting rate for ${code} by admin ${ctx.from?.id}:`,
      error
    );
    // Отправляем сообщение об ошибке пользователю
    await ctx.reply(
      `❌ <b>Ошибка при установке курса!</b>\n\n` +
        `<i>Детали: ${
          error.message || "Неизвестная ошибка базы данных"
        }</i>\n\n` +
        `Попробуйте еще раз или проверьте формат команды.`,
      { parse_mode: "HTML" }
    );
  }
};

// --- Команда /getrates ---
// Предназначена для просмотра всех текущих курсов, сохраненных в базе данных.
export const getRatesHandler = async (ctx: Context) => {
  // Middleware isAdmin уже проверил права доступа.
  console.log(`[Admin Bot] User ${ctx.from?.id} requested current rates.`);

  try {
    // Запрашиваем все документы из коллекции 'currency_rates'
    // Сортируем результат по коду валюты для упорядоченного вывода
    const rates = await CurrencyRateModel.find().sort({ code: 1 }).exec();

    // Проверяем, есть ли вообще записи в базе данных
    if (!rates || rates.length === 0) {
      await ctx.reply(
        "⚠️ В базе данных пока нет установленных курсов.\n" +
          "Используйте команду <code>/setrate КОД ЗНАЧЕНИЕ</code> для их добавления.",
        { parse_mode: "HTML" }
      );
      return; // Прерываем выполнение
    }

    // Формируем текстовый ответ с курсами
    let response = "📊 <b>Текущие курсы валют (к RUB):</b>\n\n";
    rates.forEach((rateDoc) => {
      // Добавляем строку для каждой валюты
      response +=
        `<b>${rateDoc.code}:</b> ${rateDoc.rate}\n` +
        `   <i>(Обновлено: ${rateDoc.updatedAt.toLocaleString("ru-RU")})</i>\n`;
    });

    // Отправляем сформированное сообщение пользователю
    await ctx.replyWithHTML(response);
  } catch (error: any) {
    // Обработка ошибок при чтении из базы данных
    console.error(
      `[Admin Bot] Error fetching rates by admin ${ctx.from?.id}:`,
      error
    );
    await ctx.reply(
      `❌ <b>Ошибка при получении курсов!</b>\n\n` +
        `<i>Детали: ${error.message || "Неизвестная ошибка базы данных"}</i>`,
      { parse_mode: "HTML" }
    );
  }
};

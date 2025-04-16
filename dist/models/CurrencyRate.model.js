"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// --- src/models/CurrencyRate.model.ts ---
const mongoose_1 = __importStar(require("mongoose"));
// Определяем схему данных для Mongoose.
// Схема описывает структуру документов в коллекции MongoDB.
const CurrencyRateSchema = new mongoose_1.Schema({
    // Поле 'code': код валюты
    code: {
        type: String, // Тип данных в MongoDB
        required: [true, "Код валюты обязателен"], // Поле обязательно для заполнения
        unique: true, // Значения в этом поле должны быть уникальными во всей коллекции
        enum: {
            // Ограничиваем возможные значения для поля 'code'
            values: ["KRW", "CNY", "JPY", "EUR"],
            message: "Недопустимый код валюты: {VALUE}. Допустимые: KRW, CNY, JPY, EUR.", // Сообщение об ошибке при неверном значении
        },
        index: true, // Создаем индекс по этому полю для ускорения поиска
    },
    // Поле 'rate': значение курса
    rate: {
        type: Number, // Тип данных в MongoDB
        required: [true, "Значение курса обязательно"], // Поле обязательно
        min: [0, "Курс валюты не может быть отрицательным"], // Минимальное допустимое значение
        // Можно добавить и другие валидаторы, например, максимальное значение, если нужно
    },
}, {
    // Опции схемы:
    timestamps: {
        createdAt: false, // Не добавлять автоматически поле createdAt
        updatedAt: true, // Автоматически обновлять поле updatedAt при каждом изменении документа
    },
    versionKey: false, // Не добавлять поле версии (__v), которое Mongoose добавляет по умолчанию
    collection: "currency_rates", // Явно указываем имя коллекции в MongoDB
});
// Создаем и экспортируем модель Mongoose.
// Модель - это конструктор, который позволяет создавать, читать, обновлять и удалять документы
// в соответствующей коллекции MongoDB, используя определенную схему.
// Мы типизируем модель с помощью интерфейса ICurrencyRate для удобства работы в TypeScript.
exports.default = mongoose_1.default.model("CurrencyRate", CurrencyRateSchema);
//# sourceMappingURL=CurrencyRate.model.js.map
const { Bot, webhookCallback } = require('grammy');
const Groq = require('groq-sdk');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `Ты — вежливый ассистент поддержки платформы "Xolis Arenda" — Telegram-приложения для аренды жилья в Узбекистане.

ВАЖНО: Xolis Arenda работает ТОЛЬКО внутри Telegram — это Mini App. Никакого отдельного сайта или аккаунта нет. Пользователь уже авторизован через Telegram автоматически.

Главный бот с приложением: @xolisarenda_bot
Ссылка на бота: t.me/xolisarenda_bot

Как пользоваться приложением:
• Открыть каталог — перейдите в бота @xolisarenda_bot и нажмите кнопку "🏠 Найти жильё" внизу чата (или зелёную кнопку слева от поля ввода).
• Добавить объявление — открыть Mini App через @xolisarenda_bot → кнопка "➕ Добавить объявление".
• Найти жильё — в Mini App есть AI-поиск: можно написать "2-комнатная в Юнусабаде до 3 млн сум" — AI поймёт.

Правила платформы:
• Только реальные объявления о сдаче жилья.
• Максимум 2 активных объявления на одного пользователя.
• Минимальная цена — 30 000 сум.
• Заголовок — минимум 10 символов, описание — минимум 30 символов.
• Публикация бесплатна.

Если пользователь жалуется на мошенника — попроси нажать "🚨 Это риелтор" в карточке объявления.
Если пользователь хочет связаться с живым человеком — скажи написать в этот же чат, ты передашь вопрос команде.

Отвечай кратко (2-4 предложения) на том же языке, на котором написан вопрос.`;

bot.on('message', async (ctx) => {
  await ctx.replyWithChatAction('typing');
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ctx.message.text || '' }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.6,
      max_tokens: 300
    });
    const reply = completion.choices[0]?.message?.content;
    if (reply) await ctx.reply(reply);
    else throw new Error('Empty response');
  } catch (err) {
    console.error('Groq error:', err);
    await ctx.reply('Извините, возникла ошибка. Попробуйте позже.');
  }
});

module.exports = webhookCallback(bot, 'https');

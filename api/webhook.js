const { Bot, webhookCallback } = require('grammy');
const Groq = require('groq-sdk');

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `Ты — вежливый ассистент поддержки платформы "Xolis Arenda" по аренде жилья в Узбекистане.
Правила платформы: только реальные объявления, максимум 2 активных объявления на пользователя, цена от 30 000 сум.
Для связи с человеком: @xolisarenda_support.
Отвечай кратко (2-4 предложения) на русском, узбекском или английском — на языке вопроса.`;

bot.on('message', async (ctx) => {
  await ctx.replyWithChatAction('typing');
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ctx.message.text || '' }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 250
    });
    const reply = completion.choices[0]?.message?.content;
    if (reply) await ctx.reply(reply);
    else throw new Error('Empty response');
  } catch (err) {
    console.error('Groq error:', err);
    await ctx.reply('Извините, возникла ошибка. Попробуйте позже или напишите @xolisarenda_support.');
  }
});

module.exports = webhookCallback(bot, 'https');

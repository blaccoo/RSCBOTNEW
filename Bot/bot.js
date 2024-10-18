const { Telegraf } = require("telegraf");
const TOKEN = "7527123224:AAGziEn6Pt_zh-Db1121IIDhh-4Ztm1jdFY";
const bot = new Telegraf(TOKEN);

const web_link = process.env.WEB_LINK;
const community_link = process.env.COMMUNITY_LINK; 

bot.start((ctx) => {
  const startPayload = ctx.startPayload;
  const urlSent = `${web_link}?ref=${startPayload}`;
  const user = ctx.message.from;
  const userName = user.username ? `@${user.username}` : user.first_name;
  ctx.replyWithMarkdown(`*Hey, ${userName}! Welcome to RisingCoin!*
Tap on the coin and see your balance rise.

RisingCoin is a cryptocurrency platform with a play to earn game, Dex exchange base on multiple exchanges.`, {
      reply_markup: {
          inline_keyboard: [
            [{ text: "👋 Start now!", web_app: { url: urlSent } }],
            [{ text: "Join Community", url: community_link }]
          
          ],
          in: true
      },
  });
});



bot.launch();

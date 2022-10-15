const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5700037817:AAFRNuRtpyETylCioV3o9r-uHeSP5x0J5ks'
const webAppUrl = 'https://unrivaled-alfajores-4cf0a0.netlify.app/';
const bot = new TelegramBot(token, {polling: true});

const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text === '/start' || text === 'Заполнить форму') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму!', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'form'}}]
                ]
            }
        })
    }
    else if (text === 'Перейти на сайт') {
        await bot.sendMessage(chatId, 'Чтобы перейти на сайт, нажмите кнопку ниже!', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Перейти на сайт', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country + '\n' +
                                        'Ваш регион: ' + data?.region + '\n' +
                                        'Ваш город: ' + data?.city + '\n' +
                                        'Ваша улица: ' + data?.street);

        } catch (e) {
            console.log(e)
        }
        
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: `Поздравляю с покупкой, вы приобрели товар на сумму  ${totalPrice}р.`}
        })
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {message_text: 'Не удалось приобрести товар'}
        })
        return res.status(500).json({});
    }

    

    
})

const PORT = 8000;

app.listen(PORT, () => console.log('server stated on PORT ' + PORT))
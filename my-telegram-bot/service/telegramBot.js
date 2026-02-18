process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const { CHANNEL_ID, TOKEN } = process.env;
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const { fillTemplate } = require('./createExcel');
const { getDates } = require('./date');
const { previousDate, currentDate } = getDates();

const bot = new TelegramBot('6437547786:AAHSJTq_vx8kiAJ_V89bpphMYAXlhzqf1K8', { polling: true });

const texts = ['Список «непослушных» за период', 'Следующие «невидимки» ещё не подписали документы за период']

// Рассылка по расписанию (18:33 каждый день)
cron.schedule('19 10 * * *', async () => {
    const FILE_PATH = fillTemplate()
    bot.sendDocument('-1003473643652_2', await FILE_PATH, {
        caption: `<tg-emoji emoji-id="5436044822697750252">➡️</tg-emoji> Cледующие «невидимки» ещё не подписали документы за период ${previousDate.slice(0, 10)}-${currentDate.slice(0, 10)}`,
        parse_mode: 'HTML',
        message_thread_id: 2
    })
        .then(() => console.log('Файл успешно отправлен'))
        .catch(err => console.error('Ошибка отправки файла:', err.message));
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const threadId = msg.message_thread_id;

    // Проверяем ID группы и ID ветки
    if (chatId === -1003473643652 && threadId === 2) {
        bot.deleteMessage(chatId, msg.message_id)
            .catch(err => console.log("Ошибка: сообщение уже удалено или нет прав"));
    }
});

console.log('Бот запущен...');

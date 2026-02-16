process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const { file } = require('./ооп/app');
const token = '6437547786:AAHSJTq_vx8kiAJ_V89bpphMYAXlhzqf1K8';
const bot = new TelegramBot(token, { polling: true });
const { getDates } = require('./date');
const { previousDate, currentDate } = getDates();
const CHANNEL_ID = '-1003473643652_2';


const runFile = async () => {
    await file()
    const filePath = `./отчеты/${previousDate.slice(0, 10)}-${currentDate.slice(0, 10)}.xlsx`;
    return filePath
}

const texts = ['Список «непослушных» за период', 'Следующие «невидимки» ещё не подписали документы за период']

// Рассылка по расписанию (18:33 каждый день)
cron.schedule('44 20 * * *', async () => {
    const FILE_PATH = runFile()
    bot.sendDocument(CHANNEL_ID, await FILE_PATH, {
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const { runAll } = require('./app');

const token = '6437547786:AAHSJTq_vx8kiAJ_V89bpphMYAXlhzqf1K8';
const bot = new TelegramBot(token, { polling: true });

const CHANNEL_ID = '-1003473643652_2';

const start = async () => {
    // Ждем, пока runAll выполнит все запросы и вернет массив результатов
    const results = await runAll();
    console.log(results);
    

    // 1. Сначала превращаем массив массивов в один плоский список "отказников"
    const allUnsigned = results.flatMap(item =>
        item.value.filter(person => person.подписал === 'нет')
    );

    // 2. Теперь группируем этот плоский список
    const groupedDoctors = allUnsigned.reduce((acc, doctor) => {
        const otdel = doctor.Отделение;

        if (!acc[otdel]) acc[otdel] = [];

        acc[otdel].push(`${doctor.Фамилия} ${doctor.Имя} ${doctor.Отчество}`);

        return acc;
    }, {});

    
    // Формируем текст
    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(0, 0, 0, 0);

    const begin = new Date(end);
    begin.setMonth(begin.getMonth() - 1)
    const formatRU = (date) => date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    let report = `📅 <b>Список сотрудников:</b> ${formatRU(begin)} – ${formatRU(end)}\n\n`;

    Object.entries(groupedDoctors).forEach(([Отделение, names]) => {
        report += `<b>${Отделение}</b>\n`;
        names.forEach(name => {
            // Если кастомный эмодзи не отображается, замените его на обычный ➡️
            report += `<tg-emoji emoji-id="5436044822697750252">➡️</tg-emoji> ${name}\n`;
        });
        report += `\n`;
    });
    return report
};



async function main (params) {
    await start();
}
main

// Рассылка по расписанию (18:33 каждый день)
// cron.schedule('13 20 * * *', async () => {
//     const text = await start();
//     bot.sendMessage(CHANNEL_ID, text, {
//         parse_mode: 'HTML',
//         message_thread_id: 2
//     })
//         .then(() => console.log('Отчет успешно отправлен в канал'))
//         .catch(err => console.error('Ошибка:', err.message));
// });

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     const threadId = msg.message_thread_id;

//     // Проверяем ID группы и ID ветки
//     if (chatId === -1003473643652 && threadId === 2) {
//         bot.deleteMessage(chatId, msg.message_id)
//             .catch(err => console.log("Ошибка: сообщение уже удалено или нет прав"));
//     }
// });


console.log('Бот запущен...');

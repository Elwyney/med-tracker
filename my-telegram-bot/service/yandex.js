const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const userDataDir = path.join(__dirname, 'yandex-profile');
let browser = null;
let page = null;

async function getSession() {
    try {
        // Запускаем браузер если не запущен
        if (!browser) {
            browser = await puppeteer.launch({
                executablePath: '/var/lib/flatpak/exports/bin/ru.yandex.Browser',
                headless: false,
                userDataDir: userDataDir,
                args: ['--start-maximized', '--no-sandbox']
            });

            page = await browser.newPage();
            await page.goto('https://remd.egisz.rosminzdrav.ru/#/');
            await new Promise(r => setTimeout(r, 3000));
        }

    } catch (e) {
        console.error('❌', e.message);
    }
}

const ASession = async () => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            try {
                if (!page) return;

                const cookies = await page.cookies();
                const session = cookies.find(c => c.name === 'SESSION');

                if (session) {
                    clearInterval(interval);
                    resolve(session.value);
                }
            } catch (e) {
                clearInterval(interval);
                reject(e);
            }
        }, 500);
    });

}

(async () => {
    setInterval(async () => {
        // Обновляем страницу для keep-alive
        await page.reload();
    },2 * 60 * 1000);
    console.log('✅ Запущено.');
})();




module.exports = { getSession, ASession };




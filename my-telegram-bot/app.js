process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { previousDate, currentDate } = require('./date');
const doctor = require('./doctors.json');

// Уникальные врачи
const uniqueDoctors = Array.from(new Set(doctor.map(d => JSON.stringify(d)))).map(s => JSON.parse(s));

// Группировка врачей по подразделениям
const groupedDoctors = uniqueDoctors.reduce((acc, doctor) => {
    const {
        Типструктурногоподразделения: type,
        Наименованиеструктурногоподразделения: dept,
        Фамилия, Имя, Отчество,
        OIDструктурногоподразделения: oid
    } = doctor;

    // Инициализируем Тип (Стационарный, Амбулаторный и т.д.)
    if (!acc[type]) acc[type] = {};

    // Инициализируем конкретное Отделение как объект
    if (!acc[type][dept]) {
        acc[type][dept] = {
            oid: oid, // Сохраняем OID отделения
            doctors: [] // Список врачей этого отделения
        };
    }

    // Добавляем врача в список этого отделения
    acc[type][dept].doctors.push({ Фамилия, Имя, Отчество });

    return acc;
}, {});


// Функция для запроса к серверу
const fetchServer = async (dataUser) => {
    const { name, oid, users } = dataUser;
    const url = new URL("https://remd.egisz.rosminzdrav.ru/n2o/data/emdrRegistryList/dsMain");

    const params = {
        page: 1,
        size: 9999,
        table_departMedOrg_id: oid,
        table_registrationDateTime_begin: previousDate,
        table_registrationDateTime_end: currentDate,
        table_searchRadio_id: 2,
        withCount: false
    };

    // Безопасное добавление параметров
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    try {
        const response = await fetch(url, {
            headers: {
                "accept": "*/*",
                "accept-language": "ru,en;q=0.9",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"YaBrowser\";v=\"25.12\", \"Not_A Brand\";v=\"99\", \"Yowser\";v=\"2.5\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "cookie": "SESSION=ZWI4MDUxM2ItY2ZhOC00N2Y3LWJhNTctOWU1MDQ0YmI4ZDBj",
                "Referer": "https://remd.egisz.rosminzdrav.ru/"
            },
            method: "GET"
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();

        const processedUsers = users.map(user => {
            const doctorFIO = `${user.Фамилия} ${user.Имя} ${user.Отчество}`.trim();

            // Проверяем, есть ли этот врач в списке ответов от сервера
            const hasSignature = data.list.some(res => {
                const cleanEmplName = res.emplList.replace(/\s*\(.*\)/, "").trim();
                // Используем .toLowerCase() для надежности сравнения
                return cleanEmplName.toLowerCase() === doctorFIO.toLowerCase();
            });

            // Возвращаем объект врача с новым полем
            return {
                ...user, отделение: name,
                подписал: hasSignature ? 'да' : 'нет'
            };
        });

        return processedUsers;
    } catch (err) {
        console.error('Error fetching data:', err);

    }
};

// Функция-хелпер для ожидания
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const runAll = async () => {
    const departments = Object.keys(groupedDoctors.Стационарный);

    const results = await departments.reduce(async (prev, name) => {
        const acc = await prev;

        const { oid, doctors: users } = groupedDoctors.Стационарный[name];

        try {
            console.log(`Запрос для: ${name}...`);
            const data = await fetchServer({ name, oid, users });
            await sleep(1500);
            return [...acc, data];
        } catch (error) {
            console.error(`Ошибка в отделе ${name}:`, error);
            await sleep(1500);
            return acc;
        }
    }, Promise.resolve([]));

    // 1. Получаем плоский список всех, кто НЕ подписал
    const allUnsigned = results.flatMap(item =>
        (item.value ?? []).filter(person => person.подписал === 'нет')
    );

    // 2. Группируем по отделению
    const grouped = allUnsigned.reduce((acc, doctor) => {
        const otdel = doctor.Отделение;

        if (!acc[otdel]) acc[otdel] = [];

        acc[otdel].push(
            `${doctor.Фамилия} ${doctor.Имя} ${doctor.Отчество}`
        );

        return acc;
    }, {});


    console.log('Все запросы выполнены:', grouped);
};

runAll()

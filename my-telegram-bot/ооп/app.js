process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const ExcelJS = require('exceljs');
const fs = require('fs');
const doctor = require('../doctors.json');
const { getDates } = require('../date');
const { previousDate, currentDate } = getDates();
// Работа с врачами 
class DoctorService {
    constructor(doctors) {
        this.doctors = doctors;
    }
    // Уникальные врачи с группировкой по структуре
    uniqueAndGroupDoctors() {
        const uniqueMap = new Map();

        // Уникализируем врачей по ФИО и группируем сразу
        const groupedDoctors = this.doctors.reduce((acc, {
            Типструктурногоподразделения: type,
            Наименованиеструктурногоподразделения: dept,
            Фамилия,
            Имя,
            Отчество,
            OIDструктурногоподразделения: oid
        }) => {
            // Генерируем уникальный ключ на основе Фамилии, Имени и Отчества
            const fioKey = `${Фамилия}|${Имя}|${Отчество}`;

            // Проверяем, был ли уже добавлен этот врач по ключу (ФИО)
            if (!uniqueMap.has(fioKey)) {
                uniqueMap.set(fioKey, { Фамилия, Имя, Отчество, type, dept, oid });

                // Группируем по Типу и Наименованию структурного подразделения
                acc[type] ??= {};
                acc[type][dept] ??= { oid, doctors: [] };
                acc[type][dept].doctors.push({ Фамилия, Имя, Отчество });
            }

            return acc;
        }, {});

        return groupedDoctors;
    }
    // достаем отд.
    getDepartment(groupedDoctors) {
        const departments = groupedDoctors.Стационарный;
        return Object.keys(departments).map(key => ({
            department: key,
            oid: departments[key].oid,
            user: departments[key].doctors
        }));
    }
}

// 1 class
// Создание экземпляра класса
const doctorService = new DoctorService(doctor);
// 1. Получаем уникальных и сгруппированных врачей
const groupedDoctors = doctorService.uniqueAndGroupDoctors();
// 2. Получаем департамент с врачами
const department = doctorService.getDepartment(groupedDoctors);

// Запросы на сервер
class ClientServer {
    // Асинхронный запрос к серверу для одного отделения
    async fetchDoctorsByDepartment(obj) {
        const params = {
            page: 1,
            size: 9999,
            table_departMedOrg_id: obj.oid,
            table_registrationDateTime_begin: previousDate,
            table_registrationDateTime_end: currentDate,
            table_searchRadio_id: 2,
            withCount: false
        };
        const url = new URL("https://remd.egisz.rosminzdrav.ru/n2o/data/emdrRegistryList/dsMain");
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        const response = await fetch(url.href, {
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
                "cookie": "SESSION=NmY3NzY3YTEtMWI3Yi00Y2QyLTk4YmUtMzQ0YmRmZmQ5ZTMz",
                "Referer": "https://remd.egisz.rosminzdrav.ru/"
            },
            method: "GET"
        })
        console.log(obj.department);

        return response.json()
    }

    // Функция ожидания (пауза)
    sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
}
const fetchServer = new ClientServer()
// Организатор
class Process {
    constructor() {
        this.notSignedAll = []
    }
    async run() {
        for (const obj of department) {
            const response = await fetchServer.fetchDoctorsByDepartment(obj);

            const signatureSet = new Set(response.list.map(res => res.emplList.replace(/\s*\(.*\)/, "").trim()));

            const notSignedUsers = obj.user
                .map(user => {
                    const doctorFIO = `${user.Фамилия} ${user.Имя} ${user.Отчество || ""}`
                        .replace(/\s+/g, " ")
                        .trim()
                    const noSing = signatureSet.has(doctorFIO);

                    return {
                        фио: doctorFIO,
                        отделение: obj.department || "",
                        подписал: noSing ? "да" : "нет"
                    };
                })
                .filter(user => user.подписал === "нет");

            this.notSignedAll.push(...notSignedUsers); // добавляем всех не подписавших

            // пауза 2 секунды
            await fetchServer.sleep(2000);
        }
        return this.notSignedAll;
    }

}
// Вызов метода и обработка результата
async function getNotSignedUsers() {
    const process = new Process();
    const result = await process.run();
    console.log(result);
    return result
}


const file = async () => {
    try {
        const users = await getNotSignedUsers();

        if (!Array.isArray(users) || users.length === 0) {
            console.error('Нет данных для экспорта');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Сотрудники');

        // Заголовки
        const headers = Object.keys(users[0]);
        worksheet.addRow(headers);

        // Стили заголовков: синий фон, белый текст, жирный
        worksheet.getRow(1).eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0000FF' } // синий
            };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });

        // Добавляем данные
        users.forEach(user => {
            worksheet.addRow(Object.values(user));
        });

        // Автоширина колонок по содержимому
        worksheet.columns.forEach(column => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, cell => {
                const text = cell.value ? cell.value.toString() : '';
                if (text.length > maxLength) maxLength = text.length;
            });
            column.width = maxLength + 2; // немного отступа
        });

        const filePath = `./отчеты/${previousDate.slice(0, 10)}-${currentDate.slice(0, 10)}.xlsx`;
        await workbook.xlsx.writeFile(filePath);

    } catch (err) {
        console.error('Ошибка при создании Excel:', err);
    }
};
module.exports = { file };


//string-similarity
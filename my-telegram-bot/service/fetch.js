process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const doctor = require('../doctors.json');
const { getDates } = require('./date');
const { previousDate, currentDate } = getDates();


// вытаскиваем только станционар. 
// вытаскиваем уникальных пользователей и отделения
const departmentType = doctor.reduce((acc, item) => {
  const { Фамилия, Имя, Отчество, OIDструктурногоподразделения, Наименованиеструктурногоподразделения } = item

  if (item.Типструктурногоподразделения?.includes('Стационарный')) {
    const doctors = {
      users: `${Фамилия} ${Имя} ${Отчество}`,
      department: Наименованиеструктурногоподразделения
    }
    if (!acc.uniqueUsers.has(doctors.users)) {
      acc.uniqueUsers.add(doctors.users)
      acc.ListDoctors.push(doctors)
    }
    acc.ListDepartment.add(OIDструктурногоподразделения)
  }
  return acc
}, { ListDoctors: [], ListDepartment: new Set(), uniqueUsers: new Set() })


// структура запроса
const fetchDoctorsByDepartment = async (data) => {
  const params = {
    page: 1,
    size: 9999,
    table_departMedOrg_id: data,
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
      "cookie": `SESSION=ZjFiYzQ2ODEtYjA0OC00ZDMwLWE4ZjYtNGIzYWY3OGEzODBk`,
      "Referer": "https://remd.egisz.rosminzdrav.ru/"
    },
    method: "GET"
  })
  const jsonRes = await response.json();
  const SUPER = new Set(jsonRes.list.map(res => res.emplList.replace(/\s*\(.*\)/, "").trim()))
  return [...SUPER]
}
// интервал задержки
const sleep = (ms) => new Promise(res => setTimeout(res, ms))
// иницилизация 
const run = async () => {
  // список подписанных
  const allListDoctors = new Set()
  const { ListDepartment, ListDoctors } = departmentType
  // Запросы на сервер
  for (const item of ListDepartment) {
    const doctors = await fetchDoctorsByDepartment(item);
    doctors.forEach(doc => allListDoctors.add(doc));
    console.log('новый');
    await sleep(2000); // 
  }
  // вывод не подписанных
  const noSing = ListDoctors.reduce((acc, item) => {
    const { users, department } = item;

    if (!allListDoctors.has(users)) {
      if (!acc[department]) acc[department] = []
      acc[department].push(users)
    }
    return acc
  }, {})
  return noSing
}
module.exports = { run }

const ExcelJS = require('exceljs');
const { run } = require('./fetch');
const { getDates } = require('./date');
const { previousDate, currentDate } = getDates();
// Данные с отделениями и врачами

async function fillTemplate() {
  const workbook = new ExcelJS.Workbook();

  // 1️⃣ Открываем существующий шаблон
  await workbook.xlsx.readFile('шаблон.xlsx'); // путь к вашему шаблону

  // 2️⃣ Выбираем лист (замените 'Лист1' на реальное имя листа в шаблоне)
  const worksheet = workbook.getWorksheet('Лист1');
  if (!worksheet) {
    console.error("Лист 'Лист1' не найден. Проверьте название листа!");
    return;
  }

  // 3️⃣ Создаём заголовки в первой строке
  worksheet.getCell('A1').value = 'Отделение';
  worksheet.getCell('B1').value = 'ФИО';
  worksheet.getRow(1).font = { bold: true }; // делаем заголовки жирными

  // 4️⃣ Устанавливаем ширину колонок
  worksheet.getColumn(1).width = 50; // Отделение
  worksheet.getColumn(2).width = 35; // ФИО

  // 5️⃣ Определяем строку для начала записи (сразу под заголовком)
  let startRow = 2;
  let currentRow = startRow;

  // 6️⃣ Добавляем данные
  const data = await run()
  for (const [department, doctors] of Object.entries(data)) {
    doctors.forEach(doctor => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = department; // колонка A
      row.getCell(2).value = doctor;     // колонка B
      row.commit(); // фиксируем изменения строки
      currentRow++;
    });
  }

  // 7️⃣ Сохраняем в новый файл
  const filePath = `./отчеты/${previousDate.slice(0, 10)}-${currentDate.slice(0, 10)}.xlsx`;
  await workbook.xlsx.writeFile(filePath);
  console.log('Excel файл создан');
  return filePath
}

module.exports = { fillTemplate }

const { format, subDays, startOfMonth, set } = require('date-fns');

const resetTime = (date) =>
    set(date, { hours: 0, minutes: 0, seconds: 0 }); // миллисекунды остаются

const getDates = () => {
    const today = new Date();

    // currentDate — вчерашний день с временем 00:00:00
    const currentDate = format(
        resetTime(subDays(today, 1)),
        "yyyy-MM-dd'T'HH:mm:ss"
    );

    // previousDate — первое число текущего месяца с временем 00:00:00
    const previousDate = format(
        resetTime(startOfMonth(today)),
        "yyyy-MM-dd'T'HH:mm:ss"
    );

    console.log(previousDate, currentDate);

    return { previousDate, currentDate };
};

getDates();

module.exports = { getDates };

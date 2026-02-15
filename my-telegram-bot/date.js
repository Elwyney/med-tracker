const { format, subMonths, subDays, set } = require('date-fns');

const getDateMinusOneDay = (date) =>
    set(subDays(date, 1), {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    });

const getDates = () => {
    const today = new Date();

    const currentDate = format(
        getDateMinusOneDay(today),
        "yyyy-MM-dd'T'HH:mm:ss"
    );

    const previousDate = format(
        getDateMinusOneDay(subMonths(today, 1)),
        "yyyy-MM-dd'T'HH:mm:ss"
    );

    return { previousDate, currentDate };
};

module.exports = { getDates };

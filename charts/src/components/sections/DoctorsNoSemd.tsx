import { useEffect, useState } from "react";

interface ModelList {
    фио: string;
    отделение: string;
    подписал: string
}
const DoctorsNoSemd = () => {
    // const doctors: ModelList[] = [
    //     { fullName: 'Алексеев Игорь Валерьевич', department: 'Терапия' },
    //     { fullName: 'Борисова Наталья Юрьевна', department: 'Терапия' },

    //     { fullName: 'Григорьев Артем Денисович', department: 'Хирургия' },
    //     { fullName: 'Дмитриева Ксения Игоревна', department: 'Хирургия' },

    //     { fullName: 'Елисеев Роман Викторович', department: 'Кардиология' },
    //     { fullName: 'Жукова Светлана Михайловна', department: 'Кардиология' },

    //     { fullName: 'Зимин Константин Львович', department: 'Неврология' },
    //     { fullName: 'Игнатова Дарья Сергеевна', department: 'Неврология' },

    //     { fullName: 'Котов Максим Евгеньевич', department: 'Педиатрия' },
    //     { fullName: 'Лазарева Ирина Анатольевна', department: 'Педиатрия' },

    //     { fullName: 'Макаров Вадим Петрович', department: 'Кардиология' },
    //     { fullName: 'Никитина Ольга Борисовна', department: 'Кардиология' },

    //     { fullName: 'Осипов Геннадий Аркадьевич', department: 'Неврология' },
    //     { fullName: 'Полякова Вера Николаевна', department: 'Неврология' },

    //     { fullName: 'Румянцев Олег Владимирович', department: 'Педиатрия' },
    //     { fullName: 'Савельева Яна Дмитриевна', department: 'Педиатрия' },

    //     { fullName: 'Тихонов Андрей Степанович', department: 'Кардиология' },
    //     { fullName: 'Уварова Елена Валентиновна', department: 'Кардиология' },

    //     { fullName: 'Фролов Илья Александрович', department: 'Неврология' },
    //     { fullName: 'Харитонова Мария Григорьевна', department: 'Неврология' },

    //     { fullName: 'Цветков Денис Юрьевич', department: 'Педиатрия' },
    //     { fullName: 'Чехова Ангелина Эдуардовна', department: 'Педиатрия' },

    //     { fullName: 'Шапошников Кирилл Игоревич', department: 'Кардиология' },
    //     { fullName: 'Щербакова Лариса Павловна', department: 'Кардиология' },

    //     { fullName: 'Яковлев Павел Федорович', department: 'Неврология' },
    //     { fullName: 'Антонова София Михайловна', department: 'Неврология' },

    //     { fullName: 'Белов Эдуард Викторович', department: 'Педиатрия' },
    //     { fullName: 'Виноградова Алла Семеновна', department: 'Педиатрия' },
    //     { fullName: 'Герасимов Олег Николаевич', department: 'Гастроэнтерология' },
    //     { fullName: 'Денисова Инна Владимировна', department: 'Гастроэнтерология' },
    //     { fullName: 'Ермаков Сергей Петрович', department: 'Гастроэнтерология' },

    //     { fullName: 'Зайцева Тамара Ильинична', department: 'Офтальмология' },
    //     { fullName: 'Иванов Юрий Алексеевич', department: 'Офтальмология' },
    //     { fullName: 'Кириллова Анна Викторовна', department: 'Офтальмология' },

    //     { fullName: 'Логинов Аркадий Дмитриевич', department: 'Ортопедия' },
    //     { fullName: 'Морозова Елена Юрьевна', department: 'Ортопедия' },
    //     { fullName: 'Новиков Игорь Семенович', department: 'Ортопедия' },

    //     { fullName: 'Павлова Кристина Игоревна', department: 'Эндокринология' },
    //     { fullName: 'Романов Максим Сергеевич', department: 'Эндокринология' },
    //     { fullName: 'Семенова Ольга Павловна', department: 'Эндокринология' },

    //     { fullName: 'Тарасов Виталий Львович', department: 'Оториноларингология' },
    //     { fullName: 'Устинова Вера Борисовна', department: 'Оториноларингология' },
    //     { fullName: 'Федоров Артем Николаевич', department: 'Оториноларингология' },

    //     { fullName: 'Харитонов Глеб Валерьевич', department: 'Дерматология' },
    //     { fullName: 'Царёва Нина Михайловна', department: 'Дерматология' },
    //     { fullName: 'Чистяков Леонид Эдуардович', department: 'Дерматология' },

    //     { fullName: 'Шубина Маргарита Александровна', department: 'Урология' },
    //     { fullName: 'Щукин Борис Геннадьевич', department: 'Урология' },
    //     { fullName: 'Эльдаров Руслан Тимурович', department: 'Урология' },

    //     { fullName: 'Юдина Марина Сергеевна', department: 'Пульмонология' },
    //     { fullName: 'Яшин Владислав Юрьевич', department: 'Пульмонология' }
    // ]
    const [doctors, setDoctors] = useState<ModelList[]>([])
    console.log(doctors);

    useEffect(() => {
        fetch('http://localhost:3000/nosemd')
            .then(res => res.json())
            .then(data => {
                // Если сервер вернул null или undefined, использовать пустой массив
                setDoctors(Array.isArray(data.message) ? data.message : []);
            })
            .catch(err => console.error(err));
    }, []);
    // сортировка
    const groupedDoctors = doctors?.reduce((acc, doctor) => {
        const { отделение, фио } = doctor
        if (!acc[отделение]) {
            acc[отделение] = []
        }
        acc[отделение].push(фио)
        return acc

    }, {} as Record<string, string[]>)

    return (
        <>
            <div>
                <span className="info">
                    По результатам проведенной проверки за отчетный период была зафиксирована нулевая активность по подписанию медицинских документов со стороны группы профильных специалистов. Несмотря на наличие доступа к системе, указанные сотрудники не оформили ни одной электронной подписи под протоколами осмотров или результатами исследований.</span>
                <span className="date-interval" >Диапазон даты 01.01.2026-01.26.2026</span>
                <div className="doctors-container">
                    {Object.entries(groupedDoctors).map(([department, doctors]) => (
                        <div key={department} className="department-group">
                            <h3>{department}</h3>
                            <ul>
                                {doctors.map((name) => {
                                    // Регулярка: $1 - фамилия, $2 - первая буква имени, $3 - первая буква отчества
                                    const shortName = name.replace(/^(\S+)\s+(\S)\S*\s*(\S)?.*$/, (match, p1, p2, p3) => {
                                        return `${p1} ${p2}.${p3 ? ` ${p3}.` : ''}`;
                                    });

                                    return <li key={name}>{shortName}</li>;
                                })}
                            </ul>
                        </div>
                    ))}

                </div>

            </div>

        </>
    )
}
export default DoctorsNoSemd;
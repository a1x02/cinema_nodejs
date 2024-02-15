const sessionTemplate = document.querySelector('.session-template')
const buttonClosePopup = document.querySelectorAll('.popup__close')
const buttonAddSession = document.querySelector('.sessions__add')
const popupAddSession = document.querySelector('.popup_add-session')
const popupConfirm = document.querySelector('.popup_confirm')
const popupEditSession = document.querySelector('.popup_edit-session')
const popupBuyTickets = document.querySelector('.popup_buy-tickets')
const popups = document.querySelectorAll(".popup")
const seats = document.querySelectorAll(".popup__seat")
const sessionsSection = document.querySelector(".sessions")
const sessionsList = document.querySelector('.sessions__list')
const errorNoSessions = document.querySelector('.error__no-sessions')
const buttonDeleteConfirmation = document.querySelector('#delete-session-btn')
const formAddSession = document.querySelector('.popup__form_add-session')
const formBuyTickets = document.querySelector('#chosenSeats')
const boughtTickets = []

const sessions = [
    // session = {
    //     title: 'Холоп 2. Комедия 2D.',
    //     hall: 'Зал 2',
    //     date: '10.01.2024 17:00',
    //     image: 'https://images.kinomax.ru/550/films/7/7315/p_3de2386.ebp'
    // },
]

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${month} ${day}`;
};
sessionsList.innerHTML = '';

// Получить список сеансов из сервера
fetch('/sessions')
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка получения списка сеансов');
        }
        return response.json();
    })
    .then(sessionsFromServer => {
        // Проход по каждому сеансу и добавление его в массив sessions
        sessionsFromServer.forEach(sessionFromServer => {
            const session = {
                title: sessionFromServer.f_title + '. ' + sessionFromServer.f_type,
                hall: sessionFromServer.h_name,
                date: formatDate(sessionFromServer.s_date) + ' ' + formatTime(sessionFromServer.s_time),
                image: sessionFromServer.f_images
            };
            sessions.push(session);

            // Создание DOM-элемента для сеанса
            // const sessionElement = sessionTemplate.content.cloneNode(true).children[0];
            // sessionElement.querySelector('.session__title').textContent = session.title;
            // sessionElement.querySelector('.session__hall').textContent = session.hall;
            // sessionElement.querySelector('.session__date').textContent = session.date;
            // sessionElement.querySelector('.session__image').src = session.image;
            // sessionElement.querySelector('.session__image').alt = session.title;
            //
            // // Добавление сеанса на страницу
            // sessionsList.appendChild(sessionElement);

            // Добавление обработчиков событий (редактирование, удаление, покупка билетов и т.д.)
            // (Ваш существующий код по добавлению обработчиков событий)
            console.log(sessions.length)
            if (sessions.length === 0) {
                errorNoSessions.classList.add('error_visible')
            } else {
                if (errorNoSessions.classList.contains('error_visible')) {
                    errorNoSessions.classList.remove('error_visible')
                }
                sessions.forEach((element, index) => {
                    const sessionElement = sessionTemplate.content.cloneNode(true).children[0]
                    sessionElement.querySelector('.session__title').textContent = element.title
                    sessionElement.querySelector('.session__hall').textContent = element.hall
                    sessionElement.querySelector('.session__date').textContent = element.date
                    sessionElement.querySelector('.session__image').src = element.image
                    sessionElement.querySelector('.session__image').alt = element.title

                    sessionsSection.append(sessionElement)

                    const buttonEditSession = sessionElement.querySelector('.session__edit')
                    const buttonDeleteSession = sessionElement.querySelector('.session__delete')
                    const buttonBuyTickets = sessionElement.querySelector('.session__button')

                    // buttonDeleteSession.addEventListener('click', (evt) => {
                    //     evt.target.parentNode.remove()
                    //     sessions.splice(element, 1)
                    //     if (sessions.length === 0) {
                    //         errorNoSessions.classList.add('error_visible')
                    //     } else {
                    //         if (errorNoSessions.classList.contains('error_visible')) {
                    //             errorNoSessions.classList.remove('error_visible')
                    //         }
                    //     }
                    // })

                    // Добавляем обработчик события для кнопки удаления сеанса
                    buttonDeleteSession.addEventListener('click', async () => {
                        // Удаление сеанса из массива sessions
                        sessions.splice(index, 1);
                        sessionElement.remove();

                        // Отправка запроса на сервер для удаления сеанса из базы данных
                        try {
                            const response = await fetch(`/sessions/${sessionFromServer.s_id}`, {
                                method: 'DELETE',
                            });
                            if (!response.ok) {
                                throw new Error('Ошибка удаления сеанса');
                            }
                            alert('Сеанс успешно удален');
                        } catch (error) {
                            console.error('Ошибка при удалении сеанса:', error);
                            alert('Произошла ошибка при удалении сеанса');
                        }
                    });


                    buttonEditSession.addEventListener('click', () => {
                        popupEditSession.classList.add('popup_opened')
                    })

                    buttonBuyTickets.addEventListener('click', async() => {
                        popupBuyTickets.classList.add('popup_opened')

                        try {
                            const response = await fetch(`/tickets/${sessionFromServer.s_id}`, {
                                method: 'GET',
                            });
                            if (!response.ok) {
                                throw new Error('Ошибка удаления сеанса');
                            }
                            const tickets = await response.json()
                            tickets.forEach(ticket => {
                                const { t_row, t_place } = ticket;
                                const seatId = `${t_row}-${t_place}`;
                                const seatElement = document.getElementById(seatId);
                                if (seatElement) {
                                    seatElement.classList.add('popup__seat_bought');
                                } else {
                                    console.warn(`Элемент с id "${seatId}" не найден`);
                                }
                            });
                            console.log(tickets)

                        } catch (error) {
                            console.error('Ошибка при удалении сеанса:', error);
                            alert('Произошла ошибка при удалении сеанса');
                        }
                    })

                    formBuyTickets.addEventListener('submit', async (event) => {
                        event.preventDefault(); // Предотвращаем отправку формы по умолчанию

                        try {
                            const formData = new FormData(formBuyTickets);

                            // Извлекаем информацию о выбранных местах
                            const chosenSeats = Array.from(document.querySelectorAll('.popup__seat_chosen')).map((ticket) => {
                                const [row, place] = ticket.id.split('-'); // Разбиваем id места на номер ряда и номер места
                                return {
                                    t_row: row,
                                    t_place: place,
                                    t_session: sessionFromServer.s_id // Добавляем id сеанса
                                };
                            });

                            // Отправляем информацию о выбранных местах на сервер для добавления в базу данных
                            const response = await fetch(`/tickets/${sessionFromServer.s_id}`, {
                                method: 'POST',
                                body: JSON.stringify(chosenSeats),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (!response.ok) {
                                throw new Error('Ошибка при добавлении билетов');
                            }

                            alert('Билеты успешно добавлены');
                            location.reload(); // Перезагрузка страницы после успешного добавления билетов
                        } catch (error) {
                            console.error('Ошибка при добавлении билетов:', error);
                            alert('Произошла ошибка при добавлении билетов');
                        }
                    });
                })
            }
        });
    })
    .catch(error => {
        console.error('Ошибка при загрузке сеансов:', error);
        // Обработка ошибки (например, отображение сообщения об ошибке пользователю)
    });


buttonAddSession.addEventListener('click', async () => {
    popupAddSession.classList.add('popup_opened')
    // Получаем список фильмов из базы данных
    try {
        const response = await fetch('/films'); // Отправляем GET запрос на сервер
        if (!response.ok) {
            throw new Error('Ошибка получения списка фильмов');
        }
        const films = await response.json(); // Получаем список фильмов из ответа
        const selectElement = popupAddSession.querySelector('.popup__form .popup__select');

        // Очищаем текущие элементы в <select>
        // selectElement.innerHTML = '';

        // Создаем новые элементы <option> для каждого фильма и добавляем их в <select>
        films.forEach(film => {
            const optionElement = document.createElement('option');
            optionElement.id = film.f_id;
            optionElement.textContent = film.f_title;
            optionElement.name = 'filmId'
            selectElement.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
    }
    // Получаем список залов из базы данных
    try {
        const response = await fetch('/halls'); // Отправляем GET запрос на сервер
        if (!response.ok) {
            throw new Error('Ошибка получения списка залов');
        }
        const halls = await response.json(); // Получаем список фильмов из ответа
        const selectHallElement = popupAddSession.querySelector('.popup__select-hall');
        console.log(selectHallElement)

        // Очищаем текущие элементы в <select>
        // selectHallElement.innerHTML = '';

        // Создаем новые элементы <option> для каждого фильма и добавляем их в <select>
        halls.forEach(hall => {
            const optionElement = document.createElement('option');
            optionElement.id = hall.h_id;
            optionElement.textContent = hall.h_name;
            optionElement.name = 'hallId'
            selectHallElement.appendChild(optionElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке залов:', error);
    }
    console.log(sessions)
})

formAddSession.addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    const formData = new FormData(formAddSession);
    const selectFilm = document.querySelector('.popup__select'); // Получаем элемент select для фильма
    const selectHall = document.querySelector('.popup__select-hall'); // Получаем элемент select для зала

    // Получаем id выбранных элементов option
    const filmId = selectFilm.options[selectFilm.selectedIndex].id;
    const hallId = selectHall.options[selectHall.selectedIndex].id;

    const date = formData.get('date')
    const time = formData.get('time')

    try {
        // Отправляем POST запрос на сервер с данными из формы
        const response = await fetch('/sessions', {
            method: 'POST',
            body: JSON.stringify({date, time, hallId, filmId }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка добавления сеанса');
        }

        alert('Сеанс успешно добавлен');
        location.reload(); // Перезагрузка страницы после успешного добавления сеанса
    } catch (error) {
        console.error('Ошибка при добавлении сеанса:', error);
        alert('Произошла ошибка при добавлении сеанса');
    }
});

buttonClosePopup.forEach((element) => {
    element.addEventListener('click', () => {
        popups.forEach((item) => {
            if (item.classList.contains('popup_opened')) {
                item.classList.remove('popup_opened')
            }
        })
    })
})

seats.forEach((element) => {
    element.addEventListener('click', (evt) => {
        if (!evt.target.classList.contains('popup__seat_chosen') && !evt.target.classList.contains('popup__seat_bought')) {
            evt.target.classList.add('popup__seat_chosen')

            const chosenTicketsInfo = document.querySelector('.popup__ticket-info')
            chosenTicketsInfo.classList.add('popup__ticket-info_visible')
            const numbers = element.id.match(/\d+/g)
            const listItem = document.createElement('li')
            const row = parseInt(numbers[0])
            const place = parseInt(numbers[1])
            listItem.textContent = `Ряд - ${row}, место - ${place}`
            chosenTicketsInfo.append(listItem)
            const ticket = {
                row: row,
                place: place
            }
            boughtTickets.push(ticket)
            console.log(boughtTickets)
        } else if(evt.target.classList.contains('popup__seat_chosen')) {
            evt.target.classList.remove('popup__seat_chosen')
        }
        console.log(element.id)
    })
})


import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this. #dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        });
    }

    async connect () {
        try{
            await this.#dbClient.connect();
            console.log('DB connection sucsessful')
        } catch (error){
            console.error('Unable to connect to the DB:', error);
            return Promise.reject(error);
        }
    }

    async disconnect(){
        await this.#dbClient.end();
        console.log('DB connection closed')
    }

    async check(login, password) {
        try {
            const queryText = 'SELECT id, login FROM public."Users" WHERE login = $1 AND password = $2;';
            const queryParams = [login, password];
            const result = await this.#dbClient.query(queryText, queryParams);
            return result; // Возвращаем результат запроса
        } catch (error) {
            console.error('Ошибка при проверке пользователя:', error);
            throw error; // Выбрасываем ошибку для последующей обработки
        }
    }

    async query(queryText, queryParams) {
        try {
            const result = await this.#dbClient.query(queryText, queryParams);
            return result; // Возвращаем результат запроса
        } catch (error) {
            console.error('Ошибка при выполнении запроса к БД:', error);
            throw error;
        }
    }

    async checkPassword(userId, password) {
        try {
            const queryText = 'SELECT id FROM public."Users" WHERE id = $1 AND password = $2;';
            const queryParams = [userId, password];
            const result = await this.#dbClient.query(queryText, queryParams);
            return result; // Возвращаем результат запроса (rowCount для проверки совпадения)
        } catch (error) {
            console.error('Ошибка при проверке пароля:', error);
            throw error;
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const queryText = 'UPDATE public."Users" SET password = $2 WHERE id = $1;';
            const queryParams = [userId, newPassword];
            await this.#dbClient.query(queryText, queryParams);
            // Здесь не возвращаем результат, так как это операция обновления
        } catch (error) {
            console.error('Ошибка при обновлении пароля:', error);
            throw error;
        }
    }

    async getFilmNames() {
        try {
            const queryText = 'SELECT f_id, f_title FROM cinema_schema.films;';
            const result = await this.#dbClient.query(queryText);
            return result.rows; // Возвращаем массив объектов фильмов
        } catch (error) {
            console.error('Ошибка при запросе фильмов:', error);
            throw error;
        }
    }

    async getHalls() {
        try {
            const queryText = 'SELECT h_id, h_name FROM cinema_schema.halls;';
            const result = await this.#dbClient.query(queryText);
            return result.rows; // Возвращаем массив объектов фильмов
        } catch (error) {
            console.error('Ошибка при запросе фильмов:', error);
            throw error;
        }
    }

    async createSession(sessionId, date, time, hallId, filmId) {
        try {
            const queryText = 'INSERT INTO cinema_schema.sessions (s_id, s_date, s_time, s_hall, s_film) VALUES ($1, $2, $3, $4, $5)';
            const queryParams = [sessionId, date, time, hallId, filmId];
            await this.#dbClient.query(queryText, queryParams);
            console.log('Сеанс успешно добавлен в базу данных');
        } catch (error) {
            console.error('Ошибка при добавлении сеанса в базу данных:', error);
            throw error;
        }
    }

    async getSessions() {
        try {
            const queryText = 'SELECT s_id, s_date, s_time, h_name, f_title, f_images, f_type FROM cinema_schema.sessions LEFT JOIN cinema_schema.halls ON s_hall = h_id LEFT JOIN cinema_schema.films ON s_film = f_id;';
            const result = await this.#dbClient.query(queryText);
            return result.rows; // Возвращаем массив объектов фильмов
        } catch (error) {
            console.error('Ошибка при запросе фильмов:', error);
            throw error;
        }
    }

    async getTickets(sessionID) {
        try {
            const queryText = 'SELECT t_id, t_row, t_place FROM cinema_schema.tickets WHERE t_session = $1'
            const result = await this.#dbClient.query(queryText, [sessionID]);
            return result.rows; // Возвращаем массив объектов билетов
        } catch (error) {
            console.error('Ошибка при запросе фильмов:', error);
            throw error;
        }
    }

    // async postTickets(ticketId, ticketRow, ticketPlace, sessionId) {
    //     try {
    //         const queryText = 'INSERT INTO cinema_schema.tickets(t_id, t_row, t_place, t_session) VALUES ($1, $2, $3, $4)'
    //         const result = await this.#dbClient.query(queryText, [ticketId, ticketRow, ticketPlace, sessionId]);
    //         return result.rows; // Возвращаем массив объектов билетов
    //     } catch (error) {
    //         console.error('Ошибка при запросе фильмов:', error);
    //         throw error;
    //     }
    // }

    async postTickets(ticketId, ticketRow, ticketPlace, sessionId) {
        try {
            const queryText = 'INSERT INTO cinema_schema.tickets(t_id, t_row, t_place, t_session) VALUES ($1, $2, $3, $4)';
            const result = await this.#dbClient.query(queryText, [ticketId, ticketRow, ticketPlace, sessionId]);
            return result.rows; // Здесь нет необходимости возвращать результат, так как метод только добавляет билет в базу данных
        } catch (error) {
            console.error('Ошибка при добавлении билетов:', error);
            throw error;
        }
    }
};
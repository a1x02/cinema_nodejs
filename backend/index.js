import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import DB from './db/DataBase.js';
import dbClient from "express";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: './backend/.env'
})

const appHost = process.env.APP_HOST
const appPort = process.env.APP_PORT
const index = express()
const db = new DB()

function generateUUID() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

index.use('*', (req, res, next) => {
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString());
    next();
});

index.use(express.json()); // Промежуточный обработчик для разбора JSON

index.use('/', express.static(path.resolve(__dirname, '../dist')));

index.get('/films', async (req, res) => {
    try {
        // Получаем список фильмов из базы данных
        const films = await db.getFilmNames();
        // Отправляем список фильмов в формате JSON клиенту
        res.json(films);
    } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        // Возвращаем статус ошибки и сообщение об ошибке клиенту
        res.status(500).json({ error: 'Ошибка при загрузке фильмов' });
    }
});

index.get('/halls', async (req, res) => {
    try {
        // Получаем список залов из базы данных
        const halls = await db.getHalls();
        // Отправляем список фильмов в формате JSON клиенту
        res.json(halls);
        console.log(db.getTickets('954bde87-0909-4cf5-96e5-ffdb2473ad95'))
    } catch (error) {
        console.error('Ошибка при загрузке залов:', error);
        // Возвращаем статус ошибки и сообщение об ошибке клиенту
        res.status(500).json({ error: 'Ошибка при загрузке залов' });
    }
});

index.get('/sessions', async (req, res) => {
    try {
        // Получаем список залов из базы данных
        const sessions = await db.getSessions();
        // Отправляем список фильмов в формате JSON клиенту
        res.json(sessions);
    } catch (error) {
        console.error('Ошибка при загрузке сеансов:', error);
        // Возвращаем статус ошибки и сообщение об ошибке клиенту
        res.status(500).json({ error: 'Ошибка при загрузке сеансов' });
    }
})

index.get('/tickets/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    try {
        const tickets = await db.getTickets(sessionId)
        res.json(tickets)
    } catch (error) {
        console.error('Ошибка при загрузке билетов:', error);
        // Возвращаем статус ошибки и сообщение об ошибке клиенту
        res.status(500).json({ error: 'Ошибка при загрузке билетов' });
    }
})

index.post('/tickets/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId; // Получаем идентификатор сеанса из запроса
    const ticketsData = req.body; // Получаем данные о билетах из тела запроса

    try {
        // Здесь вы должны вызвать метод вашего объекта DB для сохранения информации о билетах
        // Например, если ваш метод называется postTickets, вы можете вызвать его следующим образом:

        // Для каждого билета в данных о билетах делаем запрос к БД на сохранение билета
        await Promise.all(ticketsData.map(async ticket => {
            const ticketId = generateUUID(); // Генерируем UUID для каждого билета
            const { t_row, t_place } = ticket; // Извлекаем данные о месте из объекта билета

            // Вызываем метод postTickets вашего объекта DB для сохранения билета
            await db.postTickets(ticketId, t_row, t_place, sessionId);
        }));

        res.status(201).json({ message: 'Билеты успешно добавлены' });
    } catch (error) {
        console.error('Ошибка при добавлении билетов:', error);
        res.status(500).json({ error: 'Ошибка при добавлении билетов' });
    }
});

index.delete('/sessions/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId; // Получаем идентификатор сеанса из запроса
    try {
        // Выполняем запрос к базе данных для удаления сеанса
        const queryText = 'DELETE FROM cinema_schema.sessions WHERE s_id = "$1"';
        await dbClient.query(queryText, [sessionId]);

        // Отправляем клиенту успешный ответ
        res.status(200).json({ message: 'Сеанс успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении сеанса:', error);
        // Возвращаем статус ошибки и сообщение об ошибке клиенту
        res.status(500).json({ error: 'Ошибка при удалении сеанса' });
    }
});
index.post('/sessions', async (req, res) => {
    try {
        const { date, time, hallId, filmId } = req.body; // Получаем данные из тела запроса
        const sessionId = generateUUID()

        // Выполняем запрос к базе данных для добавления нового сеанса
        await db.createSession(sessionId, date, time, hallId, filmId);

        res.status(201).json({ message: 'Сеанс успешно добавлен' });
    } catch (error) {
        console.error('Ошибка при добавлении сеанса:', error);
        res.status(500).json({ error: 'Ошибка при добавлении сеанса' });
    }
});

const server = index.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect();
    } catch (error) {
        console.log('App shut down');
        process.exit(100);
    }
    console.log(`App started at host http://${appHost}:${appPort}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});

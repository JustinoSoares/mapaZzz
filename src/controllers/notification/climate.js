const axios = require('axios');
const db = require('../../../models/index');
const { Op } = require('sequelize');
const notification = db.notification;
const User = db.User;
const DangerZone = db.danger_zone;

exports.climate = async (req, res) => {
    const { latitude, longitude, past_days = 2, userId } = req.query;

    if (!latitude || !longitude || !userId) {
        return res.status(400).json({
            message: 'Latitude, longitude e userId são obrigatórios.'
        });
    }

    try {
        // Chamar a API Open-Meteo
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude,
                longitude,
                past_days,
                hourly: 'precipitation',
            },
        });

        const userId = req.query.userId; // ID do usuário autenticado

        const user = await User.findOne({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                message: 'Usuário não encontrado.'
            });
        }

        // Processar os dados
        const { hourly } = response.data;
        const precipitationData = hourly.precipitation.map((rain, index) => ({
            time: hourly.time[index],
            precipitation: rain, // Chuva em mm
        }));

        // Verificar se choveu
        const rained = precipitationData.some((entry) => entry.precipitation > 0);

        if (rained) {
            // criar uma notificação no banco de dados
            const notificationCreated = await notification.create({
                lat: latitude,
                lon: longitude,
                typeNotification: 'clima',
                title: 'Chuva detectada',
                describe: 'Choveu nos últimos 2 dias, tenha muita atenção com a malária, proteja a si e aos teus',
                userId: userId,
                users: [],
            });
            // Emitir notificação via Socket.IO
            const io = req.app.get('socketio');
            io.emit('notification', {
                type: 'clima',
                message: 'Choveu nos últimos 2 dias.',
                data: notificationCreated,
            });


            return res.status(200).json({
                message: 'Choveu nos últimos 2 dias.',
                notificationCreated,
            });
        }
        return res.status(200).json({
            message: 'Não choveu nos últimos 2 dias.'
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao criar notificação',
            message: error.message
        });
    }
}

exports.approach_danger_zone = async (req, res) => {
    const { latitude, longitude } = req.query;

    const userId = req.userId;

    if (!latitude || !longitude || !userId) {
        return res.status(400).json({
            message: 'Latitude, longitude e userId são obrigatórios.'
        });
    }

    try {
        const notificationCreate = await notification.create({
            lat: latitude,
            lon: longitude,
            typeNotification: 'alerta',
            title: 'Perigo',
            describe: 'Você está se aproximando de uma zona de perigo, tenha muita atenção com a malária, proteja a si e aos teus',
            userId: userId,
            users: [],
        });
        // Emitir notificação via Socket.IO
        const io = req.app.get('socketio');
        io.emit('notification', {
            data: notificationCreate,
        });
        return res.status(200).json({
            message: 'Notificação criada com sucesso.',
            notificationCreate,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao criar notificação',
            message: error.message
        });
    }
}

exports.game = async (req, res) => {
    const { latitude, longitude } = req.query;

    const userId = req.userId;

    if (!latitude || !longitude || !userId) {
        return res.status(400).json({
            message: 'Latitude, longitude e userId são obrigatórios.'
        });
    }

    try {
        const notificationCreate = await notification.create({
            lat: latitude,
            lon: longitude,
            typeNotification: 'educação',
            title: 'Jogo',
            describe: 'Vamos ver se você sabe como se prevenir da malária, responda a pergunta',
            userId: null,
            users: [],
        });
        // Emitir notificação via Socket.IO
        const io = req.app.get('socketio');
        io.emit('notification', {
            data: notificationCreate,
        });
        return res.status(200).json({
            message: 'Notificação criada com sucesso.',
            notificationCreate,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: 'Erro ao criar notificação'
        });
    }
}

exports.new_danger_zone = async (req, res) => {
    const last_danger_zone = await DangerZone.findOne({
        order: [['createdAt', 'DESC']],
    });

    try {

        const notificationData = await notification.create({
            lat: last_danger_zone.lat,
            lon: last_danger_zone.lon,
            typeNotification: 'surto',
            title: 'Nova zona de perigo',
            describe: `Uma nova zona de perigo foi Reportada em ${last_danger_zone.address}, tenha muita atenção com a malária, proteja a si e aos teus`,
            userId: null,
            users: [],
        });
        // Emitir notificação via Socket.IO
        const io = req.app.get('socketio');
        io.emit('notification', {
            data: notificationData,
        });
        return res.status(200).json({
            message: 'Notificação criada com sucesso.',
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao criar notificação',
            message: error.message
        });
    }
}

exports.getNotification = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({
            message: 'userId é obrigatório.'
        });
    }

    try {
        // pegar as notificações do usuário ou que o userId é null
        const notifications = await notification.findAll({
            where: {
                [Op.or]: [
                    { userId: null },
                    { userId: userId }
                ]
            },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao buscar notificações',
            message: error.message
        });
    }
}

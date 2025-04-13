const axios = require('axios');
const db = require('../../../models/index');
const  notification  = db.notification;
const User = db.User;

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
          describe: 'Choveu nos últimos 2 dias.',
          userId: userId,
          users: [],
        });
      // Emitir notificação via Socket.IO
       const io = req.app.get('socketio');
         io.emit('notification_climate', {
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
            error: 'Erro ao criar notificação' ,
            message: error.message
        });
    }
}

exports.getNotification = async (req, res) => {
    const  userId  = req.userId;

    if (!userId) {
        return res.status(400).json({ 
            message: 'userId é obrigatório.' 
        });
    }

    try {
        const notifications = await notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        return res.status(200).json({ 
            notifications 
        });
    } catch (error) {
        return res.status(500).json({ 
            error: 'Erro ao buscar notificações' ,
            message: error.message
        });
    }
}


const db = require("../../../models");
const { run } = require("../../general/trainingAi");
const User = db.User;
const DangerZone = db.danger_zone;
const confirmation = db.confirmation;
const  notification  = db.notification;
const { v4 : uuidv4 } = require("uuid");
const { send_email } = require("../../controllers/users/sendEmail");
const  help  = db.help;
const { getAddressFromCoordinates } = require("../../general/geocoding");
const { Op } = require("sequelize");

// Função para verificar se a URL da imagem é válida
function isValidImageUrl(url) {
    const imageExtensions = [".jpg", ".jpeg", ".png"];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

//Função para calcular a distância entre dois pontos geográficos usando a fórmula de Haversine
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Raio da Terra em metros
    const toRad = (degree) => (degree * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
};

exports.approach = async (req, res) => {
    try {
        const {lat, lon} = req.query;
        if (!lat || !lon) {
            return res.status(400).json({
                message: "Latitude e Longitude são obrigatórios."
            });
        }
        // Verifica se existem zonas de risco ativas
        const dangerZones = await DangerZone.findAll({
            where: {
                status: "active",
            }
        });

        for (const zone of dangerZones) {
            const distance = haversineDistance(lat, lon, zone.lat, zone.lon);
            if (distance < 2) {
              // usar web socket para enviar a notificação
              const io = req.app.get("socketio");
                if (io) {
                    io.emit("dangerZoneNotification", {
                        message: "Você está se aproximando de uma zona de risco.",
                        zone: zone,
                    });
                    console.log("Você está se aproximando de uma zona de risco.");
                }
                return res.status(200).json({
                    message: "Zonas de risco encontradas.",
                    dangerZones,
                });
            }
            return res.status(404).json({
                message: "Nenhuma zona de risco encontrada.",
                dangerZones: [],
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar zonas de risco.",
            error: error.message,
        });
    }
}

exports.getDangerZoneForReportage = async (req, res) => {
    try {
        const userAuth = req.userId;
        const user = await User.findByPk(userAuth);
        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }
        // Verifica se existem zonas de risco ativas
        const dangerZones = await DangerZone.findAll({
            where: {
                status: "active",
            }
        });

        // Busca todas as zonas de risco onde ele ainda não reportou
        const reports = await confirmation.findAll({
            where: {
                userId: userAuth,
            }
        });
        // Filtra as zonas de risco que o usuário ainda não reportou
        const filteredZones = dangerZones.filter(zone => {
            return !reports.some(report => report.dangerZoneId === zone.id);
        });

        if (filteredZones.length === 0) {
            return res.status(404).json({
                message: "Nenhuma zona de risco encontrada para reportar."
            });
        }
        return res.status(200).json({
            message: "Zonas de risco encontradas.",
            dangerZone: filteredZones[0],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar zonas de risco para reportar.",
            error: error.message,
        });
    }
}

exports.allZones = async (req, res) => {
    try {
        const allZones = await DangerZone.findAll();
        return res.status(200).json({
            message: "Todas as zonas de risco encontradas.",
            dangerZones: allZones,
        });       
    }catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar todas as zonas de risco.",
            error: error.message,
        });
    }
}

exports.report = async (req, res) => {
    try {
        const userAuth = req.userId;
        const dangerZoneId = req.params.dangerZoneId;
        const user = await User.findByPk(userAuth);
        const {status} = req.body;
        if (!status) {
            return res.status(400).json({ 
                message: "Todos os campos são obrigatórios." 
            });
        }
        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }
        const dangerZone = await DangerZone.findByPk(dangerZoneId);
        if (!dangerZone) {
            return res.status(404).json({
                message: "Zona de risco não encontrada."
            });
        }
        // Verifica se o usuário já fez o report
        const report = await confirmation.findAll({
            where: { 
                userId: userAuth, 
                dangerZoneId: dangerZoneId
             }
        }
        );
        if (report.length > 0) {
            return res.status(400).json({
                message: "Você já reportou essa zona de risco."
            });
        }
     
        // actualizar a quantidade de reports na tabela danger_zone
        const dangerZoneToUpdate = await DangerZone.findByPk(dangerZoneId);
        const updatedDangerZone = await dangerZoneToUpdate.update({
            reports: dangerZoneToUpdate.reports + 1,
        });
        if (!updatedDangerZone) {
            return res.status(500).json({
                message: "Erro ao atualizar a zona de risco."
            });
        }
        // Cria o report
        const newReport = await confirmation.create({
            id: uuidv4(),
            status,
            userId: userAuth,
            dangerZoneId : dangerZoneId,
        });
        return res.status(201).json({ 
            message: "Report enviado com sucesso!", 
            report: newReport,
        });
    }
    catch (error) {
        return res.status(500).json({ 
            message: "Erro ao reportar uma zona de risco", 
            error: error.message
        });
    }
}

exports.register = async (req, res) => {
    try{
    const userAuth = req.userId;  
    const {image, lat, lon} = req.body;
    if (!image || !lat || !lon) {
        return res.status(400).json({ 
            message: "Todos os campos são obrigatórios." 
        });
    }
    
    // Verifica se a URL da imagem é válida
    if (!isValidImageUrl(image)) {
        return res.status(400).json({ 
            message: "Imagem inválida."
        });
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ 
            message: "Latitude ou Longitude inválida." 
        });
    }

    const user = await User.findByPk(userAuth);
    if (!user) {
        return res.status(404).json({ 
            message: "Usuário não encontrado." 
        });
    }
    const result = await run(image);
    if (result.level_dange == "without") {
        return res.status(400).json({ 
            message: "A imagem não representa uma zona de risco.",
        });
    }

    const zones = await DangerZone.findAll();
       // Verificar se alguma zona está a menos de 2 metros
       for (const zone of zones) {
        const distance = haversineDistance(lat, lon, zone.lat, zone.lon);
        if (zone.status === "active" && distance < 2) {
            return res.status(400).json({ 
                message: "Zona de risco já cadastrada ou está muito próxima!" 
            });
        }
    }
    const address = await getAddressFromCoordinates(lat, lon);
    let fullAddress = null;
    if (address) {
        // Formatar o endereço completo
        fullAddress = `${address.country}, ${address.city}`; 
    }

    //criar nova zona de risco
    const newZone = await DangerZone.create({
        image,
        lat,
        lon,
        description : result.description,
        level : result.level_dange,
        objectsFinds : result.objectsFinds,
        how_to_help : result.how_to_help,
        address: fullAddress || null,
        userId: userAuth,
    });
    const notificationData = await notification.create({
        lat,
        lon,
        typeNotification: 'surto',
        title: 'Nova zona de perigo',
        describe: `Uma nova zona de perigo foi Reportada em ${fullAddress}, tenha muita atenção com a malária, proteja a si e aos teus`,
        userId: null,
        users: [],
    });
    // Emitir notificação via Socket.IO
    const io = req.app.get('socketio');
    io.emit('notification', {
        data: notificationData,
    });
    // Enviar email para todas instituições de apoio
    const allHelpers = await help.findAll({
        where: {
            kind: "helpOrganization",
        }
    });
     for (const helper of allHelpers) {
         const { name, email, message } = helper;
         const emailData = {
             name,
             email,
             about: message,
             dangerZones: newZone,
         };
         await send_email(name, email, message, newZone);
     }
    return res.status(201).json({ 
        message: "Zona de risco cadastrada com sucesso!", 
        zone: newZone,
    });
} catch (error) {
    return res.status(500).json({ 
        message: "Erro ao cadastrar zona de risco", 
        error: error.message
    });
}
}

exports.deleteZone = async (req, res) => {
    try {
        const userAuth = req.userId;
        const dangerZoneId = req.params.dangerZoneId;
        const user = await User.findByPk(userAuth);
        if (!user) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }
        const dangerZone = await DangerZone.findByPk(dangerZoneId);
        if (!dangerZone) {
            return res.status(404).json({
                message: "Zona de risco não encontrada."
            });
        }
        // Verifica se o usuário é o dono da zona de risco
        if (dangerZone.userId !== userAuth && user.role !== "admin") {
            return res.status(403).json({
                message: "Você não tem permissão para deletar essa zona de risco."
            });
        }
        // Deleta a zona de risco
        await dangerZone.destroy();
        return res.status(200).json({
            message: "Zona de risco deletada com sucesso."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao deletar zona de risco.",
            error: error.message,
        });
    }
}
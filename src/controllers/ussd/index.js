const db = require("../../../models");
const User = db.User;
const notification = db.notification;
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
require("dotenv").config();

exports.sendHelpToReport = async (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({
            message: "precisa passar o endereço do local"
        })
    }

    try {
        const notificationCreate = await notification.create({
            lat: null,
            lon: null,
            typeNotification: 'alerta',
            title: 'Ajude a Reportar',
            describe: `Contamos com a sua ajuda para reportar essa zona : ${address}`,
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

exports.nearHospitais = async (req, res) => {
    try {


        const { address } = req.body;

        if (!address) {
            return res.status(400).json({
                message: "precisa passar o endereço do local"
            });
        }
        const queryLocation = address;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryLocation)}`;

        const geoRes = await fetch(url, {
            headers: { 'User-Agent': 'hospital-finder/1.0' },
        });
        const geoData = await geoRes.json();

        if (!geoData.length) {
            console.error('Localização não encontrada.');
            return res.status(400).json({
                message : "Localização não encontrada."
            })
        }

        const bbox = geoData[0].boundingbox; // [south, north, west, east]
        const [south, north, west, east] = bbox.map(parseFloat);

        const overpassQuery = `[out:json];(
                node["amenity"="hospital"](${south},${west},${north},${east});
                node["amenity"="clinic"](${south},${west},${north},${east});
            );
        out body;`;

        const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery,
        });

        const hospitalData = await overpassRes.json();

        const results = hospitalData.elements.map((el) => ({
            nome: el.tags?.name || 'Sem nome',
            telefone: el.tags?.phone || 'Sem telefone',
            endereco: `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:city'] || ''}`.trim(),
            lat: el.lat,
            lon: el.lon,
        }));

        return res.status(200).json(results);

    } catch (error) {
        return res.status(500).json({
            message: "Error de conexão",
            error: error.message
        });

    }

}
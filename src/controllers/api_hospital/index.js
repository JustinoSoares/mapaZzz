const db = require("../../../models");
const { run } = require("../../general/trainingAi");
const User = db.User;
const DangerZone = db.danger_zone;
const confirmation = db.confirmation;
const axios = require("axios");

exports.danger_zones = async (req, res) => {
    try {
        // pegar  as zonas mais afetadas 
        const dangerZones = await Promise.all(
            (await DangerZone.findAll({
                attributes: [
                    "id",
                    "address",
                    "description",
                    "createdAt",
                    "image",
                    "lat",
                    "lon",
                    "level",
                ],
                order: [["createdAt", "DESC"]],
            })).map(async (zone) => {

                
                const numberCheckers = await confirmation.findAll({
                    where: {
                        dangerZoneId: zone.id,
                        status: "yes",
                    },
                });

                const numberNoCheckers = await confirmation.findAll({
                    where: {
                        dangerZoneId: zone.id,
                        status: "no",
                    },
                });
            
                return {
                    id: zone.id,
                    address: zone.address,
                    description: zone.description,
                    date_reported: zone.createdAt,
                    photo: zone.image,
                    latitude: zone.lat,
                    longitude: zone.lon,
                    objects_detected: zone.objectsFinds,
                    danger_level: zone.level,
                    number_checkers: numberCheckers.length || 0,
                    number_no_checkers: numberNoCheckers.length || 0,
                    how_to_help: zone.how_to_help || "",
                    createdAt: zone.createdAt,
                    updatedAt: zone.updatedAt,
                };
            }
        ));

        return res.status(200).json({
            message: "Danger zones fetched successfully",
            danger_zones: dangerZones,
        });
    } catch (error) {
        console.error("Error fetching danger zones:", error);
        return res.status(500).json({ 
            message: "Internal server error" 
        });
        }
    }

exports.most_effected = async (req, res) => {
// pegar as zonas mais afetadas
try {
    const mostAffectedZones = await Promise.all(
        (await confirmation.findAll({
            attributes: [
                "dangerZoneId",
                [db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")), "count"],
            ],
            group: ["dangerZoneId"],
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")), "DESC"]],
            limit: 3,
        })).map(async (zone) => {
            const zoneData = await DangerZone.findOne({
                where: { id: zone.dangerZoneId },
                attributes: ["id", "address", "description", "image", "lat", "lon"],
            });
    
            return {
                id: zoneData.id,
                address: zoneData.address,
                description: zoneData.description,
                photo: zoneData.image,
                latitude: zoneData.lat,
                longitude: zoneData.lon,
                number_checkers: zoneData.length || 0,
            };
        })
    );
    return res.status(200).json({
        message: "Danger zones fetched successfully",
        mostAffectedZones: mostAffectedZones,
    });
} catch (error) {
    console.error("Error fetching danger zones:", error);
    return res.status(500).json({ 
        message: "Internal server error" 
    });
    
}
}

exports.statistics = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalDangerZones = await DangerZone.count();
        
        // Número de zonas de perigo com mais de 5 confirmações
        const totalConfirmations = await confirmation.count({
            where: {
                status: "yes",
            },
        });
        // Número de zonas de perigo com mais de 5 confirmações
        const totalDangerZonesWithConfirmations = await confirmation.count({
            where: {
                status: "yes",
            },
            group: ["dangerZoneId"],
            having: db.sequelize.where(db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")), {
                [db.Sequelize.Op.gte]: 5,
            }),
        });

        const totalDangerZonesResolved = await confirmation.count({
            where: {
                status: "no_yet",
            },
            group: ["dangerZoneId"],
            having: db.sequelize.where(db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")), {
                [db.Sequelize.Op.gte]: 1000,
            }),
        });


        return res.status(200).json({
            message: "Statistics fetched successfully",
            statistics: {
                total_users: totalUsers,
                total_danger_zones: totalDangerZones,
                total_confirmations: totalConfirmations,
                pedding_zones : totalDangerZonesWithConfirmations.length,
                resolved_zones : totalDangerZonesResolved.length,
            },
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}


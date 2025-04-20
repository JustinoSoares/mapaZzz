const db = require("../../../models");
// const { run } = require("../../general/trainingAi");
const User = db.User;
const DangerZone = db.danger_zone;
const confirmation = db.confirmation;
const axios = require("axios");

exports.danger_zones = async (req, res) => {
  try {
    // pegar  as zonas mais afetadas
    const dangerZones = await Promise.all(
      (
        await DangerZone.findAll({
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
        })
      ).map(async (zone) => {
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
      })
    );

    return res.status(200).json({
      message: "Danger zones fetched successfully",
      danger_zones: dangerZones,
    });
  } catch (error) {
    console.error("Error fetching danger zones:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.most_effected = async (req, res) => {
  // pegar as zonas mais afetadas
  try {
    const mostAffectedZones = await Promise.all(
      (
        await confirmation.findAll({
          attributes: [
            "dangerZoneId",
            [
              db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")),
              "count",
            ],
          ],
          group: ["dangerZoneId"],
          order: [
            [
              db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")),
              "DESC",
            ],
          ],
          limit: 3,
        })
      ).map(async (zone) => {
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
      message: "Internal server error",
    });
  }
};

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
      having: db.sequelize.where(
        db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")),
        {
          [db.Sequelize.Op.gte]: 5,
        }
      ),
    });

    const totalDangerZonesResolved = await confirmation.count({
      where: {
        status: "no_yet",
      },
      group: ["dangerZoneId"],
      having: db.sequelize.where(
        db.sequelize.fn("COUNT", db.sequelize.col("dangerZoneId")),
        {
          [db.Sequelize.Op.gte]: 1000,
        }
      ),
    });

    return res.status(200).json({
      message: "Statistics fetched successfully",
      statistics: {
        total_users: totalUsers,
        total_danger_zones: totalDangerZones,
        total_confirmations: totalConfirmations,
        pedding_zones: totalDangerZonesWithConfirmations.length,
        resolved_zones: totalDangerZonesResolved.length,
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.nearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Dados de localização inválido",
      });
    }
    const googleKey = process.env.GOOGLE_MAPS_KEY;
    

    // 1. Buscar hospitais próximos
    const nearby = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: 5000,
          type: "hospital",
          key: googleKey,
        },
      }
    );

    const hospitais = nearby.data.results;

    // 2. Buscar detalhes para cada hospital
    const detalhesHospitais = await Promise.all(
      hospitais.map(async (hospital) => {
        const placeId = hospital.place_id;
        // 2.1. Obter detalhes com Place Details API
        const detalhes = await axios.get(
          "https://maps.googleapis.com/maps/api/place/details/json",
          {
            params: {
              place_id: placeId,
              key: googleKey,
              fields:
                "name,formatted_address,formatted_phone_number,geometry,opening_hours,rating,user_ratings_total",
            },
          }
        );

        const info = detalhes.data.result;

        // 2.2. Calcular distância com Distance Matrix API
        const distancia = await axios.get(
          "https://maps.googleapis.com/maps/api/distancematrix/json",
          {
            params: {
              origins: `${latitude},${longitude}`,
              destinations: `${info.geometry.location.lat},${info.geometry.location.lng}`,
              key: googleKey,
              mode: "driving",
            },
          }
        );

        const distanciaInfo = distancia.data.rows[0].elements[0];

        return {
          name: info.name,
          address: info.formatted_address,
          phone: info.formatted_phone_number || "Telefone não disponível",
          is_open: info.opening_hours?.open_now || false,
          eval: info.rating,
          all_evaluations: info.user_ratings_total,
          distance: distanciaInfo.distance?.text,
          duration: distanciaInfo.duration?.text,

        };
      })
    );
    // 3. Ordenar do mais próximo ao mais distante
    detalhesHospitais.sort((a, b) => a.duration - b.duration);

    return res.json(detalhesHospitais);
  } catch (error) {
    console.error("Erro ao buscar hospitais:", error.message);
    return res.status(500).json({ error: "Erro ao buscar hospitais" });
  }
};

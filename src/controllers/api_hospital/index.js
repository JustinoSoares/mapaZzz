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
          attributes: ["id", "address", "description", "image", "lat", "lon", "level", "objectsFinds"],
        });

        return {
          id: zoneData.id,
          address: zoneData.address,
          description: zoneData.description,
          photo: zoneData.image,
          latitude: zoneData.lat,
          longitude: zoneData.lon,
          number_checkers: zone.dataValues.count || 0,
          level: zoneData.level,
          objectsFinds: zoneData.objectsFinds,
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
    const orsApiKey = '5b3ce3597851110001cf62487875890facf341089ce7830c6c468e5c';

    const query = ` [out:json]; (
        node["amenity"="hospital"](around:5000, ${latitude}, ${longitude});
        node["amenity"="clinic"](around:5000, ${latitude}, ${longitude});
      );
      out body;`;
    function haversineDistance(lat1, lon1, lat2, lon2) {
      function toRad(x) {
        return (x * Math.PI) / 180;
      }
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    async function getTravelInfo(start, end) {
      const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
      const response = await fetch(`${url}?api_key=${orsApiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`);
      const data = await response.json();
    
      const distanceKm = data.features[0].properties.segments[0].distance / 1000;
      const durationMin = data.features[0].properties.segments[0].duration / 60;
    
      return {
        distance_km: distanceKm.toFixed(2),
        duration_min: durationMin.toFixed(1),
      };
    }

    const overpass = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    const data = await overpass.json();
  
    const locais = data.elements
      .map(el => ({
        name: el.tags?.name || 'Sem nome',
        phone: el.tags?.phone || 'Sem telefone',
        address: `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:housenumber'] || ''}, ${el.tags?.['addr:city'] || ''}`,
        lat: el.lat,
        lon: el.lon,
        distance: haversineDistance(latitude, longitude, el.lat, el.lon),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  
    for (const local of locais) {
      const travel = await getTravelInfo(
        [latitude, longitude],
        [local.lat, local.lon]
      );
      local.distance_km = travel.distance_km;
      local.duration_min = travel.duration_min;
    }
    return res.status(200).json(locais)

  } catch (err) {
    console.log("Erro ao buscar detalhes de hospital:", err.message);
    return  res.status(200).json({
      message: "Ocorreu um erroa ao pegar hospitais"
    }); // ou retorne info parcial se quiser
  }
};

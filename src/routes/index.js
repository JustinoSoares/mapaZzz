const express = require('express');
const router = express.Router();
const routerUser = require('./users/users.route');
const routerAuth = require('./auth/auth');
const routerDangerZone = require('./danger_zone/danger_zone');
const routerGame = require('./game/index');
const routerNotification = require('./notification/index');
const routerHospital = require('./api_hospital/index');


const controllerTest = require('../controllers/danger_zone/ImageIsDangerZone');
const { create } = require("../general/init/index.js");
// funcao para criar o usuario admin sempre que não existir
create();

router.get('/', (req, res) => {
  res.send('API is working');
});
router.post("/analizar", controllerTest.AnalicyImage);

router.use('/', routerUser);
router.use('/', routerAuth);
router.use('/', routerDangerZone);
router.use('/', routerGame);
router.use('/', routerNotification);
router.use('/', routerHospital);


module.exports = router;
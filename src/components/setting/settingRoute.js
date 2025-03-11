const express = require ('express');
const router =express.Router();
const {ensureLogin} = require('../../middlewares/AuthMiddleware');


const settingController= require('./controllers/SettingController');

router.get('/edit-profile',ensureLogin ,settingController.editProfile);
router.post('/update-profile/general',ensureLogin ,settingController.updateGeneral);
router.post('/update-profile/info',ensureLogin ,settingController.updateInfo);
router.post('/update-profile/password',ensureLogin ,settingController.updatePassword);


module.exports = router;
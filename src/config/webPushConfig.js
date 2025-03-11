const webPush = require('web-push');
require('dotenv').config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails(
  'mailto:php2692004@gmail.com',
  publicVapidKey,
  privateVapidKey
);

module.exports = webPush;
const webpush = require('web-push');

// Tạo cặp VAPID Key
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public VAPID Key:', vapidKeys.publicKey);
console.log('Private VAPID Key:', vapidKeys.privateKey);
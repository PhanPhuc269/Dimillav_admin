const socketIo = require('socket.io');
const redisAdapter = require('socket.io-redis');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const chatEvents = require('@components/chat/chatEvents');
require('dotenv').config();
const { createAdapter } = require('@socket.io/redis-adapter');



let io;

async function init(server, sessionStore) {
    io = socketIo(server);

    // io.adapter(redisAdapter({
    //     // host: process.env.REDIS_HOST,
    //     // port: process.env.REDIS_PORT,
    //     // auth_pass: process.env.REDIS_PASSWORD,
    //     // requestsTimeout: 10000 // Tăng thời gian chờ lên 10 giây
    //     host: 'redis-19991.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    //     port: 19991,
    //     auth_pass: 'NBbQXNFY8NU7uX8NCUpoMagALBm8t58g',
    //     requestsTimeout: 30000,  // Tăng thời gian chờ lên 10 giây
    //     username: 'default',
    //     logErrors: true// Log lỗi từ Redis
    // }));
    const { createClient } = require('redis');
    const redisPubClient = createClient({
        username: 'default',
        password: 'NBbQXNFY8NU7uX8NCUpoMagALBm8t58g',
        socket: {
            host: 'redis-19991.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
            port: 19991
        }
    });
    const redisSubClient = redisPubClient.duplicate();

    await redisPubClient.connect();
    await redisSubClient.connect();


    io.adapter(createAdapter(redisPubClient, redisSubClient, {
        key: 'uniquekey',
        requestsTimeout: 10000 // Tăng thời gian chờ lên 10 giây
    }));

    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser, // the same middleware you use for express
        key: 'admin.sid', // the name of the cookie where express/connect stores its session_id
        secret: process.env.MY_SECRET_KEY, // the session_secret to parse the cookie
        store: sessionStore, // we NEED to use a sessionstore. no memorystore please
        allowRequest: (req, callback) => {
            callback(null, true); // Cho phép tất cả các request
        },
        success: onAuthorizeSuccess, // callback on success
        fail: onAuthorizeFail, // callback on fail/error
    }));

    io.on('connection', (socket) => {
        console.log('New client connected');
        
        // io.of('/').fetchSockets().then((sockets) => {
        //     //in ra id của các socket đang kết nối
        //     console.log('Sockets:', sockets.map(s => s.id));
        // });
        chatEvents(io , socket);
    });
}

function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    if (error) {
        console.error('failed connection to socket.io:', message);
        accept(new Error(message));
    }
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}


module.exports = {
    init,
    getIo,
};
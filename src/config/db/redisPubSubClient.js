const { createClient } = require('redis');

const redisPubClient = createClient({
    username: 'default',
    password: 'NBbQXNFY8NU7uX8NCUpoMagALBm8t58g',
    socket: {
        host: 'redis-19991.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 19991
    }
});

const redisSubClient = createClient({
    username: 'default',
    password: 'NBbQXNFY8NU7uX8NCUpoMagALBm8t58g',
    socket: {
        host: 'redis-19991.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
        port: 19991
    }
});

redisPubClient.on('connect', () => console.log('Publisher client connected to Redis'));
redisPubClient.on('error', (err) => console.error('Redis publisher client error:', err));

redisSubClient.on('connect', () => console.log('Subscriber client connected to Redis'));
redisSubClient.on('error', (err) => console.error('Redis subscriber client error:', err));

redisPubClient.connect();
redisSubClient.connect();

module.exports = {
    redisPubClient,
    redisSubClient
};
const { createClient } = require('redis');

const redisPubClient = createClient({
    username: 'default',
    password: 'QoDA8sx6LE4r9VnmuegYYGnZ2TVCOkR9',
    socket: {
        host: 'redis-13044.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 13044
    }
});

const redisSubClient = createClient({
    username: 'default',
    password: 'QoDA8sx6LE4r9VnmuegYYGnZ2TVCOkR9',
    socket: {
        host: 'redis-13044.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 13044
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
const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'QoDA8sx6LE4r9VnmuegYYGnZ2TVCOkR9',
    socket: {
        host: 'redis-13044.crce178.ap-east-1-1.ec2.redns.redis-cloud.com',
        port: 13044
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

async function connectRedis() {
    await redisClient.connect();
    await redisClient.set('foo', 'bar');
    const result = await redisClient.get('foo');
    console.log(result);  // >>> bar
}
const MAX_RETRIES = 5; // Số lần thử kết nối tối đa
const RETRY_DELAY = 1000; // Thời gian chờ giữa các lần thử (đơn vị: milliseconds)

async function connectWithRetry() {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            await redisClient.connect(); // Thử kết nối đến Redis
            console.log('Đã kết nối đến Redis');
            break; // Nếu kết nối thành công, thoát khỏi vòng lặp
        } catch (error) {
            retries++;
            console.error(`Kết nối đến Redis thất bại. Thử lần ${retries} trong ${MAX_RETRIES}`);
            if (retries === MAX_RETRIES) {
                console.error('Đã đạt số lần thử tối đa. Không thể kết nối đến Redis.');
                throw error; // Nếu đã thử đủ số lần mà vẫn thất bại, ném lỗi
            }
            await new Promise(res => setTimeout(res, RETRY_DELAY)); // Chờ một khoảng thời gian trước khi thử lại
        }
    }
}

connectWithRetry(); // Gọi hàm để bắt đầu quá trình kết nối với cơ chế thử lại

//connectRedis();

module.exports = redisClient;
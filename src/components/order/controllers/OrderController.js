const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');

const Product = require("@components/product/models/Product");
const Order = require("@components/order/models/Order");


const OrderService = require('../services/OrderService');

class OrderController {
    ViewProductCheckout(req, res, next) {
        res.render('checkout');
    }

    async ViewOrderList(req, res, next) {
        try {
          
           
            const orders = await OrderService.getAllOrdersSortedByDate();
            res.render('orderList', {
                orders: mutipleMongooseToObject(orders),
            });
        } catch (error) {
            next(error);
        }
    }

    async ViewOrderDetail(req, res, next) {
        try {
            const orderId = req.params._id;
            const order = await OrderService.getOrderDetails(orderId);

            if (!order) {
                return res.status(404).send('Không tìm thấy đơn hàng.');
            }

            res.render('orderDetail', {
                order: mongooseToObject(order),
            });
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Lỗi server.');
        }
    }

   
    
}

module.exports = new OrderController();




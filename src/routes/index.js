const authRoute=require('../components/auth/auth');
const dashboardRoute=require('../components/dashboard/dashboardRoute');
const pagesRoute=require('../components/pages/pagesRoute');

const settingRouter=require('../components/setting/settingRoute');
const productRouter=require('../components/product/productRoute');
const orderRouter=require('../components/order/orderRoute');
const reportRouter=require('../components/report/reportRoute');
const accountRoute=require('../components/account/accountRoute');
const inventoryRoute=require('../components/inventory/inventoryRoute');
const {ensureAuthenticated, ensureLogin } = require('@AuthMiddleware');
const notifyRouter=require('../components/notify/notifyRoute');
const chatRoute=require('../components/chat/chatRoute');

function router(app)
{
   app.use('/', dashboardRoute);
   app.use('/auth', authRoute);
   app.use('/pages',ensureAuthenticated, pagesRoute);
   app.use('/setting',ensureLogin, settingRouter);
   app.use('/order', ensureAuthenticated, orderRouter);
   app.use('/product', ensureAuthenticated, productRouter);
   app.use('/report', ensureAuthenticated, reportRouter);
   app.use('/account', ensureAuthenticated, accountRoute);
   app.use('/inventory', ensureAuthenticated, inventoryRoute);
   app.use('/notify', notifyRouter);
   app.use('/chat', chatRoute);
}

module.exports = router
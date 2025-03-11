const express = require ('express');
const router =express.Router();

const inventoryController= require('./controllers/InventoryController');
const {ensureAuthenticated, ensureLogin } = require('@AuthMiddleware');

function sortMiddleware (req,res, next){
    res.locals._sort = {
        enabled: false,
        type: 'default'
    }
    if(req.query.hasOwnProperty('_sort')){
        // res.locals._sort.enabled = true;
        // res.locals._sort.type = rep.query.type;
        // res.locals._sort.column = rep.query.column;
        Object.assign(res.locals._sort,{
            enabled: true,
            type: req.query._sort.type,
            column: req.query._sort.column
        })
    }
    next();
}

router.get('/',sortMiddleware, inventoryController.viewInventory); 
router.post('/restock', inventoryController.restockProduct);
router.post('/delete', inventoryController.deleteProduct);



module.exports = router;
const express = require('express');
const router = express.Router();
const productController = require('./controllers/ProductController');
//const {ensureAuthenticated} = require('../../middlewares/AuthMiddleware');

router.get('/list', productController.ViewProductListings);
//router.get('/product-details/:slug', productController.ViewProductDetails);
//router.get('/confirmation', ensureAuthenticated, productController.ViewOrderConfirmation);
router.get('/filter', productController.getFilteredProducts);
router.get('/search', productController.SearchProduct);
// Route để hiển thị form cập nhật sản phẩm
router.get('/update/:slug', productController.editProductForm);
router.post('/update/:slug', productController.updateProduct);
router.patch('/:slug/image', productController.addImage);
router.delete('/remove-image/:slug/:index', productController.removeImage);
router.patch('/:slug/category-brand', productController.changeCategoryOrBrand);
router.patch('/:slug/availability', productController.updateAvailability);

// Add AJAX route for fetching products
router.get('/api/products', productController.getProductsAjax);

router.get('/create', productController.createProductForm);
router.post('/create', productController.createProduct);

// Add Delete Product Route
router.post('/delete/:slug', productController.deleteProduct);

module.exports = router;
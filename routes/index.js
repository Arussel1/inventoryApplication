const express = require('express');
const router = express.Router();
const itemsControllers = require('../controllers/itemsControllers');
const categoriesControllers = require('../controllers/categoriesControllers');
const brandControllers = require('../controllers/brandControllers.js');

/* Home page. */

router.get('/', (req, res, next) => {
  res.render('index', {title: "Snack Shop Inventory"});
});

/* Items page */

router.get('/items', itemsControllers.renderedItems);

router.get('/items/create', itemsControllers.renderCreateItemForm);

router.post('/items/create', itemsControllers.createItem);

router.get('/items/:item', itemsControllers.renderedSpecificItem);

router.get('/items/:item/update', itemsControllers.renderItemForm);

router.post('/items/:item/update', itemsControllers.updateItem);

router.get('/items/:item/delete', itemsControllers.deleteItem);

/* Categories page */

router.get('/categories', categoriesControllers.renderedCategories);

router.get('/categories/create', categoriesControllers.renderCreateCategoryForm);

router.post('/categories/create', categoriesControllers.createCategory);

router.get('/categories/:category', categoriesControllers.renderedSpecificCategory);

router.get('/categories/:category/update', categoriesControllers.renderCategoryForm);

router.post('/categories/:category/update', categoriesControllers.updateCategory);

router.get('/categories/:category/delete', categoriesControllers.deleteCategory); 

/* Brands page */

router.get('/brands', brandControllers.renderedBrands);

router.get('/brands/create', brandControllers.renderCreateBrandForm);

router.post('/brands/create', brandControllers.createBrand);

router.get('/brands/:brand', brandControllers.renderedSpecificBrand);

router.get('/brands/:brand/update', brandControllers.renderBrandForm);

router.post('/brands/:brand/update', brandControllers.updateBrand);

router.get('/brands/:brand/delete', brandControllers.deleteBrand); 

module.exports = router;

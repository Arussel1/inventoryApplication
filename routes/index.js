const express = require('express');
const router = express.Router();
const itemsControllers = require('../controllers/itemsControllers');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect('/items');
});

/* Items page */
router.get('/items', itemsControllers.renderedItems);

router.get('/items/:item', itemsControllers.renderedSpecificItem);

router.get('/items/:item/update', itemsControllers.renderItemForm);

router.post('/items/:item/update', itemsControllers.updateItem);

router.get('/items/:item/delete', itemsControllers.deleteItem);

module.exports = router;

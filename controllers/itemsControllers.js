const Pool = require('../db/pool');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const renderedItems = asyncHandler(async (req, res) => {
    const result = await Pool.query('SELECT items.name, items.image FROM items');
    const allItems = result.rows;
    res.render('items', { title: "Snack Shop Inventory", allItems });
});

const renderedSpecificItem = asyncHandler(async (req, res) => {
    const item = decodeURIComponent(req.params.item);
    console.log(item);
    const result = await Pool.query('SELECT items.name, items.description, price, quantity, categories.name AS category, brand.name AS brand, items.image FROM items INNER JOIN categories ON items.category = categories.id INNER JOIN brand ON items.brand = brand.id WHERE items.name = $1', [item]);
    const itemInfo = result.rows[0];
    res.render('specificItem', { item: itemInfo });
});

const renderItemForm = asyncHandler(async (req, res) => {
    const item = decodeURIComponent(req.params.item);
    const result = await Pool.query('SELECT items.name, items.description, price, quantity, categories.name AS category, brand.name AS brand, items.image, (SELECT json_agg(name) FROM categories) AS allCategories, (SELECT json_agg(name) FROM brand) AS allBrand FROM items INNER JOIN categories ON items.category = categories.id INNER JOIN brand ON items.brand = brand.id WHERE items.name = $1', [item]);
    const itemInfo = result.rows[0];
    res.render('itemForm', { item: itemInfo, errors: [] });
});


  const updateItem = [
    // Validate and sanitize fields.
    body("name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Name must be specified."),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Description must be specified."),
    body("price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("quantity")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Quantity must be a positive integer."),
    body("category")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Category must be specified."),
    body("brand")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Brand must be specified."),
    body("image")
      .trim()
      .optional({ checkFalsy: true }),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      const item = decodeURIComponent(req.params.item);
      const itemInfo = req.body;
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        console.log(errors);
        const categories = await Pool.query('SELECT json_agg(name) AS allCategories FROM categories ');
        const brands =  await Pool.query('SELECT json_agg(name) AS allBrand FROM brand');
        itemInfo.allcategories = categories.rows[0].allcategories;
        itemInfo.allbrand = brands.rows[0].allbrand;
        res.render('itemForm', { item: itemInfo, errors: errors });
      } else {
        try {
          const result = await Pool.query(`
            UPDATE items 
            SET 
              name=$1, 
              description=$2, 
              price=$3, 
              quantity=$4, 
              category=(SELECT id FROM categories WHERE name=$5), 
              brand=(SELECT id FROM brand WHERE name=$6), 
              image=$7 
            WHERE name=$8
          `, [itemInfo.name, itemInfo.description, itemInfo.price, itemInfo.quantity, itemInfo.category, itemInfo.brand, itemInfo.image, item]);
  
          if (result.rowCount === 0) {
            res.render('itemForm', { item: itemInfo, errors: [{msg: 'Item not found'}] });
          } else {
            res.redirect(`/items/${itemInfo.name}`);
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
        }
      }
    })
  ];

  const deleteItem = asyncHandler(async (req, res) => {
    const item = decodeURIComponent(req.params.item);
    await Pool.query('DELETE FROM items WHERE name=$1', [item]);
    res.redirect('/items');
});

  const renderCreateItemForm = asyncHandler(async (req, res) => {
    const categories = await Pool.query('SELECT categories.name AS category FROM categories');
    console.log(categories.rows)
    const brands = await Pool.query('SELECT name AS brand FROM brand');
    res.render('createItemForm', {categories: categories.rows, brands: brands.rows})
  });

  
const createItem = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified."),
  body("price")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("quantity")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer."),
  body("category")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category must be specified."),
  body("brand")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Brand must be specified."),
  body("image")
    .trim()
    .optional({ checkFalsy: true }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const itemInfo = req.body;

    // Extract validation errors from the request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      console.log(errors);
      try {
        const categories = await Pool.query('SELECT json_agg(name) AS allCategories FROM categories');
        const brands = await Pool.query('SELECT json_agg(name) AS allBrand FROM brand');
        itemInfo.allcategories = categories.rows[0].allcategories;
        itemInfo.allbrand = brands.rows[0].allbrand;
        res.render('createItemForm', { item: itemInfo, errors: errors.array() });
      } catch (err) {
        console.error('Error fetching categories or brands:', err);
        return next(err); // Pass error to global error handler
      }
    } else {
      try {
        if(!itemInfo.image){
          itemInfo.image = ' https://cdn.loveandlemons.com/wp-content/uploads/2020/05/health-snacks-1.jpg';
        }
        const result = await Pool.query(`
          INSERT INTO items (name, description, price, quantity, category, brand, image)
          VALUES ($1, $2, $3, $4, (SELECT id FROM categories WHERE name=$5), (SELECT id FROM brand WHERE name=$6), $7)
        `, [itemInfo.name, itemInfo.description, itemInfo.price, itemInfo.quantity, itemInfo.category, itemInfo.brand, itemInfo.image]);

        res.redirect(`/items`);
      } catch (err) {
        console.error('Database Error:', err);
        res.status(500).send('Server Error');
      }
    }
  })
];

  
  module.exports = { renderedItems, renderedSpecificItem, renderItemForm, updateItem, deleteItem, renderCreateItemForm, createItem};
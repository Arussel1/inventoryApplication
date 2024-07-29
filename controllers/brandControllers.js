const Pool = require('../db/pool');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const renderedBrands = asyncHandler(async (req, res) => {
    const result = await Pool.query('SELECT name, image, description FROM brand');
    const allBrands = result.rows;
    res.render('brands', { title: "Brand", allBrands: allBrands });
});

const renderedSpecificBrand = asyncHandler(async (req, res) => {
    const brand = decodeURIComponent(req.params.brand);
    const brandInfo = await Pool.query('SELECT name, image, description FROM brand WHERE name=$1', [brand]);
    const itemsInfo = await Pool.query('SELECT name, image FROM items WHERE brand=(SELECT id FROM brand WHERE name=$1)',[brand]);
    res.render('specificBrand', { brand: brandInfo.rows[0], items: itemsInfo.rows });
});

const renderBrandForm = asyncHandler(async (req, res) => {
    const brand = decodeURIComponent(req.params.brand);
    const brandInfo = await Pool.query('SELECT name, image, description FROM brand WHERE name=$1', [brand]);
    res.render('brandForm', { brand: brandInfo.rows[0] });
});

const updateBrand = [
    // Validate and sanitize fields.
    body("name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Name must be specified."),
    body("description")
      .trim()
      .escape(),
    body("image")
      .trim()
      .optional({ checkFalsy: true }),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      const brand = decodeURIComponent(req.params.brand);
      const { name, description,  image } = req.body;
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.status(400).json({ errors: errors.array() });
        return;
      } else {
        try {
          const result = await Pool.query(`
            UPDATE brand
            SET 
              name=$1, 
              description=$2, 
              image=$3 
            WHERE name=$4
          `, [name, description, image, brand]);
  
          if (result.rowCount === 0) {
            res.status(404).send('Item not found');
          } else {
            res.redirect(`/brands/${name}`);
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
        }
      }
    })
  ];

  const deleteBrand = asyncHandler(async (req, res) => {
    const brand = decodeURIComponent(req.params.brand);
    const countResult = await Pool.query(
        `SELECT COUNT(name) AS counter FROM items WHERE brand=(SELECT id FROM brand WHERE name=$1)`, 
        [brand]
    );
    const count = countResult.rows[0].counter;

    if (count > 0) {
        return res.status(400).send('Brand must not have any items before delete.');
    } else {
        await Pool.query('DELETE FROM brand WHERE name=$1', [brand]); 
        }
    res.redirect('/brands');
});

const renderCreateBrandForm = asyncHandler(async (req, res) => {
    res.render('createBrandForm');
});

const createBrand = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified."),
  body("description")
    .trim()
    .escape(),
  body("image")
    .trim()
    .optional({ checkFalsy: true }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res) => {
    const { name, description,  image } = req.body;

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(400).json({ errors: errors.array() });
      return;
    } else {
        const result = await Pool.query(`
          INSERT INTO brand (name, description, image)
          VALUES (
            $1, 
            $2, 
            $3
            )
        `, [name, description, image]);
        }
       
      res.redirect(`/brands`);
  })
];


module.exports = { renderedBrands, renderedSpecificBrand, renderBrandForm, renderCreateBrandForm, updateBrand, deleteBrand, createBrand }
const Pool = require('../db/pool');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const renderedCategories = asyncHandler(async (req, res) => {
    const result = await Pool.query('SELECT name, image, description FROM categories');
    const allCategories = result.rows;
    res.render('categories', { title: "Category", allCategories });
});

const renderedSpecificCategory = asyncHandler(async (req, res) => {
    const category = decodeURIComponent(req.params.category);
    const categoryInfo = await Pool.query('SELECT name, image, description FROM categories WHERE name=$1', [category]);
    const itemsInfo = await Pool.query('SELECT name, image FROM items WHERE category=(SELECT id FROM categories WHERE name=$1)',[category]);
    res.render('specificCategory', { category: categoryInfo.rows[0], items: itemsInfo.rows });
});

const renderCategoryForm = asyncHandler(async (req, res) => {
    const category = decodeURIComponent(req.params.category);
    const categoryInfo = await Pool.query('SELECT name, image, description FROM categories WHERE name=$1', [category]);
    res.render('categoryForm', { category: categoryInfo.rows[0] });
});

const updateCategory = [
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
    body("image")
      .trim()
      .optional({ checkFalsy: true }),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      const category = decodeURIComponent(req.params.category);
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
            UPDATE categories
            SET 
              name=$1, 
              description=$2, 
              image=$3 
            WHERE name=$4
          `, [name, description, image, category]);
  
          if (result.rowCount === 0) {
            res.status(404).send('Item not found');
          } else {
            res.redirect(`/categories/${name}`);
          }
        } catch (err) {
          console.error(err);
          res.status(500).send('Server Error');
        }
      }
    })
  ];

  const deleteCategory = asyncHandler(async (req, res) => {
    const category = decodeURIComponent(req.params.category);
    const countResult = await Pool.query(
        `SELECT COUNT(name) AS counter FROM items WHERE category=(SELECT id FROM categories WHERE name=$1)`, 
        [category]
    );
    const count = countResult.rows[0].counter;

    if (count > 0) {
        return res.status(400).send('Category must not have any items before delete.');
    } else {
        await Pool.query('DELETE FROM categories WHERE name=$1', [category]); 
        }
    res.redirect('/categories');
});

const renderCreateCategoryForm = asyncHandler(async (req, res) => {
    res.render('createCategoryForm');
});

const createCategory = [
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
          INSERT INTO categories (name, description, image)
          VALUES (
            $1, 
            $2, 
            $3
            )
        `, [name, description, image]);
        }
       
      res.redirect(`/categories`);
  })
];


module.exports = { renderedCategories, renderedSpecificCategory, renderCategoryForm, renderCreateCategoryForm, updateCategory, deleteCategory, createCategory };
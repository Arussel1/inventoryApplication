#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const SQL1 = `
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 10,
  category INTEGER,
  brand INTEGER,
  image TEXT
);
`;

const SQL2 = `INSERT INTO items (name, description, price, quantity, category, brand, image) VALUES 
('Prawn Cracker', 'Spicy Prawn Cracker from Oishi', 1.99, 20, 1, 1, 'https://www.thesnacksbox.ca/cdn/shop/files/oishi-prawn-crakers-hot-spicy-90g-the-snacks-box-asian-snacks-store-the-snacks-box-korean-snack-japanese-snack.jpg?v=1694064059&width=200'),
('Crab cracker', 'Delicious Crab Cracker from Oishi', 1.49, 100, 1, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6J4AUkyoypxp8FF64AsoctN8h8Kt-oZUbBA&swidth=200'),
('Onion ring', 'Flavorful Onion Ring from Oishi', 1.29, 50, 1, 1, 'https://www.thesnacksbox.ca/cdn/shop/files/oishi-onion-rings-snack-the-snacks-box-asian-snacks-store-the-snack.jpg?v=1694064059&width=200'),
('Ube pillow', 'Sweet and savory Ube Pillow from Oishi', 2.29, 25, 1, 1, 'https://1212928256.rsc.cdn77.org/content/images/thumbs/000/0007031_ph-pillows-ube-filled-cracker_500.png');
`;

const SQL3 = `CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT
);`;

const SQL4 = `INSERT INTO categories (name, description, image) VALUES 
('snack', 'Your childhood favorite snack', 'https://www.eatthis.com/wp-content/uploads/sites/4/2020/05/snacks-in-america.jpg?quality=82&strip=1'),
('candy', 'Your childhood favorite candy', 'https://candyfunhouse.ca/cdn/shop/files/certified-candy-lover-funbox_grande.jpg?v=1694638470'),
('chocolate', 'Your childhood favorite chocolate', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgxOQt-GBxH7Uq-NlamZ0ScH_zT91TdcdkJw&s'),
('drink', 'Your childhood favorite drink', 'https://static.independent.co.uk/s3fs-public/thumbnails/image/2016/02/01/16/fizzy_drink_RF_getty.jpg?width=1200&height=1200&fit=crop');
`;

const SQL5 = `CREATE TABLE IF NOT EXISTS brand (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
  image TEXT,
);`;

const SQL6 = `INSERT INTO brand (name, description, image) VALUES 
('Oishi', 'Oishi comes from the Japanese word meaning delicious. Dates back to 1946, when a small family business engaged in the repacking of flour and coffee products was established.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReUahkoNKuswQ2mov4_6TKIrIv6huhToFz5g&s'),
('PepsiCo', 'PepsiCo, Inc., based in Purchase, New York, is one of the world''s largest food and beverage companies. PepsiCo is known for its Frito-Lay snack food brands, soft drinks under its Gatorade, Mountain Dew, and namesake Pepsi brands', 'https://skai.io/wp-content/uploads/2021/05/PepsiCo-Small-Logo.png');
`;

async function main() {
  console.log('seeding...');
  const client = new Client({
    connectionString: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:5432/${process.env.PGDATABASE}`,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    await client.query(SQL1);
    await client.query(SQL2);
    await client.query(SQL3);
    await client.query(SQL4);
    await client.query(SQL5);
    await client.query(SQL6);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
    console.log('done');
  }
}

main();

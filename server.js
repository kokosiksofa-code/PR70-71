require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/api', (req, res, next) => { res.set('X-Robots-Tag', 'noindex, nofollow'); next(); });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'loveli_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'index.html')));
app.get('/robots.txt', (req, res) => res.type('text/plain').sendFile(path.join(__dirname, 'frontend', 'robots.txt')));
app.get('/sitemap.xml', (req, res) => res.type('application/xml').sendFile(path.join(__dirname, 'frontend', 'sitemap.xml')));
app.get('/api/status', (req, res) => res.json({ message: 'Loveli backend работает', database: 'PostgreSQL', status: 'OK' }));

app.get('/api/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database() AS database, NOW() AS server_time');
    res.json({ status: 'connected', ...result.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРєР»СЋС‡РёС‚СЊСЃСЏ Рє PostgreSQL' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, search } = req.query;
    const conditions = [];
    const values = [];
    if (category) { values.push(Number(category)); conditions.push(`p.category_id = $${values.length}`); }
    if (brand) { values.push(Number(brand)); conditions.push(`p.brand_id = $${values.length}`); }
    if (search) { values.push(`%${search}%`); conditions.push(`(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`
      SELECT p.product_id AS "ProductId", p.name AS "Name",
        p.description AS "Description", p.price AS "Price",
        p.image_url AS "ImageUrl", p.characteristics AS "Characteristics",
        p.stock_quantity AS "StockQuantity", c.name AS "Category", b.name AS "Brand"
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      JOIN brands b ON b.brand_id = p.brand_id
      ${where} ORDER BY p.product_id
    `, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ С‚РѕРІР°СЂС‹' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ ID С‚РѕРІР°СЂР°' });
    const result = await pool.query(`
      SELECT p.product_id AS "ProductId", p.name AS "Name",
        p.description AS "Description", p.price AS "Price",
        p.image_url AS "ImageUrl", p.characteristics AS "Characteristics",
        p.stock_quantity AS "StockQuantity", c.name AS "Category", b.name AS "Brand"
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      JOIN brands b ON b.brand_id = p.brand_id
      WHERE p.product_id = $1
    `, [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'РўРѕРІР°СЂ РЅРµ РЅР°Р№РґРµРЅ' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ С‚РѕРІР°СЂ' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const r = await pool.query('SELECT category_id AS "CategoryId", name AS "Name" FROM categories ORDER BY name');
    res.json(r.rows);
  } catch (error) {
    console.error(error.message); res.status(500).json({ error: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РєР°С‚РµРіРѕСЂРёРё' });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const r = await pool.query('SELECT brand_id AS "BrandId", name AS "Name" FROM brands ORDER BY name');
    res.json(r.rows);
  } catch (error) {
    console.error(error.message); res.status(500).json({ error: 'РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ Р±СЂРµРЅРґС‹' });
  }
});

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Р‘Р°Р·Р° РґР°РЅРЅС‹С… PostgreSQL Loveli РїРѕРґРєР»СЋС‡РµРЅР°');
    app.listen(PORT, () => console.log(`Loveli backend Р·Р°РїСѓС‰РµРЅ: http://localhost:${PORT}`));
  } catch (error) {
    console.error('РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРєР»СЋС‡РёС‚СЊСЃСЏ Рє PostgreSQL:', error.message);
    process.exit(1);
  }
}
start();


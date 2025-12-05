const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.PG_HOST || 'appreactbd.cn8oio0gkdwh.us-east-1.rds.amazonaws.com',
  user: process.env.PG_USER || 'ruraluser',
  password: process.env.PG_PASSWORD || 'root0000',
  database: process.env.PG_DATABASE || 'ruraldb',
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  ssl: {
    rejectUnauthorized: false
  }
});


const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

app.get('/health', (req,res)=>res.json({ok:true}));

// --- AUTH --- (same simple demo)
app.post('/auth/register', async (req,res)=>{
  const {email, password, name} = req.body;
  if(!email||!password) return res.status(400).json({error:'email+password required'});
  const hashed = await bcrypt.hash(password, 10);
  await pool.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT)');
  await pool.query('INSERT INTO users(email,password,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[email,hashed,name||null]);
  res.json({ok:true});
});

app.post('/auth/login', async (req,res)=>{
  const {email,password} = req.body;
  const r = await pool.query('SELECT * FROM users WHERE email=$1',[email]);
  if(r.rowCount===0) return res.status(401).json({error:'invalid'});
  const user = r.rows[0];
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(401).json({error:'invalid'});
  const token = jwt.sign({id:user.id,email:user.email}, JWT_SECRET, {expiresIn:'8h'});
  res.json({token});
});

// --- LISTINGS ---
app.post('/listings', async (req,res)=>{
  const {title, description, location, price_per_night, owner_id} = req.body;
  await pool.query('CREATE TABLE IF NOT EXISTS listings(id SERIAL PRIMARY KEY, title TEXT, description TEXT, location TEXT, price_per_night NUMERIC, owner_id INTEGER)');
  const r = await pool.query('INSERT INTO listings(title,description,location,price_per_night,owner_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [title,description,location,price_per_night||0,owner_id||null]);
  res.json(r.rows[0]);
});

app.get('/listings', async (req,res)=>{
  await pool.query('CREATE TABLE IF NOT EXISTS listings(id SERIAL PRIMARY KEY, title TEXT, description TEXT, location TEXT, price_per_night NUMERIC, owner_id INTEGER)');
  const r = await pool.query('SELECT * FROM listings ORDER BY id DESC LIMIT 100');
  res.json(r.rows);
});

app.get('/listings/:id', async (req,res)=>{
  const id = req.params.id;
  const r = await pool.query('SELECT * FROM listings WHERE id=$1',[id]);
  if(r.rowCount===0) return res.status(404).json({error:'not found'});
  res.json(r.rows[0]);
});

// --- AVAILABILITY ---
// Returns bookings for a listing, and whether a requested date range is available
app.get('/listings/:id/availability', async (req,res)=>{
  const listing_id = req.params.id;
  const {start_date, end_date} = req.query; // optional
  await pool.query('CREATE TABLE IF NOT EXISTS bookings(id SERIAL PRIMARY KEY, listing_id INTEGER, user_id INTEGER, start_date DATE, end_date DATE, total_price NUMERIC)');
  const r = await pool.query('SELECT * FROM bookings WHERE listing_id=$1 ORDER BY start_date', [listing_id]);
  const bookings = r.rows;
  let available = true;
  if(start_date && end_date){
    // Check overlap: two intervals [a,b] and [c,d] overlap if a<=d && c<=b
    const overlap = await pool.query('SELECT count(*) FROM bookings WHERE listing_id=$1 AND start_date <= $3 AND end_date >= $2', [listing_id, start_date, end_date]);
    available = parseInt(overlap.rows[0].count,10)===0;
  }
  res.json({bookings, queryRequested: !!(start_date && end_date), available});
});

// --- BOOKINGS ---
// When creating a booking, validate that it doesn't overlap existing bookings.
// Dates should be sent as YYYY-MM-DD
app.post('/bookings', async (req,res)=>{
  const {listing_id, user_id, start_date, end_date, total_price} = req.body;
  if(!listing_id || !start_date || !end_date) return res.status(400).json({error:'listing_id + start_date + end_date required'});
  await pool.query('CREATE TABLE IF NOT EXISTS bookings(id SERIAL PRIMARY KEY, listing_id INTEGER, user_id INTEGER, start_date DATE, end_date DATE, total_price NUMERIC)');
  // Check overlap
  const overlap = await pool.query('SELECT * FROM bookings WHERE listing_id=$1 AND start_date <= $3 AND end_date >= $2', [listing_id, start_date, end_date]);
  if(overlap.rowCount > 0){
    return res.status(409).json({error:'dates_unavailable', conflicting: overlap.rows});
  }
  const r = await pool.query('INSERT INTO bookings(listing_id,user_id,start_date,end_date,total_price) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [listing_id,user_id,start_date,end_date,total_price||0]);
  res.json(r.rows[0]);
});

// --- Image upload (local, demo only) ---
const upload = multer({ dest: '/tmp/uploads' });
app.post('/upload', upload.single('file'), (req,res)=>{
  res.json({filename: req.file.filename, path: req.file.path});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT, "/n ", pool));

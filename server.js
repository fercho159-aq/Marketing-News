import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection to Neon
const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_hWR7yQga0wub@ep-empty-pine-a4xpry1f-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to Neon PostgreSQL database');
    release();
  }
});

// API Routes

// GET all articles with optional category filter
app.get('/api/articles', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM blog_postmarketing ORDER BY date DESC';
    let params = [];

    if (category && category !== 'all') {
      query = 'SELECT * FROM blog_postmarketing WHERE category = $1 ORDER BY date DESC';
      params = [category];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Error fetching articles' });
  }
});

// GET single article by slug
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM blog_postmarketing WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Error fetching article' });
  }
});

// GET unique categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM blog_postmarketing WHERE category IS NOT NULL ORDER BY category'
    );
    res.json(result.rows.map(row => row.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/article', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'article.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

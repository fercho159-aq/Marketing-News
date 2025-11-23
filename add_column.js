import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_hWR7yQga0wub@ep-empty-pine-a4xpry1f-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function addColumn() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding related_posts column...');

        await client.query(`
      ALTER TABLE blog_postmarketing 
      ADD COLUMN IF NOT EXISTS related_posts JSONB;
    `);

        console.log('✅ Column related_posts added successfully!');

        console.log('🔄 Updating sample data...');

        // Update a few articles with sample related posts
        const sampleRelated = JSON.stringify([
            { "link": "https://mawsoluciones.com/blog/kpis-clave-email-marketing", "title": "KPIs Clave en Email Marketing" },
            { "link": "https://www.techmarketing.com.mx/article.html?slug=que-es-zero-party-data", "title": "Qué es Zero Party Data?" }
        ]);

        await client.query(`
      UPDATE blog_postmarketing 
      SET related_posts = $1
      WHERE id IN (SELECT id FROM blog_postmarketing LIMIT 3);
    `, [sampleRelated]);

        console.log('✅ Sample data updated successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

addColumn();

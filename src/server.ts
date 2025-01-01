import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const app = express();
app.use(cors());
app.use(express.json());

// Database paths relative to project root
const DB_PATH = join(process.cwd(), 'database', 'filaments.db');
const SCHEMA_PATH = join(process.cwd(), 'database', 'schema.sql');
const MIGRATIONS_PATH = join(process.cwd(), 'database', 'migrations');

let db: Database;

async function initializeDatabase() {
  try {
    // Ensure database directory exists
    await fs.mkdir(dirname(DB_PATH), { recursive: true });

    // Open database connection
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Check if database needs initialization
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='filaments'"
    );

    if (!tableExists) {
      try {
        const schema = await fs.readFile(SCHEMA_PATH, 'utf8');
        await db.exec(schema);
      } catch (error) {
        console.log('Schema file not found, running initial migration directly');
        const initialSchema = await fs.readFile(join(MIGRATIONS_PATH, '001_initial_schema.sql'), 'utf8');
        await db.exec(initialSchema);
      }
      console.log('Database initialized with schema');
    }

    await runMigrations(db);
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

async function runMigrations(db: Database) {
    try {
        // Ensure migrations directory exists
        await fs.mkdir(MIGRATIONS_PATH, { recursive: true });
        
        // Get list of migrations, or empty array if none exist
        let migrations = [];
        try {
            migrations = await fs.readdir(MIGRATIONS_PATH);
        } catch (error) {
            console.log('No migrations found, continuing with initialization');
            return;
        }
        
        // Get current schema version
        await db.run(`CREATE TABLE IF NOT EXISTS schema_versions (
            version INTEGER PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        const currentVersion = await db.get('SELECT MAX(version) as version FROM schema_versions');
        const dbVersion = currentVersion?.version || 0;
        
        // Sort migrations numerically
        const pendingMigrations = migrations
            .filter(f => f.endsWith('.sql'))
            .sort((a, b) => {
                const vA = parseInt(a.split('_')[0]);
                const vB = parseInt(b.split('_')[0]);
                return vA - vB;
            })
            .filter(f => parseInt(f.split('_')[0]) > dbVersion);

        // Run pending migrations in order
        for (const migration of pendingMigrations) {
            const sql = await fs.readFile(join(MIGRATIONS_PATH, migration), 'utf8');
            await db.exec(sql);
            console.log(`Applied migration: ${migration}`);
        }
    } catch (error) {
        console.error('Migration error:', error);
        // Don't exit process, allow initialization to continue
    }
}

// Initialize database before starting the server
initializeDatabase().then(() => {
    const port = process.env.PORT || 8175;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

// API Routes
app.get('/api/filaments', async (req, res) => {
    try {
        const filaments = await db.all('SELECT * FROM filaments ORDER BY created_at DESC');
        res.json(filaments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch filaments' });
    }
});

app.get('/api/manufacturers', async (req, res) => {
    try {
        const manufacturers = await db.all(
            'SELECT DISTINCT manufacturer FROM filaments WHERE manufacturer IS NOT NULL AND manufacturer != "" ORDER BY manufacturer'
        );
        res.json(manufacturers.map((m: { manufacturer: string }) => m.manufacturer));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch manufacturers' });
    }
});

app.post('/api/filaments', async (req, res) => {
    try {
        const {
            name,
            material,
            color,
            quantity,
            manufacturer,
            notes
        } = req.body;

        const result = await db.run(
            `INSERT INTO filaments (
                name, material, color, quantity,
                manufacturer, notes
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, material, color, quantity, manufacturer, notes]
        );

        const newFilament = await db.get('SELECT * FROM filaments WHERE id = ?', result.lastID);
        res.status(201).json(newFilament);
    } catch (error) {
        console.error('Error creating filament:', error);
        res.status(500).json({ error: 'Failed to create filament' });
    }
});

app.put('/api/filaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        delete updates.id;  // Remove id from updates
        delete updates.created_at;  // Remove created_at from updates
        updates.updated_at = new Date().toISOString();

        const fields = Object.keys(updates);
        const placeholders = fields.map(() => '?').join(', ');
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field]);

        await db.run(
            `UPDATE filaments SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        const updatedFilament = await db.get('SELECT * FROM filaments WHERE id = ?', id);
        if (!updatedFilament) {
            return res.status(404).json({ error: 'Filament not found' });
        }
        res.json(updatedFilament);
    } catch (error) {
        console.error('Error updating filament:', error);
        res.status(500).json({ error: 'Failed to update filament' });
    }
});

app.delete('/api/filaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM filaments WHERE id = ?', id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete filament' });
    }
});

export default app; 
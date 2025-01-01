import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import fsPromises from 'fs/promises';
import fsExtra from 'fs-extra';

const app = express();
app.use(cors());
app.use(express.json());

const dbFile = join(__dirname, '..', 'db', 'filaments.db');
const schemaFile = join(__dirname, 'db', 'schema.sql');
const migrationFile = join(__dirname, 'db', 'migrations', 'remove_diameter.sql');

let db: Database;

async function setupMigrationDirectory() {
    const srcMigrationsDir = join(__dirname, 'db', 'migrations');
    const distMigrationsDir = join(__dirname, '..', 'dist', 'db', 'migrations');
    
    // Ensure the migrations directory exists
    await fsExtra.ensureDir(distMigrationsDir);
    
    // Copy all migration files
    await fsExtra.copy(srcMigrationsDir, distMigrationsDir, {
        filter: (src: string) => {
            return src.endsWith('.sql');
        }
    });
}

async function initializeDatabase() {
    try {
        // Ensure the db directory exists
        await fsPromises.mkdir(dirname(dbFile), { recursive: true });
        
        // Add the migration directory setup
        await setupMigrationDirectory();

        // Open database
        db = await open({
            filename: dbFile,
            driver: sqlite3.Database
        });

        // Check if this is a new database
        const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='filaments'");
        
        if (!tableExists) {
            // If it's a new database, run the schema
            const schema = await fsPromises.readFile(schemaFile, 'utf8');
            await db.exec(schema);
        } else {
            try {
                // If the table exists, try to run the migration
                const migration = await fsPromises.readFile(migrationFile, 'utf8');
                await db.exec(migration);
                console.log('Migration completed successfully');
            } catch (error) {
                // If the migration fails (possibly because it was already run), just log it
                console.log('Migration skipped or failed:', error instanceof Error ? error.message : String(error));
            }
        }
    } catch (error) {
        console.error('Database initialization error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
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
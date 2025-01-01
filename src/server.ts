import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const app = express();
const port = Number(process.env.PORT) || 8175;

app.use(cors());
app.use(express.json());

// Ensure the db directory exists
const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Database setup
const dbPath = path.join(dbDir, 'filaments.db');
let db: any;

async function initializeDb() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await db.exec(schema);
}

// API Routes
app.get('/api/filaments', async (req, res) => {
    try {
        const filaments = await db.all('SELECT * FROM filaments ORDER BY created_at DESC');
        res.json(filaments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch filaments' });
    }
});

app.post('/api/filaments', async (req, res) => {
    try {
        const {
            name,
            material,
            color,
            diameter,
            quantity,
            cost,
            manufacturer,
            notes
        } = req.body;

        const result = await db.run(
            `INSERT INTO filaments (
                name, material, color, diameter, quantity,
                cost, manufacturer, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, material, color, diameter, quantity, cost, manufacturer, notes]
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

// Initialize database and start server
initializeDb().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}); 
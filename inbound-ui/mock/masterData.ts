
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Adjust path as needed based on your project structure
// Assuming mock folder is at d:\ofl\ies-frontend-v4\ies-ui\mock
// and db.json is at d:\ofl\ies-frontend-v4\ies-ui\src\pages\hrm\master-data\db.json
const DB_PATH = path.join(__dirname, '../src/pages/hrm/master-data/db.json');

function getDb() {
    if (!fs.existsSync(DB_PATH)) {
        return { types: [], items: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

function saveDb(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf-8');
}

export default {
    // GET returns the whole DB
    'GET /api/master-data/db': (req: Request, res: Response) => {
        const db = getDb();
        res.json(db);
    },

    // POST updates the whole DB or parts of it
    'POST /api/master-data/db': (req: Request, res: Response) => {
        const currentDb = getDb();
        const { types, items } = req.body;

        const newDb = {
            types: types || currentDb.types,
            items: items || currentDb.items,
        };

        saveDb(newDb);
        res.json({ success: true });
    },
};

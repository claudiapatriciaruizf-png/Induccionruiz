/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const dbFile = path.resolve(__dirname, 'evaluaciones_db.json');
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([], null, 2));
  }

  // API Endpoints para la base de datos de evaluaciones del aprendiz
  app.post('/api/evaluaciones', (req, res) => {
    try {
      const evaluacionData = {
        id: Date.now(),
        ...req.body,
        fechaCreacion: new Date().toISOString()
      };
      const registros = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      registros.push(evaluacionData);
      fs.writeFileSync(dbFile, JSON.stringify(registros, null, 2));
      res.json({ success: true, mensaje: 'Evaluación guardada exitosamente en la base de datos', evaluacion: evaluacionData });
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      res.status(500).json({ error: 'Error interno al guardar la evaluación en la base de datos' });
    }
  });

  app.get('/api/evaluaciones', (req, res) => {
    try {
      const registros = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      res.json(registros);
    } catch (err) {
      console.error('Error al leer evaluaciones:', err);
      res.status(500).json({ error: 'Error interno al consultar la base de datos' });
    }
  });

  // Vite middleware for frontend development
  const vite = await createViteServer({
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();

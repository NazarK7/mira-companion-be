import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

// Il path di base: process.cwd() nel backend punterà alla root del progetto NestJS.
// La cartella data/blobs sarà la stessa montata via Docker volume nel deploy.
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'blobs');

export const multerDiskConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Garantisce che la directory esista prima del salvataggio
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // Estraiamo l'estensione (es. .zip, .jobx) e assegniamo un UUID per evitare collisioni
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 1024, // Limite hard: 1GB (necessario per i backup MIRA_3D)
  },
};
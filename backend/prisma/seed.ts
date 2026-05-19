// backend/prisma/seed.ts
import {
  PrismaClient,
  CameraType,
  RobotControllerType,
  MaintenanceCategory,
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// Forza il caricamento delle variabili d'ambiente a runtime per leggere DATABASE_URL
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'FATAL: DATABASE_URL is not defined in the environment variables.',
  );
}

// Inizializzazione del pool e dell'adapter (identica a PrismaService)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Passiamo l'adapter al client
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Inizio seeding database...');

  // Pulisce il DB (grazie all'onDelete: Cascade, eliminare i Customer svuota tutto l'albero)
  await prisma.customer.deleteMany();
  console.log('Database pulito.');

  // Creazione Volvo con nested writes
  const volvo = await prisma.customer.create({
    data: {
      slug: 'volvo',
      name: 'Volvo Cars',
      shortName: 'Volvo',
      notes: 'OEM scandinavo, piattaforme SPA2 / CMA',
      contacts: {
        create: [
          {
            name: 'Anders Nyström',
            role: 'Plant Engineering Lead',
            email: 'anders.nystrom@volvocars.com',
            phone: '+46 31 123 4567',
            category: 'PLANT_REFERENT',
          },
        ],
      },
      plants: {
        create: [
          {
            name: 'Torslanda',
            location: 'Göteborg, Svezia',
            address: 'Volvo Personvagnar AB, 405 31 Göteborg',
            notes: 'Plant principale SPA2, body-in-white',
            stations: {
              create: [
                {
                  name: 'Body Side Assy LH',
                  code: '17-54-020',
                  line: 'Body Shop Line A',
                  description:
                    'Cella di assemblaggio fianco sinistro carrozzeria',
                  status: 'PRODUCTION',
                  cameras: {
                    create: [
                      {
                        name: 'Right Side',
                        type: CameraType.MIRA_3D,
                        cameraModel: 'Matrox Iris GTR-12M',
                        lensFocalMm: 12,
                        firmware: '4.2.1',
                        ipAddress: '192.168.10.21',
                        serialNumber: 'IGTR12M-2024-0042',
                        controllerType: RobotControllerType.ABB,
                        plcNotes: 'Trigger via PROFINET da IRC5, DB10.DBX0.0.',
                        notes:
                          'Distanza di lavoro 650mm. Plate caltab250 in uso.',
                        jobs: {
                          create: [
                            {
                              name: 'Bracket Pickup',
                              description: 'Localizzazione staffa rinforzo',
                              visionToolSlot: 1,
                              backups: {
                                create: [
                                  {
                                    filePath:
                                      'volvo/torslanda/175420/cam_rs/jobs/bracket_pickup_20260420.zip',
                                    fileName: 'bracket_pickup_20260420.zip',
                                    fileSize: 487233120,
                                    notes:
                                      'Aggiornato match_score min da 0.65 a 0.72',
                                    createdBy: 'Nazar',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                        maintenanceEvents: {
                          create: [
                            {
                              occurredAt: new Date('2026-04-20T14:00:00.000Z'),
                              category: MaintenanceCategory.JOB_UPDATE,
                              title: 'Aggiornamento Bracket Pickup',
                              performedBy: 'Nazar',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Creata infrastruttura Volvo: ${volvo.id}`);

  // Creazione Stellantis
  const stellantis = await prisma.customer.create({
    data: {
      slug: 'stellantis',
      name: 'Stellantis',
      shortName: 'Stellantis',
      plants: {
        create: [
          {
            name: 'Mirafiori',
            location: 'Torino, Italia',
            stations: {
              create: [
                {
                  name: 'Quality Inspection',
                  code: 'QI-21',
                  cameras: {
                    create: [
                      {
                        name: 'VIN Reader',
                        type: CameraType.COGNEX_DATAMAN,
                        cameraModel: 'Cognex DataMan 470',
                        ipAddress: '10.42.15.10',
                        jobs: {
                          create: [
                            {
                              name: 'VIN Decode',
                              backups: {
                                create: [
                                  {
                                    filePath:
                                      'stellantis/mirafiori/qi21/cam_dm470/jobs/vin_20260510.job',
                                    fileName: 'vin_20260510.job',
                                    fileSize: 145000,
                                    masterImagePath:
                                      'stellantis/mirafiori/qi21/cam_dm470/master/vin_master.bmp',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`Creata infrastruttura Stellantis: ${stellantis.id}`);

  console.log('Seeding completato con successo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

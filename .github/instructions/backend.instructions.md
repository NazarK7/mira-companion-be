---
description: 'Standard architetturali e di sicurezza per il Backend NestJS e Prisma'
applyTo: 'backend/**/*'
---

# 1. Context and Domain Model (Descrizione Applicativa)

- Il backend gestisce asset industriali attraverso una gerarchia obbligatoria e strettamente relazionale: `Customer` -> `Plant` -> `Station` -> `Camera`.
- La gerarchia è definita in Prisma con chiavi primarie UUID PostgreSQL (`@db.Uuid`) e `@default(dbgenerated("gen_random_uuid()"))`; ogni livello figlio dipende dal padre tramite `@relation(..., onDelete: Cascade)`.
- `Customer` rappresenta il cliente finale e contiene metadati descrittivi, note operative e contatti associati.
- `Plant` rappresenta lo stabilimento del cliente e non può esistere senza `Customer`.
- `Station` rappresenta una linea/cella produttiva, contiene stato operativo, data installazione, recovery procedure, tag e relazione 1:N con `Camera`.
- `Camera` è l'asset centrale della piattaforma; identifica un dispositivo di visione industriale con configurazione tecnica, stato operativo, asset binari caricati e storico operativo.
- Ogni `Camera` può possedere asset singoli persistiti su file system e referenziati a database: backup `mira3d`, licenza `halcon`, script `restartOnCrash`.
- Ogni `Camera` è l'aggregato padre per i record operativi collegati: `Job`, `RobotBackupRecord`, `MaintenanceEvent` e `Calibration`.
- `Job` rappresenta una configurazione applicativa di visione associata a una camera; include backup (`JobBackup`) e immagini di test (`JobTestImage`), con vincoli di unicità per nome e `visionToolSlot` all'interno della stessa camera.
- `RobotBackupRecord` archivia backup del controller robot con tipo controller, versione e note operative.
- `MaintenanceEvent` registra eventi manutentivi tipizzati come installazione, calibrazione, aggiornamento job, rinnovo licenze, sostituzione hardware, aggiornamento firmware o troubleshooting.
- `Calibration` registra configurazioni di calibrazione e risultati JSON strutturati; `isCurrent` identifica la calibrazione attiva.
- `Contact` può appartenere a `Customer` o `Plant` e supporta i referenti operativi del dominio.
- `AuditLog` rappresenta il registro storico delle modifiche e deve essere trattato come sorgente autoritativa per la tracciabilità applicativa.
- `AppSetting` è una configurazione singleton applicativa e non deve essere modellata come entità multi-record.
- I controller e i servizi devono sempre preservare questa gerarchia; nessuna operazione può creare, spostare o cancellare entità figlie ignorando la catena padre-figlio definita nello schema.
- Prime Directive: nessuna modifica simultanea a piu file del backend senza un piano confermato, esplicito e verificabile rispetto all'impatto su dominio, persistenza, API e migrazioni.
- Prime Directive: ogni cambiamento deve partire dall'aggregato responsabile del comportamento, non da wiring periferico o da controller che si limitano a esporre endpoint.

# 2. Technology Stack and Architectural Conventions (Stack Tecnologico)

- Il framework backend standard e NestJS 11, come indicato dalle dipendenze `@nestjs/common`, `@nestjs/core` e `@nestjs/platform-express` in `backend/package.json`.
- Il layer ORM e Prisma 7 (`prisma` e `@prisma/client` 7.8.0); la presenza di `@prisma/adapter-pg` identifica l'adozione del runtime Prisma Rust-Free su PostgreSQL.
- Il database di sviluppo e PostgreSQL 16 tramite immagine `postgres:16-alpine`, esposto localmente su `127.0.0.1:5433:5432` in `backend/docker-compose.yml`.
- La configurazione Prisma deve dipendere esclusivamente da `DATABASE_URL` tramite `backend/prisma.config.ts`; nessun datasource URL hardcoded e ammesso.
- TypeScript deve essere trattato come strict-first: `target` `ES2023`, `module` `nodenext`, `moduleResolution` `nodenext`, `noImplicitAny`, `strictNullChecks`, `strictBindCallApply` e `noFallthroughCasesInSwitch` sono parte del contratto di compilazione definito in `backend/tsconfig.json`.
- L'architettura obbligatoria e controller sottili e service ricchi.
- I controller NestJS devono limitarsi a:
- esporre route e decorator HTTP;
- leggere `@Param`, `@Query`, `@Body`, `@UploadedFile` e header;
- mappare input/output HTTP;
- delegare immediatamente la business logic a un service.
- I service NestJS devono contenere tutta la business logic applicativa: validazioni di dominio, orchestrazione Prisma, coordinamento file system, mapping di errori applicativi, audit e autorizzazioni future.
- Ogni service deve essere annotato con `@Injectable()`.
- La dependency injection deve essere esclusivamente constructor-based, con dipendenze `private readonly` e nessuna risoluzione dinamica o service locator manuale.
- Ogni modulo Nest deve dichiarare, esportare e importare dipendenze in modo esplicito; import ciclici e dipendenze implicite sono vietati.
- La bootstrap pipeline definita in `backend/src/main.ts` stabilisce baseline obbligatorie: `ValidationPipe` globale, `BigIntInterceptor` globale, CORS configurato da environment e prefisso globale `/api`.
- Ogni nuovo endpoint deve rispettare il prefisso applicativo `/api` e integrarsi con la configurazione globale esistente, non duplicarla localmente.
- Gli interceptor e i filter cross-cutting devono vivere in moduli o cartelle comuni; duplicazioni locali per singolo controller sono vietate salvo motivazione architetturale documentata.
- L'uso di tipi `any` nel service layer deve essere evitato; se la shape Prisma e insufficiente, definire type helper o payload type espliciti.

# 3. Data Integrity and Development Guidelines (Linee Guida di Stile)

- Tutti gli input esterni devono transitare attraverso DTO dedicati.
- Ogni DTO deve usare `class-validator` e `class-transformer` in modo rigoroso e completo.
- Campi UUID devono usare `@IsUUID()`.
- Enum Prisma devono usare `@IsEnum(...)`.
- Array devono usare validazione per contenitore e contenuto (`@IsArray()` e validator `each: true` quando applicabile).
- Conversioni numeriche e booleane devono essere esplicite e compatibili con `transform: true` gia abilitato in `ValidationPipe` globale.
- Nessun controller puo accettare `any`, payload anonimi o oggetti non validati.
- Le validazioni di shape non sostituiscono le validazioni di dominio: unicita, esistenza di parent, cardinalita e invarianti applicative devono essere verificate nel service layer.
- Atomicity e cruciale.
- Ogni workflow che combina upload/download, cancellazioni di file, generazione metadata e mutazioni database deve essere progettato come un'unica unita atomica.
- Le mutazioni Prisma correlate allo stesso workflow devono essere eseguite in un blocco `$transaction`.
- Le operazioni file system devono essere coordinate con la `$transaction` tramite staging temporaneo, cleanup compensativo e rimozione esplicita dei file in caso di rollback applicativo; nessun file orfano e accettabile.
- Esempi diretti di workflow da trattare come atomici: asset `Camera`, backup job, immagini di test, backup robot e ogni futuro allegato binario.
- Nessun service puo cancellare un file prima che l'entita sostitutiva o la nuova metadata row sia stata validata; la sequenza corretta e stage -> `$transaction` -> commit logico -> cleanup finale.
- Tutte le interazioni con Prisma devono usare `async/await`.
- Tutte le interazioni con file system devono usare API asincrone.
- Operazioni bloccanti sincrone come `fs.existsSync`, `fs.mkdirSync`, `fs.readFileSync`, `fs.writeFileSync` e simili sono vietate nel codice applicativo runtime.
- I componenti di upload basati su Multer devono essere adattati per eliminare dipendenze sincrone e delegare il coordinamento persistente al service layer.
- Nessuna logica di dominio puo essere implementata nel callback di `res.download`, nel middleware Multer o in utility anonime non testabili.
- Ogni query Prisma deve limitare `include` e `select` ai dati necessari all'endpoint; over-fetching su relazioni profonde va evitato salvo esigenza esplicita.
- I vincoli Prisma esistenti devono essere rispettati anche a livello di business logic, in particolare:
- unicita `@@unique([stationId, name])` per `Camera`;
- unicita `@@unique([cameraId, visionToolSlot])` per `Job`;
- unicita `@@unique([cameraId, name])` per `Job`.
- Ogni modifica a `schema.prisma` richiede revisione congiunta di migrazione, DTO, service, test e policy di cancellazione cascata.

# 4. Error Handling and Logging (Gestione degli Errori)

- Gli errori devono essere classificati e gestiti in modo deterministico.
- Network Errors: timeout, connessioni interrotte, errori di storage remoto o database non raggiungibile devono produrre risposte coerenti, log strutturati e nessuna esposizione di dettagli interni sensibili.
- Business Logic Errors: input invalidi, vincoli di unicita, parent mancanti, stato non compatibile, file assente o workflow non consentito devono essere mappati a eccezioni HTTP NestJS esplicite (`BadRequestException`, `ConflictException`, `NotFoundException`, `UnprocessableEntityException`).
- Runtime Exceptions: errori imprevisti, bug, serialization failure, eccezioni non classificate e fallimenti infrastrutturali devono essere catturati da Global Exception Filters.
- I Global Exception Filters sono obbligatori per tutto il backend NestJS.
- I Global Exception Filters devono:
- normalizzare il payload di errore;
- impedire il leak di stack trace, query SQL, path assoluti, environment variables o dettagli Prisma al client in produzione;
- loggare il contesto tecnico necessario lato server;
- preservare correlation id o request id quando introdotti.
- I controller non devono gestire errori con `try/catch` generici salvo conversione diretta e minimale tra eccezione tecnica ed eccezione HTTP.
- I service devono sollevare errori semantici, non stringhe arbitrarie.
- Il logging deve essere strutturato, coerente e minimale.
- Eventi sensibili da loggare: creazione `AuditLog`, upload/cancellazione asset, fallimenti di transazione, errori Prisma, eventi manutentivi rilevanti, cambi di stato di `Camera` e `Station`.
- E vietato loggare dati personali non necessari, contenuti di file, segreti, credenziali, token, connection string complete, dump JSON integrali di payload utente o stack trace in output client.
- I log applicativi devono includere almeno: nome servizio, operazione, entity id, outcome e contesto tecnico sintetico.
- `AuditLog` deve essere usato per tracciare cambiamenti di dominio e non sostituito da log testuali non persistenti.
- Le risposte di errore devono essere stabili nel formato; ogni consumer frontend o integrazione deve poter distinguere tra errore validazione, conflitto, assenza risorsa e failure interna.

# 5. Security and Persistence Standards (Standard di Sicurezza)

- Prisma deve essere il canale predefinito per l'accesso ai dati.
- Le query parametrizzate sono obbligatorie; Prisma le gestisce nativamente e nessun codice deve introdurre concatenazione manuale di SQL o interpolazione non sicura.
- L'uso di raw SQL e consentito solo se indispensabile, con query parametrizzate e motivazione architetturale documentata.
- Tutte le chiavi di configurazione, credenziali e secret devono provenire da environment variables.
- Sono obbligatori almeno i seguenti input configurabili via environment: `DATABASE_URL`, `PORT`, `CORS_ORIGIN` e ogni futura chiave di integrazione esterna.
- Credenziali hardcoded, secret committati, fallback con password in chiaro e default non sicuri sono vietati.
- Gli identificatori primari UUID devono essere trattati come opachi e immutabili.
- La generazione UUID server-side tramite `gen_random_uuid()` e uno standard di persistenza da preservare in tutte le nuove entita aggregate.
- Ogni endpoint che riceve UUID deve validarli a livello DTO o parametro prima di raggiungere Prisma.
- Le cancellazioni a cascata definite in Prisma devono essere considerate parte del contratto dati e non aggirate con delete manuali incoerenti.
- Prima di introdurre nuove relazioni, definire esplicitamente la policy `onDelete` coerente con il dominio; l'assenza di policy esplicita non e accettabile.
- Le entita con asset file associati richiedono doppio presidio di sicurezza: integrita del record Prisma e pulizia del blob sul file system.
- I path persistiti a database devono essere identificatori controllati dall'applicazione, non path assoluti forniti dal client.
- I nomi file originali devono essere trattati come metadati e mai come input trusted per costruire percorsi sul server.
- Gli upload devono imporre limiti di dimensione, validazione del tipo logico di allegato e naming collision-safe; l'uso di UUID per il filename storage e corretto e va mantenuto.
- Nessun endpoint deve esporre percorsi interni del file system o dettagli infrastrutturali nel body di risposta.
- Ogni evoluzione del backend deve preservare coerenza tra schema Prisma, DTO, servizi NestJS, pipeline di validazione globale e policy di sicurezza operativa.
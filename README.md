# Cold Chain Monitor MVP

A Next.js app that:

- imports cold-chain temperature data from Google Cloud Storage or a local mock feed
- stores shipment and temperature records in a local JSON database
- analyzes temperature excursions per shipment
- scores and grades transport carriers
- shows a dashboard, shipment detail page, and carrier ranking page

## Tech stack

- Next.js App Router
- TypeScript
- Recharts
- date-fns
- optional Google Cloud Storage integration via `@google-cloud/storage`

## 1) Install

```bash
npm install
```

## 2) Run locally

```bash
npm run dev
```

Then open:

```bash
http://localhost:3000
```

## 3) Mock mode

By default the project reads new temperature data from:

```bash
data/mock-temperature-feed.json
```

On the dashboard, click **Import Google Cloud Data**. That imports mock feed records into `data/db.json`.

## 4) Real Google Cloud Storage mode

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Then fill in:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
GOOGLE_CLOUD_TEMPERATURE_FILE=path/in/bucket/temperature-feed.json
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

The JSON file in GCS should look like this:

```json
[
  {
    "shipmentCode": "CC-1002",
    "recordedAt": "2026-03-07T19:00:00.000Z",
    "temperature": 3.2,
    "sensorId": "sensor-b2",
    "locationText": "New Jersey"
  }
]
```

## 5) Core routes

### Pages

- `/` dashboard
- `/shipments` shipment list
- `/shipments/[id]` shipment detail with chart and analysis
- `/carriers` carrier ranking

### APIs

- `GET /api/import/google-data`
- `GET /api/shipments`
- `GET /api/shipments/:id`
- `POST /api/shipments/:id/analyze`
- `GET /api/carriers/:id/score`

## 6) How scoring works

Each shipment gets a 100-point score:

- compliance: 50 points
- stability: 20 points
- recovery: 15 points
- punctuality: 15 points

The current MVP penalizes:

- total excursion minutes
- excursion count
- peak over-temperature amount
- temperature standard deviation
- long recovery duration

Grades:

- A: 90+
- B: 80-89
- C: 70-79
- D: below 70

## 7) Where to customize

- shipment seed data: `data/db.json`
- external feed structure: `data/mock-temperature-feed.json`
- scoring model: `lib/analysis.ts`
- Google import logic: `lib/googleSource.ts`

## 8) Important note

This is an MVP. For production, replace `data/db.json` with a real database such as PostgreSQL, add auth, validate incoming data, and move import jobs to a queue or scheduled worker.

# adi Workwear Orders

This is the initial scaffold for the adi Workwear Orders app.

What's included:
- Next.js (TypeScript) app
- Prisma schema for Postgres
- Docker Compose (app + Postgres)
- Seed script that imports the provided CSVs (data/Ace Price List.csv and data/1.1 New Workwear Request.csv)
- Basic Orders Requested and Orders Placed pages

Quick start (local with Docker):

1. Copy .env.example to .env and update DATABASE_URL if needed.
2. docker-compose up --build
3. In another terminal, install deps and run seed:
   - npm install
   - npx prisma generate
   - npm run seed
4. Run the dev server:
   - npm run dev

The seed script will create sample companies, MD users, import the price list and sample orders.

Next steps I will do after you review this push:
- Implement full API logic for orders, approvals and price lookup
- Add authentication and authorization (SSO scaffolded)
- Configure Vercel + Railway deployment on request


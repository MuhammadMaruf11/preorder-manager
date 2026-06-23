# Preorder Manager

A full-stack preorder management application built with **Next.js 16**, **Prisma 7**, and **SQLite**.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma 7** (ORM)
- **SQLite** via **libsql** (file-based, no server needed)

---

## Local Setup

### Prerequisites

- **Node.js 18+**
- **npm**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/preorder-manager.git
cd preorder-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variable

Create a `.env` file in the root:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Run database migration

```bash
npx prisma migrate dev --name init
```

This creates the `dev.db` SQLite file and sets up the tables.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed sample data

```bash
npx prisma db seed
```

This inserts 8 sample preorders into the database.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)


## Project Structure

```
preorder-manager/

├── app/

│   ├── page.tsx                     # Preorder list page

│   ├── layout.tsx

│   ├── globals.css

│   ├── api/preorders/

│   │   ├── route.ts                 # GET list, POST create

│   │   └── [id]/route.ts            # GET one, PATCH update, DELETE

│   └── preorders/

│       ├── create/page.tsx          # Create preorder page

│       └── [id]/edit/page.tsx       # Edit preorder page

├── components/

│   └── PreorderForm.tsx             # Shared create/edit form

├── lib/

│   └── db.ts                        # Prisma client singleton

├── prisma/

│   ├── schema.prisma                # Database schema

│   ├── migrations/                  # Migration history

│   └── seed.ts                      # Sample data seeder

├── types/

│   └── index.ts                     # Shared TypeScript types

├── prisma.config.ts                 # Prisma 7 config

└── README.md
```
---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/preorders?filter=all&sortBy=createdAt&sortDir=desc&page=1&pageSize=10` | List preorders |
| POST | `/api/preorders` | Create preorder |
| GET | `/api/preorders/:id` | Get single preorder |
| PATCH | `/api/preorders/:id` | Update preorder |
| DELETE | `/api/preorders/:id` | Delete preorder |

---

## Features

- List page with **filter** (All / Active / Inactive), **sort**, and **pagination** — all server-side
- **Status toggle** — updates database instantly
- **Delete** — removes from database with confirmation
- **Row checkboxes** and **Select All**
- **Create / Edit** form with validation, loading state, and redirect on save
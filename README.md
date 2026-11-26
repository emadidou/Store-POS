# Store POS — Maison Verde

A click & collect and point-of-sale platform for a single grocery store.

- **Storefront**: customers browse the catalog, fill a cart and place pickup orders.
- **Admin back office**: the store manages products, stock, orders, the in-store POS, invoices, credit notes, supplier purchases and accounting exports.
- **Laravel API**: holds the business logic, the database, PDF generation and exports.

This is a single-store application, not a multi-tenant SaaS.

## Tech stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 7, Tailwind CSS, Framer Motion, Recharts, Lucide icons |
| Backend | Laravel 13, PHP 8.3+, Laravel Sanctum (admin auth), DomPDF |
| Database | MySQL (SQLite works locally with small adjustments) |

## Features

**Customer site**
- Product catalog with categories and featured products
- Cart saved in the browser
- Checkout with pickup slot selection
- Order voucher page after ordering
- Live open/closed indicator based on business hours

**Admin back office** (`/admin`)
- Dashboard with sales and stock charts
- POS for in-store sales with receipt printing
- Orders, invoices and credit notes (PDF)
- Products, categories and stock movements
- Customers and suppliers
- Supplier purchases and purchase journal
- Pickup slots and business hours
- Sales journal and accounting export
- Store, tax and profile settings

## Project structure

```text
├── src/                 React app (customer site + admin)
│   ├── api/             Public API client
│   ├── components/      Customer site components
│   ├── hooks/           Shared hooks
│   └── admin/           Admin back office (pages, components, API client, auth)
├── backend/             Laravel API
│   ├── app/             Models, controllers, services, enums
│   ├── database/        Migrations and seeders
│   ├── resources/views/pdf/  PDF templates
│   └── routes/api.php   API routes
└── DOCUMENTATION_COMPLETE_EN.md   Full technical documentation
```

## Getting started

### Requirements

- Node.js and npm
- PHP 8.3+ and Composer
- MySQL

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env        # then set your DB_* values
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve           # http://localhost:8000
```

In the `local` environment, the seeder creates an admin account. Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` and `SEED_ADMIN_NAME` in `backend/.env` to choose its credentials. No admin is created in production.

### 2. Frontend

From the project root:

```bash
npm install
```

Create a `.env` file pointing at your API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Then start the dev server:

```bash
npm run dev                 # http://127.0.0.1:5173
```

The admin back office is at `/admin`.

## Building for production

```bash
npm run build
```

The build reads `VITE_API_URL` from `.env.production` and outputs to `dist/`.

## Tests

```bash
cd backend
php artisan test --testsuite=Feature
```

## Documentation

Full technical documentation (architecture, database tables, API routes, business rules):

- English: [DOCUMENTATION_COMPLETE_EN.md](DOCUMENTATION_COMPLETE_EN.md)
- Français : [DOCUMENTATION_COMPLETE.md](DOCUMENTATION_COMPLETE.md)

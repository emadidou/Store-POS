# Complete Documentation - GreenGrocery / Maison Verde

## 1. Overview

This application is a store / pickup / POS solution composed of three main parts:

- a React customer frontend used to display the catalog, manage the cart, and place pickup orders
- a React admin back office used to manage the store, products, stock, orders, invoicing, credit notes, supplier purchases, and exports
- a Laravel backend API that centralizes business logic, data persistence, PDF generation, and accounting exports

The project is designed as a single-store application. It is not a multi-tenant SaaS.

## 2. Technical stack

### Frontend

- React 19
- React Router 7
- Vite 7
- Tailwind CSS
- Lucide React
- Recharts
- Framer Motion

### Backend

- Laravel 13
- PHP 8.3+
- Laravel Sanctum for admin token authentication
- DomPDF for PDF generation
- Laravel Excel for XLSX exports
- MySQL by default in `backend/.env.example`

## 3. Repository structure

```text
greengrocery/
|-- src/                      Customer frontend + admin frontend
|   |-- api/                  Public site API client
|   |-- components/           Public site components
|   |-- hooks/                Frontend hooks
|   |-- admin/                Full admin application
|   |   |-- api/              Admin API client + types
|   |   |-- auth/             AuthContext + protected route
|   |   |-- components/       Reusable admin components
|   |   |-- layout/           Admin shell + sidebar
|   |   |-- pages/            Admin pages
|   |   |-- services/         Admin frontend services
|   |   |-- utils/            Admin helpers
|-- backend/                  Laravel API
|   |-- app/
|   |   |-- Enums/            Business enums
|   |   |-- Http/
|   |   |   |-- Controllers/  Public and admin API controllers
|   |   |   |-- Requests/     Server-side validation
|   |   |   |-- Resources/    JSON transformers
|   |   |-- Models/           Eloquent models
|   |   |-- Services/         Business services
|   |-- database/
|   |   |-- migrations/       Database schema
|   |   |-- seeders/          Initial data
|   |-- resources/views/pdf/  PDF templates
|   |-- routes/api.php        API routes
|   |-- tests/Feature/        Business feature tests
|-- DOCUMENTATION_COMPLETE.md
|-- DOCUMENTATION_COMPLETE_EN.md
```

## 4. Applications and entry points

### 4.1 Main frontend

- Entry point: `src/main.jsx`
- Global router: `src/App.jsx`

Main React routes:

- `/` : public site
- `/produits` : full catalog
- `/checkout` : checkout flow
- `/order-success/:orderNumber` : customer order voucher / success page
- `/admin/*` : admin back office

### 4.2 Customer site

Main file: `src/ClientSite.jsx`

The customer site handles:

- loading store settings
- local cart storage through `localStorage`
- product and category display
- checkout
- contact, footer, floating actions, open/closed store indicator

Main public components:

- `Header.jsx`
- `Hero.jsx`
- `FeaturedProducts.jsx`
- `ProductsPage.jsx`
- `CartDrawer.jsx`
- `CheckoutPage.jsx`
- `LiveIndicator.tsx`
- `FloatingActions.tsx`
- `Contact.jsx`
- `Footer.jsx`

### 4.3 Admin

Main file: `src/admin/AdminApp.jsx`

The back office is lazy-loaded page by page.

Main admin pages:

- `DashboardPage.tsx`
- `PosPage.tsx`
- `OrdersPage.tsx`
- `OrderDetailPage.tsx`
- `ProductsPage.tsx`
- `StockPage.tsx`
- `CategoriesPage.tsx`
- `CustomersPage.tsx`
- `SuppliersPage.tsx`
- `PurchasesPage.tsx`
- `PurchaseJournalPage.tsx`
- `PickupSlotsPage.tsx`
- `BusinessHoursPage.tsx`
- `SalesJournalPage.tsx`
- `AccountingExportPage.tsx`
- `StoreSettingsPage.tsx`
- `ProfilePage.tsx`

Admin shell:

- `src/admin/layout/AdminLayout.tsx`

Current admin sidebar sections:

- Dashboard
- POS
- Orders
- Stock
- Products
- Categories
- Customers
- Suppliers
- Purchases
- Pickup slots
- Business hours
- Sales journal
- Accounting export
- Settings
- Profile

## 5. Configuration and environment variables

### 5.1 Frontend

Example file: `.env.example`

Used variable:

- `VITE_API_URL=http://127.0.0.1:8000/api`

Used in:

- `src/api/config.ts`
- `src/admin/api/client.ts`

### 5.2 Backend

Example file: `backend/.env.example`

Important variables:

- `APP_NAME`
- `APP_ENV`
- `APP_URL`
- `APP_DEBUG`
- `FRONTEND_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SESSION_DRIVER`
- `QUEUE_CONNECTION`
- `CACHE_STORE`
- `FILESYSTEM_DISK`

Local admin seeding variables:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

Important:

- the seeded admin account is created only when `app()->environment('local')`
- in production, no default admin account is automatically created

## 6. Installation and startup

### 6.1 Requirements

- recent Node.js
- npm
- PHP 8.3+
- Composer
- MySQL or SQLite if adapted locally

### 6.2 Frontend installation

From the repository root:

```bash
npm install
```

### 6.3 Backend installation

From `backend/`:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

### 6.4 Development startup

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd backend
php artisan serve
```

### 6.5 Frontend build

```bash
npm run build
```

### 6.6 Backend tests

```bash
cd backend
php artisan test --testsuite=Feature
```

## 7. Frontend architecture

### 7.1 Public frontend API layer

Files:

- `src/api/client.ts`
- `src/api/config.ts`
- `src/api/products.ts`
- `src/api/orders.ts`
- `src/api/store.ts`
- `src/api/storeSettings.ts`

Responsibilities:

- fetch products and categories
- fetch store status
- create a public order
- fetch the customer voucher by order number + token
- fetch store settings

### 7.2 Frontend hooks

- `useProducts(currency?)`: loads all public products
- `useFeaturedProducts(currency?)`: loads featured products
- `useCategories(products)`: loads categories
- `useStoreStatus()`: polls `/api/store-status`

### 7.3 Cart management

The cart is managed in `src/ClientSite.jsx`.

Rules:

- stored in `localStorage` under `maison-verde-cart`
- add by product
- quantity handled in grams
- item removed automatically below the minimal threshold

### 7.4 Checkout

Main file: `src/components/CheckoutPage.jsx`

Checkout behavior:

- reads store settings
- reads backend slots and store status
- builds the customer payload
- posts an order to `/api/orders`
- redirects to the success page

Online payment:

- no real online payment flow is implemented
- the UI currently supports payment on pickup / reception behavior
- no paid invoice can be generated directly from the public frontend

### 7.5 LiveIndicator

Main file: `src/components/LiveIndicator.tsx`

This component no longer uses hardcoded hours:

- it consumes `GET /api/store-status`
- it displays `message`, `opens_at`, `closes_at`, `timezone`

## 8. Admin frontend architecture

### 8.1 Admin authentication

Files:

- `src/admin/auth/AuthContext.tsx`
- `src/admin/auth/ProtectedRoute.tsx`

Behavior:

- login through `POST /api/admin/login`
- Sanctum token stored in `localStorage`
- session verification with `GET /api/admin/me`
- logout through `POST /api/admin/logout`
- expiration handled through `admin-auth-expired`

### 8.2 Admin API client

Main file: `src/admin/api/client.ts`

This client handles:

- login/logout/me
- order CRUD
- credit note creation
- product / category / customer CRUD
- stock and stock movements
- supplier CRUD
- purchase CRUD + supplier invoice upload
- pickup slots and business hours
- sales journal
- sales accounting export
- purchase accounting export
- store settings
- secure admin file opening and download

### 8.3 Admin mock mode

Admin mock mode is enabled only if:

- `import.meta.env.DEV`
- and `VITE_ENABLE_ADMIN_MOCKS === 'true'`

It must not be enabled in production.

### 8.4 Admin printing

File: `src/admin/services/printerService.ts`

Current state:

- browser printing is supported
- `qz-tray` is not configured
- `printnode` is not configured

Conclusion:

- documents are printable
- there is not yet a configured native hardware printing integration

## 9. Backend architecture

### 9.1 Public API controllers

`backend/app/Http/Controllers/Api`

- `CategoryController`
- `ProductController`
- `PickupSlotController`
- `BusinessHourController`
- `StoreSettingController`
- `StoreStatusController`
- `OrderController`
- `OrderDocumentController`

### 9.2 Admin API controllers

`backend/app/Http/Controllers/Api/Admin`

- `AuthController`
- `OrderController`
- `OrderDocumentController`
- `CreditNoteController`
- `ProductController`
- `CategoryController`
- `CustomerController`
- `SupplierController`
- `PurchaseController`
- `PurchaseAttachmentController`
- `PickupSlotController`
- `BusinessHourController`
- `StockController`
- `StoreSettingController`
- `SalesJournalController`
- `AccountingExportController`

### 9.3 Business services

Main services:

- `OrderService`
- `CreditNoteService`
- `PurchaseService`
- `StockService`
- `StockStatsService`
- `StoreStatusService`
- `SalesJournalService`
- `AccountingExportService`
- `PurchaseAccountingExportService`
- `DocumentTypeResolver`
- `InvoiceNumberGenerator`
- `CreditNoteNumberGenerator`
- `PurchaseNumberGenerator`
- `DocumentPdfService`
- `TaxCalculator`

Architecture principle:

- controllers stay thin
- validation lives in FormRequest classes
- critical business logic lives in services
- Resources control JSON output

## 10. Database

### 10.1 Main migrations

Important migrations:

- `2026_04_23_100000_create_store_core_tables.php`
- `2026_04_23_120000_add_voucher_token_to_orders_table.php`
- `2026_04_23_130000_add_pos_fields_to_orders_table.php`
- `2026_04_23_140000_add_commercial_document_fields_to_orders_table.php`
- `2026_04_23_142000_add_tax_totals_to_orders_and_items.php`
- `2026_04_23_152000_add_stock_management_fields_to_products_table.php`
- `2026_04_23_152100_create_stock_movements_table.php`
- `2026_04_24_130000_add_order_cancellation_tracking_and_store_setting_safety_columns.php`
- `2026_04_24_170000_add_credit_note_fields_to_orders_table.php`
- `2026_04_24_190000_create_suppliers_and_purchases_tables.php`
- `2026_04_24_191000_add_purchase_tracking_to_stock_movements_and_products.php`

### 10.2 Main tables

#### categories

- `id`
- `name`
- `slug`
- `description`
- `is_active`
- timestamps

#### products

- `id`
- `category_id`
- `name`
- `slug`
- `description`
- `image`
- `price`
- `stock`
- `alert_threshold`
- `last_stock_update_at`
- `average_purchase_cost_ht`
- `last_purchase_cost_ht`
- `last_purchased_at`
- `is_available`
- `is_featured`
- timestamps

#### customers

- `id`
- `full_name`
- `phone`
- `email`
- timestamps

#### orders

Core fields:

- `id`
- `customer_id`
- `original_order_id`
- `order_number`
- `voucher_token`
- `status`
- `total_amount`
- `subtotal_ht`
- `total_vat`
- `total_ttc`
- `vat_rate`
- `vat_regime`
- `legal_note`
- `pickup_date`
- `pickup_time`
- `payment_method`
- `notes`
- `source`
- `order_type`
- `is_paid`
- `payment_status`
- `document_type`
- `invoice_number`
- `credit_note_number`
- `paid_at`
- `refunded_at`
- `refund_reason`
- `refund_amount`
- `cancelled_at`
- `stock_restored_at`
- timestamps

#### order_items

- `id`
- `order_id`
- `product_id`
- `product_name_snapshot`
- `unit_price`
- `unit_price_ht`
- `unit_price_ttc`
- `vat_rate`
- `vat_amount`
- `quantity`
- `subtotal`
- `subtotal_ht`
- `subtotal_ttc`
- timestamps

#### pickup_slots

- `id`
- `day_of_week`
- `start_time`
- `end_time`
- `max_orders`
- `is_active`

#### business_hours

- `id`
- `day_of_week`
- `open_time`
- `close_time`
- `is_closed`

#### store_settings

Main fields:

- `store_name`
- `company_name`
- `legal_form`
- `share_capital`
- `phone`
- `email`
- `address`
- `siret`
- `siren`
- `ape_code`
- `vat_number`
- `rc`
- `rcs_city`
- `ice`
- `vat_rate`
- `vat_exempt`
- `vat_regime`
- `default_vat_rate`
- `legal_vat_note`
- `pickup_buffer_minutes`
- `currency`
- `timezone`
- `open_message`
- `closed_message`

#### stock_movements

Purpose:

- stores every stock entry, output, or adjustment

Useful fields:

- `product_id`
- `purchase_id`
- `type`
- `quantity`
- `previous_stock`
- `new_stock`
- `reason`
- `source`
- `reference`
- `note`
- `created_by`
- timestamps

#### suppliers

- `id`
- `name`
- `phone`
- `email`
- `address`
- `siret`
- `siren`
- `vat_number`
- `notes`
- `is_active`

#### purchases

- `id`
- `supplier_id`
- `purchase_number`
- `external_invoice_number`
- `external_invoice_date`
- `purchase_date`
- `status`
- `subtotal_ht`
- `total_vat`
- `total_ttc`
- `payment_status`
- `payment_method`
- `paid_at`
- `notes`
- `attachment_path`
- `confirmed_at`
- `cancelled_at`
- `stock_applied_at`
- timestamps

#### purchase_items

- `id`
- `purchase_id`
- `product_id`
- `product_name_snapshot`
- `quantity`
- `unit_cost_ht`
- `vat_rate`
- `vat_amount`
- `subtotal_ht`
- `subtotal_ttc`
- timestamps

#### users

- Laravel users
- `is_admin` is used to grant back office access

#### personal_access_tokens

- Sanctum admin tokens

#### document_generation_logs

- internal document generation logs

## 11. Business enums

### DocumentType

- `invoice`
- `order_voucher`
- `credit_note`

### OrderStatus

- `pending`
- `confirmed`
- `preparing`
- `ready`
- `picked_up`
- `cancelled`

### PaymentStatus

- `pending`
- `paid`
- `failed`

### PaymentMethod

- `cash`
- `stripe_later_ready`
- `stripe`

Note:

- `stripe` exists in the enum for admin / card / future integration use
- the public checkout does not implement a real Stripe flow confirmed by the server

### VatRegime

- `standard`
- `franchise_base`

## 12. API routes

### 12.1 Public API

Defined in `backend/routes/api.php`:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/{product}`
- `GET /api/pickup-slots`
- `GET /api/business-hours`
- `GET /api/store-settings`
- `GET /api/store-status`
- `POST /api/orders`
- `GET /api/orders/{orderNumber}/voucher`
- `GET /api/orders/{orderNumber}/document-pdf`

### 12.2 Admin API

Prefix: `/api/admin`

Auth:

- `POST /login`
- `POST /logout`
- `GET /me`
- `PATCH /profile`

Orders:

- `GET /orders`
- `POST /orders`
- `GET /orders/{order}`
- `PUT /orders/{order}`
- `DELETE /orders/{order}`
- `PATCH /orders/{order}/status`
- `GET /orders/{order}/invoice-pdf`
- `GET /orders/{order}/voucher-pdf`

Credit notes:

- `POST /orders/{order}/credit-note`
- `GET /orders/{order}/credit-note`
- `GET /credit-notes`
- `GET /credit-notes/{order}/pdf`

Products:

- `GET /products`
- `POST /products`
- `GET /products/{product}`
- `PUT /products/{product}`
- `DELETE /products/{product}`
- `PATCH /products/{product}/stock`

Categories:

- `apiResource('categories')`

Customers:

- `apiResource('customers')`

Suppliers:

- `apiResource('suppliers')`

Purchases:

- `GET /purchases`
- `POST /purchases`
- `GET /purchases/{purchase}`
- `PUT /purchases/{purchase}`
- `DELETE /purchases/{purchase}`
- `PATCH /purchases/{purchase}/status`
- `GET /purchases/journal`
- `GET /purchases/stats`
- `GET /purchases/{purchase}/attachment`
- `GET /purchases/{purchase}/attachment/download`

Stock:

- `GET /stock`
- `POST /stock/adjust`
- `GET /stock/movements`
- `GET /stock/alerts`
- `GET /stock/stats`
- `GET /stock/movements-summary`

Hours and slots:

- `GET /business-hours`
- `PUT /business-hours`
- `GET /pickup-slots`
- `POST /pickup-slots`
- `PUT /pickup-slots/{pickupSlot}`
- `DELETE /pickup-slots/{pickupSlot}`

Settings:

- `GET /store-settings`
- `PUT /store-settings`

Journals and accounting:

- `GET /sales-journal`
- `GET /sales-journal/export`
- `GET /accounting-export`
- `GET /accounting-export/csv`
- `GET /accounting-export/xlsx`
- `GET /accounting-export/purchases`

## 13. Backend validation

Important FormRequests:

- `StoreOrderRequest`
- `StoreAdminOrderRequest`
- `UpdateOrderRequest`
- `UpdateOrderStatusRequest`
- `StoreCreditNoteRequest`
- `StoreProductRequest`
- `UpdateProductStockRequest`
- `StorePurchaseRequest`
- `UpdatePurchaseRequest`
- `UpdatePurchaseStatusRequest`
- `StoreSupplierRequest`
- `AdminLoginRequest`
- `UpdateStoreSettingsRequest`

Examples of critical validation:

- the public order flow forces `source=web` and `order_type=pickup`
- sensitive accounting fields are not decided by the client
- purchases validate `items`, `quantity`, `unit_cost_ht`, `vat_rate`
- supplier files allow only `pdf`, `jpg`, `jpeg`, `png`
- admin login is validated and rate-limited

## 14. Business rules - orders

### 14.1 Public order creation

Service: `OrderService::createPublic()`

Rules:

- only the backend decides the financial state
- `source` is forced to `web`
- `order_type` is forced to `pickup`
- `payment_status` is forced to `pending`
- generated document is `order_voucher`
- no paid invoice can be issued by a public client

### 14.2 Admin order creation

Service: `OrderService::createAdmin()`

Rules:

- backend validates products, stock, and availability
- line totals are recalculated server-side
- if `payment_captured=true`, the order becomes `paid`
- if payment is captured, the document becomes an `invoice`
- otherwise the document remains an `order_voucher`

### 14.3 POS

The POS uses the same admin order backend.

Business rules:

- POS cash collected => `invoice` + `paid`
- POS card / TPE confirmed => `invoice` + `paid`
- pay-on-reception / not collected => `order_voucher` + `pending`

### 14.4 Update / delete

The backend blocks:

- credit note modification
- credit note deletion
- modification of an already invoiced order
- deletion of an already invoiced order

### 14.5 Order cancellation

Service: `OrderService::cancelOrder()`

Rules:

- an already collected order (`picked_up`) cannot be cancelled
- a paid invoice cannot be cancelled directly
- a paid invoice must go through a credit note
- cancelling an unpaid order restores stock
- `stock_restored_at` tracks stock restoration

## 15. Business rules - commercial documents

### 15.1 Document types

- `order_voucher`: order / pickup voucher for an unpaid order
- `invoice`: invoice for a paid order
- `credit_note`: credit note linked to an original invoice

### 15.2 Document type resolution

Service: `DocumentTypeResolver`

Rules:

- `paid` => `invoice`
- `pending` => `order_voucher`
- public checkout => always `pending`

### 15.3 Numbering

Services:

- `InvoiceNumberGenerator`
- `CreditNoteNumberGenerator`
- `PurchaseNumberGenerator`

Usage:

- invoice: unique chronological number
- credit note: unique number like `AV-YYYY-XXXXXX`
- purchase: internal purchase number

### 15.4 Immutability

Rules:

- an issued invoice never changes its number
- a credit note is immutable
- a refunded paid invoice keeps its original trace
- the credit note references the original invoice through `original_order_id`

## 16. Business rules - credit notes

Service: `CreditNoteService`

Behavior:

- verifies the source document is an invoice
- verifies the invoice is paid
- blocks multiple full credit notes
- supports full or partial credit notes
- creates negative lines
- creates `credit_note_number`
- sets `refunded_at`, `refund_reason`, `refund_amount`
- restores stock when requested

Effects:

- the original invoice remains intact
- journals and accounting exports include the credit note
- stock can be restored if products return

## 17. Business rules - VAT and tax

Service: `TaxCalculator`

Rules:

- standard regime: VAT uses `default_vat_rate` or `vat_rate`
- franchise regime: VAT = 0
- default legal note: `TVA non applicable - article 293 B du CGI`

Important:

- documents display the historical VAT stored on the order / invoice
- changing VAT settings does not rewrite old invoices

## 18. Business rules - stock

Services:

- `StockService`
- `StockStatsService`

Supported operations:

- stock input
- stock output
- manual adjustment
- alert threshold update
- availability update

Traceability:

- every movement creates a `stock_movement`
- `reason`, `source`, `reference`, `note`, and `created_by` are stored

Rules:

- negative stock is forbidden
- if stock reaches 0, `is_available` can be forced to false depending on the operation
- low stock uses `alert_threshold`

## 19. Business rules - supplier purchases

Service: `PurchaseService`

States:

- `draft`
- `confirmed`
- `cancelled`

Behavior:

- a draft purchase does not affect stock
- a confirmed purchase increases stock
- each line creates an `in` movement
- cancelling a confirmed purchase attempts the reverse movement
- cancellation is blocked if current stock makes rollback impossible

Attachments:

- supplier invoice is stored on the private local disk
- access is admin-only through secure routes

Derived product stats:

- `average_purchase_cost_ht`
- `last_purchase_cost_ht`
- `last_purchased_at`

## 20. Business rules - store status and pickup

Service: `StoreStatusService`

Sources:

- `store_settings.timezone`
- `store_settings.open_message`
- `store_settings.closed_message`
- `business_hours`

Returned payload:

- `is_open`
- `message`
- `opens_at`
- `closes_at`
- `timezone`

Public order checks:

- store must be open
- pickup slot must exist
- `pickup_buffer_minutes` must be respected
- max slot capacity is checked if configured

## 21. Sales journal

Service: `SalesJournalService`

The sales journal returns normalized rows with:

- document date
- order number
- document type
- invoice number
- credit note number
- original invoice reference
- customer
- HT / VAT / TTC amounts
- payment
- source
- order status
- refund reason
- `entry_type`

Entry types:

- `paid_sale`
- `credit_note`
- `cancelled_invoice`
- `cancelled_voucher`
- `order_voucher`

## 22. Sales accounting export

Service: `AccountingExportService`

Formats:

- CSV UTF-8 with BOM
- XLSX

CSV columns:

- Date
- Invoice
- Credit note
- Original invoice
- Type
- Order
- Customer
- Direction
- Payment
- HT
- VAT
- TTC
- Status
- Source

Rules:

- exports only `invoice` and `credit_note`
- excludes non-accounting vouchers
- `credit_note` is exported as `credit`
- separator is `;`

Filters:

- `type=day|month|year|all`
- `date`
- `month`
- `year`
- `source`
- `payment_method`
- `payment_status`
- `document_type`

## 23. Purchase journal and export

Services:

- `PurchaseJournalService`
- `PurchaseAccountingExportService`

Purchase journal:

- only `confirmed` purchases
- filterable by supplier, dates, payment, attachment
- provides stats:
  - monthly purchases
  - monthly VAT
  - top suppliers
  - most purchased products
  - 30-day series

Purchase export CSV:

Columns:

- `date_achat`
- `fournisseur`
- `numero_facture_fournisseur`
- `numero_achat_interne`
- `montant_ht`
- `montant_tva`
- `montant_ttc`
- `statut_paiement`
- `methode_paiement`
- `fichier_facture`
- `notes`

Rules:

- `;` separator
- UTF-8 BOM
- confirmed purchases only

## 24. PDF and documents

Central service:

- `backend/app/Services/Pdf/DocumentPdfService.php`

Blade templates in `backend/resources/views/pdf/`:

- invoice
- order voucher
- credit note

Available documents:

- admin invoice
- admin voucher
- public customer voucher
- admin credit note

## 25. Security

### 25.1 Admin auth

- Sanctum token auth
- `auth:sanctum` middleware
- `admin` middleware
- admin profile update through API

### 25.2 Brute-force protection

The route:

- `POST /api/admin/login`

is protected by:

- `throttle:admin-login`

Covered by test:

- `StoreStatusAndAuthTest::test_admin_login_is_throttled_after_repeated_failures`

### 25.3 File protection

Supplier invoices are not exposed publicly.

Access:

- only through authenticated admin routes
- read / download controlled by backend

### 25.4 Server-side truth

The backend recalculates:

- order totals
- purchase totals
- document type
- payment status

The frontend is never trusted for sensitive business data.

## 26. Test coverage

Feature tests present:

- `OrderFlowTest.php`
- `AccountingExportTest.php`
- `PurchaseFlowTest.php`
- `StoreStatusAndAuthTest.php`

Covered scenarios:

- web order pending => order voucher
- client attempt to force sensitive fields
- POS cash => paid invoice
- POS card / TPE => paid invoice
- unpaid order cancellation => stock restoration
- paid invoice => direct cancellation blocked
- credit note creation => trace + stock restoration
- credit note PDF available
- out-of-stock product not orderable
- unique invoice numbers
- confirmed purchase => stock input + movements
- draft purchase => no stock effect
- confirmed purchase cancellation with reverse stock validation
- supplier invoice upload + admin download
- purchase accounting export
- store status using configured messages
- admin login throttling

## 27. Seed data

`DatabaseSeeder` initializes:

- `fruits`, `legumes`, `paniers` categories
- demo products
- business hours
- pickup slots
- default store settings
- local-only admin

Default local admin account:

- email: `admin@maison-verde.test`
- password: `password`

Important:

- this account is for local environments only
- it must not be reused in production

## 28. Current limitations

Important known limitations:

- no real Stripe payment flow on the customer side
- `printerService` does not yet support configured `qz-tray` or `printnode`
- application is designed for one store
- no advanced role system beyond `is_admin`
- no production business email/SMS notification flow connected yet

## 29. Production checklist

Before going live:

1. Configure `backend/.env`
2. Configure `VITE_API_URL`
3. Run migrations
4. Run seeds if needed
5. Run `php artisan storage:link`
6. Create at least one real admin user
7. Disable any admin mock mode
8. Verify CORS with `FRONTEND_URL`
9. Test critical flows:
   - web order
   - paid POS order
   - cancellation
   - credit note
   - supplier purchase
   - sales export
   - purchase export
10. Run feature tests
11. Build the frontend

## 30. Functional validation checklist

### Public frontend

- site loads
- catalog loads
- categories load
- cart works
- checkout creates an order
- `order-success` page works
- store status comes from backend

### Admin

- login/logout
- dashboard
- product CRUD
- category CRUD
- customer CRUD
- orders
- POS
- stock and movements
- invoice / voucher PDF
- credit notes
- suppliers
- purchases
- sales accounting export
- purchase accounting export
- sales journal
- purchase journal
- store settings

## 31. Most important files to know

### Frontend

- `src/App.jsx`
- `src/ClientSite.jsx`
- `src/api/products.ts`
- `src/api/orders.ts`
- `src/hooks/useCatalog.ts`
- `src/hooks/useStoreStatus.ts`
- `src/components/CheckoutPage.jsx`
- `src/components/LiveIndicator.tsx`

### Admin frontend

- `src/admin/AdminApp.jsx`
- `src/admin/layout/AdminLayout.tsx`
- `src/admin/api/client.ts`
- `src/admin/auth/AuthContext.tsx`
- `src/admin/pages/PosPage.tsx`
- `src/admin/pages/OrdersPage.tsx`
- `src/admin/pages/OrderDetailPage.tsx`
- `src/admin/pages/StockPage.tsx`
- `src/admin/pages/PurchasesPage.tsx`
- `src/admin/pages/PurchaseDetailPage.tsx`
- `src/admin/pages/SalesJournalPage.tsx`
- `src/admin/pages/AccountingExportPage.tsx`

### Backend

- `backend/routes/api.php`
- `backend/app/Services/OrderService.php`
- `backend/app/Services/CreditNoteService.php`
- `backend/app/Services/PurchaseService.php`
- `backend/app/Services/StockService.php`
- `backend/app/Services/StoreStatusService.php`
- `backend/app/Services/Sales/SalesJournalService.php`
- `backend/app/Services/Accounting/AccountingExportService.php`
- `backend/app/Services/Accounting/PurchaseAccountingExportService.php`
- `backend/app/Services/Tax/TaxCalculator.php`

## 32. Functional summary

The application currently handles:

- public catalog
- local cart
- pickup / drive order flow
- admin back office
- POS
- products / categories / customers
- stock and stock movements
- invoices
- order vouchers
- credit notes
- sales journal
- sales accounting export
- suppliers
- supplier purchases
- supplier invoice attachments
- purchase journal
- purchase accounting export
- VAT and legal store information
- business hours and pickup slots

## 33. Conclusion

This project is a complete business application for a fruit store / grocery / pickup shop with an integrated back office. Critical business logic now lives on the backend: admin payments, invoicing, vouchers, credit notes, stock, purchases, and exports. Both the public frontend and the back office consume the Laravel API as the single source of truth.

This documentation reflects the current implementation in the repository as of `2026-04-24`.

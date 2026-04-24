# Documentation Complete - GreenGrocery / Maison Verde

## 1. Vue d'ensemble

Cette application est une solution magasin / drive / POS composee de trois blocs principaux :

- un frontend client React pour presenter le catalogue, gerer le panier et passer une commande de retrait
- un back office admin React pour gerer le magasin, les produits, le stock, les commandes, la facturation, les avoirs, les achats fournisseurs et les exports
- une API backend Laravel qui centralise toute la logique metier, la persistence des donnees, la generation des documents PDF et les exports comptables

Le projet est concu comme une application mono-boutique. Il ne s'agit pas d'un SaaS multi-tenant.

## 2. Stack technique

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
- Laravel Sanctum pour l'authentification admin par token
- DomPDF pour les PDF
- Laravel Excel pour les exports XLSX
- Base de donnees MySQL par defaut dans `backend/.env.example`

## 3. Structure du depot

```text
greengrocery/
|-- src/                      Frontend client + frontend admin
|   |-- api/                  Client API du site public
|   |-- components/           Composants du site public
|   |-- hooks/                Hooks frontend
|   |-- admin/                Application admin complete
|   |   |-- api/              Client API admin + types
|   |   |-- auth/             AuthContext + route protegee
|   |   |-- components/       Composants reutilisables admin
|   |   |-- layout/           Shell admin + sidebar
|   |   |-- pages/            Pages admin
|   |   |-- services/         Services frontend admin
|   |   |-- utils/            Helpers admin
|-- backend/                  API Laravel
|   |-- app/
|   |   |-- Enums/            Enums metier
|   |   |-- Http/
|   |   |   |-- Controllers/  Controleurs API publics et admin
|   |   |   |-- Requests/     Validation serveur
|   |   |   |-- Resources/    Transformation JSON
|   |   |-- Models/           Modeles Eloquent
|   |   |-- Services/         Services metier
|   |-- database/
|   |   |-- migrations/       Schema DB
|   |   |-- seeders/          Donnees initiales
|   |-- resources/views/pdf/  Templates PDF
|   |-- routes/api.php        Routes API
|   |-- tests/Feature/        Tests metier
|-- DOCUMENTATION_COMPLETE.md
```

## 4. Applications et points d'entree

### 4.1 Frontend principal

- Point d'entree : `src/main.jsx`
- Router global : `src/App.jsx`

Routes frontend React :

- `/` : site public
- `/produits` : catalogue complet
- `/checkout` : tunnel de commande
- `/order-success/:orderNumber` : page client de bon de commande / recapitulatif
- `/admin/*` : back office

### 4.2 Site client

Fichier central : `src/ClientSite.jsx`

Le site client gere :

- chargement des parametres magasin
- panier local via `localStorage`
- affichage des produits et categories
- checkout
- contact, footer, actions flottantes, indicateur magasin ouvert/ferme

Composants publics principaux :

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

Fichier central : `src/admin/AdminApp.jsx`

Le back office est charge page par page en lazy loading.

Pages admin principales :

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

Shell admin :

- `src/admin/layout/AdminLayout.tsx`

Sidebar admin actuelle :

- Dashboard
- Caisse POS
- Commandes
- Stock
- Produits
- Categories
- Clients
- Fournisseurs
- Achats
- Creneaux
- Horaires
- Journal ventes
- Export comptable
- Parametres
- Profil

## 5. Configuration et variables d'environnement

### 5.1 Frontend

Fichier exemple : `.env.example`

Variable utilisee :

- `VITE_API_URL=http://127.0.0.1:8000/api`

Utilisation :

- `src/api/config.ts`
- `src/admin/api/client.ts`

### 5.2 Backend

Fichier exemple : `backend/.env.example`

Variables importantes :

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

Variables de seeding admin local :

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

Important :

- le compte admin de seed n'est cree que si `app()->environment('local')`
- en production, aucun compte admin par defaut n'est cree automatiquement

## 6. Installation et demarrage

### 6.1 Prerequis

- Node.js recent
- npm
- PHP 8.3+
- Composer
- MySQL ou SQLite si adaptation locale

### 6.2 Installation frontend

Depuis la racine :

```bash
npm install
```

### 6.3 Installation backend

Depuis `backend/` :

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

### 6.4 Lancement en developpement

Frontend :

```bash
npm run dev
```

Backend :

```bash
cd backend
php artisan serve
```

### 6.5 Build frontend

```bash
npm run build
```

### 6.6 Tests backend

```bash
cd backend
php artisan test --testsuite=Feature
```

## 7. Architecture frontend

## 7.1 API publique du frontend

Fichiers :

- `src/api/client.ts`
- `src/api/config.ts`
- `src/api/products.ts`
- `src/api/orders.ts`
- `src/api/store.ts`
- `src/api/storeSettings.ts`

Responsabilites :

- recuperer produits et categories
- recuperer status magasin
- creer une commande publique
- recuperer le bon client par numero + token
- lire les parametres magasin

### 7.2 Hooks frontend

- `useProducts(currency?)` : charge tous les produits publics
- `useFeaturedProducts(currency?)` : charge les produits vedettes
- `useCategories(products)` : charge les categories
- `useStoreStatus()` : interroge regulierement `/api/store-status`

### 7.3 Gestion du panier

Le panier est gere dans `src/ClientSite.jsx`.

Regles :

- stockage local dans `localStorage` sous la cle `maison-verde-cart`
- ajout par produit
- quantite geree en grammes
- retrait automatique si le poids descend sous le seuil minimal

### 7.4 Checkout

Fichier cle : `src/components/CheckoutPage.jsx`

Le checkout :

- lit les reglages magasin
- lit les creneaux et le status backend
- prepare le payload client
- envoie une commande a `/api/orders`
- redirige ensuite vers la page de succes client

Paiement en ligne :

- le vrai flux en ligne n'est pas implemente
- l'UI traite uniquement un scenario de paiement a la reception
- aucune facture payee n'est generee par le frontend public

### 7.5 LiveIndicator

Fichier cle : `src/components/LiveIndicator.tsx`

Le composant n'utilise plus d'horaires hardcodes :

- il consomme `GET /api/store-status`
- il affiche `message`, `opens_at`, `closes_at`, `timezone`

## 8. Architecture admin frontend

## 8.1 Authentification admin

Fichiers :

- `src/admin/auth/AuthContext.tsx`
- `src/admin/auth/ProtectedRoute.tsx`

Fonctionnement :

- connexion via `POST /api/admin/login`
- token Sanctum stocke en localStorage
- verification de session avec `GET /api/admin/me`
- deconnexion via `POST /api/admin/logout`
- expiration geree par evenement `admin-auth-expired`

## 8.2 Client API admin

Fichier central : `src/admin/api/client.ts`

Ce client gere :

- login/logout/me
- CRUD commandes
- creation d'avoirs
- CRUD produits / categories / clients
- stock et mouvements de stock
- CRUD fournisseurs
- CRUD achats + upload de facture fournisseur
- creneaux et horaires
- journal de ventes
- export comptable ventes
- export comptable achats
- parametres magasin
- ouverture securisee de fichiers admin

## 8.3 Mock admin

Le mode mock admin n'est actif que si :

- `import.meta.env.DEV`
- et `VITE_ENABLE_ADMIN_MOCKS === 'true'`

Il ne doit pas etre active en production.

## 8.4 Impression admin

Fichier : `src/admin/services/printerService.ts`

Etat actuel :

- impression navigateur supportee
- `qz-tray` non configure
- `printnode` non configure

Conclusion :

- les documents sont imprimables
- il n'existe pas encore d'integration materielle native configuree

## 9. Architecture backend

## 9.1 Controleurs API publics

`backend/app/Http/Controllers/Api`

- `CategoryController`
- `ProductController`
- `PickupSlotController`
- `BusinessHourController`
- `StoreSettingController`
- `StoreStatusController`
- `OrderController`
- `OrderDocumentController`

## 9.2 Controleurs API admin

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

## 9.3 Services metier

Services principaux :

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

Principe d'architecture :

- les controleurs restent minces
- la validation est dans les FormRequest
- la logique metier critique est dans les services
- les Resources controlent le JSON renvoye au frontend

## 10. Base de donnees

## 10.1 Migrations principales

Migrations importantes :

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

## 10.2 Tables principales

### categories

- `id`
- `name`
- `slug`
- `description`
- `is_active`
- timestamps

### products

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

### customers

- `id`
- `full_name`
- `phone`
- `email`
- timestamps

### orders

Champs coeur :

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

### order_items

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

### pickup_slots

- `id`
- `day_of_week`
- `start_time`
- `end_time`
- `max_orders`
- `is_active`

### business_hours

- `id`
- `day_of_week`
- `open_time`
- `close_time`
- `is_closed`

### store_settings

Champs principaux :

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

### stock_movements

Role :

- historiser chaque entree, sortie ou ajustement

Champs utiles :

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

### suppliers

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

### purchases

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

### purchase_items

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

### users

- utilisateurs Laravel
- champ `is_admin` utilise pour l'acces back office

### personal_access_tokens

- tokens Sanctum admin

### document_generation_logs

- journal interne de generation de documents

## 11. Enums metier

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

Note :

- `stripe` existe dans l'enum pour les usages admin / TPE ou extension future
- le checkout public n'implemente pas un vrai flux Stripe confirme serveur

### VatRegime

- `standard`
- `franchise_base`

## 12. Routes API

## 12.1 API publique

Routes definies dans `backend/routes/api.php` :

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

## 12.2 API admin

Prefixe : `/api/admin`

Auth :

- `POST /login`
- `POST /logout`
- `GET /me`
- `PATCH /profile`

Commandes :

- `GET /orders`
- `POST /orders`
- `GET /orders/{order}`
- `PUT /orders/{order}`
- `DELETE /orders/{order}`
- `PATCH /orders/{order}/status`
- `GET /orders/{order}/invoice-pdf`
- `GET /orders/{order}/voucher-pdf`

Avoirs :

- `POST /orders/{order}/credit-note`
- `GET /orders/{order}/credit-note`
- `GET /credit-notes`
- `GET /credit-notes/{order}/pdf`

Produits :

- `GET /products`
- `POST /products`
- `GET /products/{product}`
- `PUT /products/{product}`
- `DELETE /products/{product}`
- `PATCH /products/{product}/stock`

Categories :

- `apiResource('categories')`

Clients :

- `apiResource('customers')`

Fournisseurs :

- `apiResource('suppliers')`

Achats :

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

Stock :

- `GET /stock`
- `POST /stock/adjust`
- `GET /stock/movements`
- `GET /stock/alerts`
- `GET /stock/stats`
- `GET /stock/movements-summary`

Horaires et creneaux :

- `GET /business-hours`
- `PUT /business-hours`
- `GET /pickup-slots`
- `POST /pickup-slots`
- `PUT /pickup-slots/{pickupSlot}`
- `DELETE /pickup-slots/{pickupSlot}`

Parametres :

- `GET /store-settings`
- `PUT /store-settings`

Journal et comptabilite :

- `GET /sales-journal`
- `GET /sales-journal/export`
- `GET /accounting-export`
- `GET /accounting-export/csv`
- `GET /accounting-export/xlsx`
- `GET /accounting-export/purchases`

## 13. Validation backend

FormRequest importantes :

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

Exemples de validations critiques :

- la commande publique impose `source=web` et `order_type=pickup`
- les champs sensibles document / statut paiement ne sont pas decider par le client
- les achats valident `items`, `quantity`, `unit_cost_ht`, `vat_rate`
- les fichiers fournisseurs acceptent seulement `pdf`, `jpg`, `jpeg`, `png`
- le login admin est valide et rate-limite

## 14. Regles metier - commandes

## 14.1 Creation de commande publique

Service : `OrderService::createPublic()`

Regles :

- seule l'API backend decide du statut financier
- `source` est force a `web`
- `order_type` est force a `pickup`
- `payment_status` est force a `pending`
- le document genere est un `order_voucher`
- aucune facture payee n'est emise par un client public

## 14.2 Creation de commande admin

Service : `OrderService::createAdmin()`

Regles :

- le backend verifie les produits, le stock et la disponibilite
- les lignes sont recalculees serveur
- si `payment_captured=true`, la commande est `paid`
- si paiement capture, le document devient une `invoice`
- sinon le document reste `order_voucher`

## 14.3 POS

Le POS utilise le meme backend de commandes admin.

Regles metier :

- POS cash encaisse => `invoice` + `paid`
- POS carte/TPE confirme => `invoice` + `paid`
- paiement a la reception / non encaisse => `order_voucher` + `pending`

## 14.4 Modification / suppression

Le backend bloque :

- modification d'un avoir
- suppression d'un avoir
- modification d'une commande deja facturee
- suppression d'une commande deja facturee

## 14.5 Annulation de commande

Service : `OrderService::cancelOrder()`

Regles :

- une commande deja retiree (`picked_up`) ne peut pas etre annulee
- une facture payee ne peut pas etre annulee directement
- une facture payee doit passer par un avoir
- l'annulation d'une commande non payee restaure le stock
- `stock_restored_at` trace le retour en stock

## 15. Regles metier - documents commerciaux

## 15.1 Types de document

- `order_voucher` : bon de commande / bon de retrait pour commande non payee
- `invoice` : facture pour commande payee
- `credit_note` : avoir relie a une facture d'origine

## 15.2 Resolution du type de document

Service : `DocumentTypeResolver`

Regles :

- `paid` => `invoice`
- `pending` => `order_voucher`
- checkout public => toujours `pending`

## 15.3 Numerotation

Services :

- `InvoiceNumberGenerator`
- `CreditNoteNumberGenerator`
- `PurchaseNumberGenerator`

Usage :

- facture : numero unique chronologique
- avoir : numero unique du type `AV-YYYY-XXXXXX`
- achat : numero interne d'achat

## 15.4 Immutabilite

Regles :

- une facture emise ne change pas de numero
- un avoir est immutable
- une facture payee remboursee garde sa trace d'origine
- l'avoir reference la facture originale via `original_order_id`

## 16. Regles metier - avoirs

Service : `CreditNoteService`

Comportement :

- verifie que le document d'origine est une facture
- verifie que la facture est payee
- bloque un avoir total multiple
- gere un avoir total ou partiel
- cree des lignes negatives
- cree `credit_note_number`
- renseigne `refunded_at`, `refund_reason`, `refund_amount`
- restaure le stock si demande

Effets :

- la facture d'origine reste intacte
- les journaux et exports comptables incluent l'avoir
- le stock peut revenir si le remboursement implique un retour produit

## 17. Regles metier - TVA et fiscalite

Service : `TaxCalculator`

Regles :

- regime standard : TVA appliquee selon `default_vat_rate` ou `vat_rate`
- regime franchise de base : TVA = 0
- mention legale par defaut : `TVA non applicable - article 293 B du CGI`

Important :

- les documents affichent la TVA historique enregistree sur la commande / la facture
- un changement de TVA dans les parametres ne modifie pas les anciennes factures

## 18. Regles metier - stock

Services :

- `StockService`
- `StockStatsService`

Operations supportees :

- entree stock
- sortie stock
- ajustement manuel
- mise a jour du seuil d'alerte
- mise a jour de disponibilite

Tracabilite :

- chaque mouvement cree un `stock_movement`
- `reason`, `source`, `reference`, `note` et `created_by` sont enregistres

Regles :

- stock negatif interdit
- si stock atteint 0, `is_available` peut etre force a false selon l'operation
- le seuil faible utilise `alert_threshold`

## 19. Regles metier - achats fournisseurs

Service : `PurchaseService`

Etats :

- `draft`
- `confirmed`
- `cancelled`

Comportement :

- un achat en brouillon n'affecte pas le stock
- un achat confirme augmente le stock
- chaque ligne cree un mouvement `in`
- un achat annule apres confirmation tente un mouvement inverse
- l'annulation est bloquee si le stock actuel ne permet pas le retour arriere

Piieces jointes :

- facture fournisseur stockee sur le disque local prive
- acces uniquement admin via route securisee

Statistiques produit derivees :

- `average_purchase_cost_ht`
- `last_purchase_cost_ht`
- `last_purchased_at`

## 20. Regles metier - status magasin et retrait

Service : `StoreStatusService`

Sources :

- `store_settings.timezone`
- `store_settings.open_message`
- `store_settings.closed_message`
- `business_hours`

Retour :

- `is_open`
- `message`
- `opens_at`
- `closes_at`
- `timezone`

Controle des commandes publiques :

- le magasin doit etre ouvert
- le creneau doit exister
- le buffer minimal `pickup_buffer_minutes` doit etre respecte
- la capacite max du slot est verifiee si configuree

## 21. Journal de ventes

Service : `SalesJournalService`

Le journal de ventes retourne des lignes normalisees avec :

- date document
- numero commande
- type document
- numero facture
- numero avoir
- facture origine
- client
- montants HT / TVA / TTC
- paiement
- source
- statut commande
- motif de remboursement
- `entry_type`

Types d'entree :

- `paid_sale`
- `credit_note`
- `cancelled_invoice`
- `cancelled_voucher`
- `order_voucher`

## 22. Export comptable ventes

Service : `AccountingExportService`

Formats :

- CSV UTF-8 avec BOM
- XLSX

Colonnes CSV :

- Date
- Facture
- Avoir
- Facture origine
- Type
- Commande
- Client
- Sens
- Paiement
- HT
- TVA
- TTC
- Statut
- Source

Regles :

- exporte uniquement `invoice` et `credit_note`
- n'inclut pas les bons non comptables
- `credit_note` est exporte en `credit`
- separateur `;`

Filtres :

- `type=day|month|year|all`
- `date`
- `month`
- `year`
- `source`
- `payment_method`
- `payment_status`
- `document_type`

## 23. Journal et export achats

Service :

- `PurchaseJournalService`
- `PurchaseAccountingExportService`

Journal achats :

- uniquement les achats `confirmed`
- filtrable par fournisseur, dates, paiement, piece jointe
- fournit des stats :
  - achats du mois
  - TVA du mois
  - top fournisseurs
  - produits les plus achetes
  - serie 30 jours

Export achats CSV :

Colonnes :

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

Regles :

- separateur `;`
- UTF-8 BOM
- uniquement achats confirmes

## 24. PDF et documents

Service central :

- `backend/app/Services/Pdf/DocumentPdfService.php`

Templates Blade dans `backend/resources/views/pdf/` :

- facture
- bon de commande
- avoir

Documents disponibles :

- facture admin
- bon admin
- bon client public
- avoir admin

## 25. Securite

## 25.1 Auth admin

- token Sanctum
- middleware `auth:sanctum`
- middleware `admin`
- profil admin modifiable via API

## 25.2 Anti brute-force login

La route :

- `POST /api/admin/login`

est protegee par :

- `throttle:admin-login`

Un test couvre ce comportement :

- `StoreStatusAndAuthTest::test_admin_login_is_throttled_after_repeated_failures`

## 25.3 Protection des fichiers

Les factures fournisseurs ne sont pas exposees directement en public.

Acces :

- uniquement via routes admin authentifiees
- lecture / download controlee par le backend

## 25.4 Validation serveur

Le backend recalcule :

- les totaux de commandes
- les totaux d'achats
- le type de document
- le statut de paiement

Le frontend ne fait pas foi pour les donnees sensibles.

## 26. Couverture de tests

Tests Feature presentes :

- `OrderFlowTest.php`
- `AccountingExportTest.php`
- `PurchaseFlowTest.php`
- `StoreStatusAndAuthTest.php`

Scenarios couverts :

- commande web pending => bon de commande
- tentative client de forcer des champs sensibles
- POS cash => facture payee
- POS carte/TPE => facture payee
- annulation commande non payee => retour stock
- facture payee => annulation directe interdite
- creation d'avoir => trace + retour stock
- PDF avoir disponible
- produit en rupture non commandable
- numeros de facture uniques
- achat confirme => entree stock + mouvements
- achat brouillon => pas d'effet stock
- annulation achat confirme avec controle de stock inverse
- upload facture fournisseur + download admin
- export comptable achats
- store status avec messages configures
- throttling login admin

## 27. Donnees de seed

Le `DatabaseSeeder` initialise :

- categories `fruits`, `legumes`, `paniers`
- quelques produits de demonstration
- horaires du magasin
- creneaux de retrait
- store settings par defaut
- admin local seulement

Compte admin local par defaut :

- email : `admin@maison-verde.test`
- mot de passe : `password`

Important :

- ce compte est reserve a l'environnement local
- il ne doit pas etre reutilise en production

## 28. Limitations actuelles

Points importants a connaitre :

- pas de vrai flux Stripe actif cote client
- `printerService` ne gere pas encore `qz-tray` ou `printnode`
- application pensee pour une seule boutique
- pas de systeme multi-role avance autre que `is_admin`
- pas de notification email/SMS metier branchee

## 29. Checklist de mise en production

Avant mise en production :

1. Configurer `backend/.env`
2. Configurer `VITE_API_URL`
3. Executer les migrations
4. Executer les seeds si necessaire
5. Lancer `php artisan storage:link`
6. Creer au moins un utilisateur admin reel
7. Desactiver tout mode mock admin
8. Verifier CORS via `FRONTEND_URL`
9. Tester les flux critiques :
   - commande web
   - POS paye
   - annulation
   - avoir
   - achat fournisseur
   - export ventes
   - export achats
10. Lancer les tests feature
11. Generer le build frontend

## 30. Checklist de verification fonctionnelle

### Front public

- site charge
- catalogue charge
- categories chargees
- panier fonctionne
- checkout cree une commande
- page `order-success` fonctionne
- etat magasin remonte bien du backend

### Admin

- login/logout
- dashboard
- CRUD produits
- CRUD categories
- CRUD clients
- commandes
- POS
- stock et mouvements
- PDF facture / bon
- avoirs
- fournisseurs
- achats
- export comptable ventes
- export comptable achats
- journal ventes
- journal achats
- parametres magasin

## 31. Fichiers les plus importants a connaitre

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

## 32. Resume fonctionnel

L'application gere aujourd'hui :

- catalogue public
- panier local
- commande drive / retrait
- back office admin
- POS
- produits / categories / clients
- stock et mouvements
- factures
- bons de commande
- avoirs
- journal de ventes
- export comptable ventes
- fournisseurs
- achats fournisseurs
- factures fournisseurs jointes
- journal achats
- export comptable achats
- TVA et informations legales
- horaires et creneaux

## 33. Conclusion

Le projet est une application metier complete pour une boutique de type primeur / epicerie / drive avec back office integre. La logique metier critique est maintenant cote backend : paiements admin, facturation, bons, avoirs, stock, achats et exports. Le frontend public et le back office consomment tous deux une API Laravel qui fait office de source de verite.

Cette documentation decrit l'etat actuel du code tel qu'il est implemente dans le depot a la date du `2026-04-24`.

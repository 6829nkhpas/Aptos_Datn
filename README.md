# Aptos E-commerce Platform (DATN)

A full-stack decentralized e-commerce marketplace built on Aptos blockchain with escrow-based payments, product management, and order tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contract Modules](#smart-contract-modules)
- [Workflow & User Journey](#workflow--user-journey)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Running the Application](#running-the-application)
- [Testing](#testing)

---

## 🎯 Overview

This is a decentralized e-commerce platform that enables secure peer-to-peer transactions using blockchain technology. The platform features:

- **Role-based system**: Buyers and Sellers with distinct capabilities
- **Product Management**: Create, update, and manage product listings
- **Secure Escrow System**: Funds held in smart contracts until delivery confirmation
- **Order Tracking**: Complete order lifecycle management
- **Custom Indexer**: PostgreSQL-based indexer for fast data retrieval
- **Modern UI**: Next.js frontend with Aptos Wallet integration

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Buyer UI    │  │  Seller UI   │  │  Admin UI    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Aptos Wallet Adapter
             │
┌────────────┴────────────────────────────────────────────────┐
│              Aptos Blockchain Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Smart Contract Modules                     │  │
│  │  ┌──────────────┐  ┌──────────────┐                 │  │
│  │  │UserProfile   │  │  Product     │                 │  │
│  │  │  Module      │  │   Module     │                 │  │
│  │  └──────┬───────┘  └──────┬───────┘                 │  │
│  │         │                  │                          │  │
│  │  ┌──────┴───────┐  ┌──────┴───────┐                 │  │
│  │  │   Order      │  │   Escrow     │                 │  │
│  │  │   Module     │  │   Module     │                 │  │
│  │  └──────────────┘  └──────────────┘                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Events: ProfileCreated, ProductCreated, OrderPlaced,       │
│          FundsLocked, OrderDelivered, FundsReleased         │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ (Blockchain Events)
             │
┌────────────┴────────────────────────────────────────────────┐
│          Custom Indexer (Rust + PostgreSQL)                 │
│  - Processes blockchain events in real-time                 │
│  - Stores indexed data for fast queries                     │
│  - Provides REST API for frontend                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Buyer Flow:
1. Connect Wallet → 2. Register Profile (Buyer) → 3. Browse Products
4. Select Product → 5. Initiate Escrow Order → 6. Funds Locked
7. Wait for Delivery → 8. Confirm with Code → 9. Funds Released to Seller

Seller Flow:
1. Connect Wallet → 2. Register Profile (Seller) → 3. Create Products
4. Receive Orders → 5. Get Delivery Code → 6. Deliver Product
7. Enter Delivery Code → 8. Wait for Buyer Confirmation → 9. Receive Funds
```

---

## 📜 Smart Contract Modules

### 1. **User Profile Module** (`user_profile.move`)

**Purpose**: Manages user registration and profiles for buyers and sellers.

**Key Features**:
- User registration with role selection (Buyer/Seller)
- Profile information: name, email, country, physical address, bio
- Profile activation/deactivation
- Profile updates

**Main Functions**:
```move
// Entry Functions
register_profile(sender, name, country, role, email, physical_address, bio)
update_profile(sender, name, country, email, physical_address, bio)
deactivate_profile(sender)
reactivate_profile(sender)

// View Functions
get_profile(user_addr) -> UserProfile
is_seller(user_addr) -> bool
is_buyer(user_addr) -> bool
profile_exists(user_addr) -> bool
```

**Events Emitted**:
- `ProfileCreatedEvent`
- `ProfileUpdatedEvent`
- `ProfileDeactivatedEvent`
- `ProfileReactivatedEvent`

---

### 2. **Product Module** (`product.move`)

**Purpose**: Handles product creation, listing, inventory management, and product lifecycle.

**Key Features**:
- Product creation (seller-only)
- Product details: title, description, price, quantity, images, category
- Inventory management (add/reduce stock)
- Product availability toggle
- Soft delete functionality
- Global product registry

**Main Functions**:
```move
// Entry Functions
create_product(sender, title, description, price, total_quantity, image_urls, category)
update_product(sender, product_obj, title, description, price, image_urls, category)
update_inventory(sender, product_obj, quantity_to_add)
reduce_inventory(sender, product_obj, quantity_to_reduce)
set_product_availability(sender, product_obj, is_available)
delete_product(sender, product_obj)

// View Functions
get_all_products() -> vector<address>
get_product(product_obj) -> (title, description, price, quantity, ...)
get_seller_products(seller_addr) -> vector<address>
is_product_available(product_obj) -> bool
```

**Events Emitted**:
- `ProductCreatedEvent`
- `ProductUpdatedEvent`
- `ProductDeletedEvent`
- `ProductAvailabilityChangedEvent`
- `InventoryUpdatedEvent`

---

### 3. **Order Module** (`order.move`)

**Purpose**: Manages order placement, tracking, and status updates.

**Key Features**:
- Order placement (buyer-only)
- Order status tracking (Pending → Confirmed → Processing → Shipped → Delivered)
- Order cancellation (with conditions)
- Payment tracking
- Shipping address updates
- Order history for buyers and sellers

**Order Status Flow**:
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓         ↓            ↓
CANCELLED  CANCELLED  CANCELLED

DELIVERED → REFUNDED (special case)
```

**Main Functions**:
```move
// Entry Functions
place_order(buyer, product_obj, quantity, shipping_address, notes)
update_order_status(sender, order_obj, new_status)
cancel_order(sender, order_obj, reason)
update_shipping_address(buyer, order_obj, new_shipping_address)
mark_order_paid(buyer, order_obj)

// View Functions
get_order(order_obj) -> (order_id, product, buyer, seller, quantity, ...)
get_buyer_orders(buyer_addr) -> vector<address>
get_seller_orders(seller_addr) -> vector<address>
get_order_status(order_obj) -> u8
is_order_paid(order_obj) -> bool
```

**Events Emitted**:
- `OrderPlacedEvent`
- `OrderStatusUpdatedEvent`
- `OrderCancelledEvent`
- `PaymentConfirmedEvent`

---

### 4. **Escrow Module** (`escrow.move`)

**Purpose**: Secure fund management using escrow mechanism with delivery verification codes.

**Key Features**:
- **Escrow-based payments**: Funds locked until delivery confirmation
- **6-digit delivery code**: Generated for seller to mark delivery
- **4-digit receiving code**: Generated for buyer to confirm receipt
- **Automatic fund release**: Funds transferred to seller after confirmation
- **Dispute resolution**: Cancel and refund before delivery
- **APT coin integration**: Uses AptosCoin for payments

**Escrow Workflow**:

```
┌─────────────────────────────────────────────────────────────┐
│                   ESCROW WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

Step 1: INITIATE TRADE & LOCK FUNDS
────────────────────────────────────
Buyer clicks "Buy Now"
  ↓
System generates:
  • 6-digit delivery code (for seller)
  • 4-digit receiving code (for buyer)
  ↓
Buyer's funds withdrawn and locked in escrow
  ↓
Status: HOLDING
  ↓
Events: TradeInitiatedEvent, FundsLockedEvent


Step 2: DELIVER ORDER
──────────────────────
Seller ships product
  ↓
Seller enters 6-digit delivery code
  ↓
System validates code
  ↓
Status: DELIVERED
  ↓
Event: OrderDeliveredEvent


Step 3: CONFIRM DELIVERY & RELEASE FUNDS
─────────────────────────────────────────
Buyer receives product
  ↓
Buyer enters 4-digit receiving code
  ↓
System validates code
  ↓
Funds automatically released to seller
  ↓
Status: COMPLETED
  ↓
Events: DeliveryConfirmedEvent, FundsReleasedEvent


Alternative: CANCEL ORDER
──────────────────────────
Before delivery (HOLDING status)
  ↓
Buyer or Seller can cancel
  ↓
Funds automatically refunded to buyer
  ↓
Status: CANCELLED
  ↓
Event: EscrowCancelledEvent
```

**Main Functions**:
```move
// Entry Functions
initiate_trade_and_lock_funds(buyer, product_obj, quantity, shipping_address, tx_hash)
deliver_order(seller, escrow_order_obj, delivery_code)
confirm_delivery_and_release_funds(buyer, escrow_order_obj, receiving_code)
cancel_escrow_order(sender, escrow_order_obj, reason)

// View Functions
get_escrow_order(escrow_order_obj) -> (id, product, buyer, seller, amount, codes, ...)
get_buyer_escrow_orders(buyer_addr) -> vector<address>
get_seller_escrow_orders(seller_addr) -> vector<address>
get_delivery_code(escrow_order_obj) -> String
get_receiving_code(escrow_order_obj) -> String
is_funds_locked(escrow_order_obj) -> bool
```

**Events Emitted**:
- `TradeInitiatedEvent`
- `FundsLockedEvent`
- `OrderDeliveredEvent`
- `DeliveryConfirmedEvent`
- `FundsReleasedEvent`
- `EscrowCancelledEvent`

---

## 🔄 Workflow & User Journey

### Complete Purchase Flow with Escrow

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYER JOURNEY                            │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION & SETUP
   ├─ Connect Aptos Wallet (Petra/Martian/Pontem)
   ├─ Register profile as "Buyer"
   └─ Browse marketplace

2. PRODUCT SELECTION
   ├─ Search/filter products by category
   ├─ View product details (price, images, description)
   ├─ Check seller information
   └─ Select quantity

3. CHECKOUT & PAYMENT
   ├─ Click "Buy Now"
   ├─ Enter shipping address
   ├─ Review order total
   ├─ Approve transaction in wallet
   ├─ Funds locked in escrow smart contract
   └─ Receive 4-digit receiving code

4. ORDER TRACKING
   ├─ View order status in dashboard
   ├─ Track: Pending → Confirmed → Processing → Shipped
   └─ Wait for delivery notification

5. DELIVERY CONFIRMATION
   ├─ Receive product
   ├─ Enter 4-digit receiving code
   ├─ Funds automatically released to seller
   └─ Order marked as completed


┌─────────────────────────────────────────────────────────────┐
│                    SELLER JOURNEY                           │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION & SETUP
   ├─ Connect Aptos Wallet
   ├─ Register profile as "Seller"
   └─ Access seller dashboard

2. PRODUCT MANAGEMENT
   ├─ Create new product listing
   │  ├─ Add title, description, price
   │  ├─ Upload images (S3 URLs)
   │  ├─ Set category and quantity
   │  └─ Publish to marketplace
   ├─ Manage inventory (add/reduce stock)
   ├─ Update product details
   └─ Toggle availability or delete products

3. ORDER MANAGEMENT
   ├─ Receive order notification
   ├─ View order details and buyer information
   ├─ Confirm order (change status to CONFIRMED)
   ├─ Process order (change status to PROCESSING)
   └─ Receive 6-digit delivery code

4. DELIVERY & FULFILLMENT
   ├─ Ship product to buyer
   ├─ Enter 6-digit delivery code in system
   ├─ Order marked as DELIVERED
   └─ Wait for buyer confirmation

5. PAYMENT RECEIPT
   ├─ Buyer confirms delivery with receiving code
   ├─ Smart contract releases funds automatically
   ├─ APT coins deposited to seller wallet
   └─ Transaction completed
```

### Module Interaction Flow

```
User Profile Module (Foundation)
        │
        ├──→ Product Module (Sellers create products)
        │         │
        │         ├──→ Order Module (Buyers place orders)
        │         │         │
        │         │         └──→ Status updates flow
        │         │
        │         └──→ Escrow Module (Secure payment flow)
        │                   │
        │                   ├──→ Lock funds
        │                   ├──→ Verify delivery codes
        │                   └──→ Release funds
        │
        └──→ All modules verify user roles and permissions
```

---

## 🛠️ Technology Stack

### Blockchain Layer
- **Aptos Blockchain**: Layer-1 blockchain using Move language
- **Move Language**: Smart contract programming language
- **Aptos Framework**: Core blockchain utilities (coin, timestamp, events, objects)

### Backend
- **Custom Indexer**: Rust-based blockchain event indexer
- **PostgreSQL**: Database for indexed blockchain data
- **Aptos Indexer SDK**: Event streaming and processing

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Aptos TypeScript SDK**: Blockchain interaction library
- **Aptos Wallet Adapter**: Multi-wallet support (Petra, Martian, Pontem)
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **React Query**: Data fetching and caching
- **Redux Toolkit**: State management

### Development Tools
- **Node.js**: JavaScript runtime
- **Aptos CLI**: Contract compilation and deployment
- **Vitest**: Unit testing framework
- **Docker**: Containerization (for indexer)

---

## 📁 Project Structure

```
aptos-datn/
│
├── contract/                    # Smart Contracts (Move)
│   ├── Move.toml               # Move package configuration
│   ├── sources/
│   │   ├── user_profile.move   # User profile management
│   │   ├── product.move        # Product management
│   │   ├── order.move          # Order management
│   │   └── escrow.move         # Escrow payment system
│   └── tests/                  # Move unit tests
│       ├── test_ecommerce.move
│       ├── test_escrow.move
│       └── test_order.move
│
├── indexer/                    # Custom Indexer (Rust)
│   ├── Cargo.toml             # Rust dependencies
│   ├── src/
│   │   ├── main.rs            # Indexer entry point
│   │   ├── processors/        # Event processors
│   │   └── db_migrations/     # Database migrations
│   └── example.config.yaml    # Indexer configuration
│
├── src/                       # Frontend (Next.js)
│   ├── app/                   # App Router pages
│   │   ├── page.tsx          # Home page (marketplace)
│   │   ├── profile/          # User profile pages
│   │   ├── product/          # Product listing & details
│   │   ├── seller/           # Seller dashboard
│   │   │   ├── products/    # Manage products
│   │   │   ├── inventory/   # Inventory management
│   │   │   └── payments/    # Payment history
│   │   ├── checkout/        # Checkout flow
│   │   ├── order/           # Order tracking
│   │   └── search/          # Product search
│   │
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── WalletInfo.tsx   # Wallet connection
│   │   └── ProductCard.tsx  # Product display
│   │
│   └── lib/                 # Utilities & contracts
│       ├── contracts/       # Contract interaction layer
│       │   ├── profile.ts   # Profile contract calls
│       │   ├── product.ts   # Product contract calls
│       │   ├── order.ts     # Order contract calls
│       │   └── escrow.ts    # Escrow contract calls
│       └── utils/           # Helper functions
│
├── scripts/                  # Deployment & utility scripts
│   └── move/
│       ├── publish.js       # Deploy contracts
│       ├── compile.js       # Compile contracts
│       ├── test.js          # Run tests
│       └── upgrade.js       # Upgrade contracts
│
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── package.json            # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Aptos CLI** (for contract deployment)
- **PostgreSQL** (for indexer)
- **Rust** (for building indexer)

### 1. Clone Repository

```bash
git clone https://github.com/6829nkhpas/Aptos_Datn.git
cd Aptos_Datn
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Aptos Network Configuration
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_MODULE_ADDRESS=0x...

# Contract Addresses
NEXT_PUBLIC_USER_PROFILE_MODULE=ecommerce_platform::user_profile
NEXT_PUBLIC_PRODUCT_MODULE=ecommerce_platform::product
NEXT_PUBLIC_ORDER_MODULE=ecommerce_platform::order
NEXT_PUBLIC_ESCROW_MODULE=ecommerce_platform::escrow

# Database (for indexer)
DATABASE_URL=postgresql://user:password@localhost:5432/aptos_ecommerce

# S3 Configuration (for image uploads)
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## 📝 Smart Contract Deployment

### 1. Compile Contracts

```bash
npm run move:compile
```

### 2. Run Tests

```bash
npm run move:test
```

### 3. Deploy to Testnet

```bash
npm run move:publish
```

### 4. Verify Deployment

```bash
npm run move:verify
```

---

## ▶️ Running the Application

### Start Frontend Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Start Custom Indexer

```bash
cd indexer
cargo run --release
```

### Start Local Aptos Node (Optional)

```bash
npm run move:start-node
```

---

## 🧪 Testing

### Run Frontend Tests

```bash
npm run test
```

### Run Contract Tests

```bash
npm run move:test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

---

## 🔑 Key Features

### Security Features
- ✅ Escrow-based payment protection
- ✅ Role-based access control
- ✅ Delivery verification codes
- ✅ Automated fund release
- ✅ Cancel & refund mechanism

### Marketplace Features
- ✅ Product catalog with categories
- ✅ Search and filter functionality
- ✅ Seller reputation system
- ✅ Order history tracking
- ✅ Real-time inventory updates

### Smart Contract Features
- ✅ Object-based architecture (Aptos Objects)
- ✅ Event-driven design
- ✅ Gas-optimized operations
- ✅ Comprehensive error handling
- ✅ Upgradeable contracts

---

## 📊 Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN EVENTS FLOW                         │
└─────────────────────────────────────────────────────────────┘

Smart Contracts                    Indexer                  Frontend
─────────────────                 ────────                  ────────
     │                                │                         │
     │  ProfileCreatedEvent           │                         │
     ├───────────────────────────────→│                         │
     │                                │  Store in DB            │
     │                                ├──────────→              │
     │                                │            ← GET /users │
     │                                │            └────────────┘
     │                                │                         │
     │  ProductCreatedEvent           │                         │
     ├───────────────────────────────→│                         │
     │                                │  Store in DB            │
     │                                ├──────────→              │
     │                                │            ← GET /products
     │                                │            └────────────┘
     │                                │                         │
     │  FundsLockedEvent              │                         │
     ├───────────────────────────────→│                         │
     │                                │  Update order status    │
     │                                ├──────────→              │
     │                                │            ← GET /orders
     │                                │            └────────────┘
     │                                │                         │
     │  FundsReleasedEvent            │                         │
     ├───────────────────────────────→│                         │
     │                                │  Complete transaction   │
     │                                ├──────────→              │
     │                                │            ← Notify user
     │                                │            └────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the Apache-2.0 License.

---

## 👥 Authors

- DATN Project Team
- GitHub: [@6829nkhpas](https://github.com/6829nkhpas)

---

## 🔗 Links

- **Repository**: https://github.com/6829nkhpas/Aptos_Datn
- **Aptos Docs**: https://aptos.dev
- **Move Language**: https://move-language.github.io/move/
- **Aptos Wallet**: https://petra.app

---

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ on Aptos Blockchain**

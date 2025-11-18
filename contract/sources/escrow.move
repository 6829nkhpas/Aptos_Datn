/// Escrow Module for E-commerce Platform
/// Handles secure fund holding and release for product trades
/// Flow: Lock funds -> Verify delivery -> Release to seller
module ecommerce_platform::escrow {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use ecommerce_platform::user_profile;
    use ecommerce_platform::product::{Self, Product};

    // ======================== Error Codes ========================
    
    /// User profile not found
    const ERR_USER_PROFILE_NOT_FOUND: u64 = 1;
    
    /// Only buyers can initiate trades
    const ERR_ONLY_BUYER_CAN_TRADE: u64 = 2;
    
    /// Product not available
    const ERR_PRODUCT_NOT_AVAILABLE: u64 = 3;
    
    /// Insufficient product quantity
    const ERR_INSUFFICIENT_PRODUCT_QUANTITY: u64 = 4;
    
    /// Invalid quantity
    const ERR_INVALID_QUANTITY: u64 = 5;
    
    /// Escrow order not found
    const ERR_ESCROW_ORDER_NOT_FOUND: u64 = 6;
    
    /// Invalid delivery code
    const ERR_INVALID_DELIVERY_CODE: u64 = 7;
    
    /// Invalid receiving code
    const ERR_INVALID_RECEIVING_CODE: u64 = 8;
    
    /// Only buyer can confirm delivery
    const ERR_ONLY_BUYER_CAN_CONFIRM: u64 = 9;
    
    /// Only seller can deliver order
    const ERR_ONLY_SELLER_CAN_DELIVER: u64 = 10;
    
    /// Funds already released
    const ERR_FUNDS_ALREADY_RELEASED: u64 = 11;
    
    /// Order not in holding status
    const ERR_ORDER_NOT_HOLDING: u64 = 12;
    
    /// Order not in delivered status
    const ERR_ORDER_NOT_DELIVERED: u64 = 13;
    
    /// Insufficient funds
    const ERR_INSUFFICIENT_FUNDS: u64 = 14;
    
    /// Cannot cancel order in current status
    const ERR_CANNOT_CANCEL: u64 = 15;

    // ======================== Constants ========================
    
    /// Escrow Status: Initiated (transaction created)
    const ESCROW_STATUS_INITIATED: u8 = 1;
    
    /// Escrow Status: Holding (funds locked in escrow)
    const ESCROW_STATUS_HOLDING: u8 = 2;
    
    /// Escrow Status: Delivered (seller delivered with code)
    const ESCROW_STATUS_DELIVERED: u8 = 3;
    
    /// Escrow Status: Completed (buyer confirmed, funds released)
    const ESCROW_STATUS_COMPLETED: u8 = 4;
    
    /// Escrow Status: Cancelled
    const ESCROW_STATUS_CANCELLED: u8 = 5;
    
    /// Escrow Status: Refunded
    const ESCROW_STATUS_REFUNDED: u8 = 6;

    // ======================== Structs ========================
    
    /// Escrow Order - holds funds until delivery is confirmed
    struct EscrowOrder has key, store {
        /// Unique escrow order ID
        escrow_order_id: u64,
        /// Product object address
        product_obj_addr: address,
        /// Quantity ordered
        quantity: u64,
        /// Buyer's wallet address
        buyer_wallet: address,
        /// Seller's wallet address
        seller_wallet: address,
        /// Unit price at time of order
        unit_price: u64,
        /// Total amount locked in escrow
        total_amount: u64,
        /// Transaction hash (for verification)
        transaction_hash: String,
        /// 6-digit delivery code (generated for seller)
        delivery_code: String,
        /// 4-digit receiving code (generated for buyer verification)
        receiving_code: String,
        /// Escrow status
        status: u8,
        /// Funds locked in this object
        locked_funds: Coin<AptosCoin>,
        /// Shipping address
        shipping_address: String,
        /// Order creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
        /// Delivered timestamp
        delivered_at: u64,
        /// Completed timestamp
        completed_at: u64,
        /// Extended reference for transfers
        extend_ref: ExtendRef,
    }
    
    /// Buyer's escrow order registry
    struct BuyerEscrowRegistry has key {
        /// List of escrow order addresses for this buyer
        escrow_orders: vector<address>,
        /// Total number of orders
        order_count: u64,
    }
    
    /// Seller's escrow order registry (global resource at module address)
    struct SellerEscrowRegistry has key {
        /// Seller addresses
        seller_addresses: vector<address>,
        /// List of escrow orders for each seller (parallel vector)
        seller_escrow_orders: vector<vector<address>>,
    }
    
    /// Global escrow order counter
    struct GlobalEscrowCounter has key {
        counter: u64,
    }

    // ======================== Events ========================
    
    #[event]
    /// Emitted when a trade is initiated
    struct TradeInitiatedEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        product_obj_addr: address,
        buyer_wallet: address,
        seller_wallet: address,
        quantity: u64,
        total_amount: u64,
        created_at: u64,
    }
    
    #[event]
    /// Emitted when funds are locked in escrow
    struct FundsLockedEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        amount: u64,
        transaction_hash: String,
        delivery_code: String,
        buyer_wallet: address,
        seller_wallet: address,
        locked_at: u64,
    }
    
    #[event]
    /// Emitted when seller delivers with code
    struct OrderDeliveredEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        delivery_code: String,
        seller_wallet: address,
        delivered_at: u64,
    }
    
    #[event]
    /// Emitted when buyer confirms delivery
    struct DeliveryConfirmedEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        receiving_code: String,
        buyer_wallet: address,
        confirmed_at: u64,
    }
    
    #[event]
    /// Emitted when funds are released to seller
    struct FundsReleasedEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        amount: u64,
        seller_wallet: address,
        released_at: u64,
    }
    
    #[event]
    /// Emitted when escrow order is cancelled
    struct EscrowCancelledEvent has drop, store {
        escrow_order_obj_addr: address,
        escrow_order_id: u64,
        cancelled_by: address,
        reason: String,
        refund_amount: u64,
        cancelled_at: u64,
    }

    // ======================== Initialization ========================
    
    /// Initialize the escrow module (call once at deployment)
    fun init_module(admin: &signer) {
        // Initialize global counter
        move_to(admin, GlobalEscrowCounter {
            counter: 0,
        });
        
        // Initialize seller registry
        move_to(admin, SellerEscrowRegistry {
            seller_addresses: vector::empty(),
            seller_escrow_orders: vector::empty(),
        });
    }

    // ======================== Entry Functions ========================
    
    /// Step 1: Buyer initiates trade and locks funds in escrow
    /// After clicking "Buy Now", this creates escrow order and locks funds
    public entry fun initiate_trade_and_lock_funds(
        buyer: &signer,
        product_obj: Object<Product>,
        quantity: u64,
        shipping_address: String,
        transaction_hash: String,
    ) acquires GlobalEscrowCounter, BuyerEscrowRegistry, SellerEscrowRegistry {
        let buyer_addr = signer::address_of(buyer);
        
        // Validate buyer profile exists
        assert!(user_profile::profile_exists(buyer_addr), ERR_USER_PROFILE_NOT_FOUND);
        assert!(user_profile::is_buyer(buyer_addr), ERR_ONLY_BUYER_CAN_TRADE);
        
        // Validate quantity
        assert!(quantity > 0, ERR_INVALID_QUANTITY);
        
        // Get product details
        let product_obj_addr = object::object_address(&product_obj);
        assert!(product::is_product_available(product_obj), ERR_PRODUCT_NOT_AVAILABLE);
        
        let (_, _, _, _, qty_left, _, _, _, _, seller_wallet, _, _) = 
            product::get_product(product_obj);
        
        // Check sufficient quantity
        assert!(qty_left >= quantity, ERR_INSUFFICIENT_PRODUCT_QUANTITY);
        
        // Get price and calculate total
        let unit_price = product::get_product_price(product_obj);
        let total_amount = unit_price * quantity;
        
        // Verify buyer has sufficient funds
        let buyer_balance = coin::balance<AptosCoin>(buyer_addr);
        assert!(buyer_balance >= total_amount, ERR_INSUFFICIENT_FUNDS);
        
        // Withdraw funds from buyer
        let locked_funds = coin::withdraw<AptosCoin>(buyer, total_amount);
        
        // Generate unique escrow order ID
        let counter = borrow_global_mut<GlobalEscrowCounter>(@ecommerce_platform);
        counter.counter = counter.counter + 1;
        let escrow_order_id = counter.counter;
        
        // Generate 6-digit delivery code (for seller)
        let delivery_code = generate_6_digit_code(escrow_order_id, buyer_addr);
        
        // Generate 4-digit receiving code (for buyer verification)
        let receiving_code = generate_4_digit_code(escrow_order_id, seller_wallet);
        
        let current_time = timestamp::now_seconds();
        
        // Create escrow order object
        let constructor_ref = &object::create_object(buyer_addr);
        let object_signer = &object::generate_signer(constructor_ref);
        let extend_ref = object::generate_extend_ref(constructor_ref);
        
        // Create and store escrow order
        let escrow_order = EscrowOrder {
            escrow_order_id,
            product_obj_addr,
            quantity,
            buyer_wallet: buyer_addr,
            seller_wallet,
            unit_price,
            total_amount,
            transaction_hash,
            delivery_code,
            receiving_code,
            status: ESCROW_STATUS_HOLDING,
            locked_funds,
            shipping_address,
            created_at: current_time,
            updated_at: current_time,
            delivered_at: 0,
            completed_at: 0,
            extend_ref,
        };
        
        let escrow_order_obj_addr = signer::address_of(object_signer);
        move_to(object_signer, escrow_order);
        
        // Add to buyer registry
        if (!exists<BuyerEscrowRegistry>(buyer_addr)) {
            move_to(buyer, BuyerEscrowRegistry {
                escrow_orders: vector::empty(),
                order_count: 0,
            });
        };
        
        let buyer_registry = borrow_global_mut<BuyerEscrowRegistry>(buyer_addr);
        vector::push_back(&mut buyer_registry.escrow_orders, escrow_order_obj_addr);
        buyer_registry.order_count = buyer_registry.order_count + 1;
        
        // Add to seller registry
        add_to_seller_registry(seller_wallet, escrow_order_obj_addr);
        
        // Emit events
        event::emit(TradeInitiatedEvent {
            escrow_order_obj_addr,
            escrow_order_id,
            product_obj_addr,
            buyer_wallet: buyer_addr,
            seller_wallet,
            quantity,
            total_amount,
            created_at: current_time,
        });
        
        event::emit(FundsLockedEvent {
            escrow_order_obj_addr,
            escrow_order_id,
            amount: total_amount,
            transaction_hash,
            delivery_code,
            buyer_wallet: buyer_addr,
            seller_wallet,
            locked_at: current_time,
        });
    }
    
    /// Step 2: Seller delivers order with the 6-digit delivery code
    /// Seller must provide the correct delivery code to mark as delivered
    public entry fun deliver_order(
        seller: &signer,
        escrow_order_obj: Object<EscrowOrder>,
        delivery_code_input: String,
    ) acquires EscrowOrder {
        let seller_addr = signer::address_of(seller);
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global_mut<EscrowOrder>(escrow_order_obj_addr);
        
        // Validate seller
        assert!(escrow_order.seller_wallet == seller_addr, ERR_ONLY_SELLER_CAN_DELIVER);
        
        // Validate status
        assert!(escrow_order.status == ESCROW_STATUS_HOLDING, ERR_ORDER_NOT_HOLDING);
        
        // Validate delivery code
        assert!(escrow_order.delivery_code == delivery_code_input, ERR_INVALID_DELIVERY_CODE);
        
        // Update status and timestamp
        let current_time = timestamp::now_seconds();
        escrow_order.status = ESCROW_STATUS_DELIVERED;
        escrow_order.delivered_at = current_time;
        escrow_order.updated_at = current_time;
        
        // Emit event
        event::emit(OrderDeliveredEvent {
            escrow_order_obj_addr,
            escrow_order_id: escrow_order.escrow_order_id,
            delivery_code: delivery_code_input,
            seller_wallet: seller_addr,
            delivered_at: current_time,
        });
    }
    
    /// Step 3: Buyer confirms receipt with 4-digit receiving code
    /// After buyer enters code, funds are released to seller
    public entry fun confirm_delivery_and_release_funds(
        buyer: &signer,
        escrow_order_obj: Object<EscrowOrder>,
        receiving_code_input: String,
    ) acquires EscrowOrder {
        let buyer_addr = signer::address_of(buyer);
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global_mut<EscrowOrder>(escrow_order_obj_addr);
        
        // Validate buyer
        assert!(escrow_order.buyer_wallet == buyer_addr, ERR_ONLY_BUYER_CAN_CONFIRM);
        
        // Validate status
        assert!(escrow_order.status == ESCROW_STATUS_DELIVERED, ERR_ORDER_NOT_DELIVERED);
        
        // Validate receiving code
        assert!(escrow_order.receiving_code == receiving_code_input, ERR_INVALID_RECEIVING_CODE);
        
        // Release funds to seller
        let amount = escrow_order.total_amount;
        let funds = coin::extract_all(&mut escrow_order.locked_funds);
        
        // Deposit to seller (coin::deposit handles account creation if needed)
        coin::deposit(escrow_order.seller_wallet, funds);
        
        // Update status and timestamp
        let current_time = timestamp::now_seconds();
        escrow_order.status = ESCROW_STATUS_COMPLETED;
        escrow_order.completed_at = current_time;
        escrow_order.updated_at = current_time;
        
        // Emit events
        event::emit(DeliveryConfirmedEvent {
            escrow_order_obj_addr,
            escrow_order_id: escrow_order.escrow_order_id,
            receiving_code: receiving_code_input,
            buyer_wallet: buyer_addr,
            confirmed_at: current_time,
        });
        
        event::emit(FundsReleasedEvent {
            escrow_order_obj_addr,
            escrow_order_id: escrow_order.escrow_order_id,
            amount,
            seller_wallet: escrow_order.seller_wallet,
            released_at: current_time,
        });
    }
    
    /// Cancel escrow order and refund buyer (only if not delivered)
    public entry fun cancel_escrow_order(
        sender: &signer,
        escrow_order_obj: Object<EscrowOrder>,
        reason: String,
    ) acquires EscrowOrder {
        let sender_addr = signer::address_of(sender);
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global_mut<EscrowOrder>(escrow_order_obj_addr);
        
        // Only buyer or seller can cancel
        assert!(
            escrow_order.buyer_wallet == sender_addr || escrow_order.seller_wallet == sender_addr,
            ERR_ONLY_BUYER_CAN_CONFIRM
        );
        
        // Can only cancel if holding (not delivered or completed)
        assert!(escrow_order.status == ESCROW_STATUS_HOLDING, ERR_CANNOT_CANCEL);
        
        // Refund buyer
        let refund_amount = escrow_order.total_amount;
        let refund = coin::extract_all(&mut escrow_order.locked_funds);
        coin::deposit(escrow_order.buyer_wallet, refund);
        
        // Update status
        let current_time = timestamp::now_seconds();
        escrow_order.status = ESCROW_STATUS_CANCELLED;
        escrow_order.updated_at = current_time;
        
        // Emit event
        event::emit(EscrowCancelledEvent {
            escrow_order_obj_addr,
            escrow_order_id: escrow_order.escrow_order_id,
            cancelled_by: sender_addr,
            reason,
            refund_amount,
            cancelled_at: current_time,
        });
    }

    // ======================== View Functions ========================
    
    #[view]
    /// Get complete escrow order information
    public fun get_escrow_order(escrow_order_obj: Object<EscrowOrder>): (
        u64,      // escrow_order_id
        address,  // product_obj_addr
        u64,      // quantity
        address,  // buyer_wallet
        address,  // seller_wallet
        u64,      // unit_price
        u64,      // total_amount
        String,   // transaction_hash
        String,   // delivery_code
        String,   // receiving_code
        u8,       // status
        u64,      // locked_amount
        String,   // shipping_address
        u64,      // created_at
        u64,      // updated_at
        u64,      // delivered_at
        u64,      // completed_at
    ) acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        
        (
            escrow_order.escrow_order_id,
            escrow_order.product_obj_addr,
            escrow_order.quantity,
            escrow_order.buyer_wallet,
            escrow_order.seller_wallet,
            escrow_order.unit_price,
            escrow_order.total_amount,
            escrow_order.transaction_hash,
            escrow_order.delivery_code,
            escrow_order.receiving_code,
            escrow_order.status,
            coin::value(&escrow_order.locked_funds),
            escrow_order.shipping_address,
            escrow_order.created_at,
            escrow_order.updated_at,
            escrow_order.delivered_at,
            escrow_order.completed_at,
        )
    }
    
    #[view]
    /// Get all escrow orders for a buyer
    public fun get_buyer_escrow_orders(buyer_addr: address): vector<address> acquires BuyerEscrowRegistry {
        if (!exists<BuyerEscrowRegistry>(buyer_addr)) {
            return vector::empty()
        };
        
        let registry = borrow_global<BuyerEscrowRegistry>(buyer_addr);
        registry.escrow_orders
    }
    
    #[view]
    /// Get all escrow orders for a seller
    public fun get_seller_escrow_orders(seller_addr: address): vector<address> acquires SellerEscrowRegistry {
        let registry = borrow_global<SellerEscrowRegistry>(@ecommerce_platform);
        
        let (found, index) = vector::index_of(&registry.seller_addresses, &seller_addr);
        if (!found) {
            return vector::empty()
        };
        
        *vector::borrow(&registry.seller_escrow_orders, index)
    }
    
    #[view]
    /// Get escrow order status
    public fun get_escrow_status(escrow_order_obj: Object<EscrowOrder>): u8 acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        escrow_order.status
    }
    
    #[view]
    /// Get delivery code (only for seller verification)
    public fun get_delivery_code(escrow_order_obj: Object<EscrowOrder>): String acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        escrow_order.delivery_code
    }
    
    #[view]
    /// Get receiving code (only for buyer verification)
    public fun get_receiving_code(escrow_order_obj: Object<EscrowOrder>): String acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        escrow_order.receiving_code
    }
    
    #[view]
    /// Check if funds are locked
    public fun is_funds_locked(escrow_order_obj: Object<EscrowOrder>): bool acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        coin::value(&escrow_order.locked_funds) > 0
    }
    
    #[view]
    /// Get locked amount
    public fun get_locked_amount(escrow_order_obj: Object<EscrowOrder>): u64 acquires EscrowOrder {
        let escrow_order_obj_addr = object::object_address(&escrow_order_obj);
        assert!(exists<EscrowOrder>(escrow_order_obj_addr), ERR_ESCROW_ORDER_NOT_FOUND);
        
        let escrow_order = borrow_global<EscrowOrder>(escrow_order_obj_addr);
        coin::value(&escrow_order.locked_funds)
    }
    
    #[view]
    /// Get buyer order count
    public fun get_buyer_order_count(buyer_addr: address): u64 acquires BuyerEscrowRegistry {
        if (!exists<BuyerEscrowRegistry>(buyer_addr)) {
            return 0
        };
        
        let registry = borrow_global<BuyerEscrowRegistry>(buyer_addr);
        registry.order_count
    }

    // ======================== Helper Functions ========================
    
    /// Generate 6-digit delivery code (for seller)
    fun generate_6_digit_code(escrow_order_id: u64, buyer_addr: address): String {
        // Simple deterministic code generation
        // In production, use more secure random number generation
        let addr_bytes = std::bcs::to_bytes(&buyer_addr);
        let addr_hash = std::hash::sha3_256(addr_bytes);
        let first_byte = (*vector::borrow(&addr_hash, 0) as u64);
        let seed = escrow_order_id + first_byte;
        let code = 100000 + (seed % 900000); // Ensures 6 digits (100000-999999)
        u64_to_string(code)
    }
    
    /// Generate 4-digit receiving code (for buyer)
    fun generate_4_digit_code(escrow_order_id: u64, seller_addr: address): String {
        // Simple deterministic code generation
        let addr_bytes = std::bcs::to_bytes(&seller_addr);
        let addr_hash = std::hash::sha3_256(addr_bytes);
        let first_byte = (*vector::borrow(&addr_hash, 0) as u64);
        let seed = (escrow_order_id * 7) + first_byte;
        let code = 1000 + (seed % 9000); // Ensures 4 digits (1000-9999)
        u64_to_string(code)
    }
    
    /// Convert u64 to string
    fun u64_to_string(num: u64): String {
        if (num == 0) {
            return string::utf8(b"0")
        };
        
        let digits = vector::empty<u8>();
        let temp = num;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // ASCII '0' is 48
            vector::push_back(&mut digits, digit);
            temp = temp / 10;
        };
        
        // Reverse digits
        vector::reverse(&mut digits);
        string::utf8(digits)
    }
    
    /// Add escrow order to seller registry
    fun add_to_seller_registry(seller_addr: address, escrow_order_addr: address) acquires SellerEscrowRegistry {
        let registry = borrow_global_mut<SellerEscrowRegistry>(@ecommerce_platform);
        
        let (found, index) = vector::index_of(&registry.seller_addresses, &seller_addr);
        
        if (found) {
            // Seller exists, add to their orders
            let seller_orders = vector::borrow_mut(&mut registry.seller_escrow_orders, index);
            vector::push_back(seller_orders, escrow_order_addr);
        } else {
            // New seller, create entry
            vector::push_back(&mut registry.seller_addresses, seller_addr);
            let new_orders = vector::empty<address>();
            vector::push_back(&mut new_orders, escrow_order_addr);
            vector::push_back(&mut registry.seller_escrow_orders, new_orders);
        };
    }

    // ======================== Test Only Functions ========================
    
    #[test_only]
    public fun init_module_for_test(admin: &signer) {
        init_module(admin);
    }
}

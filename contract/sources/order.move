/// Order Module for E-commerce Platform
/// Handles order placement, management, and tracking for buyers
/// Integrates with product and user_profile modules
module ecommerce_platform::order {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::timestamp;
    use ecommerce_platform::user_profile;
    use ecommerce_platform::product::{Self, Product};

    // ======================== Error Codes ========================
    
    /// User profile not found
    const ERR_USER_PROFILE_NOT_FOUND: u64 = 1;
    
    /// Only buyers can place orders
    const ERR_ONLY_BUYER_CAN_ORDER: u64 = 2;
    
    /// Product not available for purchase
    const ERR_PRODUCT_NOT_AVAILABLE: u64 = 3;
    
    /// Insufficient product quantity
    const ERR_INSUFFICIENT_PRODUCT_QUANTITY: u64 = 4;
    
    /// Invalid quantity (must be > 0)
    const ERR_INVALID_QUANTITY: u64 = 5;
    
    /// Order not found
    const ERR_ORDER_NOT_FOUND: u64 = 6;
    
    /// Only order owner can perform this action
    const ERR_NOT_ORDER_OWNER: u64 = 7;
    
    /// Only seller can update order status
    const ERR_ONLY_SELLER_CAN_UPDATE: u64 = 8;
    
    /// Invalid status transition
    const ERR_INVALID_STATUS_TRANSITION: u64 = 9;
    
    /// Order already cancelled
    const ERR_ORDER_ALREADY_CANCELLED: u64 = 10;
    
    /// Cannot cancel order in current status
    const ERR_CANNOT_CANCEL_ORDER: u64 = 11;
    
    /// Insufficient payment
    const ERR_INSUFFICIENT_PAYMENT: u64 = 12;

    // ======================== Constants ========================
    
    /// Order Status: Pending (just placed)
    const ORDER_STATUS_PENDING: u8 = 1;
    
    /// Order Status: Confirmed by seller
    const ORDER_STATUS_CONFIRMED: u8 = 2;
    
    /// Order Status: Processing (being prepared)
    const ORDER_STATUS_PROCESSING: u8 = 3;
    
    /// Order Status: Shipped
    const ORDER_STATUS_SHIPPED: u8 = 4;
    
    /// Order Status: Delivered
    const ORDER_STATUS_DELIVERED: u8 = 5;
    
    /// Order Status: Cancelled
    const ORDER_STATUS_CANCELLED: u8 = 6;
    
    /// Order Status: Refunded
    const ORDER_STATUS_REFUNDED: u8 = 7;

    // ======================== Structs ========================
    
    /// Order structure containing all order information
    struct Order has key, store {
        /// Order ID (for reference)
        order_id: u64,
        /// Product object reference
        product_obj_addr: address,
        /// Buyer's wallet address
        buyer_wallet: address,
        /// Seller's wallet address
        seller_wallet: address,
        /// Quantity ordered
        quantity: u64,
        /// Price per unit at time of order
        unit_price: u64,
        /// Total order amount (quantity * unit_price)
        total_amount: u64,
        /// Shipping address
        shipping_address: String,
        /// Order status
        status: u8,
        /// Payment status (true if paid)
        is_paid: bool,
        /// Order creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
        /// Delivery timestamp (0 if not delivered)
        delivered_at: u64,
        /// Optional order notes/instructions
        notes: String,
        /// Object extension reference
        extend_ref: ExtendRef,
    }

    /// Registry to track all orders by a buyer
    struct BuyerOrderRegistry has key {
        /// Vector of order object addresses
        order_objects: vector<address>,
        /// Counter for generating order IDs
        order_counter: u64,
    }

    /// Global registry to track all orders for sellers
    struct SellerOrderRegistry has key {
        /// Map of seller addresses to their order addresses
        /// In a production system, this would use a Table or SmartTable
        /// For now, we'll implement a simpler version
        order_objects: vector<address>,
        seller_addresses: vector<address>,
    }

    /// Global order counter (optional - for unique IDs across platform)
    struct GlobalOrderCounter has key {
        counter: u64,
    }

    // ======================== Events ========================
    
    #[event]
    /// Event emitted when a new order is placed
    struct OrderPlacedEvent has drop, store {
        order_obj_addr: address,
        order_id: u64,
        product_obj_addr: address,
        buyer_wallet: address,
        seller_wallet: address,
        quantity: u64,
        total_amount: u64,
        created_at: u64,
    }

    #[event]
    /// Event emitted when order status is updated
    struct OrderStatusUpdatedEvent has drop, store {
        order_obj_addr: address,
        order_id: u64,
        old_status: u8,
        new_status: u8,
        updated_by: address,
        updated_at: u64,
    }

    #[event]
    /// Event emitted when an order is cancelled
    struct OrderCancelledEvent has drop, store {
        order_obj_addr: address,
        order_id: u64,
        cancelled_by: address,
        reason: String,
        cancelled_at: u64,
    }

    #[event]
    /// Event emitted when payment is confirmed
    struct PaymentConfirmedEvent has drop, store {
        order_obj_addr: address,
        order_id: u64,
        amount: u64,
        buyer_wallet: address,
        seller_wallet: address,
        paid_at: u64,
    }

    // ======================== Initialization ========================
    
    /// Initialize module (called once on deployment)
    fun init_module(deployer: &signer) {
        // Initialize global order counter
        move_to(deployer, GlobalOrderCounter {
            counter: 0,
        });
        
        // Initialize global seller order registry
        move_to(deployer, SellerOrderRegistry {
            order_objects: vector::empty<address>(),
            seller_addresses: vector::empty<address>(),
        });
    }

    // ======================== Entry Functions (Write) ========================
    
    /// Place a new order for a product
    /// @param buyer - The buyer placing the order
    /// @param product_obj - Product object reference
    /// @param quantity - Quantity to order
    /// @param shipping_address - Shipping address for delivery
    /// @param notes - Optional order notes/instructions
    public entry fun place_order(
        buyer: &signer,
        product_obj: Object<Product>,
        quantity: u64,
        shipping_address: String,
        notes: String,
    ) acquires BuyerOrderRegistry, SellerOrderRegistry, GlobalOrderCounter {
        let buyer_addr = signer::address_of(buyer);
        let product_addr = object::object_address(&product_obj);
        
        // Validate buyer profile exists and user is a buyer
        assert!(user_profile::profile_exists(buyer_addr), ERR_USER_PROFILE_NOT_FOUND);
        assert!(user_profile::is_buyer(buyer_addr), ERR_ONLY_BUYER_CAN_ORDER);
        
        // Validate quantity
        assert!(quantity > 0, ERR_INVALID_QUANTITY);
        
        // Check product availability
        assert!(product::is_product_available(product_obj), ERR_PRODUCT_NOT_AVAILABLE);
        
        // Check sufficient quantity
        let available_quantity = product::get_quantity_left(product_obj);
        assert!(available_quantity >= quantity, ERR_INSUFFICIENT_PRODUCT_QUANTITY);
        
        // Get product details
        let unit_price = product::get_product_price(product_obj);
        let seller_wallet = product::get_product_seller(product_obj);
        let total_amount = unit_price * quantity;
        
        // Generate order ID
        let order_id = get_next_order_id();
        
        // Create order object
        let order_constructor_ref = &object::create_object(@ecommerce_platform);
        let order_signer = &object::generate_signer(order_constructor_ref);
        let order_obj_addr = object::address_from_constructor_ref(order_constructor_ref);
        let extend_ref = object::generate_extend_ref(order_constructor_ref);
        
        let now = timestamp::now_seconds();
        
        // Create order struct
        let order = Order {
            order_id,
            product_obj_addr: product_addr,
            buyer_wallet: buyer_addr,
            seller_wallet,
            quantity,
            unit_price,
            total_amount,
            shipping_address,
            status: ORDER_STATUS_PENDING,
            is_paid: false,
            created_at: now,
            updated_at: now,
            delivered_at: 0,
            notes,
            extend_ref,
        };
        
        // Store order
        move_to(order_signer, order);
        
        // Initialize or update buyer's order registry
        if (!exists<BuyerOrderRegistry>(buyer_addr)) {
            move_to(buyer, BuyerOrderRegistry {
                order_objects: vector::empty<address>(),
                order_counter: 0,
            });
        };
        
        let buyer_registry = borrow_global_mut<BuyerOrderRegistry>(buyer_addr);
        vector::push_back(&mut buyer_registry.order_objects, order_obj_addr);
        buyer_registry.order_counter = buyer_registry.order_counter + 1;
        
        // Track order in global seller registry
        let global_seller_registry = borrow_global_mut<SellerOrderRegistry>(@ecommerce_platform);
        vector::push_back(&mut global_seller_registry.order_objects, order_obj_addr);
        vector::push_back(&mut global_seller_registry.seller_addresses, seller_wallet);
        
        // Emit event
        event::emit(OrderPlacedEvent {
            order_obj_addr,
            order_id,
            product_obj_addr: product_addr,
            buyer_wallet: buyer_addr,
            seller_wallet,
            quantity,
            total_amount,
            created_at: now,
        });
    }

    /// Update order status (seller only)
    /// @param sender - The seller updating the order
    /// @param order_obj - Order object reference
    /// @param new_status - New order status
    public entry fun update_order_status(
        sender: &signer,
        order_obj: Object<Order>,
        new_status: u8,
    ) acquires Order {
        let sender_addr = signer::address_of(sender);
        let order_addr = object::object_address(&order_obj);
        
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        
        let order = borrow_global_mut<Order>(order_addr);
        
        // Verify seller
        assert!(order.seller_wallet == sender_addr, ERR_ONLY_SELLER_CAN_UPDATE);
        
        // Cannot update cancelled orders
        assert!(order.status != ORDER_STATUS_CANCELLED, ERR_ORDER_ALREADY_CANCELLED);
        
        // Validate status transition
        assert!(is_valid_status_transition(order.status, new_status), ERR_INVALID_STATUS_TRANSITION);
        
        let old_status = order.status;
        order.status = new_status;
        order.updated_at = timestamp::now_seconds();
        
        // Set delivered_at timestamp if status is delivered
        if (new_status == ORDER_STATUS_DELIVERED) {
            order.delivered_at = timestamp::now_seconds();
        };
        
        // Emit event
        event::emit(OrderStatusUpdatedEvent {
            order_obj_addr: order_addr,
            order_id: order.order_id,
            old_status,
            new_status,
            updated_by: sender_addr,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Cancel an order (buyer can cancel if pending/confirmed, seller can cancel anytime before shipped)
    /// @param sender - The user cancelling the order
    /// @param order_obj - Order object reference
    /// @param reason - Cancellation reason
    public entry fun cancel_order(
        sender: &signer,
        order_obj: Object<Order>,
        reason: String,
    ) acquires Order {
        let sender_addr = signer::address_of(sender);
        let order_addr = object::object_address(&order_obj);
        
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        
        let order = borrow_global_mut<Order>(order_addr);
        
        // Check if sender is buyer or seller
        let is_buyer = order.buyer_wallet == sender_addr;
        let is_seller = order.seller_wallet == sender_addr;
        assert!(is_buyer || is_seller, ERR_NOT_ORDER_OWNER);
        
        // Check if order can be cancelled
        assert!(order.status != ORDER_STATUS_CANCELLED, ERR_ORDER_ALREADY_CANCELLED);
        
        // Buyer can only cancel pending or confirmed orders
        if (is_buyer) {
            assert!(
                order.status == ORDER_STATUS_PENDING || 
                order.status == ORDER_STATUS_CONFIRMED,
                ERR_CANNOT_CANCEL_ORDER
            );
        };
        
        // Seller can cancel before shipped
        if (is_seller) {
            assert!(
                order.status != ORDER_STATUS_SHIPPED && 
                order.status != ORDER_STATUS_DELIVERED,
                ERR_CANNOT_CANCEL_ORDER
            );
        };
        
        let old_status = order.status;
        order.status = ORDER_STATUS_CANCELLED;
        order.updated_at = timestamp::now_seconds();
        
        // Emit events
        event::emit(OrderCancelledEvent {
            order_obj_addr: order_addr,
            order_id: order.order_id,
            cancelled_by: sender_addr,
            reason,
            cancelled_at: timestamp::now_seconds(),
        });
        
        event::emit(OrderStatusUpdatedEvent {
            order_obj_addr: order_addr,
            order_id: order.order_id,
            old_status,
            new_status: ORDER_STATUS_CANCELLED,
            updated_by: sender_addr,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Update shipping address (buyer only, before order is shipped)
    /// @param buyer - The buyer updating shipping address
    /// @param order_obj - Order object reference
    /// @param new_shipping_address - New shipping address
    public entry fun update_shipping_address(
        buyer: &signer,
        order_obj: Object<Order>,
        new_shipping_address: String,
    ) acquires Order {
        let buyer_addr = signer::address_of(buyer);
        let order_addr = object::object_address(&order_obj);
        
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        
        let order = borrow_global_mut<Order>(order_addr);
        
        // Verify buyer
        assert!(order.buyer_wallet == buyer_addr, ERR_NOT_ORDER_OWNER);
        
        // Can only update before shipped
        assert!(
            order.status == ORDER_STATUS_PENDING || 
            order.status == ORDER_STATUS_CONFIRMED ||
            order.status == ORDER_STATUS_PROCESSING,
            ERR_CANNOT_CANCEL_ORDER
        );
        
        order.shipping_address = new_shipping_address;
        order.updated_at = timestamp::now_seconds();
    }

    /// Mark order as paid (simplified - in production, integrate with payment processor)
    /// @param buyer - The buyer making payment
    /// @param order_obj - Order object reference
    public entry fun mark_order_paid(
        buyer: &signer,
        order_obj: Object<Order>,
    ) acquires Order {
        let buyer_addr = signer::address_of(buyer);
        let order_addr = object::object_address(&order_obj);
        
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        
        let order = borrow_global_mut<Order>(order_addr);
        
        // Verify buyer
        assert!(order.buyer_wallet == buyer_addr, ERR_NOT_ORDER_OWNER);
        assert!(!order.is_paid, 0); // Not already paid
        
        order.is_paid = true;
        order.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(PaymentConfirmedEvent {
            order_obj_addr: order_addr,
            order_id: order.order_id,
            amount: order.total_amount,
            buyer_wallet: buyer_addr,
            seller_wallet: order.seller_wallet,
            paid_at: timestamp::now_seconds(),
        });
    }

    // ======================== View Functions (Read) ========================
    
    #[view]
    /// Get complete order information
    /// @param order_obj - Order object reference
    /// @return All order details as a tuple
    public fun get_order(order_obj: Object<Order>): (
        u64,       // order_id
        address,   // product_obj_addr
        address,   // buyer_wallet
        address,   // seller_wallet
        u64,       // quantity
        u64,       // unit_price
        u64,       // total_amount
        String,    // shipping_address
        u8,        // status
        bool,      // is_paid
        u64,       // created_at
        u64,       // updated_at
        u64,       // delivered_at
        String     // notes
    ) acquires Order {
        let order_addr = object::object_address(&order_obj);
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        
        let order = borrow_global<Order>(order_addr);
        (
            order.order_id,
            order.product_obj_addr,
            order.buyer_wallet,
            order.seller_wallet,
            order.quantity,
            order.unit_price,
            order.total_amount,
            order.shipping_address,
            order.status,
            order.is_paid,
            order.created_at,
            order.updated_at,
            order.delivered_at,
            order.notes
        )
    }

    #[view]
    /// Get all orders placed by a buyer
    /// @param buyer_addr - Buyer's wallet address
    /// @return Vector of order object addresses
    public fun get_buyer_orders(buyer_addr: address): vector<address> acquires BuyerOrderRegistry {
        if (!exists<BuyerOrderRegistry>(buyer_addr)) {
            return vector::empty<address>()
        };
        *&borrow_global<BuyerOrderRegistry>(buyer_addr).order_objects
    }

    #[view]
    /// Get all orders received by a seller
    /// @param seller_addr - Seller's wallet address
    /// @return Vector of order object addresses
    public fun get_seller_orders(seller_addr: address): vector<address> acquires SellerOrderRegistry {
        if (!exists<SellerOrderRegistry>(@ecommerce_platform)) {
            return vector::empty<address>()
        };
        
        let registry = borrow_global<SellerOrderRegistry>(@ecommerce_platform);
        let seller_orders = vector::empty<address>();
        let i = 0;
        let len = vector::length(&registry.order_objects);
        
        while (i < len) {
            let seller = *vector::borrow(&registry.seller_addresses, i);
            if (seller == seller_addr) {
                let order_addr = *vector::borrow(&registry.order_objects, i);
                vector::push_back(&mut seller_orders, order_addr);
            };
            i = i + 1;
        };
        
        seller_orders
    }

    #[view]
    /// Get order status
    /// @param order_obj - Order object reference
    /// @return Order status
    public fun get_order_status(order_obj: Object<Order>): u8 acquires Order {
        let order_addr = object::object_address(&order_obj);
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        borrow_global<Order>(order_addr).status
    }

    #[view]
    /// Check if order is paid
    /// @param order_obj - Order object reference
    /// @return true if paid, false otherwise
    public fun is_order_paid(order_obj: Object<Order>): bool acquires Order {
        let order_addr = object::object_address(&order_obj);
        if (!exists<Order>(order_addr)) {
            return false
        };
        borrow_global<Order>(order_addr).is_paid
    }

    #[view]
    /// Get total number of orders by buyer
    /// @param buyer_addr - Buyer's wallet address
    /// @return Number of orders
    public fun get_buyer_order_count(buyer_addr: address): u64 acquires BuyerOrderRegistry {
        if (!exists<BuyerOrderRegistry>(buyer_addr)) {
            return 0
        };
        borrow_global<BuyerOrderRegistry>(buyer_addr).order_counter
    }

    #[view]
    /// Get order total amount
    /// @param order_obj - Order object reference
    /// @return Total order amount
    public fun get_order_total(order_obj: Object<Order>): u64 acquires Order {
        let order_addr = object::object_address(&order_obj);
        assert!(exists<Order>(order_addr), ERR_ORDER_NOT_FOUND);
        borrow_global<Order>(order_addr).total_amount
    }

    #[view]
    /// Check if buyer has orders
    /// @param buyer_addr - Buyer's wallet address
    /// @return true if buyer has orders, false otherwise
    public fun buyer_has_orders(buyer_addr: address): bool acquires BuyerOrderRegistry {
        if (!exists<BuyerOrderRegistry>(buyer_addr)) {
            return false
        };
        !vector::is_empty(&borrow_global<BuyerOrderRegistry>(buyer_addr).order_objects)
    }

    // ======================== Helper Functions ========================
    
    /// Get next order ID from global counter
    fun get_next_order_id(): u64 acquires GlobalOrderCounter {
        let counter = borrow_global_mut<GlobalOrderCounter>(@ecommerce_platform);
        counter.counter = counter.counter + 1;
        counter.counter
    }

    /// Check if status transition is valid
    fun is_valid_status_transition(old_status: u8, new_status: u8): bool {
        // Pending -> Confirmed, Cancelled
        if (old_status == ORDER_STATUS_PENDING) {
            return new_status == ORDER_STATUS_CONFIRMED || 
                   new_status == ORDER_STATUS_CANCELLED
        };
        
        // Confirmed -> Processing, Cancelled
        if (old_status == ORDER_STATUS_CONFIRMED) {
            return new_status == ORDER_STATUS_PROCESSING || 
                   new_status == ORDER_STATUS_CANCELLED
        };
        
        // Processing -> Shipped, Cancelled
        if (old_status == ORDER_STATUS_PROCESSING) {
            return new_status == ORDER_STATUS_SHIPPED || 
                   new_status == ORDER_STATUS_CANCELLED
        };
        
        // Shipped -> Delivered
        if (old_status == ORDER_STATUS_SHIPPED) {
            return new_status == ORDER_STATUS_DELIVERED
        };
        
        // Delivered -> Refunded (only valid transition from delivered)
        if (old_status == ORDER_STATUS_DELIVERED) {
            return new_status == ORDER_STATUS_REFUNDED
        };
        
        // No valid transitions from cancelled or refunded
        false
    }

    /// Get status constant for pending
    public fun get_status_pending(): u8 {
        ORDER_STATUS_PENDING
    }

    /// Get status constant for confirmed
    public fun get_status_confirmed(): u8 {
        ORDER_STATUS_CONFIRMED
    }

    /// Get status constant for processing
    public fun get_status_processing(): u8 {
        ORDER_STATUS_PROCESSING
    }

    /// Get status constant for shipped
    public fun get_status_shipped(): u8 {
        ORDER_STATUS_SHIPPED
    }

    /// Get status constant for delivered
    public fun get_status_delivered(): u8 {
        ORDER_STATUS_DELIVERED
    }

    /// Get status constant for cancelled
    public fun get_status_cancelled(): u8 {
        ORDER_STATUS_CANCELLED
    }

    /// Get status constant for refunded
    public fun get_status_refunded(): u8 {
        ORDER_STATUS_REFUNDED
    }

    // ======================== Test Helper Functions ========================
    
    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }

    #[test_only]
    public fun get_order_obj_from_place_event(event: &OrderPlacedEvent): Object<Order> {
        object::address_to_object(event.order_obj_addr)
    }
}

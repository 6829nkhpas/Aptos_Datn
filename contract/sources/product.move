/// Product Module for E-commerce Platform
/// Handles product creation, listing, updating, deletion, and inventory management
/// Only sellers can create and manage products
module ecommerce_platform::product {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::timestamp;
    use ecommerce_platform::user_profile;

    // ======================== Error Codes ========================
    
    /// Only sellers can create products
    const ERR_ONLY_SELLER_CAN_CREATE: u64 = 1;
    
    /// Only product owner can update or delete the product
    const ERR_NOT_PRODUCT_OWNER: u64 = 2;
    
    /// Product not found
    const ERR_PRODUCT_NOT_FOUND: u64 = 3;
    
    /// Product already deleted
    const ERR_PRODUCT_ALREADY_DELETED: u64 = 4;
    
    /// Insufficient quantity
    const ERR_INSUFFICIENT_QUANTITY: u64 = 5;
    
    /// Invalid price
    const ERR_INVALID_PRICE: u64 = 6;
    
    /// Invalid quantity
    const ERR_INVALID_QUANTITY: u64 = 7;
    
    /// Cannot delete product with pending orders
    const ERR_PRODUCT_HAS_PENDING_ORDERS: u64 = 8;
    
    /// User profile not found
    const ERR_USER_PROFILE_NOT_FOUND: u64 = 9;
    
    /// Product not available
    const ERR_PRODUCT_NOT_AVAILABLE: u64 = 10;

    // ======================== Structs ========================
    
    /// Product structure containing all product information
    struct Product has key, store {
        /// Product title/name
        title: String,
        /// Detailed product description
        description: String,
        /// Product price in smallest unit (e.g., cents)
        price: u64,
        /// Total quantity initially added
        total_quantity: u64,
        /// Quantity currently available
        quantity_left: u64,
        /// S3 image URLs stored as vector of strings
        image_urls: vector<String>,
        /// Product category
        category: String,
        /// Is product available for purchase
        is_available: bool,
        /// Is product deleted (soft delete)
        is_deleted: bool,
        /// Seller's wallet address
        seller_wallet: address,
        /// Product creation timestamp
        created_at: u64,
        /// Last update timestamp
        updated_at: u64,
        /// Object extension reference for future functionality
        extend_ref: ExtendRef,
    }

    /// Registry to track all products by a seller
    struct SellerProductRegistry has key {
        /// Vector of product object addresses
        product_objects: vector<address>,
    }

    /// Global registry to track all products in the marketplace
    struct GlobalProductRegistry has key {
        /// Vector of all product object addresses
        all_products: vector<address>,
    }

    // ======================== Events ========================
    
    #[event]
    /// Event emitted when a new product is created
    struct ProductCreatedEvent has drop, store {
        product_obj_addr: address,
        seller_wallet: address,
        title: String,
        price: u64,
        total_quantity: u64,
        category: String,
        created_at: u64,
    }

    #[event]
    /// Event emitted when a product is updated
    struct ProductUpdatedEvent has drop, store {
        product_obj_addr: address,
        seller_wallet: address,
        updated_at: u64,
    }

    #[event]
    /// Event emitted when a product is deleted
    struct ProductDeletedEvent has drop, store {
        product_obj_addr: address,
        seller_wallet: address,
        deleted_at: u64,
    }

    #[event]
    /// Event emitted when product availability is toggled
    struct ProductAvailabilityChangedEvent has drop, store {
        product_obj_addr: address,
        seller_wallet: address,
        is_available: bool,
        changed_at: u64,
    }

    #[event]
    /// Event emitted when product inventory is updated
    struct InventoryUpdatedEvent has drop, store {
        product_obj_addr: address,
        seller_wallet: address,
        quantity_change: u64,
        new_quantity_left: u64,
        updated_at: u64,
    }

    // ======================== Initialization ========================
    
    /// Initialize module (called once on deployment)
    fun init_module(deployer: &signer) {
        // Initialize global product registry
        move_to(deployer, GlobalProductRegistry {
            all_products: vector::empty<address>(),
        });
    }

    // ======================== Entry Functions (Write) ========================
    
    /// Create a new product (only sellers can call this)
    /// @param sender - The seller creating the product
    /// @param title - Product title/name
    /// @param description - Detailed product description
    /// @param price - Product price in smallest unit
    /// @param total_quantity - Initial quantity of the product
    /// @param image_urls - Vector of S3 image URLs
    /// @param category - Product category
    public entry fun create_product(
        sender: &signer,
        title: String,
        description: String,
        price: u64,
        total_quantity: u64,
        image_urls: vector<String>,
        category: String,
    ) acquires SellerProductRegistry, GlobalProductRegistry {
        let sender_addr = signer::address_of(sender);
        
        // Validate seller profile exists and user is a seller
        assert!(user_profile::profile_exists(sender_addr), ERR_USER_PROFILE_NOT_FOUND);
        assert!(user_profile::is_seller(sender_addr), ERR_ONLY_SELLER_CAN_CREATE);
        
        // Validate inputs
        assert!(price > 0, ERR_INVALID_PRICE);
        assert!(total_quantity > 0, ERR_INVALID_QUANTITY);
        
        // Create product object
        let product_constructor_ref = &object::create_object(@ecommerce_platform);
        let product_signer = &object::generate_signer(product_constructor_ref);
        let product_obj_addr = object::address_from_constructor_ref(product_constructor_ref);
        let extend_ref = object::generate_extend_ref(product_constructor_ref);
        
        let now = timestamp::now_seconds();
        
        // Create product struct
        let product = Product {
            title,
            description,
            price,
            total_quantity,
            quantity_left: total_quantity,
            image_urls,
            category,
            is_available: true,
            is_deleted: false,
            seller_wallet: sender_addr,
            created_at: now,
            updated_at: now,
            extend_ref,
        };
        
        // Store product
        move_to(product_signer, product);
        
        // Initialize or update seller's product registry
        if (!exists<SellerProductRegistry>(sender_addr)) {
            move_to(sender, SellerProductRegistry {
                product_objects: vector::empty<address>(),
            });
        };
        
        let registry = borrow_global_mut<SellerProductRegistry>(sender_addr);
        vector::push_back(&mut registry.product_objects, product_obj_addr);
        
        // Add to global product registry
        let global_registry = borrow_global_mut<GlobalProductRegistry>(@ecommerce_platform);
        vector::push_back(&mut global_registry.all_products, product_obj_addr);
        
        // Emit event
        event::emit(ProductCreatedEvent {
            product_obj_addr,
            seller_wallet: sender_addr,
            title,
            price,
            total_quantity,
            category,
            created_at: now,
        });
    }

    /// Update product details
    /// @param sender - The product owner
    /// @param product_obj - Product object reference
    /// @param title - Updated title
    /// @param description - Updated description
    /// @param price - Updated price
    /// @param image_urls - Updated image URLs
    /// @param category - Updated category
    public entry fun update_product(
        sender: &signer,
        product_obj: Object<Product>,
        title: String,
        description: String,
        price: u64,
        image_urls: vector<String>,
        category: String,
    ) acquires Product {
        let sender_addr = signer::address_of(sender);
        let product_addr = object::object_address(&product_obj);
        
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global_mut<Product>(product_addr);
        
        // Verify ownership
        assert!(product.seller_wallet == sender_addr, ERR_NOT_PRODUCT_OWNER);
        assert!(!product.is_deleted, ERR_PRODUCT_ALREADY_DELETED);
        
        // Validate inputs
        assert!(price > 0, ERR_INVALID_PRICE);
        
        // Update product fields
        product.title = title;
        product.description = description;
        product.price = price;
        product.image_urls = image_urls;
        product.category = category;
        product.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(ProductUpdatedEvent {
            product_obj_addr: product_addr,
            seller_wallet: sender_addr,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Update product inventory (add or reduce quantity)
    /// @param sender - The product owner
    /// @param product_obj - Product object reference
    /// @param quantity_to_add - Quantity to add to inventory
    public entry fun update_inventory(
        sender: &signer,
        product_obj: Object<Product>,
        quantity_to_add: u64,
    ) acquires Product {
        let sender_addr = signer::address_of(sender);
        let product_addr = object::object_address(&product_obj);
        
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global_mut<Product>(product_addr);
        
        // Verify ownership
        assert!(product.seller_wallet == sender_addr, ERR_NOT_PRODUCT_OWNER);
        assert!(!product.is_deleted, ERR_PRODUCT_ALREADY_DELETED);
        
        // Update inventory
        product.quantity_left = product.quantity_left + quantity_to_add;
        product.total_quantity = product.total_quantity + quantity_to_add;
        product.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(InventoryUpdatedEvent {
            product_obj_addr: product_addr,
            seller_wallet: sender_addr,
            quantity_change: quantity_to_add,
            new_quantity_left: product.quantity_left,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Reduce product inventory (when sold or removed)
    /// @param sender - The product owner
    /// @param product_obj - Product object reference
    /// @param quantity_to_reduce - Quantity to reduce from inventory
    public entry fun reduce_inventory(
        sender: &signer,
        product_obj: Object<Product>,
        quantity_to_reduce: u64,
    ) acquires Product {
        let sender_addr = signer::address_of(sender);
        let product_addr = object::object_address(&product_obj);
        
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global_mut<Product>(product_addr);
        
        // Verify ownership
        assert!(product.seller_wallet == sender_addr, ERR_NOT_PRODUCT_OWNER);
        assert!(!product.is_deleted, ERR_PRODUCT_ALREADY_DELETED);
        assert!(product.quantity_left >= quantity_to_reduce, ERR_INSUFFICIENT_QUANTITY);
        
        // Reduce inventory
        product.quantity_left = product.quantity_left - quantity_to_reduce;
        product.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(InventoryUpdatedEvent {
            product_obj_addr: product_addr,
            seller_wallet: sender_addr,
            quantity_change: quantity_to_reduce,
            new_quantity_left: product.quantity_left,
            updated_at: timestamp::now_seconds(),
        });
    }

    /// Toggle product availability
    /// @param sender - The product owner
    /// @param product_obj - Product object reference
    /// @param is_available - New availability status
    public entry fun set_product_availability(
        sender: &signer,
        product_obj: Object<Product>,
        is_available: bool,
    ) acquires Product {
        let sender_addr = signer::address_of(sender);
        let product_addr = object::object_address(&product_obj);
        
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global_mut<Product>(product_addr);
        
        // Verify ownership
        assert!(product.seller_wallet == sender_addr, ERR_NOT_PRODUCT_OWNER);
        assert!(!product.is_deleted, ERR_PRODUCT_ALREADY_DELETED);
        
        // Update availability
        product.is_available = is_available;
        product.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(ProductAvailabilityChangedEvent {
            product_obj_addr: product_addr,
            seller_wallet: sender_addr,
            is_available,
            changed_at: timestamp::now_seconds(),
        });
    }

    /// Soft delete a product
    /// @param sender - The product owner
    /// @param product_obj - Product object reference
    public entry fun delete_product(
        sender: &signer,
        product_obj: Object<Product>,
    ) acquires Product, GlobalProductRegistry {
        let sender_addr = signer::address_of(sender);
        let product_addr = object::object_address(&product_obj);
        
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global_mut<Product>(product_addr);
        
        // Verify ownership
        assert!(product.seller_wallet == sender_addr, ERR_NOT_PRODUCT_OWNER);
        assert!(!product.is_deleted, ERR_PRODUCT_ALREADY_DELETED);
        
        // Soft delete the product
        product.is_deleted = true;
        product.is_available = false;
        product.updated_at = timestamp::now_seconds();
        
        // Remove from global registry
        let global_registry = borrow_global_mut<GlobalProductRegistry>(@ecommerce_platform);
        let (found, index) = vector::index_of(&global_registry.all_products, &product_addr);
        if (found) {
            vector::remove(&mut global_registry.all_products, index);
        };
        
        // Emit event
        event::emit(ProductDeletedEvent {
            product_obj_addr: product_addr,
            seller_wallet: sender_addr,
            deleted_at: timestamp::now_seconds(),
        });
    }

    // ======================== View Functions (Read) ========================
    
    #[view]
    /// Get all product addresses from the global registry
    /// @return Vector of all product object addresses
    public fun get_all_products(): vector<address> acquires GlobalProductRegistry {
        let global_registry = borrow_global<GlobalProductRegistry>(@ecommerce_platform);
        global_registry.all_products
    }
    
    #[view]
    /// Get complete product information
    /// @param product_obj - Product object reference
    /// @return All product details as a tuple
    public fun get_product(product_obj: Object<Product>): (
        String,      // title
        String,      // description
        u64,         // price
        u64,         // total_quantity
        u64,         // quantity_left
        vector<String>, // image_urls
        String,      // category
        bool,        // is_available
        bool,        // is_deleted
        address,     // seller_wallet
        u64,         // created_at
        u64          // updated_at
    ) acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        
        let product = borrow_global<Product>(product_addr);
        (
            product.title,
            product.description,
            product.price,
            product.total_quantity,
            product.quantity_left,
            product.image_urls,
            product.category,
            product.is_available,
            product.is_deleted,
            product.seller_wallet,
            product.created_at,
            product.updated_at
        )
    }

    #[view]
    /// Get product price
    /// @param product_obj - Product object reference
    /// @return Product price
    public fun get_product_price(product_obj: Object<Product>): u64 acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        borrow_global<Product>(product_addr).price
    }

    #[view]
    /// Get product quantity left
    /// @param product_obj - Product object reference
    /// @return Quantity left
    public fun get_quantity_left(product_obj: Object<Product>): u64 acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        borrow_global<Product>(product_addr).quantity_left
    }

    #[view]
    /// Check if product is available
    /// @param product_obj - Product object reference
    /// @return true if available, false otherwise
    public fun is_product_available(product_obj: Object<Product>): bool acquires Product {
        let product_addr = object::object_address(&product_obj);
        if (!exists<Product>(product_addr)) {
            return false
        };
        
        let product = borrow_global<Product>(product_addr);
        product.is_available && !product.is_deleted && product.quantity_left > 0
    }

    #[view]
    /// Check if product is deleted
    /// @param product_obj - Product object reference
    /// @return true if deleted, false otherwise
    public fun is_product_deleted(product_obj: Object<Product>): bool acquires Product {
        let product_addr = object::object_address(&product_obj);
        if (!exists<Product>(product_addr)) {
            return true
        };
        borrow_global<Product>(product_addr).is_deleted
    }

    #[view]
    /// Get product seller
    /// @param product_obj - Product object reference
    /// @return Seller's wallet address
    public fun get_product_seller(product_obj: Object<Product>): address acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        borrow_global<Product>(product_addr).seller_wallet
    }

    #[view]
    /// Get all products created by a seller
    /// @param seller_addr - Seller's wallet address
    /// @return Vector of product object addresses
    public fun get_seller_products(seller_addr: address): vector<address> acquires SellerProductRegistry {
        if (!exists<SellerProductRegistry>(seller_addr)) {
            return vector::empty<address>()
        };
        *&borrow_global<SellerProductRegistry>(seller_addr).product_objects
    }

    #[view]
    /// Get product category
    /// @param product_obj - Product object reference
    /// @return Product category
    public fun get_product_category(product_obj: Object<Product>): String acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        borrow_global<Product>(product_addr).category
    }

    #[view]
    /// Get product image URLs
    /// @param product_obj - Product object reference
    /// @return Vector of image URLs
    public fun get_product_images(product_obj: Object<Product>): vector<String> acquires Product {
        let product_addr = object::object_address(&product_obj);
        assert!(exists<Product>(product_addr), ERR_PRODUCT_NOT_FOUND);
        borrow_global<Product>(product_addr).image_urls
    }

    #[view]
    /// Check if seller has products
    /// @param seller_addr - Seller's wallet address
    /// @return true if seller has products, false otherwise
    public fun seller_has_products(seller_addr: address): bool acquires SellerProductRegistry {
        if (!exists<SellerProductRegistry>(seller_addr)) {
            return false
        };
        !vector::is_empty(&borrow_global<SellerProductRegistry>(seller_addr).product_objects)
    }

    // ======================== Test Helper Functions ========================
    
    #[test_only]
    public fun init_module_for_test(aptos_framework: &signer, sender: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        init_module(sender);
    }

    #[test_only]
    public fun get_product_obj_from_create_event(event: &ProductCreatedEvent): Object<Product> {
        object::address_to_object(event.product_obj_addr)
    }
}

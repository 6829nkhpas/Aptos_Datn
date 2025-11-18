/// Comprehensive tests for the Order Module
/// Tests order placement, status updates, cancellation, and buyer operations
#[test_only]
module message_board_addr::order_tests {
    use std::signer;
    use std::string;
    use std::vector;
    
    use aptos_framework::timestamp;
    use aptos_framework::object;
    
    use message_board_addr::user_profile;
    use message_board_addr::product;
    use message_board_addr::order;

    // ======================== Test Setup ========================
    
    #[test_only]
    fun setup_test(aptos_framework: &signer, deployer: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        user_profile::init_module_for_test(aptos_framework, deployer);
        product::init_module_for_test(aptos_framework, deployer);
        order::init_module_for_test(deployer);
    }

    #[test_only]
    fun setup_seller_and_product(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ): object::Object<product::Product> {
        setup_test(aptos_framework, deployer);
        
        // Register seller
        user_profile::register_profile(
            seller,
            string::utf8(b"Test Seller"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@test.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Test seller"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/product.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Test Product"),
            string::utf8(b"Test Description"),
            10000, // $100.00
            10,    // 10 units
            image_urls,
            string::utf8(b"Electronics"),
        );
        
        // Get product object
        let seller_addr = signer::address_of(seller);
        let products = product::get_seller_products(seller_addr);
        let product_addr = *vector::borrow(&products, 0);
        object::address_to_object<product::Product>(product_addr)
    }

    #[test_only]
    fun register_buyer(buyer: &signer) {
        user_profile::register_profile(
            buyer,
            string::utf8(b"Test Buyer"),
            string::utf8(b"Canada"),
            user_profile::get_buyer_role(),
            string::utf8(b"buyer@test.com"),
            string::utf8(b"456 Buyer Ave"),
            string::utf8(b"Test buyer"),
        );
    }

    // ======================== Order Placement Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x200, buyer = @0x300)]
    fun test_place_order(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            2, // quantity
            string::utf8(b"789 Delivery St, City, Country"),
            string::utf8(b"Please deliver between 9am-5pm"),
        );
        
        // Verify order was created
        assert!(order::buyer_has_orders(buyer_addr), 1);
        assert!(order::get_buyer_order_count(buyer_addr) == 1, 2);
        
        let orders = order::get_buyer_orders(buyer_addr);
        assert!(vector::length(&orders) == 1, 3);
        
        // Get and verify order details
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        let (
            order_id,
            _product_obj_addr,
            buyer_wallet,
            _seller_wallet,
            quantity,
            unit_price,
            total_amount,
            _shipping_address,
            status,
            is_paid,
            _created_at,
            _updated_at,
            _delivered_at,
            _notes
        ) = order::get_order(order_obj);
        
        assert!(order_id == 1, 4);
        assert!(buyer_wallet == buyer_addr, 5);
        assert!(quantity == 2, 6);
        assert!(unit_price == 10000, 7);
        assert!(total_amount == 20000, 8); // 2 * 10000
        assert!(status == order::get_status_pending(), 9);
        assert!(!is_paid, 10);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x201, buyer = @0x301)]
    fun test_multiple_orders(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place multiple orders
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address 1"),
            string::utf8(b"Order 1"),
        );
        
        order::place_order(
            buyer,
            product_obj,
            2,
            string::utf8(b"Address 2"),
            string::utf8(b"Order 2"),
        );
        
        order::place_order(
            buyer,
            product_obj,
            3,
            string::utf8(b"Address 3"),
            string::utf8(b"Order 3"),
        );
        
        // Verify multiple orders
        assert!(order::get_buyer_order_count(buyer_addr) == 3, 1);
        
        let orders = order::get_buyer_orders(buyer_addr);
        assert!(vector::length(&orders) == 3, 2);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x202)]
    #[expected_failure(abort_code = 2, location = message_board_addr::order)]
    fun test_seller_cannot_place_order(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        
        // Try to place order as seller - should fail
        order::place_order(
            seller,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x203, buyer = @0x303)]
    #[expected_failure(abort_code = 4, location = message_board_addr::order)]
    fun test_insufficient_quantity(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        // Try to order more than available - should fail
        order::place_order(
            buyer,
            product_obj,
            20, // Only 10 available
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
    }

    // ======================== Order Status Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x204, buyer = @0x304)]
    fun test_update_order_status(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Check initial status
        assert!(order::get_order_status(order_obj) == order::get_status_pending(), 1);
        
        // Update to confirmed
        order::update_order_status(seller, order_obj, order::get_status_confirmed());
        assert!(order::get_order_status(order_obj) == order::get_status_confirmed(), 2);
        
        // Update to processing
        order::update_order_status(seller, order_obj, order::get_status_processing());
        assert!(order::get_order_status(order_obj) == order::get_status_processing(), 3);
        
        // Update to shipped
        order::update_order_status(seller, order_obj, order::get_status_shipped());
        assert!(order::get_order_status(order_obj) == order::get_status_shipped(), 4);
        
        // Update to delivered
        order::update_order_status(seller, order_obj, order::get_status_delivered());
        assert!(order::get_order_status(order_obj) == order::get_status_delivered(), 5);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x205, buyer = @0x305)]
    #[expected_failure(abort_code = 8, location = message_board_addr::order)]
    fun test_buyer_cannot_update_status(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Try to update status as buyer - should fail
        order::update_order_status(buyer, order_obj, order::get_status_confirmed());
    }

    // ======================== Order Cancellation Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x206, buyer = @0x306)]
    fun test_buyer_cancel_pending_order(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Cancel order
        order::cancel_order(
            buyer,
            order_obj,
            string::utf8(b"Changed my mind"),
        );
        
        // Verify cancelled
        assert!(order::get_order_status(order_obj) == order::get_status_cancelled(), 1);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x207, buyer = @0x307)]
    fun test_seller_cancel_order(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Seller cancels order
        order::cancel_order(
            seller,
            order_obj,
            string::utf8(b"Out of stock"),
        );
        
        // Verify cancelled
        assert!(order::get_order_status(order_obj) == order::get_status_cancelled(), 1);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x208, buyer = @0x308)]
    #[expected_failure(abort_code = 11, location = message_board_addr::order)]
    fun test_buyer_cannot_cancel_shipped_order(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Update to shipped
        order::update_order_status(seller, order_obj, order::get_status_confirmed());
        order::update_order_status(seller, order_obj, order::get_status_processing());
        order::update_order_status(seller, order_obj, order::get_status_shipped());
        
        // Try to cancel - should fail
        order::cancel_order(
            buyer,
            order_obj,
            string::utf8(b"Too late"),
        );
    }

    // ======================== Payment Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x209, buyer = @0x309)]
    fun test_mark_order_paid(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Check initially not paid
        assert!(!order::is_order_paid(order_obj), 1);
        
        // Mark as paid
        order::mark_order_paid(buyer, order_obj);
        
        // Verify paid
        assert!(order::is_order_paid(order_obj), 2);
    }

    // ======================== Shipping Address Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x210, buyer = @0x310)]
    fun test_update_shipping_address(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Place order
        order::place_order(
            buyer,
            product_obj,
            1,
            string::utf8(b"Original Address"),
            string::utf8(b"Notes"),
        );
        
        let orders = order::get_buyer_orders(buyer_addr);
        let order_addr = *vector::borrow(&orders, 0);
        let order_obj = object::address_to_object<order::Order>(order_addr);
        
        // Update shipping address
        order::update_shipping_address(
            buyer,
            order_obj,
            string::utf8(b"New Shipping Address"),
        );
        
        // Verify address updated
        let (_, _, _, _, _, _, _, shipping_address, _, _, _, _, _, _) = order::get_order(order_obj);
        assert!(shipping_address == string::utf8(b"New Shipping Address"), 1);
    }

    // ======================== Seller Order View Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x211, buyer1 = @0x311, buyer2 = @0x312)]
    fun test_seller_receives_multiple_orders(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
        buyer1: &signer,
        buyer2: &signer,
    ) {
        let product_obj = setup_seller_and_product(aptos_framework, deployer, seller);
        register_buyer(buyer1);
        register_buyer(buyer2);
        
        let seller_addr = signer::address_of(seller);
        
        // Buyer1 places 2 orders
        order::place_order(buyer1, product_obj, 1, string::utf8(b"Address 1"), string::utf8(b"Order 1"));
        order::place_order(buyer1, product_obj, 1, string::utf8(b"Address 2"), string::utf8(b"Order 2"));
        
        // Buyer2 places 1 order
        order::place_order(buyer2, product_obj, 2, string::utf8(b"Address 3"), string::utf8(b"Order 3"));
        
        // Verify seller received all orders
        let seller_orders = order::get_seller_orders(seller_addr);
        assert!(vector::length(&seller_orders) == 3, 1);
    }
}

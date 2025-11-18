#[test_only]
module message_board_addr::escrow_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::object;
    use message_board_addr::user_profile;
    use message_board_addr::product;
    use message_board_addr::escrow;

    // Test addresses
    const ADMIN_ADDR: address = @message_board_addr;

    // ======================== Test Setup ========================

    fun setup_test(aptos_framework: &signer, admin: &signer, buyer: &signer, seller: &signer) {
        // Initialize timestamp
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Create accounts
        account::create_account_for_test(ADMIN_ADDR);
        account::create_account_for_test(signer::address_of(buyer));
        account::create_account_for_test(signer::address_of(seller));
        
        // Initialize aptos coin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        
        // Fund buyer with 10000 APT
        let buyer_coins = coin::mint(10000000000, &mint_cap); // 10000 APT (8 decimals)
        coin::deposit(signer::address_of(buyer), buyer_coins);
        
        // Initialize modules
        user_profile::init_module_for_test(aptos_framework, admin);
        product::init_module_for_test(aptos_framework, admin);
        escrow::init_module_for_test(admin);
        
        // Cleanup capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    // ======================== Test Cases ========================

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    /// Test complete escrow flow: initiate -> deliver -> confirm
    fun test_complete_escrow_flow(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Register profiles
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer User"),
            string::utf8(b"USA"),
            1, // Buyer role
            string::utf8(b"buyer@example.com"),
            string::utf8(b"123 Buyer St"),
            string::utf8(b"I'm a buyer"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller User"),
            string::utf8(b"USA"),
            2, // Seller role
            string::utf8(b"seller@example.com"),
            string::utf8(b"456 Seller Ave"),
            string::utf8(b"I'm a seller"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"http://image1.com"));
        
        product::create_product(
            seller,
            string::utf8(b"Test Product"),
            string::utf8(b"Description"),
            500000000, // 5 APT per unit
            10,
            image_urls,
            string::utf8(b"Electronics"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        // Get buyer balance before
        let buyer_balance_before = coin::balance<AptosCoin>(buyer_addr);
        
        // Step 1: Initiate trade and lock funds
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            2, // quantity
            string::utf8(b"789 Delivery St, City"),
            string::utf8(b"tx_hash_12345"),
        );
        
        // Verify funds locked
        let buyer_balance_after = coin::balance<AptosCoin>(buyer_addr);
        assert!(buyer_balance_after == buyer_balance_before - 1000000000, 1); // 10 APT locked
        
        // Get escrow order
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        assert!(vector::length(&buyer_orders) == 1, 2);
        
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        // Verify escrow order details
        let (
            escrow_id,
            _product_addr,
            quantity,
            buyer_wallet,
            seller_wallet,
            unit_price,
            total_amount,
            tx_hash,
            delivery_code,
            receiving_code,
            status,
            locked_amount,
            shipping_addr,
            _created,
            _updated,
            delivered_at,
            completed_at,
        ) = escrow::get_escrow_order(escrow_order_obj);
        
        assert!(escrow_id == 1, 3);
        assert!(quantity == 2, 4);
        assert!(buyer_wallet == buyer_addr, 5);
        assert!(seller_wallet == seller_addr, 6);
        assert!(unit_price == 500000000, 7);
        assert!(total_amount == 1000000000, 8);
        assert!(tx_hash == string::utf8(b"tx_hash_12345"), 9);
        assert!(status == 2, 10); // HOLDING
        assert!(locked_amount == 1000000000, 11);
        assert!(delivered_at == 0, 12);
        assert!(completed_at == 0, 13);
        
        // Step 2: Seller delivers with delivery code
        timestamp::fast_forward_seconds(3600); // 1 hour later
        
        escrow::deliver_order(
            seller,
            escrow_order_obj,
            delivery_code,
        );
        
        // Verify status updated
        let new_status = escrow::get_escrow_status(escrow_order_obj);
        assert!(new_status == 3, 14); // DELIVERED
        
        // Step 3: Buyer confirms delivery with receiving code
        let seller_balance_before = coin::balance<AptosCoin>(seller_addr);
        
        timestamp::fast_forward_seconds(3600); // 1 hour later
        
        escrow::confirm_delivery_and_release_funds(
            buyer,
            escrow_order_obj,
            receiving_code,
        );
        
        // Verify status completed
        let final_status = escrow::get_escrow_status(escrow_order_obj);
        assert!(final_status == 4, 15); // COMPLETED
        
        // Verify funds released to seller
        let seller_balance_after = coin::balance<AptosCoin>(seller_addr);
        assert!(seller_balance_after == seller_balance_before + 1000000000, 16);
        
        // Verify funds no longer locked
        let remaining_locked = escrow::get_locked_amount(escrow_order_obj);
        assert!(remaining_locked == 0, 17);
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    /// Test multiple escrow orders
    fun test_multiple_escrow_orders(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Register profiles
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000, // 1 APT
            100,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        // Create 3 escrow orders
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            5,
            string::utf8(b"Address 1"),
            string::utf8(b"tx1"),
        );
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            3,
            string::utf8(b"Address 2"),
            string::utf8(b"tx2"),
        );
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            2,
            string::utf8(b"Address 3"),
            string::utf8(b"tx3"),
        );
        
        // Verify buyer has 3 orders
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        assert!(vector::length(&buyer_orders) == 3, 1);
        
        // Verify seller has 3 orders
        let seller_orders = escrow::get_seller_escrow_orders(seller_addr);
        assert!(vector::length(&seller_orders) == 3, 2);
        
        // Verify order count
        let count = escrow::get_buyer_order_count(buyer_addr);
        assert!(count == 3, 3);
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 2, location = message_board_addr::escrow)]
    /// Test only buyer can initiate trade
    fun test_only_buyer_can_trade(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller as seller (not buyer)
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2, // Seller role
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        // Try to initiate trade as seller (should fail)
        escrow::initiate_trade_and_lock_funds(
            seller,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 4, location = message_board_addr::escrow)]
    /// Test insufficient quantity (quantity check happens before funds check)
    fun test_insufficient_quantity(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Register profiles
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        // Create product with limited stock
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Limited Product"),
            string::utf8(b"Desc"),
            100000000, // 1 APT per unit
            5, // Only 5 units available
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        // Try to buy 100 units when only 5 available (should fail - insufficient quantity)
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            100,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 14, location = message_board_addr::escrow)]
    /// Test insufficient funds
    fun test_insufficient_funds(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Register profiles
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        // Create expensive product
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Expensive Product"),
            string::utf8(b"Desc"),
            50000000000, // 500 APT per unit
            100, // Many units available
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        // Try to buy 25 units (should fail - insufficient funds: need 12500 APT but buyer only has 10000 APT)
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            25,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 7, location = message_board_addr::escrow)]
    /// Test invalid delivery code
    fun test_invalid_delivery_code(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Register and create order
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        // Try to deliver with wrong code (should fail)
        escrow::deliver_order(
            seller,
            escrow_order_obj,
            string::utf8(b"000000"), // Wrong code
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 8, location = message_board_addr::escrow)]
    /// Test invalid receiving code
    fun test_invalid_receiving_code(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup and create order
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        let delivery_code = escrow::get_delivery_code(escrow_order_obj);
        
        // Deliver order
        escrow::deliver_order(
            seller,
            escrow_order_obj,
            delivery_code,
        );
        
        // Try to confirm with wrong code (should fail)
        escrow::confirm_delivery_and_release_funds(
            buyer,
            escrow_order_obj,
            string::utf8(b"0000"), // Wrong code
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    /// Test cancel escrow order
    fun test_cancel_escrow_order(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        let buyer_balance_before = coin::balance<AptosCoin>(buyer_addr);
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        // Cancel order
        escrow::cancel_escrow_order(
            buyer,
            escrow_order_obj,
            string::utf8(b"Changed my mind"),
        );
        
        // Verify status
        let status = escrow::get_escrow_status(escrow_order_obj);
        assert!(status == 5, 1); // CANCELLED
        
        // Verify refund
        let buyer_balance_after = coin::balance<AptosCoin>(buyer_addr);
        assert!(buyer_balance_after == buyer_balance_before, 2);
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 15, location = message_board_addr::escrow)]
    /// Test cannot cancel after delivered
    fun test_cannot_cancel_after_delivered(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        let delivery_code = escrow::get_delivery_code(escrow_order_obj);
        
        // Deliver order
        escrow::deliver_order(
            seller,
            escrow_order_obj,
            delivery_code,
        );
        
        // Try to cancel after delivered (should fail)
        escrow::cancel_escrow_order(
            buyer,
            escrow_order_obj,
            string::utf8(b"Too late"),
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 10, location = message_board_addr::escrow)]
    /// Test only seller can deliver
    fun test_only_seller_can_deliver(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        let delivery_code = escrow::get_delivery_code(escrow_order_obj);
        
        // Try to deliver as buyer (should fail)
        escrow::deliver_order(
            buyer,
            escrow_order_obj,
            delivery_code,
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    #[expected_failure(abort_code = 9, location = message_board_addr::escrow)]
    /// Test only buyer can confirm delivery
    fun test_only_buyer_can_confirm(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            1,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        let delivery_code = escrow::get_delivery_code(escrow_order_obj);
        let receiving_code = escrow::get_receiving_code(escrow_order_obj);
        
        // Deliver order
        escrow::deliver_order(
            seller,
            escrow_order_obj,
            delivery_code,
        );
        
        // Try to confirm as seller (should fail)
        escrow::confirm_delivery_and_release_funds(
            seller,
            escrow_order_obj,
            receiving_code,
        );
    }

    #[test(aptos_framework = @0x1, admin = @message_board_addr, buyer = @0x123, seller = @0x456)]
    /// Test view functions
    fun test_view_functions(
        aptos_framework: &signer,
        admin: &signer,
        buyer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, admin, buyer, seller);
        
        let buyer_addr = signer::address_of(buyer);
        let seller_addr = signer::address_of(seller);
        
        // Setup
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer"),
            string::utf8(b"USA"),
            1,
            string::utf8(b"buyer@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller"),
            string::utf8(b"USA"),
            2,
            string::utf8(b"seller@test.com"),
            string::utf8(b"Address"),
            string::utf8(b"Bio"),
        );
        
        let image_urls = vector::empty<string::String>();
        product::create_product(
            seller,
            string::utf8(b"Product"),
            string::utf8(b"Desc"),
            100000000,
            10,
            image_urls,
            string::utf8(b"Category"),
        );
        
        let seller_products = product::get_seller_products(seller_addr);
        let product_obj = object::address_to_object(*vector::borrow(&seller_products, 0));
        
        escrow::initiate_trade_and_lock_funds(
            buyer,
            product_obj,
            2,
            string::utf8(b"Address"),
            string::utf8(b"tx"),
        );
        
        let buyer_orders = escrow::get_buyer_escrow_orders(buyer_addr);
        let escrow_order_obj = object::address_to_object(*vector::borrow(&buyer_orders, 0));
        
        // Test view functions
        let is_locked = escrow::is_funds_locked(escrow_order_obj);
        assert!(is_locked == true, 1);
        
        let locked_amount = escrow::get_locked_amount(escrow_order_obj);
        assert!(locked_amount == 200000000, 2);
        
        let count = escrow::get_buyer_order_count(buyer_addr);
        assert!(count == 1, 3);
        
        let status = escrow::get_escrow_status(escrow_order_obj);
        assert!(status == 2, 4); // HOLDING
        
        let delivery_code = escrow::get_delivery_code(escrow_order_obj);
        assert!(string::length(&delivery_code) == 6, 5);
        
        let receiving_code = escrow::get_receiving_code(escrow_order_obj);
        assert!(string::length(&receiving_code) == 4, 6);
    }
}

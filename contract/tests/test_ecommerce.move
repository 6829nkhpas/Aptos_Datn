/// Comprehensive tests for the E-commerce Platform
/// Tests both user_profile and product modules
#[test_only]
module message_board_addr::ecommerce_tests {
    use std::signer;
    use std::string;
    use std::vector;
    
    use aptos_framework::timestamp;
    use aptos_framework::object;
    
    use message_board_addr::user_profile;
    use message_board_addr::product;

    // ======================== Test Setup ========================
    
    #[test_only]
    fun setup_test(aptos_framework: &signer, deployer: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        user_profile::init_module_for_test(aptos_framework, deployer);
        product::init_module_for_test(aptos_framework, deployer);
    }

    // ======================== User Profile Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x123)]
    fun test_register_seller_profile(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller profile
        user_profile::register_profile(
            seller,
            string::utf8(b"John Doe"),
            string::utf8(b"United States"),
            user_profile::get_seller_role(),
            string::utf8(b"john@example.com"),
            string::utf8(b"123 Main St, City, State, ZIP"),
            string::utf8(b"Experienced seller"),
        );
        
        // Verify profile exists
        assert!(user_profile::profile_exists(seller_addr), 1);
        assert!(user_profile::is_seller(seller_addr), 2);
        assert!(!user_profile::is_buyer(seller_addr), 3);
        assert!(user_profile::is_profile_active(seller_addr), 4);
        
        // Verify profile data using view functions
        assert!(user_profile::get_user_name(seller_addr) == string::utf8(b"John Doe"), 5);
        assert!(user_profile::get_user_email(seller_addr) == string::utf8(b"john@example.com"), 6);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, buyer = @0x124)]
    fun test_register_buyer_profile(
        aptos_framework: &signer,
        deployer: &signer,
        buyer: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let buyer_addr = signer::address_of(buyer);
        
        // Register buyer profile
        user_profile::register_profile(
            buyer,
            string::utf8(b"Jane Smith"),
            string::utf8(b"Canada"),
            user_profile::get_buyer_role(),
            string::utf8(b"jane@example.com"),
            string::utf8(b"456 Oak Ave, City, Province, Postal"),
            string::utf8(b"Love shopping online"),
        );
        
        // Verify profile
        assert!(user_profile::profile_exists(buyer_addr), 1);
        assert!(user_profile::is_buyer(buyer_addr), 2);
        assert!(!user_profile::is_seller(buyer_addr), 3);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, user = @0x125)]
    fun test_update_profile(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let user_addr = signer::address_of(user);
        
        // Register profile
        user_profile::register_profile(
            user,
            string::utf8(b"Original Name"),
            string::utf8(b"USA"),
            user_profile::get_buyer_role(),
            string::utf8(b"original@example.com"),
            string::utf8(b"123 Original St"),
            string::utf8(b"Original bio"),
        );
        
        // Update profile
        user_profile::update_profile(
            user,
            string::utf8(b"Updated Name"),
            string::utf8(b"Canada"),
            string::utf8(b"updated@example.com"),
            string::utf8(b"456 Updated Ave"),
            string::utf8(b"Updated bio"),
        );
        
        // Verify update using view functions
        assert!(user_profile::get_user_name(user_addr) == string::utf8(b"Updated Name"), 1);
        assert!(user_profile::get_user_email(user_addr) == string::utf8(b"updated@example.com"), 2);
        // Note: There's no get_user_country function, so we skip that check or use get_profile
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, user = @0x126)]
    fun test_deactivate_and_reactivate_profile(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let user_addr = signer::address_of(user);
        
        // Register and verify active
        user_profile::register_profile(
            user,
            string::utf8(b"Test User"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"test@example.com"),
            string::utf8(b"123 Test St"),
            string::utf8(b"Test bio"),
        );
        assert!(user_profile::is_profile_active(user_addr), 1);
        
        // Deactivate
        user_profile::deactivate_profile(user);
        assert!(!user_profile::is_profile_active(user_addr), 2);
        
        // Reactivate
        user_profile::reactivate_profile(user);
        assert!(user_profile::is_profile_active(user_addr), 3);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, user = @0x127)]
    #[expected_failure(abort_code = 1, location = message_board_addr::user_profile)]
    fun test_duplicate_profile_registration_fails(
        aptos_framework: &signer,
        deployer: &signer,
        user: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        // Register first time
        user_profile::register_profile(
            user,
            string::utf8(b"Test User"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"test@example.com"),
            string::utf8(b"123 Test St"),
            string::utf8(b"Test bio"),
        );
        
        // Try to register again - should fail
        user_profile::register_profile(
            user,
            string::utf8(b"Another Name"),
            string::utf8(b"Canada"),
            user_profile::get_buyer_role(),
            string::utf8(b"another@example.com"),
            string::utf8(b"456 Another St"),
            string::utf8(b"Another bio"),
        );
    }

    // ======================== Product Tests ========================
    
    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x200)]
    fun test_create_product(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller first
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image2.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Laptop Computer"),
            string::utf8(b"High-performance laptop with 16GB RAM"),
            150000, // $1,500.00 in cents
            10,
            image_urls,
            string::utf8(b"Electronics"),
        );
        
        // Verify seller has products
        assert!(product::seller_has_products(seller_addr), 1);
        
        let products = product::get_seller_products(seller_addr);
        assert!(vector::length(&products) == 1, 2);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, buyer = @0x201)]
    #[expected_failure(abort_code = 1, location = message_board_addr::product)]
    fun test_buyer_cannot_create_product(
        aptos_framework: &signer,
        deployer: &signer,
        buyer: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        // Register as buyer
        user_profile::register_profile(
            buyer,
            string::utf8(b"Buyer Name"),
            string::utf8(b"USA"),
            user_profile::get_buyer_role(),
            string::utf8(b"buyer@example.com"),
            string::utf8(b"123 Buyer St"),
            string::utf8(b"Love shopping"),
        );
        
        // Try to create product - should fail
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        
        product::create_product(
            buyer,
            string::utf8(b"Test Product"),
            string::utf8(b"Test Description"),
            10000,
            5,
            image_urls,
            string::utf8(b"Test"),
        );
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x202)]
    fun test_update_product(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        // Create product
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Original Product"),
            string::utf8(b"Original Description"),
            10000,
            10,
            image_urls,
            string::utf8(b"Original Category"),
        );
        
        // Get product object
        let products = product::get_seller_products(seller_addr);
        let product_addr = *vector::borrow(&products, 0);
        let product_obj = object::address_to_object<product::Product>(product_addr);
        
        // Update product
        let new_image_urls = vector::empty<string::String>();
        vector::push_back(&mut new_image_urls, string::utf8(b"https://s3.amazonaws.com/new_image.jpg"));
        
        product::update_product(
            seller,
            product_obj,
            string::utf8(b"Updated Product"),
            string::utf8(b"Updated Description"),
            20000,
            new_image_urls,
            string::utf8(b"Updated Category"),
        );
        
        // Verify update
        let (title, description, price, _, _, _, category, _, _, _, _, _) = 
            product::get_product(product_obj);
        assert!(title == string::utf8(b"Updated Product"), 1);
        assert!(description == string::utf8(b"Updated Description"), 2);
        assert!(price == 20000, 3);
        assert!(category == string::utf8(b"Updated Category"), 4);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x203)]
    fun test_inventory_management(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller and create product
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Test Product"),
            string::utf8(b"Test Description"),
            10000,
            10,
            image_urls,
            string::utf8(b"Test"),
        );
        
        let products = product::get_seller_products(seller_addr);
        let product_addr = *vector::borrow(&products, 0);
        let product_obj = object::address_to_object<product::Product>(product_addr);
        
        // Check initial quantity
        assert!(product::get_quantity_left(product_obj) == 10, 1);
        
        // Add inventory
        product::update_inventory(seller, product_obj, 5);
        assert!(product::get_quantity_left(product_obj) == 15, 2);
        
        // Reduce inventory
        product::reduce_inventory(seller, product_obj, 3);
        assert!(product::get_quantity_left(product_obj) == 12, 3);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x204)]
    fun test_product_availability(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller and create product
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Test Product"),
            string::utf8(b"Test Description"),
            10000,
            10,
            image_urls,
            string::utf8(b"Test"),
        );
        
        let products = product::get_seller_products(seller_addr);
        let product_addr = *vector::borrow(&products, 0);
        let product_obj = object::address_to_object<product::Product>(product_addr);
        
        // Check initially available
        assert!(product::is_product_available(product_obj), 1);
        
        // Make unavailable
        product::set_product_availability(seller, product_obj, false);
        assert!(!product::is_product_available(product_obj), 2);
        
        // Make available again
        product::set_product_availability(seller, product_obj, true);
        assert!(product::is_product_available(product_obj), 3);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x205)]
    fun test_delete_product(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller and create product
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        let image_urls = vector::empty<string::String>();
        vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image1.jpg"));
        
        product::create_product(
            seller,
            string::utf8(b"Test Product"),
            string::utf8(b"Test Description"),
            10000,
            10,
            image_urls,
            string::utf8(b"Test"),
        );
        
        let products = product::get_seller_products(seller_addr);
        let product_addr = *vector::borrow(&products, 0);
        let product_obj = object::address_to_object<product::Product>(product_addr);
        
        // Delete product
        product::delete_product(seller, product_obj);
        
        // Verify deleted
        assert!(product::is_product_deleted(product_obj), 1);
        assert!(!product::is_product_available(product_obj), 2);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, seller = @0x206)]
    fun test_multiple_products_by_seller(
        aptos_framework: &signer,
        deployer: &signer,
        seller: &signer,
    ) {
        setup_test(aptos_framework, deployer);
        
        let seller_addr = signer::address_of(seller);
        
        // Register seller
        user_profile::register_profile(
            seller,
            string::utf8(b"Seller Name"),
            string::utf8(b"USA"),
            user_profile::get_seller_role(),
            string::utf8(b"seller@example.com"),
            string::utf8(b"123 Seller St"),
            string::utf8(b"Professional seller"),
        );
        
        // Create multiple products
        let i = 0;
        while (i < 5) {
            let image_urls = vector::empty<string::String>();
            vector::push_back(&mut image_urls, string::utf8(b"https://s3.amazonaws.com/image.jpg"));
            
            product::create_product(
                seller,
                string::utf8(b"Test Product"),
                string::utf8(b"Test Description"),
                10000,
                10,
                image_urls,
                string::utf8(b"Test"),
            );
            i = i + 1;
        };
        
        // Verify all products created
        let products = product::get_seller_products(seller_addr);
        assert!(vector::length(&products) == 5, 1);
    }
}

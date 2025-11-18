/// User Profile Module for E-commerce Platform
/// Handles user registration and profile management for both buyers and sellers
module ecommerce_platform::user_profile {
    use std::signer;
    use std::string::String;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // ======================== Error Codes ========================
    
    /// User profile already exists
    const ERR_PROFILE_ALREADY_EXISTS: u64 = 1;
    
    /// User profile does not exist
    const ERR_PROFILE_NOT_FOUND: u64 = 2;
    
    /// Only profile owner can update their profile
    const ERR_NOT_PROFILE_OWNER: u64 = 3;
    
    /// Invalid role provided
    const ERR_INVALID_ROLE: u64 = 4;

    // ======================== Constants ========================
    
    /// Role: Buyer
    const ROLE_BUYER: u8 = 1;
    
    /// Role: Seller
    const ROLE_SELLER: u8 = 2;

    // ======================== Structs ========================
    
    /// User Profile structure containing all user information
    struct UserProfile has key, store, copy, drop {
        /// User's full name
        name: String,
        /// Wallet address (stored for reference)
        wallet_address: address,
        /// Country of residence
        country: String,
        /// User role: 1 = Buyer, 2 = Seller
        role: u8,
        /// Email address
        email: String,
        /// Physical shipping/billing address
        physical_address: String,
        /// User bio/description
        bio: String,
        /// Profile creation timestamp
        created_at: u64,
        /// Last profile update timestamp
        updated_at: u64,
        /// Profile active status
        is_active: bool,
    }

    // ======================== Events ========================
    
    #[event]
    /// Event emitted when a new user profile is created
    struct ProfileCreatedEvent has drop, store {
        wallet_address: address,
        name: String,
        role: u8,
        created_at: u64,
    }

    #[event]
    /// Event emitted when a user profile is updated
    struct ProfileUpdatedEvent has drop, store {
        wallet_address: address,
        updated_at: u64,
    }

    #[event]
    /// Event emitted when a user profile is deactivated
    struct ProfileDeactivatedEvent has drop, store {
        wallet_address: address,
        deactivated_at: u64,
    }

    #[event]
    /// Event emitted when a user profile is reactivated
    struct ProfileReactivatedEvent has drop, store {
        wallet_address: address,
        reactivated_at: u64,
    }

    // ======================== Initialization ========================
    
    /// Initialize module (called once on deployment)
    fun init_module(_sender: &signer) {}

    // ======================== Entry Functions (Write) ========================
    
    /// Register a new user profile
    /// @param sender - The signer creating the profile
    /// @param name - User's full name
    /// @param country - Country of residence
    /// @param role - User role (1 = Buyer, 2 = Seller)
    /// @param email - Email address
    /// @param physical_address - Physical shipping/billing address
    /// @param bio - User bio/description
    public entry fun register_profile(
        sender: &signer,
        name: String,
        country: String,
        role: u8,
        email: String,
        physical_address: String,
        bio: String,
    ) {
        let sender_addr = signer::address_of(sender);
        
        // Validate role
        assert!(role == ROLE_BUYER || role == ROLE_SELLER, ERR_INVALID_ROLE);
        
        // Check if profile already exists
        assert!(!exists<UserProfile>(sender_addr), ERR_PROFILE_ALREADY_EXISTS);
        
        let now = timestamp::now_seconds();
        
        // Create new profile
        let profile = UserProfile {
            name,
            wallet_address: sender_addr,
            country,
            role,
            email,
            physical_address,
            bio,
            created_at: now,
            updated_at: now,
            is_active: true,
        };
        
        // Store profile
        move_to(sender, profile);
        
        // Emit event
        event::emit(ProfileCreatedEvent {
            wallet_address: sender_addr,
            name,
            role,
            created_at: now,
        });
    }

    /// Update user profile information
    /// @param sender - The profile owner
    /// @param name - Updated name
    /// @param country - Updated country
    /// @param email - Updated email
    /// @param physical_address - Updated physical address
    /// @param bio - Updated bio
    public entry fun update_profile(
        sender: &signer,
        name: String,
        country: String,
        email: String,
        physical_address: String,
        bio: String,
    ) acquires UserProfile {
        let sender_addr = signer::address_of(sender);
        
        // Check if profile exists
        assert!(exists<UserProfile>(sender_addr), ERR_PROFILE_NOT_FOUND);
        
        let profile = borrow_global_mut<UserProfile>(sender_addr);
        let now = timestamp::now_seconds();
        
        // Update profile fields
        profile.name = name;
        profile.country = country;
        profile.email = email;
        profile.physical_address = physical_address;
        profile.bio = bio;
        profile.updated_at = now;
        
        // Emit event
        event::emit(ProfileUpdatedEvent {
            wallet_address: sender_addr,
            updated_at: now,
        });
    }

    /// Deactivate user profile
    /// @param sender - The profile owner
    public entry fun deactivate_profile(sender: &signer) acquires UserProfile {
        let sender_addr = signer::address_of(sender);
        
        // Check if profile exists
        assert!(exists<UserProfile>(sender_addr), ERR_PROFILE_NOT_FOUND);
        
        let profile = borrow_global_mut<UserProfile>(sender_addr);
        profile.is_active = false;
        profile.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(ProfileDeactivatedEvent {
            wallet_address: sender_addr,
            deactivated_at: timestamp::now_seconds(),
        });
    }

    /// Reactivate user profile
    /// @param sender - The profile owner
    public entry fun reactivate_profile(sender: &signer) acquires UserProfile {
        let sender_addr = signer::address_of(sender);
        
        // Check if profile exists
        assert!(exists<UserProfile>(sender_addr), ERR_PROFILE_NOT_FOUND);
        
        let profile = borrow_global_mut<UserProfile>(sender_addr);
        profile.is_active = true;
        profile.updated_at = timestamp::now_seconds();
        
        // Emit event
        event::emit(ProfileReactivatedEvent {
            wallet_address: sender_addr,
            reactivated_at: timestamp::now_seconds(),
        });
    }

    // ======================== View Functions (Read) ========================
    
    #[view]
    /// Get complete user profile information
    /// @param user_addr - Address of the user
    /// @return UserProfile struct with all user information
    public fun get_profile(user_addr: address): UserProfile acquires UserProfile {
        assert!(exists<UserProfile>(user_addr), ERR_PROFILE_NOT_FOUND);
        *borrow_global<UserProfile>(user_addr)
    }

    #[view]
    /// Check if user profile exists
    /// @param user_addr - Address to check
    /// @return true if profile exists, false otherwise
    public fun profile_exists(user_addr: address): bool {
        exists<UserProfile>(user_addr)
    }

    #[view]
    /// Get user role
    /// @param user_addr - Address of the user
    /// @return role (1 = Buyer, 2 = Seller)
    public fun get_user_role(user_addr: address): u8 acquires UserProfile {
        assert!(exists<UserProfile>(user_addr), ERR_PROFILE_NOT_FOUND);
        borrow_global<UserProfile>(user_addr).role
    }

    #[view]
    /// Check if user is a seller
    /// @param user_addr - Address of the user
    /// @return true if seller, false otherwise
    public fun is_seller(user_addr: address): bool acquires UserProfile {
        if (!exists<UserProfile>(user_addr)) {
            return false
        };
        borrow_global<UserProfile>(user_addr).role == ROLE_SELLER
    }

    #[view]
    /// Check if user is a buyer
    /// @param user_addr - Address of the user
    /// @return true if buyer, false otherwise
    public fun is_buyer(user_addr: address): bool acquires UserProfile {
        if (!exists<UserProfile>(user_addr)) {
            return false
        };
        borrow_global<UserProfile>(user_addr).role == ROLE_BUYER
    }

    #[view]
    /// Check if profile is active
    /// @param user_addr - Address of the user
    /// @return true if active, false otherwise
    public fun is_profile_active(user_addr: address): bool acquires UserProfile {
        if (!exists<UserProfile>(user_addr)) {
            return false
        };
        borrow_global<UserProfile>(user_addr).is_active
    }

    #[view]
    /// Get user name
    /// @param user_addr - Address of the user
    /// @return User's name
    public fun get_user_name(user_addr: address): String acquires UserProfile {
        assert!(exists<UserProfile>(user_addr), ERR_PROFILE_NOT_FOUND);
        borrow_global<UserProfile>(user_addr).name
    }

    #[view]
    /// Get user email
    /// @param user_addr - Address of the user
    /// @return User's email
    public fun get_user_email(user_addr: address): String acquires UserProfile {
        assert!(exists<UserProfile>(user_addr), ERR_PROFILE_NOT_FOUND);
        borrow_global<UserProfile>(user_addr).email
    }

    // ======================== Helper Functions ========================
    
    /// Get role constant for buyer
    public fun get_buyer_role(): u8 {
        ROLE_BUYER
    }

    /// Get role constant for seller
    public fun get_seller_role(): u8 {
        ROLE_SELLER
    }

    // ======================== Test Helper Functions ========================
    
    #[test_only]
    public fun init_module_for_test(aptos_framework: &signer, sender: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        init_module(sender);
    }
}

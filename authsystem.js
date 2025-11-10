// Authentication System - User registration, login, and level-based trial management
class AuthSystem {
    constructor() {
        this.AUTH_KEY = 'euneus_auth_data';
        this.SESSION_KEY = 'euneus_session';
        this.TRIAL_KEY = 'euneus_trial_data';
        
        // Trial settings (level-based instead of time-based)
        this.TRIAL_MAX_LEVEL = 1; // Can only play level 1 in trial
        
        this.currentUser = null;
        this.trialActive = false;
    }
    
    // Initialize authentication on game start
    init() {
        console.log('🔐 Initializing Auth System...');
        
        // Check for existing session
        const session = this.loadSession();
        if (session) {
            this.currentUser = session;
            console.log('✅ User logged in:', session.username);
            return { authenticated: true, user: session };
        }
        
        // Check trial mode
        const trialData = this.loadTrialData();
        if (trialData) {
            console.log('⏱️ Trial mode active - Level limit:', this.TRIAL_MAX_LEVEL);
            this.trialActive = true;
            return { 
                authenticated: false, 
                trialMode: true,
                maxLevel: this.TRIAL_MAX_LEVEL
            };
        }
        
        // New user - no trial started yet
        console.log('🆕 New user');
        return { authenticated: false, trialMode: false };
    }
    
    // Start trial mode
    startTrial() {
        const trialData = {
            startedAt: Date.now(),
            levelsPlayed: 0,
            highestLevel: 0
        };
        localStorage.setItem(this.TRIAL_KEY, JSON.stringify(trialData));
        this.trialActive = true;
        console.log('⏱️ Trial started - Can play up to level', this.TRIAL_MAX_LEVEL);
        return true;
    }
    
    // Check if level is accessible in trial mode
    canAccessLevel(levelNumber) {
        // Authenticated users can access any level
        if (this.isAuthenticated() && !this.isPremium()) {
            return true; // Free registered users can play all levels
        }
        
        // Premium users can access any level
        if (this.isPremium()) {
            return true;
        }
        
        // Trial users can only access level 1
        if (this.trialActive) {
            return levelNumber <= this.TRIAL_MAX_LEVEL;
        }
        
        // Not logged in and no trial - can access level 1
        return levelNumber <= this.TRIAL_MAX_LEVEL;
    }
    
    // Update trial data when level is completed
    updateTrialProgress(levelNumber) {
        if (!this.trialActive) return;
        
        const trialData = this.loadTrialData();
        if (trialData) {
            trialData.levelsPlayed++;
            trialData.highestLevel = Math.max(trialData.highestLevel, levelNumber);
            localStorage.setItem(this.TRIAL_KEY, JSON.stringify(trialData));
        }
    }
    
    // Check if user is trying to access a level beyond trial limit
    shouldShowTrialBlock(levelNumber) {
        return this.trialActive && levelNumber > this.TRIAL_MAX_LEVEL && !this.isAuthenticated();
    }
    
    // Register new user
    async register(username, email, password) {
        try {
            // Validate inputs
            if (!username || username.length < 3) {
                return { success: false, error: 'Username must be at least 3 characters' };
            }
            
            if (!email || !this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email address' };
            }
            
            if (!password || password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }
            
            // Check if user already exists
            const users = this.loadAllUsers();
            if (users[email]) {
                return { success: false, error: 'Email already registered' };
            }
            
            // Hash password (simple hash for demo - use bcrypt in production)
            const hashedPassword = this.hashPassword(password);
            
            // Create user
            const user = {
                username: username,
                email: email,
                password: hashedPassword,
                createdAt: Date.now(),
                isPremium: false,
                trialUsed: this.trialActive
            };
            
            // Save user
            users[email] = user;
            this.saveAllUsers(users);
            
            // Create session
            this.createSession(user);
            
            // Clear trial data on registration
            this.trialActive = false;
            
            console.log('✅ User registered:', username);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    }
    
    // Login existing user
    async login(email, password) {
        try {
            const users = this.loadAllUsers();
            const user = users[email];
            
            if (!user) {
                return { success: false, error: 'Email not found' };
            }
            
            const hashedPassword = this.hashPassword(password);
            if (user.password !== hashedPassword) {
                return { success: false, error: 'Incorrect password' };
            }
            
            // Create session
            this.createSession(user);
            
            // Clear trial mode
            this.trialActive = false;
            
            console.log('✅ User logged in:', user.username);
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }
    
    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.SESSION_KEY);
        console.log('👋 User logged out');
    }
    
    // Create session
    createSession(user) {
        const session = {
            username: user.username,
            email: user.email,
            isPremium: user.isPremium,
            loginTime: Date.now()
        };
        
        this.currentUser = session;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
    
    // Load session
    loadSession() {
        try {
            const json = localStorage.getItem(this.SESSION_KEY);
            if (!json) return null;
            return JSON.parse(json);
        } catch (error) {
            console.error('❌ Failed to load session:', error);
            return null;
        }
    }
    
    // Load trial data
    loadTrialData() {
        try {
            const json = localStorage.getItem(this.TRIAL_KEY);
            if (!json) return null;
            return JSON.parse(json);
        } catch (error) {
            console.error('❌ Failed to load trial data:', error);
            return null;
        }
    }
    
    // Load all users
    loadAllUsers() {
        try {
            const json = localStorage.getItem(this.AUTH_KEY);
            if (!json) return {};
            return JSON.parse(json);
        } catch (error) {
            console.error('❌ Failed to load users:', error);
            return {};
        }
    }
    
    // Save all users
    saveAllUsers(users) {
        try {
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(users));
        } catch (error) {
            console.error('❌ Failed to save users:', error);
        }
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    // Check if user has premium access
    isPremium() {
        return this.currentUser && this.currentUser.isPremium;
    }
    
    // Upgrade to premium (simulate purchase)
    async upgradeToPremium() {
        if (!this.currentUser) return false;
        
        const users = this.loadAllUsers();
        const user = users[this.currentUser.email];
        
        if (user) {
            user.isPremium = true;
            user.premiumSince = Date.now();
            this.saveAllUsers(users);
            
            this.currentUser.isPremium = true;
            this.createSession(this.currentUser);
            
            console.log('💎 User upgraded to premium');
            return true;
        }
        
        return false;
    }
    
    // Simple password hash (use bcrypt in production!)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    
    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Get trial info for display
    getTrialInfo() {
        return {
            active: this.trialActive,
            maxLevel: this.TRIAL_MAX_LEVEL,
            message: `Trial: Play up to Level ${this.TRIAL_MAX_LEVEL}`
        };
    }
}

// Make available globally
const authSystem = new AuthSystem();

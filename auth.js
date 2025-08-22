// Authentication system using localStorage
// This is for prototyping only - not suitable for production

class AuthSystem {
    constructor() {
        this.storageKeys = {
            users: 'impulsa_users',
            currentSession: 'impulsa_session'
        };
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize users array if it doesn't exist
        if (!localStorage.getItem(this.storageKeys.users)) {
            localStorage.setItem(this.storageKeys.users, JSON.stringify([]));
        }
    }

    // Simple password hashing (for demo only)
    hashPassword(password) {
        // This is NOT secure - just for prototyping
        return btoa(password + 'impulsa_salt');
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    // Get all users from localStorage
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.users)) || [];
        } catch (e) {
            console.error('Error parsing users data:', e);
            return [];
        }
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
    }

    // Check if email already exists
    emailExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Register new user
    registerUser(userData) {
        try {
            const { email, password, empresa, cnpj, telefone } = userData;

            // Validate required fields
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios');
            }

            // Check if email already exists
            if (this.emailExists(email)) {
                throw new Error('Este e-mail já está cadastrado');
            }

            // Validate password strength
            if (password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                email: email.toLowerCase(),
                password: this.hashPassword(password),
                empresa: empresa || '',
                cnpj: cnpj || '',
                telefone: telefone || '',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            // Save user
            const users = this.getUsers();
            users.push(newUser);
            this.saveUsers(users);

            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Login user
    loginUser(email, password, rememberMe = false) {
        try {
            if (!email || !password) {
                throw new Error('Email e senha são obrigatórios');
            }

            const users = this.getUsers();
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === this.hashPassword(password)
            );

            if (!user) {
                throw new Error('E-mail ou senha incorretos');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers(users);

            // Create session
            const session = this.createSession(user, rememberMe);

            return { success: true, user, session };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create user session
    createSession(user, rememberMe = false) {
        const session = {
            userId: user.id,
            token: this.generateSessionToken(),
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            expiresAt: rememberMe 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        localStorage.setItem(this.storageKeys.currentSession, JSON.stringify(session));
        return session;
    }

    // Check if user is authenticated
    isAuthenticated() {
        try {
            const session = JSON.parse(localStorage.getItem(this.storageKeys.currentSession));
            
            if (!session) return false;

            // Check if session has expired
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);
            
            if (now > expiresAt) {
                this.clearSession();
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }

    // Get current user data
    getCurrentUser() {
        try {
            if (!this.isAuthenticated()) return null;

            const session = JSON.parse(localStorage.getItem(this.storageKeys.currentSession));
            const users = this.getUsers();
            
            return users.find(user => user.id === session.userId) || null;
        } catch (e) {
            return null;
        }
    }

    // Clear current session
    clearSession() {
        localStorage.removeItem(this.storageKeys.currentSession);
    }

    // Logout user
    logoutUser() {
        this.clearSession();
        window.location.href = '/login.html';
    }

    // Update user profile
    updateUserProfile(userId, updates) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                throw new Error('Usuário não encontrado');
            }

            // Update user data
            users[userIndex] = { ...users[userIndex], ...updates };
            this.saveUsers(users);

            return { success: true, user: users[userIndex] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Create global auth instance
const auth = new AuthSystem();

// Global helper functions
function isAuthenticated() {
    return auth.isAuthenticated();
}

function getCurrentUser() {
    return auth.getCurrentUser();
}

function logout() {
    auth.logoutUser();
}

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkPasswordStrength(password) {
    const strength = {
        score: 0,
        feedback: []
    };

    if (password.length >= 6) strength.score += 1;
    else strength.feedback.push('Pelo menos 6 caracteres');

    if (/[A-Z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Uma letra maiúscula');

    if (/[0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Um número');

    if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Um caractere especial');

    return strength;
}

// Show/hide error messages
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Button loading states
function setButtonLoading(button, loading = true) {
    const textSpan = button.querySelector('.button-text');
    const spinner = button.querySelector('.loading-spinner');
    
    if (loading) {
        textSpan.style.display = 'none';
        spinner.style.display = 'inline';
        button.disabled = true;
    } else {
        textSpan.style.display = 'inline';
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

// Initialize signup form
function initializeSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const cnpjInput = document.getElementById('cnpj');
    const telefoneInput = document.getElementById('telefone');

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('emailError', 'E-mail inválido');
        } else {
            hideError('emailError');
        }
    });

    passwordInput.addEventListener('input', function() {
        const strength = checkPasswordStrength(this.value);
        const strengthElement = document.getElementById('passwordStrength');
        
        if (this.value.length > 0) {
            let strengthText = '';
            let strengthClass = '';
            
            if (strength.score <= 1) {
                strengthText = 'Fraca';
                strengthClass = 'weak';
            } else if (strength.score <= 2) {
                strengthText = 'Média';
                strengthClass = 'medium';
            } else {
                strengthText = 'Forte';
                strengthClass = 'strong';
            }
            
            strengthElement.innerHTML = `Força da senha: <span class="strength-${strengthClass}">${strengthText}</span>`;
            strengthElement.style.display = 'block';
        } else {
            strengthElement.style.display = 'none';
        }
    });

    confirmPasswordInput.addEventListener('blur', function() {
        if (this.value && this.value !== passwordInput.value) {
            showError('confirmPasswordError', 'As senhas não coincidem');
        } else {
            hideError('confirmPasswordError');
        }
    });

    // Format CNPJ and phone inputs
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            e.target.value = formatCNPJ(e.target.value);
        });
    }

    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhone(e.target.value);
        });
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearAllErrors();

        const formData = new FormData(form);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            empresa: formData.get('empresa'),
            cnpj: formData.get('cnpj'),
            telefone: formData.get('telefone'),
            terms: formData.get('terms')
        };

        // Validation
        let hasErrors = false;

        if (!validateEmail(userData.email)) {
            showError('emailError', 'E-mail inválido');
            hasErrors = true;
        }

        if (userData.password.length < 6) {
            showError('passwordError', 'A senha deve ter pelo menos 6 caracteres');
            hasErrors = true;
        }

        if (userData.password !== userData.confirmPassword) {
            showError('confirmPasswordError', 'As senhas não coincidem');
            hasErrors = true;
        }

        if (!userData.terms) {
            showError('termsError', 'Você deve aceitar os termos de uso');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading
        const submitButton = form.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true);

        // Simulate network delay
        setTimeout(() => {
            const result = auth.registerUser(userData);
            
            setButtonLoading(submitButton, false);

            if (result.success) {
                // Track registration
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'sign_up', {
                        method: 'email'
                    });
                }

                alert('Conta criada com sucesso! Redirecionando para o login...');
                window.location.href = '/login.html';
            } else {
                showError('emailError', result.error);
            }
        }, 1000);
    });
}

// Initialize login form
function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        clearAllErrors();

        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        // Validation
        if (!validateEmail(loginData.email)) {
            showError('emailError', 'E-mail inválido');
            return;
        }

        if (!loginData.password) {
            showError('passwordError', 'Senha é obrigatória');
            return;
        }

        // Show loading
        const submitButton = form.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true);

        // Simulate network delay
        setTimeout(() => {
            const result = auth.loginUser(loginData.email, loginData.password, loginData.rememberMe);
            
            setButtonLoading(submitButton, false);

            if (result.success) {
                // Track login
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'login', {
                        method: 'email'
                    });
                }

                window.location.href = '/dashboard.html';
            } else {
                showError('passwordError', result.error);
            }
        }, 1000);
    });
}

// Authentication guard for protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Redirect if already authenticated (for login/signup pages)
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard.html';
        return true;
    }
    return false;
}
// Form validation and interactivity
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('simulationForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    // Brazilian formatting functions
    function formatCNPJ(value) {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .substring(0, 18);
    }
    
    function formatPhone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
            .substring(0, 15);
    }
    
    function formatCurrency(value) {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        
        const number = parseInt(numericValue, 10) / 100;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(number);
    }
    
    // Input formatting
    const cnpjInput = document.getElementById('cnpj');
    const phoneInput = document.getElementById('phone');
    const amountInput = document.getElementById('amount');
    
    cnpjInput.addEventListener('input', function(e) {
        e.target.value = formatCNPJ(e.target.value);
    });
    
    phoneInput.addEventListener('input', function(e) {
        e.target.value = formatPhone(e.target.value);
    });
    
    amountInput.addEventListener('input', function(e) {
        e.target.value = formatCurrency(e.target.value);
    });
    
    // Validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function validateCNPJ(cnpj) {
        const numbers = cnpj.replace(/\D/g, '');
        
        // Check if has 14 digits
        if (numbers.length !== 14) return false;
        
        // Check if all digits are the same (invalid CNPJ)
        if (/^(\d)\1+$/.test(numbers)) return false;
        
        // Validate first check digit
        let sum = 0;
        let weight = 5;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(numbers[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        let remainder = sum % 11;
        let firstDigit = remainder < 2 ? 0 : 11 - remainder;
        
        if (parseInt(numbers[12]) !== firstDigit) return false;
        
        // Validate second check digit
        sum = 0;
        weight = 6;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(numbers[i]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        remainder = sum % 11;
        let secondDigit = remainder < 2 ? 0 : 11 - remainder;
        
        return parseInt(numbers[13]) === secondDigit;
    }
    
    function validatePhone(phone) {
        const numbers = phone.replace(/\D/g, '');
        return numbers.length >= 10 && numbers.length <= 11;
    }
    
    function validateRequired(value) {
        return value.trim().length > 0;
    }
    
    // Show error message
    function showError(input, message) {
        input.classList.add('error');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }
    
    // Clear error message
    function clearError(input) {
        input.classList.remove('error');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    // Validate individual field
    function validateField(input) {
        const value = input.value;
        const id = input.id;
        let isValid = true;
        
        clearError(input);
        
        switch (id) {
            case 'companyName':
                if (!validateRequired(value)) {
                    showError(input, 'Nome da empresa é obrigatório');
                    isValid = false;
                } else if (value.trim().length < 2) {
                    showError(input, 'Nome da empresa deve ter pelo menos 2 caracteres');
                    isValid = false;
                }
                break;
                
            case 'cnpj':
                if (!validateRequired(value)) {
                    showError(input, 'CNPJ é obrigatório');
                    isValid = false;
                } else if (!validateCNPJ(value)) {
                    showError(input, 'CNPJ inválido. Verifique os dígitos informados');
                    isValid = false;
                }
                break;
                
            case 'email':
                if (!validateRequired(value)) {
                    showError(input, 'E-mail é obrigatório');
                    isValid = false;
                } else if (!validateEmail(value)) {
                    showError(input, 'E-mail inválido');
                    isValid = false;
                }
                break;
                
            case 'phone':
                if (!validateRequired(value)) {
                    showError(input, 'WhatsApp é obrigatório');
                    isValid = false;
                } else if (!validatePhone(value)) {
                    showError(input, 'Número de telefone inválido');
                    isValid = false;
                }
                break;
                
            case 'amount':
                if (!validateRequired(value)) {
                    showError(input, 'Valor a antecipar é obrigatório');
                    isValid = false;
                } else {
                    const numericValue = value.replace(/\D/g, '');
                    if (!numericValue || parseInt(numericValue, 10) < 10000) {
                        showError(input, 'Valor mínimo é R$ 100,00');
                        isValid = false;
                    }
                }
                break;
                
            case 'description':
                if (!validateRequired(value)) {
                    showError(input, 'Descrição é obrigatória');
                    isValid = false;
                } else if (value.trim().length < 10) {
                    showError(input, 'Descrição deve ter pelo menos 10 caracteres');
                    isValid = false;
                }
                break;
        }
        
        return isValid;
    }
    
    // Add real-time validation
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Always prevent default to handle with AJAX
        
        let isFormValid = true;
        
        // Validate all fields
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            // Scroll to first error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                firstError.focus();
            }
            return false;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.classList.add('loading');
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        // Prepare form data for submission
        const formData = new FormData(form);
        
        // Clean values for submission (remove formatting)
        const cnpjInput = form.querySelector('#cnpj');
        const phoneInput = form.querySelector('#phone');
        const amountInput = form.querySelector('#amount');
        
        formData.set('cnpj', cnpjInput.value.replace(/\D/g, ''));
        formData.set('telefone', phoneInput.value.replace(/\D/g, ''));
        const cleanAmount = amountInput.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
        formData.set('valor-antecipar', cleanAmount);
        
        // Submit form via AJAX to Netlify
        fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                // Success - show modal
                showSuccessModal();
                
                // Track successful submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'Form',
                        event_label: 'Simulation Success'
                    });
                }
                
                // Reset form
                form.reset();
                inputs.forEach(input => clearError(input));
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            
            // Track form error
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_error', {
                    event_category: 'Form',
                    event_label: error.message
                });
            }
            
            // Show user-friendly error message
            const errorMessage = error.message.includes('Failed to fetch') 
                ? 'Erro de conexão. Verifique sua internet e tente novamente.'
                : 'Erro ao enviar formulário. Por favor, tente novamente.';
                
            alert(errorMessage);
        })
        .finally(() => {
            // Always reset button state
            submitButton.classList.remove('loading');
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // "Simular Agora" and "Quero Impulsionar Agora" buttons scroll to form
    const simulateButtons = document.querySelectorAll('.cta-button.primary, .cta-button.white');
    simulateButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = document.querySelector('.form-card');
            if (form) {
                form.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // Focus on first input
                const firstInput = form.querySelector('input');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 500);
                }
            }
        });
    });
    
    // Add loading animation for hover effects
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
    
    // Mobile menu toggle (if needed for smaller screens)
    function toggleMobileMenu() {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('mobile-open');
    }
    
    // Add mobile menu styles if screen is very small
    if (window.innerWidth < 480) {
        const headerContainer = document.querySelector('.header .container');
        const nav = document.querySelector('.nav');
        
        // Create mobile menu button
        const menuButton = document.createElement('button');
        menuButton.innerHTML = '☰';
        menuButton.className = 'mobile-menu-toggle';
        menuButton.style.cssText = `
            display: block;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #374151;
        `;
        
        // Hide navigation on mobile initially
        nav.style.display = 'none';
        
        headerContainer.appendChild(menuButton);
        
        menuButton.addEventListener('click', function() {
            if (nav.style.display === 'none') {
                nav.style.display = 'flex';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.backgroundColor = 'white';
                nav.style.flexDirection = 'column';
                nav.style.padding = '1rem';
                nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                menuButton.innerHTML = '✕';
            } else {
                nav.style.display = 'none';
                menuButton.innerHTML = '☰';
            }
        });
    }
    
    // Modal functionality
    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Show success modal
    window.showSuccessModal = function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };
    
    // Hide success modal
    function hideSuccessModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    // Close modal when clicking X
    closeModal.addEventListener('click', hideSuccessModal);
    
    // Close modal when clicking button
    closeModalBtn.addEventListener('click', hideSuccessModal);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideSuccessModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            hideSuccessModal();
        }
    });
});

// Calculadora de Antecipação
function calculateAdvance() {
    // Obter valores dos inputs
    const invoiceValueInput = document.getElementById('calc-invoice-value');
    const daysInput = document.getElementById('calc-days');
    const rateInput = document.getElementById('calc-rate');
    
    // Limpar formatação e converter para número
    let cleanValue = invoiceValueInput.value
        .replace(/[R$\s]/g, '') // Remove R$, espaços
        .replace(/\./g, '') // Remove pontos (separadores de milhares)
        .replace(',', '.'); // Troca vírgula por ponto decimal
    
    console.log('Valor original:', invoiceValueInput.value);
    console.log('Valor limpo:', cleanValue);
    
    const invoiceValue = parseFloat(cleanValue) || 0;
    console.log('Valor numérico:', invoiceValue);
    const days = parseInt(daysInput.value) || 0;
    const monthlyRate = parseFloat(rateInput.value) || 0;
    
    // Validações
    if (invoiceValue <= 0) {
        alert('Por favor, insira um valor válido para a nota fiscal.');
        invoiceValueInput.focus();
        return;
    }
    
    if (days <= 0 || days > 365) {
        alert('Por favor, insira um número válido de dias (1 a 365).');
        daysInput.focus();
        return;
    }
    
    if (monthlyRate <= 0 || monthlyRate > 10) {
        alert('Por favor, insira uma taxa válida (0.1% a 10%).');
        rateInput.focus();
        return;
    }
    
    // Cálculos corrigidos
    // Converter taxa mensal para taxa diária
    const dailyRate = monthlyRate / 30; // Taxa diária em %
    console.log('Taxa mensal:', monthlyRate + '%');
    console.log('Taxa diária:', dailyRate.toFixed(4) + '%');
    
    // Calcular taxa total para o período
    const totalRatePercent = (dailyRate * days) / 100; // Taxa em decimal
    console.log('Taxa total para', days, 'dias:', (totalRatePercent * 100).toFixed(2) + '%');
    
    // Calcular valor da taxa em reais
    const rateAmount = invoiceValue * totalRatePercent;
    console.log('Valor da taxa:', formatCurrency(rateAmount));
    
    // Valor líquido que o cliente recebe
    const finalValue = invoiceValue - rateAmount;
    console.log('Valor final:', formatCurrency(finalValue));
    
    // Atualizar resultados
    document.getElementById('original-value').textContent = formatCurrency(invoiceValue);
    document.getElementById('applied-rate').textContent = formatCurrency(rateAmount);
    document.getElementById('final-value').textContent = formatCurrency(finalValue);
    document.getElementById('time-saved').textContent = `${days} dias`;
    
    // Adicionar animação aos resultados
    const results = document.querySelectorAll('.result-value');
    results.forEach(result => {
        result.style.transform = 'scale(1.05)';
        result.style.color = '#0ea5e9';
        setTimeout(() => {
            result.style.transform = 'scale(1)';
            if (!result.closest('.highlight')) {
                result.style.color = '#111827';
            }
        }, 200);
    });
}

// Formatação de moeda brasileira
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatação automática de campos
document.addEventListener('DOMContentLoaded', function() {
    // Campo de valor na calculadora
    const invoiceInput = document.getElementById('calc-invoice-value');
    
    // Campo de valor no formulário principal  
    const amountInput = document.getElementById('amount');
    
    // Campo CNPJ
    const cnpjInput = document.getElementById('cnpj');
    
    // Campo telefone
    const phoneInput = document.getElementById('phone');
    
    if (invoiceInput) {
        invoiceInput.addEventListener('input', function(e) {
            // Remove tudo que não é dígito
            let value = e.target.value.replace(/\D/g, '');
            if (value) {
                // Converte centavos para reais (divide por 100)
                const numericValue = parseInt(value, 10) / 100;
                e.target.value = formatCurrency(numericValue);
            } else {
                e.target.value = '';
            }
        });
        
        // Enter key para calcular
        invoiceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateAdvance();
            }
        });
    }
    
    // Campo de valor do formulário principal - formato monetário brasileiro
    if (amountInput) {
        amountInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value) {
                // Converte centavos para reais (divide por 100)
                const numericValue = parseInt(value, 10) / 100;
                e.target.value = formatCurrency(numericValue);
            } else {
                e.target.value = '';
            }
        });
    }
    
    // Campo CNPJ
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function(e) {
            e.target.value = formatCNPJ(e.target.value);
        });
    }
    
    // Campo telefone com DDD completo
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Formatar com DDD
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/^(\d{0,2})/, '($1');
                } else if (value.length <= 7) {
                    value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                } else if (value.length <= 10) {
                    value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            
            e.target.value = value.substring(0, 15); // Limita tamanho
        });
    }
    
    // Enter key para todos os campos da calculadora
    const calcInputs = document.querySelectorAll('#calc-days, #calc-rate');
    calcInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateAdvance();
            }
        });
    });
    
    // Validação em tempo real para dias
    const daysInput = document.getElementById('calc-days');
    if (daysInput) {
        daysInput.addEventListener('input', function(e) {
            if (e.target.value > 365) {
                e.target.value = 365;
            }
            if (e.target.value < 0) {
                e.target.value = 1;
            }
        });
    }
    
    // Validação em tempo real para taxa
    const rateInput = document.getElementById('calc-rate');
    if (rateInput) {
        rateInput.addEventListener('input', function(e) {
            if (e.target.value > 10) {
                e.target.value = 10;
            }
            if (e.target.value < 0) {
                e.target.value = 0.1;
            }
        });
    }
    
    // Google Analytics - Eventos customizados
    function trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'User Interaction',
                event_label: parameters.label || '',
                value: parameters.value || 0,
                ...parameters
            });
        }
        
        // GTM DataLayer
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: eventName,
                ...parameters
            });
        }
    }
    
    // Tracking de eventos importantes
    // Track page view
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
    
    // Track form interactions
    const formInputs = document.querySelectorAll('#simulationForm input, #simulationForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            trackEvent('form_interaction', {
                event_category: 'Form',
                event_label: `focus_${this.id}`,
                field_name: this.id
            });
        });
    });
    
    // Track calculator usage
    const calcButton = document.querySelector('.calc-button');
    if (calcButton) {
        calcButton.addEventListener('click', function() {
            trackEvent('calculator_used', {
                event_category: 'Engagement',
                event_label: 'Calculate Advance'
            });
        });
    }
    
    // Track CTA clicks
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            trackEvent('cta_click', {
                event_category: 'Conversion',
                event_label: this.textContent.trim(),
                button_position: index + 1
            });
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            trackEvent('scroll_depth', {
                event_category: 'Engagement',
                event_label: `${scrollPercent}%`,
                value: scrollPercent
            });
        }
    });
    
    // Track FAQ interactions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            trackEvent('faq_interaction', {
                event_category: 'Engagement',
                event_label: this.textContent.trim()
            });
        });
    });
});
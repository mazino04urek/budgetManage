class ExpenseFormManager {
    constructor() {
        this.selectedCategory = null;
        this.init();
    }

    init() {
        this.loadTodayData();
        this.bindEvents();
        this.setDefaultDate();
    }

    loadTodayData() {
        // Mock today's data
        const todayExpenses = [
            { name: 'Lunch', time: '2:30 PM', amount: 12.50, category: 'food' },
            { name: 'Coffee', time: '10:15 AM', amount: 4.50, category: 'food' },
            { name: 'Notebook', time: '9:00 AM', amount: 20.50, category: 'education' }
        ];

        const total = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        document.getElementById('today-total').textContent = this.formatCurrency(total);
        document.getElementById('today-count').textContent = `${todayExpenses.length} expense${todayExpenses.length !== 1 ? 's' : ''}`;
    }

    bindEvents() {
        // Category selection
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCategory(e.currentTarget);
            });
        });

        // Form submission
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                this.handleSubmit(e);
            });
        }

        // Real-time form validation
        const amountInput = document.getElementById('amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.validateAmount();
            });
        }

        // Auto-focus amount input
        if (amountInput) {
            amountInput.focus();
        }
    }

    selectCategory(button) {
        // Remove selection from other buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select the clicked button
        button.classList.add('selected');
        this.selectedCategory = button.dataset.category;

        // Add selection animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    validateAmount() {
        const amountInput = document.getElementById('amount');
        const amount = parseFloat(amountInput.value);
        
        if (amount <= 0 || isNaN(amount)) {
            amountInput.style.borderColor = 'var(--danger)';
            return false;
        } else {
            amountInput.style.borderColor = 'var(--primary)';
            return true;
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Get form data
        const formData = this.getFormData();
        
        // Show success animation
        this.showSuccessAnimation();
        
        // Save expense (in real app, this would save to localStorage/API)
        console.log('Saving expense:', formData);
        
        // Reset form
        setTimeout(() => {
            this.resetForm();
            this.updateTodayExpenses(formData);
        }, 1500);
    }

    validateForm() {
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return false;
        }

        if (!this.selectedCategory) {
            this.showError('Please select a category');
            return false;
        }

        if (!date) {
            this.showError('Please select a date');
            return false;
        }

        return true;
    }

    getFormData() {
        return {
            amount: parseFloat(document.getElementById('amount').value),
            category: this.selectedCategory,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value,
            recurring: document.getElementById('recurring').checked,
            timestamp: new Date().toISOString()
        };
    }

    showSuccessAnimation() {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Added Successfully!';
        submitBtn.style.background = 'var(--success)';
        submitBtn.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.style.transform = '';
        }, 1500);
    }

    showError(message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: var(--danger);
            color: white;
            padding: var(--space-md);
            border-radius: var(--radius-md);
            margin: var(--space-md) 0;
            animation: slideIn 0.3s ease;
        `;

        // Insert error message
        const form = document.getElementById('expense-form');
        form.insertBefore(errorDiv, form.firstChild);

        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    resetForm() {
        document.getElementById('expense-form').reset();
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.selectedCategory = null;
        this.setDefaultDate();
    }

    setDefaultDate() {
        const dateInput = document.getElementById('date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    updateTodayExpenses(newExpense) {
        // Update today's total
        const currentTotal = parseFloat(document.getElementById('today-total').textContent.replace(/[^0-9.-]/g, ''));
        const newTotal = currentTotal + newExpense.amount;
        
        document.getElementById('today-total').textContent = this.formatCurrency(newTotal);
        
        // Update count
        const currentCount = parseInt(document.getElementById('today-count').textContent.match(/\d+/)[0]);
        const newCount = currentCount + 1;
        document.getElementById('today-count').textContent = `${newCount} expense${newCount !== 1 ? 's' : ''}`;

        // Add expense to list
        const expensesList = document.getElementById('today-expenses');
        const expenseElement = this.createExpenseElement(newExpense);
        expensesList.insertBefore(expenseElement, expensesList.firstChild);

        // Animate new expense
        expenseElement.style.opacity = '0';
        expenseElement.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            expenseElement.style.transition = 'all 0.3s ease';
            expenseElement.style.opacity = '1';
            expenseElement.style.transform = 'translateX(0)';
        }, 100);
    }

    createExpenseElement(expense) {
        const div = document.createElement('div');
        div.className = 'today-expense';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        div.innerHTML = `
            <div class="expense-icon ${expense.category}">
                <i class="fas ${this.getCategoryIcon(expense.category)}"></i>
            </div>
            <div class="expense-info">
                <span class="expense-name">${expense.description || this.getCategoryName(expense.category)}</span>
                <span class="expense-time">${timeString}</span>
            </div>
            <span class="expense-amount">${this.formatCurrency(expense.amount)}</span>
        `;

        return div;
    }

    getCategoryIcon(category) {
        const icons = {
            food: 'fa-utensils',
            transport: 'fa-bus',
            shopping: 'fa-shopping-cart',
            entertainment: 'fa-film',
            education: 'fa-book',
            health: 'fa-heart',
            bills: 'fa-file-invoice-dollar',
            other: 'fa-ellipsis-h'
        };
        return icons[category] || 'fa-ellipsis-h';
    }

    getCategoryName(category) {
        const names = {
            food: 'Food',
            transport: 'Transport',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            education: 'Education',
            health: 'Health',
            bills: 'Bills',
            other: 'Other'
        };
        return names[category] || 'Other';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize expense form manager
document.addEventListener('DOMContentLoaded', () => {
    new ExpenseFormManager();
});
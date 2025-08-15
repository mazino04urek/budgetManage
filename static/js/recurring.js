class RecurringExpensesManager {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.renderExpenses();
        this.bindEvents();
        this.calculateTotals();
    }

    loadData() {
        return {
            recurring: [
                {
                    id: 1,
                    name: 'Rent',
                    amount: 450,
                    category: 'bills',
                    frequency: 'monthly',
                    nextDate: '2025-01-01',
                    icon: 'fa-home'
                },
                {
                    id: 2,
                    name: 'Bus Pass',
                    amount: 75,
                    category: 'transport',
                    frequency: 'monthly',
                    nextDate: '2025-01-05',
                    icon: 'fa-bus'
                },
                {
                    id: 3,
                    name: 'Spotify Premium',
                    amount: 9.99,
                    category: 'entertainment',
                    frequency: 'monthly',
                    nextDate: '2025-01-15',
                    icon: 'fa-music'
                },
                {
                    id: 4,
                    name: 'Gym Membership',
                    amount: 29,
                    category: 'health',
                    frequency: 'monthly',
                    nextDate: '2025-01-20',
                    icon: 'fa-dumbbell'
                },
                {
                    id: 5,
                    name: 'Internet',
                    amount: 45,
                    category: 'bills',
                    frequency: 'monthly',
                    nextDate: '2025-01-25',
                    icon: 'fa-wifi'
                }
            ],
            oneTime: [
                {
                    id: 1,
                    name: 'Textbook: Advanced Mathematics',
                    amount: 120,
                    category: 'education',
                    date: '2024-12-20',
                    icon: 'fa-book'
                },
                {
                    id: 2,
                    name: 'Winter Jacket',
                    amount: 85,
                    category: 'shopping',
                    date: '2024-12-18',
                    icon: 'fa-tshirt'
                },
                {
                    id: 3,
                    name: 'Movie Night with Friends',
                    amount: 45,
                    category: 'entertainment',
                    date: '2024-12-15',
                    icon: 'fa-film'
                },
                {
                    id: 4,
                    name: 'Birthday Dinner',
                    amount: 68,
                    category: 'food',
                    date: '2024-12-12',
                    icon: 'fa-birthday-cake'
                },
                {
                    id: 5,
                    name: 'Prescription Medication',
                    amount: 35,
                    category: 'health',
                    date: '2024-12-10',
                    icon: 'fa-pills'
                },
                {
                    id: 6,
                    name: 'Gas for Road Trip',
                    amount: 32,
                    category: 'transport',
                    date: '2024-12-08',
                    icon: 'fa-gas-pump'
                }
            ]
        };
    }

    renderExpenses() {
        this.renderRecurringExpenses();
        this.renderOneTimeExpenses();
    }

    renderRecurringExpenses() {
        const container = document.getElementById('recurring-list');
        if (!container) return;

        container.innerHTML = this.data.recurring.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="expense-icon ${expense.category}">
                    <i class="fas ${expense.icon}"></i>
                </div>
                <div class="expense-details">
                    <h4>${expense.name}</h4>
                    <div class="expense-meta">
                        <span class="frequency">${this.capitalize(expense.frequency)}</span>
                        <span class="next-date">Next: ${this.formatDate(expense.nextDate)}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <span class="amount">${this.formatCurrency(expense.amount)}</span>
                    <button class="edit-btn" onclick="editExpense(${expense.id}, 'recurring')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expense.id}, 'recurring')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderOneTimeExpenses() {
        const container = document.getElementById('onetime-list');
        if (!container) return;

        container.innerHTML = this.data.oneTime.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="expense-icon ${expense.category}">
                    <i class="fas ${expense.icon}"></i>
                </div>
                <div class="expense-details">
                    <h4>${expense.name}</h4>
                    <div class="expense-meta">
                        <span class="date">${this.formatDate(expense.date)}</span>
                        <span class="category">${this.capitalize(expense.category)}</span>
                    </div>
                </div>
                <div class="expense-actions">
                    <span class="amount">${this.formatCurrency(expense.amount)}</span>
                    <button class="edit-btn" onclick="editExpense(${expense.id}, 'onetime')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteExpense(${expense.id}, 'onetime')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Add recurring expense button
        const addRecurringBtn = document.getElementById('add-recurring');
        if (addRecurringBtn) {
            addRecurringBtn.addEventListener('click', () => {
                this.showAddExpenseModal('recurring');
            });
        }

        // Filter one-time expenses
        const filterBtn = document.getElementById('filter-onetime');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showFilterModal();
            });
        }

        // Animate expense items on hover
        this.addHoverEffects();
    }

    addHoverEffects() {
        const expenseItems = document.querySelectorAll('.expense-item');
        
        expenseItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(8px)';
                item.style.background = 'rgba(255, 255, 255, 0.1)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
                item.style.background = '';
            });
        });
    }

    calculateTotals() {
        // Calculate recurring total
        const recurringTotal = this.data.recurring.reduce((sum, expense) => sum + expense.amount, 0);
        const recurringElement = document.querySelector('.recurring-card .total-amount');
        if (recurringElement) {
            recurringElement.textContent = `${this.formatCurrency(recurringTotal)}/month`;
        }

        // Calculate one-time total
        const oneTimeTotal = this.data.oneTime.reduce((sum, expense) => sum + expense.amount, 0);
        const oneTimeElement = document.querySelector('.onetime-card .total-amount');
        if (oneTimeElement) {
            oneTimeElement.textContent = `${this.formatCurrency(oneTimeTotal)} this month`;
        }
    }

    showAddExpenseModal(type) {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'expense-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Add ${this.capitalize(type)} Expense</h3>
                    <button class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" name="amount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select name="category" required>
                            <option value="">Select category</option>
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="shopping">Shopping</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="education">Education</option>
                            <option value="health">Health</option>
                            <option value="bills">Bills</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    ${type === 'recurring' ? `
                        <div class="form-group">
                            <label>Frequency</label>
                            <select name="frequency" required>
                                <option value="weekly">Weekly</option>
                                <option value="monthly" selected>Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Next Due Date</label>
                            <input type="date" name="nextDate" required>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" name="date" required>
                        </div>
                    `}
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn">Add Expense</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal events
        this.bindModalEvents(modal, type);

        // Show modal with animation
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    bindModalEvents(modal, type) {
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const overlay = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('.modal-form');

        // Close modal events
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element.addEventListener('click', () => {
                this.closeModal(modal);
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleModalSubmit(e, type, modal);
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        });
    }

    handleModalSubmit(e, type, modal) {
        const formData = new FormData(e.target);
        const expense = {
            id: Date.now(),
            name: formData.get('name'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category')
        };

        if (type === 'recurring') {
            expense.frequency = formData.get('frequency');
            expense.nextDate = formData.get('nextDate');
            expense.icon = this.getCategoryIcon(expense.category);
            this.data.recurring.push(expense);
        } else {
            expense.date = formData.get('date');
            expense.icon = this.getCategoryIcon(expense.category);
            this.data.oneTime.push(expense);
        }

        // Re-render and close modal
        this.renderExpenses();
        this.calculateTotals();
        this.closeModal(modal);

        // Show success notification
        this.showNotification('Expense added successfully!', 'success');
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.remove();
        }, 300);
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : 'primary'});
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Global functions for inline onclick handlers
function editExpense(id, type) {
    console.log(`Edit ${type} expense with ID: ${id}`);
    // Implement edit functionality
}

function deleteExpense(id, type) {
    if (confirm('Are you sure you want to delete this expense?')) {
        console.log(`Delete ${type} expense with ID: ${id}`);
        // Implement delete functionality
    }
}

// Initialize recurring expenses manager
document.addEventListener('DOMContentLoaded', () => {
    new RecurringExpensesManager();
});
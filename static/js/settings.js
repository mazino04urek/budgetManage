class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const defaultSettings = {
            budgetGoal: 2000,
            savingsGoal: 500,
            currency: 'USD',
            weekStart: 'monday',
            theme: 'light',
            glassIntensity: 3,
            animationSpeed: 'normal',
            budgetAlerts: true,
            loggingReminders: true,
            savingsUpdates: true,
            smartTips: true
        };

        const saved = localStorage.getItem('budgetBuddySettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    init() {
        this.populateForm();
        this.bindEvents();
        this.updateThemeOptions();
    }

    populateForm() {
        // Personal settings
        this.setInputValue('budget-goal', this.settings.budgetGoal);
        this.setInputValue('savings-goal', this.settings.savingsGoal);
        this.setSelectValue('currency-select', this.settings.currency);
        this.setSelectValue('week-start', this.settings.weekStart);

        // Appearance settings
        this.setRangeValue('glass-intensity', this.settings.glassIntensity);
        this.setSelectValue('animation-speed', this.settings.animationSpeed);

        // Notification settings
        this.setCheckboxValue('budget-alerts', this.settings.budgetAlerts);
        this.setCheckboxValue('logging-reminders', this.settings.loggingReminders);
        this.setCheckboxValue('savings-updates', this.settings.savingsUpdates);
        this.setCheckboxValue('smart-tips', this.settings.smartTips);
    }

    bindEvents() {
        // Theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectTheme(e.currentTarget);
            });
        });

        // Glass intensity slider
        const glassSlider = document.getElementById('glass-intensity');
        if (glassSlider) {
            glassSlider.addEventListener('input', (e) => {
                this.updateGlassIntensity(e.target.value);
            });
        }

        // Data management buttons
        const exportBtn = document.querySelector('.export-btn');
        const importBtn = document.querySelector('.import-btn');
        const resetBtn = document.getElementById('reset-data');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAllData());
        }

        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Import file handler
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleFileImport(e));
        }

        // Real-time setting updates
        this.bindRealTimeUpdates();
    }

    bindRealTimeUpdates() {
        // Budget and savings goals
        ['budget-goal', 'savings-goal'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updatePreview();
                });
            }
        });

        // Currency selector
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.updateCurrencyDisplay();
            });
        }
    }

    selectTheme(option) {
        // Remove active class from all options
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('active');
        });

        // Add active class to selected option
        option.classList.add('active');

        const theme = option.dataset.theme;
        this.settings.theme = theme;

        // Apply theme immediately
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        this.animateThemeChange();
    }

    animateThemeChange() {
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    updateGlassIntensity(value) {
        const intensity = parseInt(value);
        this.settings.glassIntensity = intensity;

        // Apply glass intensity to CSS variables
        const alpha = 0.1 + (intensity * 0.05); // 0.15 to 0.35
        const blur = 15 + (intensity * 5); // 20px to 40px

        document.documentElement.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${alpha})`);
        document.documentElement.style.setProperty('--glass-backdrop', `blur(${blur}px)`);
    }

    updateThemeOptions() {
        const currentTheme = this.settings.theme;
        const themeOption = document.querySelector(`[data-theme="${currentTheme}"]`);
        if (themeOption) {
            this.selectTheme(themeOption);
        }
    }

    updatePreview() {
        // Update budget goal preview
        const budgetGoal = parseFloat(document.getElementById('budget-goal').value) || 0;
        const savingsGoal = parseFloat(document.getElementById('savings-goal').value) || 0;

        // Show preview of changes
        this.showPreview(`Budget: ${this.formatCurrency(budgetGoal)}, Savings: ${this.formatCurrency(savingsGoal)}`);
    }

    updateCurrencyDisplay() {
        const currency = document.getElementById('currency-select').value;
        this.settings.currency = currency;
        
        // Update all currency displays immediately
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            CAD: 'C$',
            AUD: 'A$'
        };

        // Update input icons
        const inputIcons = document.querySelectorAll('.input-icon');
        inputIcons.forEach(icon => {
            if (icon.textContent.includes('$') || icon.textContent.includes('€') || icon.textContent.includes('£')) {
                icon.textContent = currencySymbols[currency] || '$';
            }
        });
    }

    showPreview(message) {
        const preview = document.createElement('div');
        preview.className = 'settings-preview';
        preview.textContent = message;
        preview.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-lg);
            z-index: 1000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;

        document.body.appendChild(preview);

        setTimeout(() => {
            preview.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            preview.style.transform = 'translateY(100%)';
            setTimeout(() => preview.remove(), 300);
        }, 2000);
    }

    saveSettings() {
        // Collect all form values
        this.settings.budgetGoal = parseFloat(document.getElementById('budget-goal').value) || 2000;
        this.settings.savingsGoal = parseFloat(document.getElementById('savings-goal').value) || 500;
        this.settings.currency = document.getElementById('currency-select').value;
        this.settings.weekStart = document.getElementById('week-start').value;
        this.settings.animationSpeed = document.getElementById('animation-speed').value;
        this.settings.budgetAlerts = document.getElementById('budget-alerts').checked;
        this.settings.loggingReminders = document.getElementById('logging-reminders').checked;
        this.settings.savingsUpdates = document.getElementById('savings-updates').checked;
        this.settings.smartTips = document.getElementById('smart-tips').checked;

        // Save to localStorage
        localStorage.setItem('budgetBuddySettings', JSON.stringify(this.settings));

        // Show success animation
        this.showSaveSuccess();
    }

    showSaveSuccess() {
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Settings Saved!';
        saveBtn.style.background = 'var(--success)';
        saveBtn.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
            saveBtn.style.transform = '';
        }, 2000);
    }

    exportData() {
        // Mock data export
        const data = {
            settings: this.settings,
            expenses: [], // Would contain actual expense data
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.populateForm();
                    this.saveSettings();
                    this.showNotification('Settings imported successfully!', 'success');
                }
            } catch (error) {
                this.showNotification('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    resetAllData() {
        if (!confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            return;
        }

        // Clear localStorage
        localStorage.removeItem('budgetBuddySettings');
        localStorage.removeItem('budgetBuddyExpenses');

        // Reset to defaults
        this.settings = this.loadSettings();
        this.populateForm();

        this.showNotification('All data has been reset', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'});
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

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Utility methods
    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) input.value = value;
    }

    setSelectValue(id, value) {
        const select = document.getElementById(id);
        if (select) select.value = value;
    }

    setRangeValue(id, value) {
        const range = document.getElementById(id);
        if (range) range.value = value;
    }

    setCheckboxValue(id, value) {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = value;
    }

    formatCurrency(amount) {
        const currency = this.settings.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
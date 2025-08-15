class DashboardManager {
    constructor() {
        this.data = this.loadData();
        this.chart = null;
        this.init();
    }

    init() {
        this.updateSavingsProgress();
        this.updateQuickStats();
        this.initChart();
        this.bindEvents();
        this.animateCounters();
    }

    loadData() {
        // Mock data - in a real app, this would come from localStorage or API
        return {
            savingsGoal: 500,
            currentSavings: 325,
            monthlyBudget: 2000,
            currentSpend: 1245,
            expenses: [
                { amount: 12.50, category: 'food', date: new Date(), description: 'Lunch at Campus Café' },
                { amount: 25.00, category: 'transport', date: new Date(Date.now() - 86400000), description: 'Bus Pass' },
                { amount: 65.30, category: 'shopping', date: new Date(Date.now() - 172800000), description: 'Grocery Shopping' }
            ],
            loggingStreak: 12
        };
    }

    updateSavingsProgress() {
        const percentage = Math.round((this.data.currentSavings / this.data.savingsGoal) * 100);
        const remaining = this.data.savingsGoal - this.data.currentSavings;

        // Update progress circle
        const progressPath = document.getElementById('progress-path');
        if (progressPath) {
            progressPath.style.strokeDasharray = `${percentage}, 100`;
        }

        // Update text elements
        this.updateElement('savings-percentage', `${percentage}%`);
        this.updateElement('saved-amount', this.formatCurrency(this.data.currentSavings));
        this.updateElement('goal-amount', this.formatCurrency(this.data.savingsGoal));
        this.updateElement('remaining-amount', this.formatCurrency(remaining));
    }

    updateQuickStats() {
        const remainingBudget = this.data.monthlyBudget - this.data.currentSpend;
        const avgDaily = Math.round(this.data.currentSpend / new Date().getDate());

        this.updateElement('current-spend', this.formatCurrency(this.data.currentSpend));
        this.updateElement('remaining-budget', this.formatCurrency(remainingBudget));
        this.updateElement('avg-daily', this.formatCurrency(avgDaily));
        this.updateElement('logging-streak', this.data.loggingStreak);
    }

    initChart() {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        // Mock data for the chart
        const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = {
            labels,
            datasets: [{
                label: 'Expenses',
                data: [280, 320, 290, 355],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };

        const config = {
            type: 'line',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Expenses: ${context.formattedValue}`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.8)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.8)',
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: 'rgba(16, 185, 129, 1)'
                    }
                }
            }
        };

        this.chart = new Chart(ctx, config);
    }

    bindEvents() {
        // View toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                toggleButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateViewPeriod(e.target.dataset.view);
            });
        });

        // Chart period selector
        const chartPeriod = document.getElementById('chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateChartPeriod(e.target.value);
            });
        }
    }

    updateViewPeriod(period) {
        // Update the savings display based on selected period
        if (period === 'weekly') {
            const weeklyGoal = Math.round(this.data.savingsGoal / 4);
            const weeklySaved = Math.round(this.data.currentSavings / 4);
            
            this.updateElement('goal-amount', this.formatCurrency(weeklyGoal));
            this.updateElement('saved-amount', this.formatCurrency(weeklySaved));
            this.updateElement('remaining-amount', this.formatCurrency(weeklyGoal - weeklySaved));
        } else {
            this.updateSavingsProgress();
        }
    }

    updateChartPeriod(period) {
        if (!this.chart) return;

        let labels, data;
        
        switch (period) {
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [45, 32, 78, 56, 89, 67, 43];
                break;
            case 'year':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = [1200, 1100, 1350, 1280, 1400, 1320, 1250, 1380, 1290, 1340, 1310, 1280];
                break;
            default:
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [280, 320, 290, 355];
        }

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('active');
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-value, .percentage, .amount');
        
        const animateValue = (element, start, end, duration) => {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;
            const isPercentage = element.textContent.includes('%');
            const isCurrency = element.textContent.includes('$');
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                
                let displayValue = Math.round(current);
                if (isCurrency) {
                    displayValue = this.formatCurrency(displayValue);
                } else if (isPercentage) {
                    displayValue = displayValue + '%';
                }
                
                element.textContent = displayValue;
            }, 16);
        };

        // Animate elements on page load
        setTimeout(() => {
            counters.forEach(counter => {
                const finalValue = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                if (finalValue > 0) {
                    animateValue(counter, 0, finalValue, 1000);
                }
            });
        }, 500);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
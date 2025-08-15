class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.initCharts();
        this.bindEvents();
        this.loadInsights();
    }

    loadData() {
        // Mock data for analytics
        return {
            categories: {
                food: 420,
                transport: 180,
                shopping: 250,
                entertainment: 150,
                education: 200,
                health: 80,
                bills: 450,
                other: 120
            },
            trends: {
                weekly: [280, 320, 290, 355, 310, 275, 345],
                monthly: [1200, 1350, 1180, 1420, 1290, 1380]
            },
            recurring: 820,
            oneTime: 385
        };
    }

    initCharts() {
        this.initCategoryChart();
        this.initTrendChart();
        this.initComparisonChart();
    }

    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const data = {
            labels: Object.keys(this.data.categories).map(cat => 
                cat.charAt(0).toUpperCase() + cat.slice(1)
            ),
            datasets: [{
                data: Object.values(this.data.categories),
                backgroundColor: [
                    '#f59e0b', // food
                    '#3b82f6', // transport
                    '#8b5cf6', // shopping
                    '#ef4444', // entertainment
                    '#10b981', // education
                    '#f97316', // health
                    '#6b7280', // bills
                    '#64748b'  // other
                ],
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                hoverBorderWidth: 3,
                hoverBorderColor: 'rgba(255, 255, 255, 0.8)'
            }]
        };

        const config = {
            type: 'doughnut',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-secondary)',
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: $${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '65%',
                elements: {
                    arc: {
                        borderWidth: 2
                    }
                }
            }
        };

        this.charts.category = new Chart(ctx, config);
    }

    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Spending',
                data: this.data.trends.monthly,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 3,
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
            type: 'bar',
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
                        callbacks: {
                            label: function(context) {
                                return `Spending: $${context.formattedValue}`;
                            }
                        }
                    }
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
                    bar: {
                        borderRadius: 8,
                        borderSkipped: false
                    }
                }
            }
        };

        this.charts.trend = new Chart(ctx, config);
    }

    initComparisonChart() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;

        const data = {
            labels: ['Recurring', 'One-time'],
            datasets: [{
                data: [this.data.recurring, this.data.oneTime],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(14, 165, 233, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(14, 165, 233, 1)'
                ],
                borderWidth: 2
            }]
        };

        const config = {
            type: 'pie',
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
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: $${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.comparison = new Chart(ctx, config);
    }

    bindEvents() {
        // Period selectors
        const pieSelect = document.getElementById('pie-period');
        const trendSelect = document.getElementById('trend-period');

        if (pieSelect) {
            pieSelect.addEventListener('change', (e) => {
                this.updateCategoryChart(e.target.value);
            });
        }

        if (trendSelect) {
            trendSelect.addEventListener('change', (e) => {
                this.updateTrendChart(e.target.value);
            });
        }
    }

    updateCategoryChart(period) {
        if (!this.charts.category) return;

        // Mock data update based on period
        let multiplier = 1;
        switch (period) {
            case 'week':
                multiplier = 0.25;
                break;
            case 'year':
                multiplier = 12;
                break;
        }

        const newData = Object.values(this.data.categories).map(val => 
            Math.round(val * multiplier)
        );

        this.charts.category.data.datasets[0].data = newData;
        this.charts.category.update('active');
    }

    updateTrendChart(period) {
        if (!this.charts.trend) return;

        if (period === 'week') {
            this.charts.trend.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            this.charts.trend.data.datasets[0].data = this.data.trends.weekly;
        } else {
            this.charts.trend.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            this.charts.trend.data.datasets[0].data = this.data.trends.monthly;
        }

        this.charts.trend.update('active');
    }

    loadInsights() {
        // Animate insights on load
        const insightCards = document.querySelectorAll('.insight-card');
        
        insightCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });

        // Animate coach advice
        setTimeout(() => {
            const coachAdvice = document.querySelector('.coach-advice');
            if (coachAdvice) {
                coachAdvice.style.opacity = '0';
                coachAdvice.style.transform = 'scale(0.9)';
                coachAdvice.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    coachAdvice.style.opacity = '1';
                    coachAdvice.style.transform = 'scale(1)';
                }, 100);
            }
        }, 1000);
    }
}

// Initialize analytics manager
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsManager();
});
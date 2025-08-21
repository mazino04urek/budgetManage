class QRScannerManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.hasCamera = false;
        this.selectedApp = null;
        this.scanHistory = this.loadScanHistory();
        this.init();
    }

    init() {
        this.checkCameraSupport();
        this.bindEvents();
        this.updateScanCount();
        this.renderHistory();
    }

    async checkCameraSupport() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            this.hasCamera = true;
        } catch (error) {
            this.hasCamera = false;
            this.showError('Camera access is required for QR scanning');
        }
    }

    bindEvents() {
        // Camera toggle
        const toggleBtn = document.getElementById('toggle-camera');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCamera();
            });
        }

        // Switch camera
        const switchBtn = document.getElementById('switch-camera');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => {
                this.switchCamera();
            });
        }

        // Upload image
        const uploadBtn = document.getElementById('upload-image');
        const fileInput = document.getElementById('file-input');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // Flash toggle
        const flashBtn = document.getElementById('toggle-flash');
        if (flashBtn) {
            flashBtn.addEventListener('click', () => {
                this.toggleFlash();
            });
        }

        // Clear results
        const clearBtn = document.getElementById('clear-results');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearResults();
            });
        }

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = document.getElementById('upi-modal');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-payment');
        const proceedBtn = document.getElementById('proceed-payment');
        const overlay = modal?.querySelector('.modal-overlay');

        // Close modal events
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element?.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // UPI app selection
        const appButtons = document.querySelectorAll('.upi-app-btn');
        appButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectUPIApp(btn);
            });
        });

        // Proceed to payment
        proceedBtn?.addEventListener('click', () => {
            this.proceedToPayment();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    async toggleCamera() {
        const toggleBtn = document.getElementById('toggle-camera');
        const switchBtn = document.getElementById('switch-camera');
        const flashBtn = document.getElementById('toggle-flash');
        const video = document.getElementById('qr-video');
        const status = document.getElementById('scanner-status');

        if (!this.isScanning) {
            try {
                // Start camera
                this.scanner = new QrScanner(
                    video,
                    (result) => this.handleScanResult(result),
                    {
                        onDecodeError: (error) => {
                            // Silently handle decode errors
                        },
                        highlightScanRegion: false,
                        highlightCodeOutline: false,
                    }
                );

                await this.scanner.start();
                this.isScanning = true;

                // Update UI
                toggleBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop Camera</span>';
                toggleBtn.classList.add('active');
                switchBtn.disabled = false;
                flashBtn.disabled = false;
                status.classList.add('hidden');

                this.showSuccess('Camera started successfully');
            } catch (error) {
                this.showError('Failed to start camera: ' + error.message);
            }
        } else {
            // Stop camera
            if (this.scanner) {
                this.scanner.stop();
                this.scanner.destroy();
                this.scanner = null;
            }

            this.isScanning = false;

            // Update UI
            toggleBtn.innerHTML = '<i class="fas fa-video"></i><span>Start Camera</span>';
            toggleBtn.classList.remove('active');
            switchBtn.disabled = true;
            flashBtn.disabled = true;
            status.classList.remove('hidden');
        }
    }

    async switchCamera() {
        if (this.scanner && this.isScanning) {
            try {
                await this.scanner.setCamera('environment');
                this.showSuccess('Switched to back camera');
            } catch (error) {
                try {
                    await this.scanner.setCamera('user');
                    this.showSuccess('Switched to front camera');
                } catch (error2) {
                    this.showError('Failed to switch camera');
                }
            }
        }
    }

    async toggleFlash() {
        if (this.scanner && this.isScanning) {
            try {
                const flashBtn = document.getElementById('toggle-flash');
                const isFlashOn = flashBtn.classList.contains('active');
                
                await this.scanner.setFlash(!isFlashOn);
                
                if (!isFlashOn) {
                    flashBtn.classList.add('active');
                    flashBtn.innerHTML = '<i class="fas fa-flashlight"></i> Flash On';
                } else {
                    flashBtn.classList.remove('active');
                    flashBtn.innerHTML = '<i class="fas fa-flashlight"></i> Flash';
                }
            } catch (error) {
                this.showError('Flash not supported on this device');
            }
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await QrScanner.scanImage(file);
            this.handleScanResult(result);
            this.showSuccess('QR code detected in image');
        } catch (error) {
            this.showError('No QR code found in image');
        }

        // Reset file input
        event.target.value = '';
    }

    handleScanResult(result) {
        const scanData = this.parseQRData(result);
        this.displayResult(scanData);
        this.addToHistory(scanData);
        this.updateScanCount();

        // Add success animation
        const scannerContainer = document.querySelector('.scanner-container');
        scannerContainer.classList.add('scan-success');
        setTimeout(() => {
            scannerContainer.classList.remove('scan-success');
        }, 500);

        // Show UPI modal if it's a UPI QR code
        if (scanData.type === 'UPI') {
            this.showUPIModal(scanData);
        }
    }

    parseQRData(qrText) {
        const data = {
            type: 'Unknown',
            rawData: qrText,
            timestamp: new Date().toISOString(),
            fields: {}
        };

        // Check if it's a UPI QR code
        if (qrText.startsWith('upi://pay?') || qrText.includes('pa=') || qrText.includes('pn=')) {
            data.type = 'UPI';
            
            // Parse UPI parameters
            const url = new URL(qrText.replace('upi://pay?', 'https://dummy.com?'));
            const params = url.searchParams;
            
            data.fields = {
                payeeAddress: params.get('pa') || 'Unknown',
                payeeName: params.get('pn') || 'Unknown Merchant',
                amount: params.get('am') || '0',
                currency: params.get('cu') || 'INR',
                transactionNote: params.get('tn') || '',
                transactionRef: params.get('tr') || '',
                merchantCode: params.get('mc') || ''
            };
        } else if (qrText.startsWith('http') || qrText.startsWith('https')) {
            data.type = 'URL';
            data.fields = { url: qrText };
        } else if (qrText.includes('@') && qrText.includes('.')) {
            data.type = 'Email';
            data.fields = { email: qrText };
        } else if (/^\+?[\d\s\-\(\)]+$/.test(qrText)) {
            data.type = 'Phone';
            data.fields = { phone: qrText };
        } else {
            data.type = 'Text';
            data.fields = { text: qrText };
        }

        return data;
    }

    displayResult(scanData) {
        const container = document.getElementById('results-container');
        const clearBtn = document.getElementById('clear-results');
        
        // Remove no-results message
        const noResults = container.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }

        // Create result element
        const resultElement = this.createResultElement(scanData);
        container.insertBefore(resultElement, container.firstChild);

        // Enable clear button
        clearBtn.disabled = false;

        // Limit to 5 results
        const results = container.querySelectorAll('.scan-result');
        if (results.length > 5) {
            results[results.length - 1].remove();
        }
    }

    createResultElement(scanData) {
        const div = document.createElement('div');
        div.className = 'scan-result';
        
        const timeString = new Date(scanData.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        let fieldsHTML = '';
        Object.entries(scanData.fields).forEach(([key, value]) => {
            if (value && value !== '0' && value !== 'Unknown') {
                const label = this.formatFieldLabel(key);
                fieldsHTML += `
                    <div class="result-field">
                        <span class="field-label">${label}</span>
                        <span class="field-value">${this.formatFieldValue(key, value)}</span>
                    </div>
                `;
            }
        });

        let actionsHTML = '';
        if (scanData.type === 'UPI') {
            actionsHTML = `
                <div class="result-actions">
                    <button class="result-btn primary" onclick="qrManager.showUPIModal(${JSON.stringify(scanData).replace(/"/g, '&quot;')})">
                        <i class="fas fa-mobile-alt"></i> Pay Now
                    </button>
                    <button class="result-btn secondary" onclick="qrManager.copyToClipboard('${scanData.rawData}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
        } else if (scanData.type === 'URL') {
            actionsHTML = `
                <div class="result-actions">
                    <button class="result-btn primary" onclick="window.open('${scanData.fields.url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open Link
                    </button>
                    <button class="result-btn secondary" onclick="qrManager.copyToClipboard('${scanData.rawData}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
        } else {
            actionsHTML = `
                <div class="result-actions">
                    <button class="result-btn secondary" onclick="qrManager.copyToClipboard('${scanData.rawData}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="result-header">
                <div class="result-type">
                    <i class="fas fa-${this.getTypeIcon(scanData.type)}"></i>
                    ${scanData.type} QR Code
                </div>
                <span class="result-time">${timeString}</span>
            </div>
            <div class="result-content">
                ${fieldsHTML}
            </div>
            ${actionsHTML}
        `;

        return div;
    }

    formatFieldLabel(key) {
        const labels = {
            payeeAddress: 'UPI ID',
            payeeName: 'Merchant',
            amount: 'Amount',
            currency: 'Currency',
            transactionNote: 'Note',
            transactionRef: 'Reference',
            merchantCode: 'Merchant Code',
            url: 'URL',
            email: 'Email',
            phone: 'Phone',
            text: 'Text'
        };
        return labels[key] || key;
    }

    formatFieldValue(key, value) {
        if (key === 'amount' && value !== '0') {
            return `₹${parseFloat(value).toFixed(2)}`;
        }
        return value;
    }

    getTypeIcon(type) {
        const icons = {
            UPI: 'mobile-alt',
            URL: 'link',
            Email: 'envelope',
            Phone: 'phone',
            Text: 'file-text'
        };
        return icons[type] || 'qrcode';
    }

    showUPIModal(scanData) {
        const modal = document.getElementById('upi-modal');
        const detailsContainer = document.getElementById('payment-details');
        
        // Populate payment details
        let detailsHTML = '';
        Object.entries(scanData.fields).forEach(([key, value]) => {
            if (value && value !== '0' && value !== 'Unknown' && value !== '') {
                const label = this.formatFieldLabel(key);
                const formattedValue = this.formatFieldValue(key, value);
                const isAmount = key === 'amount';
                
                detailsHTML += `
                    <div class="payment-field">
                        <span class="payment-label">${label}</span>
                        <span class="payment-value ${isAmount ? 'amount' : ''}">${formattedValue}</span>
                    </div>
                `;
            }
        });

        detailsContainer.innerHTML = detailsHTML;

        // Reset app selection
        this.selectedApp = null;
        document.querySelectorAll('.upi-app-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('proceed-payment').disabled = true;

        // Show modal
        modal.classList.add('active');
    }

    selectUPIApp(button) {
        // Remove previous selection
        document.querySelectorAll('.upi-app-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Select current app
        button.classList.add('selected');
        this.selectedApp = button.dataset.app;

        // Enable proceed button
        document.getElementById('proceed-payment').disabled = false;
    }

    proceedToPayment() {
        if (!this.selectedApp) return;

        const appNames = {
            gpay: 'Google Pay',
            phonepe: 'PhonePe',
            paytm: 'Paytm',
            bhim: 'BHIM UPI'
        };

        // Simulate opening UPI app
        this.showSuccess(`Opening ${appNames[this.selectedApp]}...`);
        
        // Close modal after a delay
        setTimeout(() => {
            this.closeModal();
            this.showSuccess(`Payment initiated via ${appNames[this.selectedApp]}`);
        }, 1500);
    }

    closeModal() {
        const modal = document.getElementById('upi-modal');
        modal.classList.remove('active');
        this.selectedApp = null;
    }

    addToHistory(scanData) {
        this.scanHistory.unshift({
            ...scanData,
            id: Date.now()
        });

        // Keep only last 50 scans
        if (this.scanHistory.length > 50) {
            this.scanHistory = this.scanHistory.slice(0, 50);
        }

        this.saveScanHistory();
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        
        if (this.scanHistory.length === 0) {
            container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-clock"></i>
                    <p>No recent scans</p>
                </div>
            `;
            return;
        }

        const recentScans = this.scanHistory.slice(0, 10);
        container.innerHTML = recentScans.map(scan => {
            const timeString = new Date(scan.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const displayName = scan.fields.payeeName || scan.fields.url || scan.fields.email || scan.fields.phone || 'Unknown';
            const displayAmount = scan.fields.amount && scan.fields.amount !== '0' ? `₹${scan.fields.amount}` : '';

            return `
                <div class="history-item" onclick="qrManager.showHistoryDetails(${scan.id})">
                    <div class="history-icon">
                        <i class="fas fa-${this.getTypeIcon(scan.type)}"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-merchant">${displayName}</div>
                        <div class="history-time">${timeString}</div>
                    </div>
                    <div class="history-amount">${displayAmount}</div>
                </div>
            `;
        }).join('');
    }

    showHistoryDetails(scanId) {
        const scan = this.scanHistory.find(s => s.id === scanId);
        if (scan && scan.type === 'UPI') {
            this.showUPIModal(scan);
        }
    }

    updateScanCount() {
        const today = new Date().toDateString();
        const todayScans = this.scanHistory.filter(scan => 
            new Date(scan.timestamp).toDateString() === today
        ).length;

        const countElement = document.getElementById('scan-count');
        countElement.textContent = `${todayScans} scan${todayScans !== 1 ? 's' : ''} today`;
    }

    clearResults() {
        const container = document.getElementById('results-container');
        const clearBtn = document.getElementById('clear-results');
        
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-qrcode"></i>
                <h4>No QR Code Scanned</h4>
                <p>Scan a UPI QR code to see payment details here</p>
            </div>
        `;

        clearBtn.disabled = true;
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('Copied to clipboard');
        }).catch(() => {
            this.showError('Failed to copy to clipboard');
        });
    }

    loadScanHistory() {
        try {
            const saved = localStorage.getItem('qrScanHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    saveScanHistory() {
        try {
            localStorage.setItem('qrScanHistory', JSON.stringify(this.scanHistory));
        } catch (error) {
            console.error('Failed to save scan history:', error);
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

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
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            font-weight: var(--font-weight-medium);
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
}

// Initialize QR Scanner Manager
let qrManager;
document.addEventListener('DOMContentLoaded', () => {
    qrManager = new QRScannerManager();
});
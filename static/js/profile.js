class ProfileManager {
    constructor() {
        this.userData = this.loadUserData();
        this.isEditing = false;
        this.init();
    }

    loadUserData() {
        // Mock user data - in real app, this would come from API/localStorage
        return {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@university.edu',
            phone: '+1 (555) 123-4567',
            dateOfBirth: '2002-03-15',
            university: 'State University',
            memberSince: '2023-12-01',
            loggingStreak: 12,
            totalSaved: 1250,
            monthlySpend: 1245,
            savingsRate: 65,
            avgDaily: 41,
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face',
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                weeklyReports: true,
                smartSuggestions: true,
                dataAnalytics: false,
                marketingEmails: false
            }
        };
    }

    init() {
        this.populateProfile();
        this.bindEvents();
        this.animateStats();
        this.loadAchievements();
        this.loadRecentActivity();
    }

    populateProfile() {
        // Profile header
        document.getElementById('profile-name').textContent = `${this.userData.firstName} ${this.userData.lastName}`;
        document.getElementById('profile-email').textContent = this.userData.email;
        document.getElementById('avatar-image').src = this.userData.avatar;

        // Personal information
        document.getElementById('first-name').textContent = this.userData.firstName;
        document.getElementById('last-name').textContent = this.userData.lastName;
        document.getElementById('email-address').textContent = this.userData.email;
        document.getElementById('phone-number').textContent = this.userData.phone;
        document.getElementById('date-of-birth').textContent = this.formatDate(this.userData.dateOfBirth);
        document.getElementById('university').textContent = this.userData.university;

        // Financial stats
        document.getElementById('total-saved').textContent = this.formatCurrency(this.userData.totalSaved);
        document.getElementById('monthly-spend').textContent = this.formatCurrency(this.userData.monthlySpend);
        document.getElementById('savings-rate').textContent = `${this.userData.savingsRate}%`;
        document.getElementById('avg-daily').textContent = this.formatCurrency(this.userData.avgDaily);

        // Preferences
        Object.keys(this.userData.preferences).forEach(key => {
            const checkbox = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (checkbox) {
                checkbox.checked = this.userData.preferences[key];
            }
        });
    }

    bindEvents() {
        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditModal();
            });
        }

        // Change avatar button
        const changeAvatarBtn = document.getElementById('change-avatar');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                this.showAvatarModal();
            });
        }

        // Period toggle buttons
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchPeriod(e.target);
            });
        });

        // Security buttons
        document.getElementById('change-password')?.addEventListener('click', () => {
            this.showPasswordModal();
        });

        document.getElementById('setup-2fa')?.addEventListener('click', () => {
            this.show2FAModal();
        });

        document.getElementById('manage-sessions')?.addEventListener('click', () => {
            this.showSessionsModal();
        });

        document.getElementById('download-data')?.addEventListener('click', () => {
            this.downloadUserData();
        });

        // Danger zone buttons
        document.getElementById('deactivate-account')?.addEventListener('click', () => {
            this.showDeactivateModal();
        });

        document.getElementById('delete-account')?.addEventListener('click', () => {
            this.showDeleteModal();
        });

        // Preference toggles
        const preferenceToggles = document.querySelectorAll('.preferences-grid input[type="checkbox"]');
        preferenceToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.updatePreference(e.target);
            });
        });

        // Edit section buttons
        const editSectionBtns = document.querySelectorAll('.edit-section-btn');
        editSectionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('button').dataset.section;
                this.showEditModal(section);
            });
        });
    }

    showEditModal(section = 'personal') {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Edit Profile Information</h3>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="edit-profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-first-name">First Name</label>
                            <input type="text" id="edit-first-name" value="${this.userData.firstName}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-last-name">Last Name</label>
                            <input type="text" id="edit-last-name" value="${this.userData.lastName}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email Address</label>
                        <input type="email" id="edit-email" value="${this.userData.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-phone">Phone Number</label>
                        <input type="tel" id="edit-phone" value="${this.userData.phone}">
                    </div>
                    <div class="form-group">
                        <label for="edit-dob">Date of Birth</label>
                        <input type="date" id="edit-dob" value="${this.userData.dateOfBirth}">
                    </div>
                    <div class="form-group">
                        <label for="edit-university">University</label>
                        <input type="text" id="edit-university" value="${this.userData.university}">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindModalEvents(modal);
        this.showModal(modal);
    }

    showAvatarModal() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Change Profile Picture</h3>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="avatar-options">
                    <div class="current-avatar">
                        <img src="${this.userData.avatar}" alt="Current Avatar" id="preview-avatar">
                        <p>Current Photo</p>
                    </div>
                    <div class="avatar-upload">
                        <input type="file" id="avatar-file" accept="image/*" style="display: none;">
                        <button type="button" class="upload-btn" onclick="document.getElementById('avatar-file').click()">
                            <i class="fas fa-upload"></i>
                            Upload New Photo
                        </button>
                        <p class="upload-hint">JPG, PNG or GIF. Max size 5MB.</p>
                    </div>
                    <div class="preset-avatars">
                        <h4>Choose from presets:</h4>
                        <div class="preset-grid">
                            <img src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" class="preset-avatar" alt="Preset 1">
                            <img src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" class="preset-avatar" alt="Preset 2">
                            <img src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" class="preset-avatar" alt="Preset 3">
                            <img src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" class="preset-avatar" alt="Preset 4">
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="button" class="save-btn" id="save-avatar">
                        <i class="fas fa-save"></i>
                        Save Photo
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindAvatarModalEvents(modal);
        this.showModal(modal);
    }

    showPasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>Change Password</h3>
                    <button class="close-modal-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="password-form">
                    <div class="form-group">
                        <label for="current-password">Current Password</label>
                        <div class="input-group">
                            <input type="password" id="current-password" required>
                            <button type="button" class="password-toggle" data-target="current-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <div class="input-group">
                            <input type="password" id="new-password" required>
                            <button type="button" class="password-toggle" data-target="new-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="password-strength">
                            <div class="strength-bar">
                                <div class="strength-fill"></div>
                            </div>
                            <span class="strength-text">Password strength</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirm-new-password">Confirm New Password</label>
                        <div class="input-group">
                            <input type="password" id="confirm-new-password" required>
                            <button type="button" class="password-toggle" data-target="confirm-new-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn">
                            <i class="fas fa-key"></i>
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.bindPasswordModalEvents(modal);
        this.showModal(modal);
    }

    bindModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-modal-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const overlay = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#edit-profile-form');

        // Close modal events
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element.addEventListener('click', () => {
                this.closeModal(modal);
            });
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(e, modal);
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
            }
        });
    }

    bindAvatarModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-modal-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const overlay = modal.querySelector('.modal-overlay');
        const saveBtn = modal.querySelector('#save-avatar');
        const fileInput = modal.querySelector('#avatar-file');
        const presetAvatars = modal.querySelectorAll('.preset-avatar');

        let selectedAvatar = this.userData.avatar;

        // Close modal events
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element.addEventListener('click', () => {
                this.closeModal(modal);
            });
        });

        // File upload
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    selectedAvatar = e.target.result;
                    modal.querySelector('#preview-avatar').src = selectedAvatar;
                };
                reader.readAsDataURL(file);
            }
        });

        // Preset avatar selection
        presetAvatars.forEach(avatar => {
            avatar.addEventListener('click', () => {
                presetAvatars.forEach(a => a.classList.remove('selected'));
                avatar.classList.add('selected');
                selectedAvatar = avatar.src;
                modal.querySelector('#preview-avatar').src = selectedAvatar;
            });
        });

        // Save avatar
        saveBtn.addEventListener('click', () => {
            this.updateAvatar(selectedAvatar);
            this.closeModal(modal);
        });
    }

    bindPasswordModalEvents(modal) {
        const closeBtn = modal.querySelector('.close-modal-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const overlay = modal.querySelector('.modal-overlay');
        const form = modal.querySelector('#password-form');
        const passwordToggles = modal.querySelectorAll('.password-toggle');
        const newPasswordInput = modal.querySelector('#new-password');

        // Close modal events
        [closeBtn, cancelBtn, overlay].forEach(element => {
            element.addEventListener('click', () => {
                this.closeModal(modal);
            });
        });

        // Password toggles
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.togglePassword(e.target.closest('.password-toggle'));
            });
        });

        // Password strength checker
        newPasswordInput.addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value, modal);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordUpdate(e, modal);
        });
    }

    handleProfileUpdate(e, modal) {
        const formData = new FormData(e.target);
        
        // Update user data
        this.userData.firstName = document.getElementById('edit-first-name').value;
        this.userData.lastName = document.getElementById('edit-last-name').value;
        this.userData.email = document.getElementById('edit-email').value;
        this.userData.phone = document.getElementById('edit-phone').value;
        this.userData.dateOfBirth = document.getElementById('edit-dob').value;
        this.userData.university = document.getElementById('edit-university').value;

        // Show loading state
        const saveBtn = modal.querySelector('.save-btn');
        this.setLoadingState(saveBtn, true);

        // Simulate API call
        setTimeout(() => {
            this.setLoadingState(saveBtn, false);
            this.populateProfile();
            this.closeModal(modal);
            this.showNotification('Profile updated successfully!', 'success');
        }, 1500);
    }

    handlePasswordUpdate(e, modal) {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        // Validate passwords
        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            return;
        }

        // Show loading state
        const saveBtn = modal.querySelector('.save-btn');
        this.setLoadingState(saveBtn, true);

        // Simulate API call
        setTimeout(() => {
            this.setLoadingState(saveBtn, false);
            this.closeModal(modal);
            this.showNotification('Password updated successfully!', 'success');
        }, 2000);
    }

    updateAvatar(newAvatar) {
        this.userData.avatar = newAvatar;
        document.getElementById('avatar-image').src = newAvatar;
        this.showNotification('Profile picture updated!', 'success');
    }

    switchPeriod(button) {
        // Update active state
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update stats based on period
        const period = button.dataset.period;
        this.updateFinancialStats(period);
    }

    updateFinancialStats(period) {
        // Mock data update based on period
        const multiplier = period === 'year' ? 12 : 1;
        
        document.getElementById('total-saved').textContent = this.formatCurrency(this.userData.totalSaved * multiplier);
        document.getElementById('monthly-spend').textContent = this.formatCurrency(this.userData.monthlySpend * multiplier);
        
        // Animate the change
        this.animateStats();
    }

    updatePreference(toggle) {
        const prefKey = toggle.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        this.userData.preferences[prefKey] = toggle.checked;
        
        // Save to localStorage
        localStorage.setItem('budgetBuddyProfile', JSON.stringify(this.userData));
        
        // Show feedback
        const status = toggle.checked ? 'enabled' : 'disabled';
        this.showNotification(`Preference ${status}`, 'info');
    }

    animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(stat => {
            const finalValue = stat.textContent;
            const numericValue = parseFloat(finalValue.replace(/[^\d.-]/g, ''));
            
            if (numericValue > 0) {
                this.animateValue(stat, 0, numericValue, 1000, finalValue.includes('$'));
            }
        });
    }

    animateValue(element, start, end, duration, isCurrency = false) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            
            let displayValue = Math.round(current);
            if (isCurrency) {
                displayValue = this.formatCurrency(displayValue);
            } else if (element.textContent.includes('%')) {
                displayValue = displayValue + '%';
            }
            
            element.textContent = displayValue;
        }, 16);
    }

    loadAchievements() {
        // Animate achievements on load
        const achievements = document.querySelectorAll('.achievement-item');
        
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                achievement.style.opacity = '0';
                achievement.style.transform = 'translateY(20px)';
                achievement.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    achievement.style.opacity = '1';
                    achievement.style.transform = 'translateY(0)';
                }, 100);
            }, index * 150);
        });
    }

    loadRecentActivity() {
        // Animate activity items
        const activityItems = document.querySelectorAll('.activity-item');
        
        activityItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                item.style.transition = 'all 0.4s ease';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, 100);
            }, index * 100);
        });
    }

    downloadUserData() {
        // Create downloadable data
        const data = {
            profile: this.userData,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-buddy-profile-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Profile data downloaded successfully!', 'success');
    }

    showDeactivateModal() {
        if (confirm('Are you sure you want to deactivate your account? You can reactivate it anytime by logging in.')) {
            this.showNotification('Account deactivated. You can reactivate anytime.', 'info');
        }
    }

    showDeleteModal() {
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
            this.showNotification('Account deletion initiated. You will receive a confirmation email.', 'error');
        }
    }

    show2FAModal() {
        this.showNotification('Two-factor authentication setup coming soon!', 'info');
    }

    showSessionsModal() {
        this.showNotification('Session management coming soon!', 'info');
    }

    togglePassword(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    checkPasswordStrength(password, modal) {
        const strengthBar = modal.querySelector('.strength-fill');
        const strengthText = modal.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let strengthLabel = 'Very Weak';

        // Check password criteria
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Update strength bar
        strengthBar.className = 'strength-fill';
        
        switch (strength) {
            case 0:
            case 1:
                strengthBar.classList.add('weak');
                strengthLabel = 'Weak';
                break;
            case 2:
                strengthBar.classList.add('fair');
                strengthLabel = 'Fair';
                break;
            case 3:
            case 4:
                strengthBar.classList.add('good');
                strengthLabel = 'Good';
                break;
            case 5:
                strengthBar.classList.add('strong');
                strengthLabel = 'Strong';
                break;
        }

        strengthText.textContent = `Password strength: ${strengthLabel}`;
    }

    showModal(modal) {
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    closeModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    setLoadingState(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}-circle"></i>
            <span>${message}</span>
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

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize profile manager
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
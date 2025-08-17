function bindEvents() {
    const editProfileBtn = document.getElementById('edit-profile');
    const editPersonalInfoBtn = document.getElementById('edit-section-btn');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditModal);
    }
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', showEditModal);
    }

    // Other buttons for password, avatar, etc. can be bound here
    // document.getElementById('change-password')?.addEventListener('click', showPasswordModal);
    // document.getElementById('change-avatar')?.addEventListener('click', showAvatarModal);
}

function showEditModal() {
    // Get current data from the DOM
    const currentData = {
        firstName: document.getElementById('first-name').textContent.trim(),
        lastName: document.getElementById('last-name').textContent.trim(),
        phone: document.getElementById('phone-number').textContent.trim(),
        university: document.getElementById('university').textContent.trim(),
    };

    const modal = createModal(`
        <div class="modal-header">
            <h3>Edit Profile Information</h3>
            <button class="close-modal-btn">&times;</button>
        </div>
        <form class="modal-form" id="edit-profile-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-first-name">First Name</label>
                    <input type="text" id="edit-first-name" name="first_name" value="${currentData.firstName}" required>
                </div>
                <div class="form-group">
                    <label for="edit-last-name">Last Name</label>
                    <input type="text" id="edit-last-name" name="last_name" value="${currentData.lastName}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="edit-phone">Phone Number</label>
                <input type="tel" id="edit-phone" name="phone_number" value="${currentData.phone !== 'Not set' ? currentData.phone : ''}">
            </div>
            <div class="form-group">
                <label for="edit-university">University</label>
                <input type="text" id="edit-university" name="university" value="${currentData.university !== 'Not set' ? currentData.university : ''}">
            </div>
            <div class="modal-actions">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="submit" class="save-btn">
                    <i class="fas fa-save"></i>
                    Save Changes
                </button>
            </div>
        </form>
    `);

    // Handle form submission
    const form = modal.querySelector('#edit-profile-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleProfileUpdate(form, modal);
    });

    document.body.appendChild(modal);
    showModal(modal);
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
/**
 * Handles the submission of the profile update form via Fetch API.
 * @param {HTMLFormElement} form The form element being submitted.
 * @param {HTMLElement} modal The modal containing the form.
 */
async function handleProfileUpdate(form, modal) {
    const saveBtn = form.querySelector('.save-btn');
    setLoadingState(saveBtn, true);

    const formData = new FormData(form);

    try {
        // The `updateProfileUrl` and `csrfToken` are defined in the HTML script tag
        const response = await fetch('/profile/update/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            updateProfileDOM(result.data);
            showNotification('Profile updated successfully!', 'success');
            closeModal(modal);
        } else {
            showNotification(result.error || 'An error occurred.', 'error');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification('Could not connect to the server.', 'error');
    } finally {
        setLoadingState(saveBtn, false);
    }
}

/**
 * Updates the text content of the profile page elements after a successful save.
 * @param {object} data The user data returned from the server.
 */
function updateProfileDOM(data) {
    document.getElementById('first-name').textContent = data.first_name;
    document.getElementById('last-name').textContent = data.last_name;
    document.getElementById('phone-number').textContent = data.phone_number;
    document.getElementById('university').textContent = data.university;
    // Update the main profile name as well
    document.getElementById('profile-name').textContent = `${data.first_name} ${data.last_name}`;
}


function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'profile-modal'; // The 'show' class will be added later
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content glass-card">
            ${content}
        </div>
    `;

    const close = () => closeModal(modal);
    modal.querySelector('.close-modal-btn')?.addEventListener('click', close);
    modal.querySelector('.cancel-btn')?.addEventListener('click', close);
    modal.querySelector('.modal-overlay')?.addEventListener('click', close);

    return modal;
}
function showModal(modal) {
    setTimeout(() => {
        modal.classList.add('show');
    }, 10); // A tiny delay ensures the transition works
}

function closeModal(modal) {
    modal.classList.remove('show');
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
}
function setLoadingState(button, loading) {
    button.disabled = loading;
    if (loading) {
        button.classList.add('loading');
    } else {
        button.classList.remove('loading');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
});
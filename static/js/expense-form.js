document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const hiddenCategoryInput = document.getElementById('category_name');

    let selectedCategory = null;

    // Handle category selection
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('selected'));
            // Add active class to the clicked button
            button.classList.add('selected');
            
            selectedCategory = button.dataset.category;
            hiddenCategoryInput.value = selectedCategory;
            console.log(hiddenCategoryInput.value);
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the default browser submission

        if (!selectedCategory) {
            showNotification('Please select a category.', 'error');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = form.querySelector('.submit-btn');
        setLoadingState(submitBtn, true);

        try {
            const response = await fetch('/add-expense/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Expense added successfully!', 'success');
                form.reset();
                categoryButtons.forEach(btn => btn.classList.remove('selected'));
                selectedCategory = null;
            } else {
                // Display errors from the server
                const errorMessage = result.errors ? Object.values(result.errors).join(', ') : 'An error occurred.';
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Could not connect to the server.', 'error');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });


    const recurringCheckbox = document.getElementById('is_recurring');
    const recurringFields = document.getElementById('recurring-expense-fields');
    const submitBtnText = document.getElementById('submit-btn-text');

    recurringCheckbox.addEventListener('change', () => {
        if (recurringCheckbox.checked) {
            // Show recurring fields, hide regular date field
            recurringFields.style.display = 'block';
            submitBtnText.textContent = 'Add Recurring Rule';
        } else {
            // Show regular date field, hide recurring fields
            recurringFields.style.display = 'none';
            submitBtnText.textContent = 'Add Expense';
        }
    });
});

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
function setLoadingState(button, loading) {
    button.disabled = loading;
    if (loading) {
        button.classList.add('loading');
    } else {
        button.classList.remove('loading');
    }
}
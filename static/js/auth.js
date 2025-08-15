function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

const tabs = document.querySelectorAll('.auth-tab');
const contents = document.querySelectorAll('.auth-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        // Switch active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show correct content
        contents.forEach(c => {
            c.classList.toggle('hidden', !c.id.startsWith(target));
        });
    });
});

document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
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
async function handleFormSubmit(form, actionName) {
    const formData = new FormData(form);
    formData.append(actionName, 'true');

    try {
        const response = await fetch('/auth/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": getCookie('csrftoken'),
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            window.location.href = '/dashboard'; // Change page manually
        } else {
            alert(data.error);
        }
        });

        if (response.redirected) {
            // Login/signup success → redirect to dashboard
            window.location.href = response.url;
            return;
        }

        // If not redirected, server sent HTML again with errors
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Replace current modal content with updated one
        const newLoginContent = doc.querySelector('#login-content');
        const newSignupContent = doc.querySelector('#signup-content');
        document.querySelector('#login-content').innerHTML = newLoginContent.innerHTML;
        document.querySelector('#signup-content').innerHTML = newSignupContent.innerHTML;

    } catch (err) {
        console.error("Error submitting form:", err);
    }
}

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, 'login_submit');
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(signupForm, 'signup_submit');
});

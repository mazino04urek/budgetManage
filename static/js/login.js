document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".auth-tab");
    const forms = document.querySelectorAll(".auth-form");
    const switchToLogin = document.querySelector(".switch-to-login");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Tab active state
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Show correct form
            forms.forEach(f => f.classList.remove("active"));
            document.getElementById(tab.dataset.target).classList.add("active");
        });
    });

    // Switch from signup footer to login tab
    if (switchToLogin) {
        switchToLogin.addEventListener("click", () => {
            tabs[0].click(); // Simulate clicking Login tab
        });
    }
});

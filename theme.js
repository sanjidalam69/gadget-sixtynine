// Theme initialization logic - runs immediately in <head> to prevent layout/color flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

// Hook up event listeners once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
});

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        updateToggleIcon(savedTheme);
        
        // Remove existing listener to prevent duplicates if function runs twice
        toggleBtn.onclick = null;
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateToggleIcon(newTheme);
        });
    }
}

function updateToggleIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'ph ph-sun';
                toggleBtn.style.color = '#fbbf24'; // Premium Amber/Gold sun color
            } else {
                icon.className = 'ph ph-moon';
                toggleBtn.style.color = ''; // Reset to default
            }
        }
    }
}

// Observe body for changes in case header loaded dynamically or auth state renders new elements
const themeObserver = new MutationObserver(() => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn && !toggleBtn.dataset.listenerAttached) {
        toggleBtn.dataset.listenerAttached = 'true';
        initThemeToggle();
    }
});
themeObserver.observe(document.body, { childList: true, subtree: true });

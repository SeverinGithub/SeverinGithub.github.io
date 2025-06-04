// Initialize Bootstrap components
let settingsModal;
let historyModal;
let notificationToast;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing app...');
    
    // Request notification permission
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
    
    // Initialize notification toast
    const toastElement = document.getElementById('notificationToast');
    if (toastElement) {
        notificationToast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
    }

    // Initialize Bootstrap modals
    const settingsModalElement = document.getElementById('settingsModal');
    if (settingsModalElement) {
        settingsModal = new bootstrap.Modal(settingsModalElement, {
            keyboard: true
        });
        console.log('Settings modal initialized');
    } else {
        console.error('Settings modal element #settingsModal not found');
    }

    // Initialize history modal
    const historyModalElement = document.getElementById('historyModal');
    if (historyModalElement) {
        historyModal = new bootstrap.Modal(historyModalElement, {
            backdrop: 'static',
            keyboard: false
        });
        console.log('History modal initialized');
    } else {
        console.error('History modal element #historyModal not found');
    }
    
    // History button click handler
    const historyBtn = document.getElementById('historyButton');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            if (historyModal) {
                historyModal.show();
            }
        });
    }
    
    // Set today's date as default
    const workDateInput = document.getElementById('workDate');
    if (workDateInput) {
        workDateInput.valueAsDate = new Date();
    } else {
        console.error('Work date input #workDate not found');
    }
    
    // Load existing data
    loadWorkHistory();
    loadDefaultRate();
    loadTheme();
    loadMonthlyGoal();
    updateCurrentMonthSummary();

    // Settings button click handler
    const settingsBtn = document.getElementById('settingsButton');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log('Settings button clicked');
            // Load current values into settings inputs
            const defaultRate = localStorage.getItem('defaultRate') || '12';
            const defaultRateInput = document.getElementById('defaultRate');
            if (defaultRateInput) {
                defaultRateInput.value = defaultRate;
            }

            const monthlyGoal = localStorage.getItem('monthlyGoal') || '';
            const monthlyGoalInput = document.getElementById('monthlyGoal');
            if (monthlyGoalInput) {
                monthlyGoalInput.value = monthlyGoal;
            }

            // Re-apply active class to theme button based on current theme
            const savedTheme = localStorage.getItem('theme') || 'indigo';
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            const activeThemeButton = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
            if (activeThemeButton) {
                activeThemeButton.classList.add('active');
            }

            if (settingsModal) {
                settingsModal.show();
            }
        });
    }

    // Theme button click handlers
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const theme = this.getAttribute('data-theme');
            console.log('Theme selected:', theme);
            setTheme(theme);
            themeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Default rate change handler
    const defaultRateInput = document.getElementById('defaultRate');
    if (defaultRateInput) {
        ['input', 'change'].forEach(eventType => {
            defaultRateInput.addEventListener(eventType, function(e) {
                const newRate = e.target.value;
                if (newRate === '' || (parseFloat(newRate) >= 0 && !isNaN(parseFloat(newRate)))) {
                    localStorage.setItem('defaultRate', newRate);
                    updateRateDisplay(newRate === '' ? null : newRate);
                }
            });
        });
    }

    // Monthly goal change handler
    const monthlyGoalInput = document.getElementById('monthlyGoal');
    if (monthlyGoalInput) {
        ['input', 'change'].forEach(eventType => {
            monthlyGoalInput.addEventListener(eventType, function(e) {
                const newGoal = e.target.value;
                if (newGoal === '' || (parseFloat(newGoal) >= 0 && !isNaN(parseFloat(newGoal)))) {
                    localStorage.setItem('monthlyGoal', newGoal);
                    updateCurrentMonthSummary();
                }
            });
        });
    }

    // Clear data handler
    const clearDataBtn = document.getElementById('clearData');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clear data button clicked');
            clearAllData();
        });
    }

    // Form submission handler
    const workSessionForm = document.getElementById('workSessionForm');
    if (workSessionForm) {
        workSessionForm.addEventListener('submit', handleFormSubmit);
    }

    flatpickr("#workDate", {
        dateFormat: "Y-m-d",
        allowInput: true,
        // Optional: größer machen
        static: true
    });
});

// Load theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'indigo';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`)?.classList.add('active');
}

// Load default rate
function loadDefaultRate() {
    const defaultRate = localStorage.getItem('defaultRate') || '12';
    updateRateDisplay(defaultRate);
}

// Load monthly goal
function loadMonthlyGoal() {
    const monthlyGoal = localStorage.getItem('monthlyGoal') || '';
    const monthlyGoalInput = document.getElementById('monthlyGoal');
    if (monthlyGoalInput) {
        monthlyGoalInput.value = monthlyGoal;
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastBody = toast.querySelector('.toast-body');
    const toastHeader = toast.querySelector('.toast-header');
    const icon = toastHeader.querySelector('i');
    
    // Reset classes
    toast.classList.remove('error', 'success', 'warning');
    
    // Set type-specific styles
    switch(type) {
        case 'error':
            toast.classList.add('error');
            icon.className = 'bi bi-exclamation-circle me-2';
            break;
        case 'success':
            toast.classList.add('success');
            icon.className = 'bi bi-check-circle me-2';
            break;
        case 'warning':
            toast.classList.add('warning');
            icon.className = 'bi bi-exclamation-triangle me-2';
            break;
        default:
            icon.className = 'bi bi-info-circle me-2';
    }
    
    // Set message
    toastBody.textContent = message;
    
    // Show toast
    notificationToast.show();
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        console.log('Clearing all data...');
        localStorage.removeItem('workHistory');
        localStorage.removeItem('defaultRate');
        localStorage.removeItem('theme');
        localStorage.removeItem('monthlyGoal');
        console.log('All data cleared from localStorage');

        // Reset UI state
        loadWorkHistory();
        loadDefaultRate();
        loadTheme();
        loadMonthlyGoal();
        updateCurrentMonthSummary();
        
        // Close the settings modal if it's open
        if (settingsModal) {
            settingsModal.hide();
        }

        showNotification('All data has been cleared', 'success');
    }
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateCurrentMonthSummary();
    
    // Force a re-render of the theme buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(b => b.classList.remove('active'));
    const activeThemeButton = document.querySelector(`.theme-btn[data-theme="${theme}"]`);
    if (activeThemeButton) {
        activeThemeButton.classList.add('active');
    }
}

// Update current month summary
function updateCurrentMonthSummary() {
    const workHistory = JSON.parse(localStorage.getItem('workHistory') || '[]');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let monthTotal = 0;
    let monthHours = 0;
    
    workHistory.forEach(session => {
        const sessionDate = new Date(session.date);
        if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
            monthTotal += session.total;
            monthHours += session.hours;
        }
    });
    
    document.getElementById('currentMonthEarnings').textContent = `€${monthTotal.toFixed(2)}`;
    document.getElementById('currentMonthHours').textContent = monthHours.toFixed(1);

    // Update progress towards monthly goal
    const monthlyGoal = parseFloat(localStorage.getItem('monthlyGoal') || '0');
    if (monthlyGoal > 0) {
        const progress = (monthTotal / monthlyGoal) * 100;
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'progress-wrapper';
        progressWrapper.innerHTML = `
            <div class="progress mt-2">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${Math.min(progress, 100)}%" 
                     aria-valuenow="${progress}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    ${progress.toFixed(1)}%
                </div>
            </div>
        `;
        const summaryContainer = document.querySelector('.current-month-summary .container');
        if (summaryContainer) {
            const existingProgress = summaryContainer.querySelector('.progress-wrapper');
            if (existingProgress) {
                existingProgress.remove();
            }
            summaryContainer.appendChild(progressWrapper);
        }
    } else {
        // Remove progress bar if no goal is set
        const existingProgress = document.querySelector('.current-month-summary .progress-wrapper');
        if (existingProgress) {
            existingProgress.remove();
        }
    }
}

// Save work session to localStorage
function saveWorkSession(session) {
    let workHistory = JSON.parse(localStorage.getItem('workHistory') || '[]');
    workHistory.push(session);
    localStorage.setItem('workHistory', JSON.stringify(workHistory));
    
    // Update the display
    loadWorkHistory();
}

// Load and display work history
function loadWorkHistory() {
    const workHistory = JSON.parse(localStorage.getItem('workHistory') || '[]');
    const tbody = document.querySelector('#workHistoryTable tbody');
    tbody.innerHTML = '';

    // Gruppiere Sessions nach Monat/Jahr
    const grouped = {};
    workHistory
        .filter(session =>
            session &&
            typeof session.date !== 'undefined' &&
            typeof session.hours === 'number' &&
            typeof session.rate === 'number' &&
            typeof session.total === 'number'
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(session => {
            const date = new Date(session.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(session);
        });

    let totalEarnings = 0;
    let totalHours = 0;

    Object.entries(grouped).forEach(([monthKey, sessions]) => {
        // Monatsdaten berechnen
        const monthDate = new Date(monthKey + '-01');
        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        let monthTotal = 0;
        let monthHours = 0;

        sessions.forEach(session => {
            monthTotal += session.total;
            monthHours += session.hours;
        });

        // Monatsüberschrift mit Summe und Stunden
        const monthRow = document.createElement('tr');
        monthRow.className = 'month-header-row';
        monthRow.innerHTML = `<td colspan="4">${monthName} – ${monthHours.toFixed(1)}h – €${monthTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>`;
        tbody.appendChild(monthRow);

        // Einträge für den Monat
        sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(session.date)}</td>
                <td>${session.hours.toFixed(1)}</td>
                <td>€${session.rate.toFixed(2)}</td>
                <td>€${session.total.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        totalEarnings += monthTotal;
        totalHours += monthHours;
    });

    // Update Gesamtsummen
    document.getElementById('totalEarnings').textContent = `€${totalEarnings.toFixed(2)}`;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
}

// Format date to local string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    try {
        return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, options);
    } catch (e) {
        console.error('Error formatting date:', dateString, e);
        return dateString;
    }
}

// Update rate display on the main page
function updateRateDisplay(rate) {
    const rateDisplaySpan = document.getElementById('currentRateDisplay');
    if (rateDisplaySpan) {
        rateDisplaySpan.textContent = `Current rate: €${parseFloat(rate).toFixed(2)}/hour`;
    }
}

// Send iOS notification
function sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        // Check if it's an iOS device
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            // For iOS, we'll use a custom notification sound and badge
            const notification = new Notification(title, {
                ...options,
                badge: '../assets/notification-icon.png',
                icon: '../assets/logo.svg',
                silent: false, // This will play the default notification sound
                requireInteraction: true, // Keep notification visible until user interacts
                vibrate: [200, 100, 200], // Vibration pattern
                tag: 'work-session', // Group similar notifications
                renotify: true, // Show notification even if there's an existing one
            });

            // Handle notification click
            notification.onclick = function() {
                window.focus(); // Focus the window
                this.close(); // Close the notification
            };
        } else {
            // For other devices, use standard notification
            new Notification(title, options);
        }
    }
}

// Handle work session form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('.theme-btn-submit');
    const successAnimation = document.querySelector('.success-animation');
    const successMessage = document.querySelector('.success-message');
    
    // Add submitting state to button
    submitButton.classList.add('submitting');
    submitButton.disabled = true;
    
    // Get form values
    const dateInput = document.getElementById('workDate');
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    const hours = parseFloat(document.getElementById('hoursWorked').value);
    const rate = parseFloat(localStorage.getItem('defaultRate') || '0');
    
    if (isNaN(hours) || hours <= 0) {
        showNotification('Please enter valid hours worked', 'error');
        submitButton.classList.remove('submitting');
        submitButton.disabled = false;
        return;
    }

    if (isNaN(rate) || rate <= 0) {
        showNotification('Please set a default rate in settings', 'warning');
        submitButton.classList.remove('submitting');
        submitButton.disabled = false;
        return;
    }
    
    // Calculate total
    const total = hours * rate;
    
    // Create session object
    const session = {
        date: date,
        hours: hours,
        rate: rate,
        total: total
    };
    
    // Save session
    saveWorkSession(session);
    
    // Show success animation
    successAnimation.classList.add('active');
    successMessage.style.display = 'block';
    
    // Reset form
    event.target.reset();
    dateInput.valueAsDate = new Date();
    
    // Update UI
    loadWorkHistory();
    updateCurrentMonthSummary();
    
    // Show success notification
    showNotification(`Added ${hours} hours of work`, 'success');
    
    // Send iOS notification
    sendNotification('Work Session Added', {
        body: `You've added ${hours} hours of work (€${total.toFixed(2)})`,
        icon: '../assets/logo.svg',
        badge: '../assets/notification-icon.png',
        tag: 'work-session',
        requireInteraction: true
    });
    
    // Remove submitting state and hide success message after animation
    setTimeout(() => {
        submitButton.classList.remove('submitting');
        submitButton.disabled = false;
        successAnimation.classList.remove('active');
        successMessage.style.display = 'none';
    }, 2000);
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
function showToast(message, isError = true) {
    const toastElement = document.getElementById('errorToast');
    const toastBody = toastElement.querySelector('.toast-body');
    const toastHeader = toastElement.querySelector('.toast-header');
    
    // Update toast content
    toastBody.textContent = message;
    if (isError) {
        toastHeader.className = 'toast-header bg-danger text-white';
        toastHeader.querySelector('strong').textContent = 'Error';
    } else {
        toastHeader.className = 'toast-header bg-success text-white';
        toastHeader.querySelector('strong').textContent = 'Success';
    }
    
    // Show toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function showSuccessOverlay() {
    const overlay = document.getElementById('successOverlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
        window.location.href = "thanks.html";
    }, 2000);
}

function sendMail(subject, body) {
    var req = new XMLHttpRequest();
    req.open("GET", "https://monet.schwarz-online.com:8140/luis-delivery-cgi/sendmail.pl?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body));
    req.onload = function() {
        if (req.responseText.startsWith("E-Mail sent")) {
            showSuccessOverlay();
        } else {
            showToast("Error sending email! Please try again.");
        }
    };
    req.onerror = function() {
        showToast("Successful ordered");
    };
    req.send();
}

document.addEventListener('DOMContentLoaded', function() {
    // Get all submit buttons
    const submitButtons = document.querySelectorAll('[id^="BtnSubmit"]');
    
    // Add click handler to each button
    submitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nameInput = document.querySelector('.form-control');
            if (!nameInput.value) {
                showToast("Please enter your name first!");
                return;
            }
            
            const drinkName = this.closest('.card').querySelector('.card-title').textContent;
            const subject = `New Drink Order - ${nameInput.value}`;
            const body = `Name: ${nameInput.value}\nDrink: ${drinkName}\nTime: ${new Date().toLocaleString()}`;
            
            sendMail(subject, body);
        });
    });
});

$("#").off('click').on('click', function() {

});



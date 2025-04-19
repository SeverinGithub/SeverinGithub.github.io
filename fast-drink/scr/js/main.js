
function sendMail(subject, body) {
    var req = new XMLHttpRequest()
    req.open("GET", "https://monet.schwarz-online.com:8140/luis-delivery-cgi/sendmail.pl?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body))
    req.onload = function(oEvent) {
        if (req.responseText.startsWith("E-Mail sent")) {
            //alert("Erfolg!"); -> toast
            
        }
        else {
            alert("Fehler!");
        }
    };

    req.send(null)
}

var subject = " ";
var body = " ";

$(document).ready(function() {
    sendMail("my subject", "my body")
})

$("#").off('click').on('click', function() {

});




//  const themeToggle = document.getElementById('themeToggle');
//  const toggleInput = themeToggle.querySelector('input');
//  const toggleLabel = themeToggle.querySelector('.toggle-label');
//  const html = document.documentElement;

//  function initTheme() {
//      const savedTheme = localStorage.getItem('theme') || 'dark';
//      html.setAttribute('data-bs-theme', savedTheme);
//      toggleInput.checked = savedTheme === 'light';
//      updateLabel(savedTheme);
//  }

//  function updateLabel(theme) {
//      toggleLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
//  }

//  function toggleTheme() {
//      const currentTheme = html.getAttribute('data-bs-theme');
//      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
     
//      html.setAttribute('data-bs-theme', newTheme);
//      localStorage.setItem('theme', newTheme);
//      toggleInput.checked = newTheme === 'light';
//      updateLabel(newTheme);
//  }

//  initTheme();

//  toggleInput.addEventListener('change', toggleTheme);


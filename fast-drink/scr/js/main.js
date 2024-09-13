
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



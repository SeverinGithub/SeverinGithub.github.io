// -----------------------------------
// MODEL


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + ' ' + mm + ' ' + yyyy;

var cash = 0;
var bank = 0; 

function initModel() {
    cash = 0;
    bank = 0;
}

function addCash(newMoney) {
    console.log("addCash("+newMoney+") adding to cash "+cash);
    cash += newMoney;
}

function setCash(newMoney) {
    console.log("addCash("+newMoney+") adding to cash"+cash);
    cash = newMoney;
}

function addBank(newMoney) {
    console.log("addBank("+newMoney+") adding to bank "+bank);
    bank += newMoney;
}

function setBank(newMoney) {
    console.log("addBank("+newMoney+") adding to bank"+bank);
    bank = newMoney;
}

function getTotal() {
  return cash + bank
}

const listofallusernames = ["Severin", "User2", "User3", "User4", "User5"];

// -----------------------------------
// VIEW

function redisplay() {
    console.log("redisplay")
    document.getElementById('newBankIncome').value = '';
    document.getElementById('newCashIncome').value = '';
    document.getElementById('setTotalCash').value = '';
    document.getElementById('setTotalBank').value = '';
    document.getElementById("mainCashStatus").innerHTML = cash;
    document.getElementById("mainBankStatus").innerHTML = bank;
    document.getElementById("mainTotalStatus").innerHTML = getTotal();
    document.getElementById("todaysDateBank").innerHTML = today;
    document.getElementById("todaysDateCash").innerHTML = today;

    drawGraph();

    var accountlogin = false;
    var loginaccount = "Severin Schwarz";

    document.getElementById("exUsername").disabled = accountlogin;
    document.getElementById("newUsername").disabled = accountlogin;
    document.getElementById("createThenewUsernameBTN").disabled = accountlogin;
    
    if(accountlogin == true){
        document.getElementById("exUsername").value = 'Logdin with: ' + loginaccount;
        document.getElementById("newUsername").value = 'Logdin with: ' + loginaccount;
    }

}

// -----------------------------------
// CONTROLLER

function initController() {
    cash = parseFloat(localStorage.getItem("cash"))
    if (isNaN(cash))
        cash = 0
    bank = parseFloat(localStorage.getItem("bank"))
    if (isNaN(bank))
        bank = 0
    redisplay()
}

$(document).ready(function() {
    console.log("jquery is ready");
    initModel();
    initController();

    {#DOCREADY#}

        $("#SaveChangesBtnCash").off('click').on('click', function() {
            if(document.getElementById("newCashIncome").value != ""){
                var str = document.getElementById("newCashIncome").value
                console.log("saved money input" + " " + str);
                var flt = parseFloat(str)
                console.log(" float: " + flt)
                if (isNaN(flt))
                    flt = 0;
                addCash(flt)
                localStorage.setItem("cash", cash)
            }    
        else {
                var str = document.getElementById("setTotalCash").value
                console.log("saved money set to" + " " + str);
                var flt = parseFloat(str)
                console.log(" float: " + flt)
                if (isNaN(flt))
                    flt = 0;
                setCash(flt)
                localStorage.setItem("cash", cash)
        }

        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToastCash'))
        toastBootstrap.show()

        redisplay()
         }); 

        $("#SaveChangesBtnBank").off('click').on('click', function() {
            if(document.getElementById("newBankIncome").value != ""){
                var str = document.getElementById("newBankIncome").value
                console.log("saved money input" + str);
                var flt = parseFloat(str)
                console.log(" float: " + flt)
                if (isNaN(flt))
                    flt = 0;
                addBank(flt)
                localStorage.setItem("bank", bank)
            }
            else {
                var str = document.getElementById("setTotalBank").value
                console.log("saved bank set to" + " " + str);
                var flt = parseFloat(str)
                console.log(" float: " + flt)
                if (isNaN(flt))
                    flt = 0;
                setBank(flt)
                localStorage.setItem("bank", cash)
            }

            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToastBank'))
            toastBootstrap.show()
            
            redisplay()
        });

     $("#factoryResetBtn").off('click').on('click', function() {
         console.log("factoryResetBtn Pressed")
         cash = 0;
         localStorage.setItem("cash", 0)
         bank = 0;
         localStorage.setItem("bank", 0)
         redisplay()
     });

     $("#loginAUsernameBTN").off('click').on('click', function() {
        if(document.getElementById("exUsername") == listofallusernames)
            var accountlogin = false;
        redisplay()
    });
});


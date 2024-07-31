// -----------------------------------
// MODEL


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
function addBank(newMoney) {
    console.log("addBank("+newMoney+") adding to bank "+bank);
    bank += newMoney;
}

function getTotal() {
  return cash + bank
}

// -----------------------------------
// VIEW

function redisplay() {
    console.log("redisplay")
    document.getElementById('newBankIncome').value = '';
    document.getElementById('newCashIncome').value = '';
    document.getElementById("mainCashStatus").innerHTML = cash;
    document.getElementById("mainBankStatus").innerHTML = bank;
    document.getElementById("mainTotalStatus").innerHTML = getTotal();
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

    $("#saveBankInput").off('click').on('click', function() {
        var str = document.getElementById("newBankIncome").value
        console.log("saved money input" + str);
        var flt = parseFloat(str)
        console.log(" float: " + flt)
        if (isNaN(flt))
            flt = 0;
        addBank(flt)
        localStorage.setItem("bank", bank)
        redisplay()
    });

    $("#saveCashInput").off('click').on('click', function() {
        var str = document.getElementById("newCashIncome").value
        console.log("saved money input" + " " + str);
        var flt = parseFloat(str)
        console.log(" float: " + flt)
        if (isNaN(flt))
            flt = 0;
        addCash(flt)
        localStorage.setItem("cash", cash)
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



});
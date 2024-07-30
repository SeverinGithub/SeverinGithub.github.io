// var totalMoney = 0;
// document.getElementById("mainBankStatus").innerHTML = totalMoney;

// var bankMoney = 0;
// document.getElementById("bankAccountStatus").innerHTML = bankMoney;

// var cashMoney = 0;
// document.getElementById("cashStatus").innerHTML = cashMoney;

// var bankMoneyInput = [];
// document.getElementById("newMoneyIncome").innerHtml = bankMoneyInput;

// function addBankMoney() {
//     console.log("add Bank Money");
//     document.getElementById("mainBankStatus").innerHTML = totalMoney;
//     document.getElementById("bankAccountStatus").innerHTML = bankMoney;
// }

// function addCashMoney() {
//     console.log("add 100 Cash");
//     totalMoney += 100;
//     cashMoney += 100;
//     document.getElementById("mainBankStatus").innerHTML = totalMoney;
//     document.getElementById("cashStatus").innerHTML = cashMoney;
// }

// function subtraktCashMoney() {
//     console.log("subtrakt 100 Cash");
//     totalMoney -= 100;
//     cashMoney -= 100;
//     document.getElementById("mainBankStatus").innerHTML = totalMoney;
//     document.getElementById("cashStatus").innerHTML = cashMoney;
// }

// function subtraktBankMoney() {
//     console.log("subtrakt 100 Money");
//     totalMoney -= 100;
//     bankMoney -= 100;
//     document.getElementById("mainBankStatus").innerHTML = totalMoney;
//     document.getElementById("bankAccountStatus").innerHTML = bankMoney;
// }


// -----------------------------------
// MODEL


var cash = 0;
var bank = 0; 
// var total = 0;

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


//addCash(200)


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
        addBank(flt)
        localStorage.setItem("bank", bank)
        redisplay()
    });

    $("#saveCashInput").off('click').on('click', function() {
        var str = document.getElementById("newCashIncome").value
        console.log("saved money input" + " " + str);
        var flt = parseFloat(str)
        console.log(" float: " + flt)
        addCash(flt)
        localStorage.setItem("cash", cash)
        redisplay()
    }); 

    $("#addMoneyButton").off('click').on('click', function() {
        console.log("addMoneyButton Pressed")
    });
});
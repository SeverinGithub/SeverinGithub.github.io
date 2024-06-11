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

var cash = 0
var bank = 0

function addCash(newMoney) {
    cash += newMoney
}
function addBank(newMoney) {
    console.log("New Income + " + newMoney);
    bank += newMoney
}

function getTotal() {
    return cash + bank
}

//addCash(200)


// -----------------------------------
// VIEW

function redisplay() {
    console.log("redisplay")
    document.getElementById("mainCashStatus").innerHTML = cash;// + "&nbsp;&euro;"
    document.getElementById("mainBankStatus").innerHTML = bank;
    document.getElementById("mainTotalStatus").innerHTML = getTotal();
}


// -----------------------------------
// CONTROLLER

function saveBankInput() {
    var str = document.getElementById("newMoneyIncome").value
    console.log("saved money input" + str);
    var flt = parseFloat(str)
    console.log(" float: " + flt)
    addBank(flt)
    redisplay()
}

function saveCashInput() {
    console.log("saved money input");
    addCash(parseFloat(document.getElementById("newCashMoneyIncome").value))
    redisplay()
}
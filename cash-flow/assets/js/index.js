var totalMoney = 0;
document.getElementById("mainBankStatus").innerHTML = totalMoney;

var bankMoney = 0;
document.getElementById("bankAccountStatus").innerHTML = bankMoney;

var cashMoney = 0;
document.getElementById("cashStatus").innerHTML = cashMoney

function addBankMoney() {
    console.log("add Bank Money");
    document.getElementById("mainBankStatus").innerHTML = totalMoney;
    document.getElementById("bankAccountStatus").innerHTML = bankMoney;
    
}

function addCashMoney() {
    console.log("add 100 Cash");
    totalMoney += 100;
    cashMoney += 100;
    document.getElementById("mainBankStatus").innerHTML = totalMoney;
    document.getElementById("cashStatus").innerHTML = cashMoney;
}

function subtraktCashMoney() {
    console.log("subtrakt 100 Cash")
    totalMoney -= 100;
    cashMoney -= 100;
    document.getElementById("mainBankStatus").innerHTML = totalMoney;
    document.getElementById("cashStatus").innerHTML = cashMoney;
}

function subtraktBankMoney() {
    console.log("subtrakt 100 Money")
    totalMoney -= 100;
    bankMoney -= 100;
    document.getElementById("mainBankStatus").innerHTML = totalMoney;
    document.getElementById("bankAccountStatus").innerHTML = bankMoney;
}

function saveBankInput() {
    console.log("saved money input")
}
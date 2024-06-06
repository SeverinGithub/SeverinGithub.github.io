var totalMoney = 0;
document.getElementById("mainBankStatus").innerHTML = totalMoney;

function addBankMoney() {
    console.log("add 100 Money");
    totalMoney += 100;
    document.getElementById("mainBankStatus").innerHTML = totalMoney;
}
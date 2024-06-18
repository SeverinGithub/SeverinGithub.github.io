var totalclicks = parseInt(localStorage.getItem("localTotalClicks"));
document.getElementById("totalClicks").innerHTML = totalclicks;

localStorage.setItem("localTotalClicks", "");


function addAClick() {
    totalclicks += 1;
    document.getElementById("totalClicks").innerHTML = totalclicks;
}
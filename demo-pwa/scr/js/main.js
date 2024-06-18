localStorage.setItem(localTotalClicks, 0);

var totalclicks = parseInt(localStorage.getItem("localTotalClicks"));
document.getElementById("totalClicks").innerHTML = totalclicks;

function addAClick() {
    totalclicks += 1;
    document.getElementById("totalClicks").innerHTML = totalclicks;
}
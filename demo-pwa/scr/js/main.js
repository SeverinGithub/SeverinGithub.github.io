var totalclicks = 0

function addAClick() {
    totalclicks += 1;
    document.getElementById("totalClicks").innerHTML = totalclicks;
    localStorage.setItem("localTotalClicks", totalclicks);
}

window.onload = (event) => {
    totalclicks = parseInt(localStorage.getItem("localTotalClicks", totalclicks));
    document.getElementById("totalClicks").innerHTML = totalclicks;
};

function refreshClicks() {
    localStorage.setItem("localTotalClicks", 0);
    var totalclicks = 0;
    document.getElementById("totalClicks").innerHTML = totalclicks;
}
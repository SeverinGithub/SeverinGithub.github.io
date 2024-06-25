var totalclicks = 0

function addAClick() {
        totalclicks += 1;
        document.getElementById("totalClicks").innerHTML = totalclicks;
        localStorage.setItem("localTotalClicks", totalclicks);
}

window.onload = (event) => {
    if (localStorage.getItem("localTotalClicks", NaN)){
        totalclicks = 0;
        localStorage.setItem("localTotalClicks", 0);
        document.getElementById("totalClicks").innerHTML = totalclicks;
    }
    totalclicks = parseInt(localStorage.getItem("localTotalClicks", totalclicks));
    document.getElementById("totalClicks").innerHTML = totalclicks;
};
var clicks = parseInt(localStorage.getItem("counter"));
document.getElementById("counter").innerHTML = cicks;


document.getElementById("showTheClicks").innerHTML = clicks;

function addToCounterVarible() {
    var clicks =+ 1;
    document.getElementById("showTheClicks").innerHTML = clicks;
    console.log("Add to Counter")
}
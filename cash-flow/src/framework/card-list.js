

{#CARDLIST#:

  <ul class="list-group marginsetter list-group-flush">
  <li id="listOb1" class="list-group-item"></li>
  <li id="listOb2" class="list-group-item"></li>
  <li id="listOb3" class="list-group-item"></li>
  </ul>

<script>
let text = '{"listorders":[' +
'{"date":"02.12.2024","ordervalue":"120€" },' +
'{"date":"11.03.2025","ordervalue":"220€" },' +
'{"date":"12.03.2025","ordervalue":"-340€" }]}';

const obj = JSON.parse(text);
document.getElementById("listOb1").innerHTML =
obj.listorders[0].date + " / " + obj.listorders[0].ordervalue;

document.getElementById("listOb2").innerHTML =
obj.listorders[1].date + " / " + obj.listorders[1].ordervalue;

document.getElementById("listOb3").innerHTML =
obj.listorders[2].date + " / " + obj.listorders[2].ordervalue;

</script>

:##}


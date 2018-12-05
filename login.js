var form = document.forms.namedItem("inscription");
form.addEventListener('submit', function(ev) {

    var oOutput = document.querySelector("div"),
        oData = new FormData(form);
    var oReq = new XMLHttpRequest();
    
    oReq.send(oData);
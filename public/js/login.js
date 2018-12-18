function validate() {
    var pw1 = document.querySelector("input[name='mdp']").value;
    var pw2 = document.querySelector("input[name='confirm']").value;
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if ((document.querySelector("input[name='username']").value) == "") {
        alert("Ceci n'est pas un nom !");
        return false;
    }
    else if ((!re.test((document.querySelector("input[name='mail']").value))) && ((document.querySelector("input[name='mail']").value) != "")) {
        alert("Ceci n'est pas un mail!");
        return false;
    }
    else if (pw1 != pw2) {
        alert("\erreur: les mots de passes ne correspondent pas")
        return false;
    }
    else return true;
}
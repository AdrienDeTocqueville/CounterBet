function NonVideProfil() {
    var regex = /^[a-zA-Z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if ((!isNaN(document.getElementsByName("username").value)) && ((document.getElementByName("username").value) != "")) {
        alert("Ceci n'est pas un nom !");
        return false;
    }
    else if ((!re.test((document.getElementByName("mail").value))) && ((document.getElementByName("mail").value) != "")) {
        alert("Ceci n'est pas un mail!");
        return false;
    }
    else if ((document.getElementByName("mdp").value).length <= 4 && ((document.getElementByName("mdp").value) != "")) {
        alert("Ceci n'est pas un mot de passe valide !");
        return false;
    }
}

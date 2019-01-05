let selected = null;
let display = 'none';
let teams = document.querySelectorAll("#bet-team > button");
let error = document.querySelector("#bet-error");

function bet_for(team)
{
	error.style.display = 'none';

	if (selected)
		teams[selected - 1].style.background = "rgb(50, 60, 141)";
	selected = team;
	teams[selected - 1].style.background = "rgb(249, 157, 28)";
}

function bet()
{
	if (display == 'none')
		document.querySelector("#bet").style.display = display = 'block';
	else if (!selected)
		error.style.display = 'block';
	else
		alert("Envoi du pari");
}

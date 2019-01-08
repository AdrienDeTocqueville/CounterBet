let selected = null;
let display = 'none';
let teams = document.querySelectorAll("#bet-team > button");
let error = document.querySelector("#bet-error");

function bet_for(i, team)
{
	const blue = "rgb(50, 60, 141)";
	const orange = "rgb(249, 157, 28)";

	error.style.display = 'none';

	if (selected)
		teams[1 - i].style.background = blue;
	teams[i].style.background = orange;

	selected = team;
}

function bet(id, date)
{
	if (display == 'none')
		document.querySelector("#bet").style.display = display = 'block';
	else if (!selected)
		error.style.display = 'block';
	else
		send_bet(selected,id,document.getElementById("num").value,date);
}

async function send_bet(team,id,num,date)
{
	let endpoint = "/bet";
	let body = `team=${team}&match=${id}&price=${num}&date=${date}`;
	

	try {
		(async () => {
			const rawResponse = await fetch(endpoint, {
				method: 'POST',
				headers: {
					"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
				},
				body
			});
			const response = await rawResponse.json();

			console.log(response);
			if (response.error)
				alert(response.msg);
		 })();
	}
	catch (e) {
		console.error(e);
	}
}

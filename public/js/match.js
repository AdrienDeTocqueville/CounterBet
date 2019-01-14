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

function bet(id)
{
	if (display == 'none')
		document.querySelector("#bet").style.display = display = 'block';
	else if (!selected)
		error.style.display = 'block';
	else
		send_bet(selected, id, document.getElementById("num").value);
}

async function send_bet(team, id, num)
{
	let endpoint = "/bet";
	let body = {team, id, num, date: Date().now};
	
	try {
		(async () => {
			const rawResponse = await fetch(endpoint, {
				method: 'POST',
				headers: {
					"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
				},
				body: "json="+JSON.stringify(body)
			});
			const response = await rawResponse.json();

			console.log(response);
			if (response.error)
				alert(response.msg);
			else
				location.reload();
		 })();
	}
	catch (e) {
		console.error(e);
	}
}

async function cancel_bet(id)
{
	let endpoint = "/bet";
	let body = {cancel: 1, id};
	
	try {
		(async () => {
			const rawResponse = await fetch(endpoint, {
				method: 'POST',
				headers: {
					"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
				},
				body: "json="+JSON.stringify(body)
			});
			const response = await rawResponse.json();

			console.log(response);
			if (response.error)
				alert(response.msg);
			else
				location.reload();
		 })();
	}
	catch (e) {
		console.error(e);
	}
}


function toString(d) {
	let time = Math.abs(Date.now() - d);
	let sec = Math.floor(time / 1000);
	let full = 1;

	if (time > 24 * 60 * 60 * 1000) // 1 day
	{
		d = new Date(d);
		var months = [ "January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December" ];
		return d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
	}
	if (time > 60 * 1000) // 1 minute
	{
		let minutes = Math.floor((sec%3600) / 60)
		let hours =  Math.floor(sec / 3600);

		if (full)
		{
			if (hours)
			{
				hours = hours + ' hour' + (hours>1?'s':'')
				if (minutes)
					return hours + ', ' + minutes + ' minute'+(minutes>1?'s':'');
				else
					return hours;
			}
			else
				return minutes + ' minute'+(minutes>1?'s':'');
		}
		else
		{
			if (hours)
				return hours + 'h' + (minutes || '');
			else
				return minutes + 'min';
		}
	}
	else
		return sec + (full? ' second'+(sec>1?'s':''): 's');
}

module.exports = {
	toString
};

window.onload = function() {
	var bigLogo = document.getElementById("bigLogo");
	var aboveTxt = document.getElementById("aboveTxt");
	var belowTxt = document.getElementById("belowTxt");

	bigLogo.onmouseover = function() {
		setTimeout(function() {
			aboveTxt.style.display = "none";
			belowTxt.style.display = "block";
		},300);
	}
	bigLogo.onmouseout = function() {
		setTimeout(function() {
			aboveTxt.style.display = "block";
			belowTxt.style.display = "none";
		},300);
	}
}
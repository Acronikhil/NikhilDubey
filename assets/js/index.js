// Loader Function

var preloader = document.getElementById("loading");
var hide = document.getElementsByClassName("hide");

function LoaderFunction() {
	var delayInMilliseconds = 1000; //1 second

	setTimeout(function () {
		//your code to be executed after 1 second
		preloader.style.display = "none";
		hide.style.display = "none";
	}, delayInMilliseconds);
}

// Change Color Of Dribble

let change = () => {
	console.log("IM CALLED");
	let a = document.getElementsByClassName("ME");
	a.style.color = "white";
};

// Loader Function

var preloader = document.getElementById("loading");
// var hide = document.getElementsByClassName("hide");

function LoaderFunction() {
	var delayInMilliseconds = 1000; //1 second

	setTimeout(function () {
		//your code to be executed after 1 second
		preloader.style.display = "none";
		// hide.style.display = "none";
	}, delayInMilliseconds);
}

// Change Color Of Dribble

let change = () => {
	console.log("IM CALLED");
	let a = document.getElementsByClassName("ME");
	a.style.color = "white";
};

// counter function

$(document).ready(function () {
	$(".counter").counterUp({
		delay: 10,
		time: 1200,
	});
});

// Play Music
// let play = () => {
// 	let music = document.getElementById("music");
// 	let sr = document.getElementById("music").src;
// 	music.src = "http://127.0.0.1:5501/assets/Fly_Me.mp3";
// 	console.log(sr);
// 	music.play();
// };
// let pause = () => {
// 	let music = document.getElementById("music");
// 	music.pause();
// };

const music = document.getElementById("music");
const play = document.getElementById("play");
// const pbtn = documement.getElementById("pbtn");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

const songs = [
	{
		name: "Saviour",
	},
	{
		name: "Fly_Me",
	},
];
songIndex = 0;

let isPlaying = false;
// To Play
const playMusic = () => {
	console.log("Play To Chalra hai");
	music.play();
	isPlaying = true;
	play.classList.replace("fa-play-circle", "fa-pause-circle");
};
// To Pause
const pauseMusic = () => {
	music.pause();

	isPlaying = false;
	play.classList.replace("fa-pause-circle", "fa-play-circle");
};

play.addEventListener("click", () => {
	isPlaying ? pauseMusic() : playMusic();
});

// change music

const loadSong = (songs) => {
	music.src = "./assets/" + songs.name + ".mp3";
};

const nextSong = () => {
	songIndex = (songIndex + 1) % songs.length;
	loadSong(songs[songIndex]);
	playMusic();
};

const prevSong = () => {
	songIndex = (songIndex - 1 + songs.length) % songs.length;
	loadSong(songs[songIndex]);
	playMusic();
};

// loadSong(songs[1]);
next.addEventListener("click", nextSong);
prev.addEventListener("click", prevSong);

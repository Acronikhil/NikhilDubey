// Loader Function
console.log("Script working");
var preloader = document.getElementById("loading");
// var hide = document.getElementsByClassName("hide");

function LoaderFunction() {
	var delayInMilliseconds = 0.1; //1 second

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

// Play Music should work now
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
const music_title = document.getElementById("music_title");
const music_state = document.getElementById("music_state");
const music_name = document.getElementById("music_name");

const songs = [
	{
		name: "Saviour",
		title: "Saviour",
	},
	{
		name: "Fly_Me",
		title: "Fly Me To The Moon",
	},
	{
		name: "This_Trap",
		title: "This Trap 🥳",
	},
	{
		name: "Riot",
		title: "Riot",
	},
	{
		name: "The_People",
		title: "The_People",
	},
	{
		name: "Human",
		title: "Human",
	},
	{
		name: "Jab_Tak__From__M_S_Dhoni_-_The_Untold_Story__",
		title: "Jab_Tak_MSD",
	},
	{
		name: "Ping_Pong",
		title: "Ping_Pong",
	},
	{
		name: "Turn_Down_for_What",
		title: "Turn_Down_for_What",
	},
	{
		name: "Bird_Machine",
		title: "Bird_Machine",
	},
	{
		name: "Magenta_Riddim",
		title: "Magenta_Riddim",
	},
	{
		name: "Not_Tonight",
		title: "Not_Tonight",
	},
	{
		name: "Panda",
		title: "Panda",
	},
	{
		name: "Playboy_-_Barely_Alive_Remix",
		title: "Playboy_-_Barely_Alive_Remix",
	},
	{
		name: "Talk_Dirty__feat__2_Chainz_",
		title: "Talk_Dirty__feat__2_Chainz_",
	},
	{
		name: "Tremor_-_Sensation_2014_Anthem",
		title: "Tremor_-_Sensation_2014_Anthem",
	},
	{
		name: "Yes_We_Faded_-_Original_Mix",
		title: "Yes_We_Faded_-_Original_Mix",
	},
	{
		name: "Bigfoot_-_Dillon_Francis_Remix",
		title: "Bigfoot_-_Dillon_Francis_Remix",
	},
	{
		name: "Breathe_Into_Me",
		title: "Breathe_Into_Me",
	},
	{
		name: "College_Drop",
		title: "College_Drop",
	},
	{
		name: "Dirty_Vibe_-_DJ_Snake___Aazar_Remix",
		title: "Dirty_Vibe_-_DJ_Snake___Aazar_Remix",
	},
	{
		name: "Don_t_Let_Me_Down",
		title: "Don_t_Let_Me_Down",
	},
	{
		name: "Don_t_Let_Me_Down",
		title: "Don_t_Let_Me_Down",
	},
	{
		name: "Let_Me_Love_You",
		title: "Let_Me_Love_You",
	},
	{
		name: "UFO_-_Trap_Edit",
		title: "UFO_-_Trap_Edit",
	},
	{
		name: "I_m_an_Albatraoz",
		title: "I_m_an_Albatraoz",
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
	music_state.textContent = "Playing ";
};
// To Pause
const pauseMusic = () => {
	music.pause();

	isPlaying = false;
	play.classList.replace("fa-pause-circle", "fa-play-circle");
	music_state.textContent = "Paused ";
};


// $("#music").bind("ended", function(){
// nextSong;	
// });

play.addEventListener("click", () => {
	isPlaying ? pauseMusic() : playMusic();
});

// change music

const loadSong = (songs) => {
	music.src = "./assets/" + songs.name + ".mp3";
	music_title.title = songs.title;
	music_name.innerHTML = `${songs.title}`;
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

const autoPlayNext = () => {
	var currentTime = music.currentTime;
	var duration = music.duration;
	// console.log("Im next song player: "+duration+"current time: "+currentTime);
	
	if(currentTime > duration-0.5){
		// console.log("call next song");
		nextSong();
	}
}

// loadSong(songs[1]);
next.addEventListener("click", nextSong);
prev.addEventListener("click", prevSong);

// alert code

const alert_gen = document.getElementById("trigger");

alert_gen.addEventListener("click", () => {
	document.querySelector(".alert").classList.add("show");
	document.querySelector(".alert").classList.remove("hide");
	document.querySelector(".alert").classList.add("showAlert");
	setTimeout(function () {
		document.querySelector(".alert").classList.remove("show");
		document.querySelector(".alert").classList.add("hide");
	}, 3000);
	console.log("im called");
});

const feemplay = document.getElementById("feemplay");
const btnText = document.getElementById("btnText");
let videoState = "paused";
const videoPlay = (name, btnId) => {
	name.load();
	name.play();
	name.requestFullscreen();
	videoState = "playing";
	console.log("vidoState after play btn call:", videoState);
	btnId.textContent = "Pause";
	pauseMusic();
};
const videoPause = (name, btnId) => {
	name.pause();
	videoState = "paused";
	console.log("vidoState after pause btn call:", videoState);
	btnId.textContent = "Play";
	// isPlaying ? pauseMusic() : playMusic();
};

// feemplay.addEventListener("click", () => {
// 	let play = document.getElementById("feemplayer");
// 	// play.play();
// 	// play.requestFullScreen();
// 	videoState == "paused" ? videoPlay(play) : videoPause(play);
// });

const videoPlayer = (id, btnId) => {
	videoState == "paused" ? videoPlay(id, btnId) : videoPause(id, btnId);
};

const toggle_btn = document.getElementById("gallery");
const cerificateGallery = document.getElementById("certificate_Gallery");
let Accordian = "collapsed";

const openAcc = () => {
	cerificateGallery.textContent = "Close ";
	Accordian = "opened";
	console.log("OpenAcc called");
};

const closeAcc = () => {
	cerificateGallery.textContent = "Open ";
	Accordian = "collapsed";
	console.log("closeAcc called");
};

toggle_btn.addEventListener("click", () => {
	console.log("Mia to call hua");
	Accordian == "collapsed" ? openAcc() : closeAcc();
});

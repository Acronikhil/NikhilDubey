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
	// console.log("IM CALLED");
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
const music_stat = document.getElementById("musicStat");

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
		title: "The People",
	},
	{
		name: "Human",
		title: "Human",
	},
	{
		name: "Jab_Tak__From__M_S_Dhoni_-_The_Untold_Story__",
		title: "JabTak MSD",
	},
	{
		name: "Ping_Pong",
		title: "Ping Pong",
	},
	{
		name: "Turn_Down_for_What",
		title: "Turn Down for What",
	},
	{
		name: "Bird_Machine",
		title: "Bird Machine",
	},
	{
		name: "Magenta_Riddim",
		title: "Magenta Riddim",
	},
	{
		name: "Not_Tonight",
		title: "Not Tonight",
	},
	{
		name: "Panda",
		title: "Panda",
	},
	{
		name: "Playboy_-_Barely_Alive_Remix",
		title: "Playboy Barely Alive Remix",
	},
	{
		name: "Talk_Dirty__feat__2_Chainz_",
		title: "Talk Dirty feat 2 Chainz",
	},
	{
		name: "Tremor_-_Sensation_2014_Anthem",
		title: "Tremor Sensation 2014 Anthem",
	},
	{
		name: "Yes_We_Faded_-_Original_Mix",
		title: "Yes We Faded Original Mix",
	},
	{
		name: "Bigfoot_-_Dillon_Francis_Remix",
		title: "Bigfoot Dillon Francis Remix",
	},
	{
		name: "Breathe_Into_Me",
		title: "Breathe Into Me",
	},
	{
		name: "College_Drop",
		title: "College Drop",
	},
	{
		name: "Dirty_Vibe_-_DJ_Snake___Aazar_Remix",
		title: "Dirty Vibe DJ Snake Aazar Remix",
	},
	{
		name: "Don_t_Let_Me_Down",
		title: "Don't Let Me Down",
	},
	{
		name: "Don_t_Let_Me_Down",
		title: "Don'tLet Me Down",
	},
	{
		name: "Let_Me_Love_You",
		title: "Let Me Love You",
	},
	{
		name: "UFO_-_Trap_Edit",
		title: "UFO Trap Edit",
	},
	{
		name: "I_m_an_Albatraoz",
		title: "I'm an Albatraoz",
	},
];

let songsLength = songs.length;

const loadSong = (songs) => {
	music.src = "./assets/" + songs.name + ".mp3";
	music_title.title = songs.title;
	music_name.innerHTML = `${songs.title}`;
};

let loadRandomSong = ()=>{
	let randIndex = Math.floor(Math.random() * songsLength);
	// console.log(`Random index: ${randIndex}`);
	loadSong(songs[randIndex]) ;
	return randIndex;
}

let previousSongIndex =0;
let songIndex = loadRandomSong();

// songIndex = randomSongIndex();



let isPlaying = false;



// To Play
const playMusic = () => {
	// console.log("Play To Chalra hai");
	music.play();

	isPlaying = true;
	play.classList.replace("fa-play-circle", "fa-pause-circle");
	music_stat.classList.replace("fa-play-circle", "fa-pause-circle");
	music_state.textContent = "Playing ";
};
// To Pause
const pauseMusic = () => {
	music.pause();

	isPlaying = false;
	play.classList.replace("fa-pause-circle", "fa-play-circle");
	music_stat.classList.replace("fa-pause-circle", "fa-play-circle");
	music_state.textContent = "Paused ";
};


play.addEventListener("click", () => {
	isPlaying ? pauseMusic() : playMusic();
});

// change music



const nextSong = () => {
	previousSongIndex= songIndex;
	// songIndex = (songIndex + 1) % songsLength;
	songIndex=  loadRandomSong();
	playMusic();
	showMusicDetails();
};

const prevSong = () => {
	// songIndex = (songIndex - 1 + songs.length) % songs.length;
	songIndex = previousSongIndex;
	loadSong(songs[songIndex]);
	playMusic();
	showMusicDetails();
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

const showMusicDetails = ()=> {
	document.querySelector(".alert").classList.add("show");
	document.querySelector(".alert").classList.remove("hide");
	document.querySelector(".alert").classList.add("showAlert");
	setTimeout(function () {
		document.querySelector(".alert").classList.remove("show");
		document.querySelector(".alert").classList.add("hide");
	}, 3000);
	console.log("im called");
}
alert_gen.addEventListener("click", () => {
	showMusicDetails();
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

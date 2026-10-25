let webClick = 0;

let videoManager;


document.addEventListener("DOMContentLoaded", () => {
    videoManager = new VideoManager();
});

const lofi = [
    {
        name: "On-My-Way",
        title: "On My Way",
    },
    {
        name: "Lost-and-Found",
        title: "Lost & Found",
    },
    {
        name: "Hidden In The Mist",
        title: "Hidden In The Mist",
    },
    
    {
        name: "Journey",
        title: "Journey",
    },
    {
        name: "Sweet Meetings",
        title: "Sweet Meetings",
    }
    ,{
        name: "City-Lights",
        title: "City Lights",
    },
];


const music = document.getElementById("music");
const play = document.getElementById("play");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const music_title = document.getElementById("music_title");
const music_name = document.getElementById("music_name");
const music_stat = document.getElementById("musicStat");
const lofiBtn = document.getElementById("lofi");

var preloader = document.getElementById("loading");
// var hide = document.getElementsByClassName("hide");



// function LoaderFunction() {
//   var delayInMilliseconds = 0.1; //1 second

//   setTimeout(function () {
//     preloader.style.display = "none";
//     // hide.style.display = "none";
//   }, delayInMilliseconds);
// }

// Change Color Of Dribble

let change = () => {
  // console.log("IM CALLED");
  let a = document.getElementsByClassName("ME");
  a.style.color = "white";
};

let songs = lofi;
let songsLength = songs.length;

const loadSong = (songs) => {
    music.src = "./assets/music/" + songs.name + ".mp3";
    music_title.title = songs.title;
    music_name.innerHTML = `${songs.title}`;
};

const loadRandomSong = () => {
    let songsLength = songs.length;
    let randIndex = Math.floor(Math.random() * songsLength);
    loadSong(songs[randIndex]);
    return randIndex;
};

let previousSongIndex = 0;
let songIndex = loadRandomSong();

// songIndex = randomSongIndex();

let isPlaying = false;

// To Play
const playMusic = () => {

    // pause currently playing video
    if (videoManager && videoManager.currentVideo) {
        videoManager.pause(videoManager.currentVideo);
    }
    music.load();
    music.muted = false;
    music.play();

    isPlaying = true;

    play.classList.replace("fa-play-circle", "fa-pause-circle");
    music_stat.classList.replace("fa-play-circle", "fa-pause-circle");
};
// To Pause
const pauseMusic = () => {
    music.pause();

    isPlaying = false;
    play.classList.replace("fa-pause-circle", "fa-play-circle");
    music_stat.classList.replace("fa-pause-circle", "fa-play-circle");
};

play.addEventListener("click", () => {
    isPlaying ? pauseMusic() : playMusic();
});

// change music

const nextSong = () => {
    previousSongIndex = songIndex;
    songIndex = loadRandomSong();
    showMusicDetails();
    playMusic();
};

const prevSong = () => {
    songIndex = previousSongIndex;
    loadSong(songs[songIndex]);
    showMusicDetails();
    playMusic();
};

const autoPlayNext = () => {
    var currentTime = music.currentTime;
    var duration = music.duration;

    if (currentTime > duration - 0.5) {
        nextSong();
    }
};


next.addEventListener("click", nextSong);
prev.addEventListener("click", prevSong);


const alert_gen = document.getElementById("trigger");
const musicAlert = document.querySelector(".alert");
const musicAlertClose = document.querySelector(".alert .close-btn");

const showMusicDetails = () => {
    musicAlert.classList.add("show");
    musicAlert.classList.remove("hide");
    musicAlert.classList.add("showAlert");
    setTimeout(function () {
        musicAlert.classList.remove("show");
        musicAlert.classList.add("hide");
    }, 3000);
};
alert_gen.addEventListener("click", () => {
    showMusicDetails();
});
musicAlertClose.addEventListener("click", () => {
    musicAlert.classList.remove("show");
    musicAlert.classList.add("hide");
});

const feemplay = document.getElementById("feemplay");
const btnText = document.getElementById("btnText");
let videoState = "paused";

const videoPlay = (name, btnId) => {

    pauseMusic();

    const iframe = document.getElementById(name);

    if (iframe && iframe.player) {
        iframe.player.play();
    }

    videoState = "playing";

    document.getElementById(btnId).textContent = "Pause";
};

// 

//     let src = name.src;
//     name.src = src+"?autoplay=1";    
//     // name.re
//     // name.pause();
//     videoState = "paused";
//     console.log("vidoState after pause btn call:", videoState);
//     btnId.textContent = "Play";
// };
const videoPause = (name, btnId) => {

    const iframe = document.getElementById(name);

    if (iframe && iframe.player) {
        iframe.player.pause();
    }

    videoState = "paused";

    document.getElementById(btnId).textContent = "Play";
};


const videoPlayer = (videoId, btnId) => {

    const btn = document.getElementById(btnId);

    if(btn.textContent === "Play"){

        videoManager.play(videoId);
        btn.textContent = "Pause";

    }else{

        videoManager.pause(videoId);
        btn.textContent = "Play";

    }

};

const songType = document.querySelector(".sng-type");

$(".sng-type").on("click", () => {
    // changeSongType();
    showMusicDetails();
    songType.classList.toggle("lofi");
    songType.classList.contains("lofi") ? songType.innerHTML = "Lofi Mode" : songType.innerHTML = "Normal Mode";
});

const toPlayMusic = true;

$(document).ready(() => {
    showMusicDetails();
    // playMusic();
    setTimeout(() => {
        // console.clear();
        // let music = document.getElementById("music");
        // music.muted = true;
        // console.log(music.muted);
        if (toPlayMusic) {
            music.src = "./assets/music/City-Lights.mp3";
  music_title.title = "City Lights";
  music_name.innerHTML = `City Lights`;
            music.load();
            // music.pause();
            // music.play();
            // music.muted = false;
            // playMusic();
            music.volume = 0.1;
            for (var i = 0.1; i <= 0.5; i += 0.1) {
                setTimeout((music, i) => {

                    // console.log(i);
                    music.volume = i;


                }, 5000 * i, music, i);
            }
        }
        else {
            console.clear();
            console.log("I have to pause music");
        }

        // music.pause();
    }, 3000);
    
});


// $("body").on("click", (e) => {
    
//     let x = e.target.className =="stretched-link";
//     webClick++;
//     if(webClick == 1 && !x) 
//         playMusic();
//     else
//         pauseMusic();
// });

// document.onload(()=> showMusicDetails());

let viewResume =  ()=>{
    console.log("View resume");
    window.open(`assets/Resume/Nikhil_Dubey_CV.pdf`, '_blank');
};

let showTitile = (e)=>{
    
}

function toggleTooltip(el) {
  el.classList.toggle("show");
}


// LAZY LOADING IMAGE CODE
const images = document.querySelectorAll(".lazy");

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const img = entry.target;

      setTimeout(() => {
        img.src = img.dataset.src;
      }, i * 100);

      obs.unobserve(img);
    }
  });
}, { rootMargin: "100px" });

images.forEach(img => observer.observe(img));

// Scroll to Top Button Functionality
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

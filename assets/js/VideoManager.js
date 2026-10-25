class VideoManager {

    constructor() {
        this.players = {};
        this.currentVideo = null;

        document.querySelectorAll(".yt-video").forEach(iframe => {
            this.players[iframe.id] = new YouTubeController(iframe);
        });
    }

    // Videos start as a lightweight thumbnail; the real YouTube player is created on first play
    mount(id) {
        const facade = document.getElementById(id);
        if (!facade || !facade.classList.contains("yt-facade")) return false;

        const iframe = document.createElement("iframe");
        iframe.id = id;
        iframe.className = "yt-video";
        iframe.src = `https://www.youtube.com/embed/${facade.dataset.yt}?enablejsapi=1&autoplay=1&rel=0`;
        iframe.title = facade.dataset.title || "YouTube video player";
        iframe.allow = "autoplay; encrypted-media; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        facade.replaceWith(iframe);
        this.players[id] = new YouTubeController(iframe);
        return true;
    }

    play(id) {

        if (this.currentVideo && this.currentVideo !== id) {
            this.pause(this.currentVideo);
        }

        pauseMusic();

        if (!this.mount(id)) {
            this.players[id].play();
        }

        this.currentVideo = id;
    }

    pause(id) {

        if (this.players[id]) {
            this.players[id].pause();
        }

        this.currentVideo = null;
    }
}

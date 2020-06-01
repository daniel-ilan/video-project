const elem = document.documentElement;
let playButton = document.getElementById("play");
let fullscreenBtn = document.querySelector('#fullScreen');
let stopAnim = document.querySelector('#stopAnim');
let animItem;
let smallAnimItem;
let animNum = 0;


playButton.addEventListener("click", handlePlayButton, false);
fullscreenBtn.addEventListener("click", handleFullScreenButton, false);
stopAnim.addEventListener("click", clickerClicked, false);


document.addEventListener("DOMContentLoaded", function (event) {

    const video = document.getElementById("video");
    createMainSlide();
    loadNextAnim(animNum);
    createSmallSlide(animNum);
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream
    });
    document.querySelector("#displayNumSlides").innerHTML = "שקף " + animNum + " מתוך " + myFrames[1].length;


});

function loadNextAnim(num) {

    const mainContainer = document.getElementById("mainLottiePlayer");
    const animPath = myFrames[0] + myFrames[1][num][1];
    const animData = {
        container: mainContainer,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: animPath,
        name: "large" + num,
    };
    animItem = lottie.loadAnimation(animData);
    document.getElementById("slides_Notes").innerHTML  = myFrames[1][num][4];
}

function createSmallSlide(num){
    const framesArea = document.querySelector('#framesArea');
    const source = myFrames[0] + myFrames[1][num][1];


    const slide = `<div class="frame_container_class">
                        <div id="${myFrames[1][animNum + 1][0]}" class="lottie-small rounded  My_border-dark animated_slideInRight slideInRight"> </div>
                    </div>`;
        framesArea.innerHTML = slide;
        const smallAnimContainer = document.getElementById(myFrames[1][animNum + 1][0]);
        const smallAnimData = {
            container: smallAnimContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: source,
            name: "small" + num,
        };

        smallAnimItem = lottie.loadAnimation(smallAnimData);
        smallAnimItem.addEventListener('DOMLoaded', function () {
            smallAnimItem.goToAndStop((smallAnimItem.getDuration(false) / 2)*1000, false);
        });
}

function createMainSlide(){
    const mainSlide = `<div id="mainLottiePlayer" class="lottie-large"></div>`;
    const mainContainer = document.querySelector('#animationsContainer');
    mainContainer.innerHTML = mainSlide;
}


function completed() {

    animItem.destroy();
    animNum++;
    // if (smallAnimItem != null){
    //     smallAnimItem.destroy();
    // }
    loadNextAnim(animNum);
    document.querySelector("#displayNumSlides").innerHTML = "שקף " + animNum + " מתוך " + myFrames[1].length;

}

const constraints = {
    video: {width: 1280, height: 720}

};


let clicks = 0;
let curFrame;
let lastFrame;
function clickerClicked() {
    /**
     * todo: change playSegments to play the frames according to each animation (list and image are not working I am
     *  thinking of doing a while loop with a different variable for each animation so:
     *  while (var < animationsClicks){play until next click - still all the timing between clicks needs to be equal}
     *
     */

    if (clicks === 0) {
        lastFrame = animItem.totalFrames;
        animItem.playSegments([animItem.firstFrame + animItem.currentFrame, lastFrame / 2], true);
        curFrame = animItem.currentFrame;
        clicks++;
        createSmallSlide(animNum + 1);
    } else if (clicks === 1) {
        animItem.playSegments([lastFrame / 2, lastFrame], true);
        clicks--;
        animItem.addEventListener("complete", completed, false);
    }
}


async function playVideo(videoElem) {
    try {
        await videoElem.play();
        playButton.classList.add("playing");
    } catch (err) {
        playButton.classList.remove("playing");
    }
}

function handlePlayButton() {
    const videoElem = document.querySelector("#video");
    if (videoElem.paused) {
        playVideo(videoElem);
    } else {
        videoElem.pause();
        playButton.classList.remove("playing");
    }
}


function handleFullScreenButton() {
    if (fullscreenBtn.classList.contains('isFull')) {
        closeFullscreen();
    } else {
        openFullscreen();
    }

}

/* View in fullscreen */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
    fullscreenBtn.classList.add('isFull');
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
    fullscreenBtn.classList.remove('isFull');
}
// import * as ebml from 'ts-ebml';
const elem = document.documentElement;
let animItem;
let recordedAnimItem;
let smallAnimItem;
let animNum = 0;
let player = "";
// let mediaRecorder = false;
let recorder = false;
const recordedAnimations = [];

let controlBar;
let playButton;
let fullscreenBtn;
let stopAnim;

document.addEventListener("DOMContentLoaded", function(event) {
  getStartingControls();
  createMainSlide();
  loadNextAnim(animNum);
  createSmallSlide(animNum);
  stopAnim.disabled = true;
  stopAnim.addEventListener("click", clickerClicked, false);
  fullscreenBtn.addEventListener("click", handleFullScreenButton, false);

  

  document.querySelector("#displayNumSlides").innerHTML =
    "שקף " + animNum + " מתוך " + myFrames[1].length;
  if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
    console.log("Let's get this party started");
    loadRecorder();
  }
});

/**
 * 
 * @param {int} num = @param{animNam} loads the next main animation
 * @event clicker clicked
 * @fires openHiddenCanvas
 */
function loadNextAnim(num) {
  const mainContainer = document.getElementById("mainLottiePlayer");
  const animPath = myFrames[0] + myFrames[1][num][1];
  const animData = {
    container: mainContainer,
    renderer: "canvas",
    loop: false,
    autoplay: false,
    path: animPath,
    name: "large" + num,
    rendererSettings: { id: "canvasElem" }
  };
  animItem = lottie.loadAnimation(animData);
  openHiddenCanvas(animPath, num);
  document.getElementById("slides_Notes").innerHTML = myFrames[1][num][4];
}

function openHiddenCanvas(animPath, num) {
  const recordCanvas = document.querySelector("#canvasRecordContainer");
  const animData = {
    container: recordCanvas,
    renderer: "canvas",
    loop: false,
    autoplay: false,
    path: animPath,
    name: "large" + num,
    rendererSettings: { id: "canvasRecord" }
  };
  recordedAnimItem = lottie.loadAnimation(animData);
}

/**
 * 
 * @param {int} num = @param{animNam + 1} 
 * @event clickerClicked when clicks = 0
 * loads the next small animation and plays it aoutomatically to 50%
 */
function createSmallSlide(num) {
  const framesArea = document.querySelector("#framesArea");
  const source = myFrames[0] + myFrames[1][num][1];
  framesArea.innerHTML = `<div class="frame-container">
                        <div id="${myFrames[1][
                          animNum + 1
                        ][0]}" class="lottie-small rounded"> </div>
                    </div>`;
  const smallAnimContainer = document.getElementById(
    myFrames[1][animNum + 1][0]
  );
  const smallAnimData = {
    container: smallAnimContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: source,
    name: "small" + num,
    rendererSettings: {
      className: "animated_slideInRight"
    }
  };

  smallAnimItem = lottie.loadAnimation(smallAnimData);
  smallAnimItem.addEventListener("DOMLoaded", function() {
    smallAnimItem.goToAndStop(
      smallAnimItem.getDuration(false) / 2 * 1000,
      false
    );
  });
}

function createMainSlide() {
  const mainSlide = `<div id="mainLottiePlayer" class="lottie-large"></div>`;
  const mainContainer = document.querySelector("#animationsContainer");
  mainContainer.innerHTML = mainSlide;
}

/**
 * @event animationCompleted
 * destroys the main animation 
 * destroys the recorded animation 
 * stops the media recorded if it's active
 * animNum = animNum + 1
 * @fires loadNextAnim 
 */
function completed() {
  if (recorder && (recorder.getState() !== "inactive" || recorder.getState() !== "stopped")) {
    recorder.stopRecording(function(e) {
      if (recorder.getState() === "inactive" || recorder.getState() === "stopped") {
        getSeekableBlob(recorder.getBlob(), function(seekableBlob) {
          recordedAnimations[animNum - 1].blob = seekableBlob;
          console.log(seekableBlob);
        });
      }
    });
  }
  stopAnim.disabled = false;
  animItem.destroy();
  recordedAnimItem.destroy();
  animNum++;
  // if (smallAnimItem != null){
  //     smallAnimItem.destroy();
  // }
  loadNextAnim(animNum);
  document.querySelector("#displayNumSlides").innerHTML =
    "שקף " + animNum + " מתוך " + myFrames[1].length;
}

/**
 * @param clicks {int} counts the number of clicker clicks
 * @param curFrame {int} used to save the current frame of the animation object
 * @param lastFrame {int} used to save the last frame of the animation object
 */

let clicks = 0;
let curFrame;
let lastFrame;
function clickerClicked() {
  /**
     * todo: change playSegments to play the frames according to each animation (list is not working I am
     *  thinking of doing a while loop with a different variable for each animation so:
     *  while (var < animationsClicks){play until next click - still all the timing between clicks needs to be equal}
     *
     */

  if (clicks === 0) {
    stopAnim.disabled = true;
    // when the animation enters the screen
    // start recordeing
    recordAnimation(animNum);
    // gets the last frame of the animation to a global variable
    lastFrame = animItem.totalFrames;
    //visible animation
    animItem.playSegments(
      [animItem.firstFrame + animItem.currentFrame, lastFrame / 2],
      true
    );
    //invisible animation: this one is being recorded
    recordedAnimItem.playSegments(
      [animItem.firstFrame + animItem.currentFrame, lastFrame / 2],
      true
    );
    const enableNextClick = function() {
      stopAnim.disabled = false;
      animItem.removeEventListener("complete", enableNextClick);
    };
    animItem.addEventListener("complete", enableNextClick);
    curFrame = animItem.currentFrame;
    //gets the name of the curren animation + the time in the main recorded timeline and appends to recordedAnimations
    const recordingTime = player.record().getDuration();
    recordedAnimations.push({
      time: recordingTime,
      canvasName: recordingTime + animItem.name + ".webm"
    });

    clicks++;
    createSmallSlide(animNum + 1);
  } else if (clicks === 1) {
    stopAnim.disabled = true;
    animItem.playSegments([lastFrame / 2, lastFrame], true);
    recordedAnimItem.playSegments([lastFrame / 2, lastFrame], true);
    clicks--;
    animItem.addEventListener("complete", completed, false);
  }
}

/**
 *
 * @param num = animNum at the moment of calling the function. this is async function so the num changes
 * num is set here to get the correct index in recordedAnimations
 *
 *
 */
function recordAnimation(num) {
  // var theCanvasElementToRecord = document.querySelector("#canvasRecord");
  // var stream = theCanvasElementToRecord.captureStream(30);

  // var options = {
  //   bitrate: 128,
  //   canvas: { width: 1280, height: 720 },
  //   checkForInactiveTracks: false,
  //   disableLogs: false,
  //   frameInterval: 10,
  //   frameRate: 200,
  //   initCallback: null,
  //   mimeType: "video/x-matroska;codecs=avc1,opus",
  //   onTimeStamp: undefined,
  //   recorderType: null,
  //   timeSlice: undefined,
  //   type: "video/x-matroska;codecs=avc1,opus",
  //   video: { width: 1280, height: 720 },
  //   webAssemblyPath: "",
  //   workerPath: undefined
  // };
  // mediaRecorder = new MediaRecorder(stream, options);
  // mediaRecorder.start()
  // var recordedChunks = [];

  // mediaRecorder.ondataavailable = async function(e) {

  //   const d = new Date();
  //   recordedChunks.push(e.data);
  //   var myBlob = new Blob(recordedChunks, {
  //     type: "video/x-matroska;codecs=avc1,opus"
  //   });
  //   myBlob.name = d.getTime() + ".webm";
  //   myBlob.lastModified = d.getTime();
  //   myBlob.lastModifiedDate = d;
  //   player.record().converter.convert(myBlob);
  //   recordedAnimations[num].blob = myBlob;
  //   console.log("animation blob:" + myBlob);

  const theCanvasElementToRecord = document.querySelector("#canvasRecord");
  recorder = new RecordRTC(theCanvasElementToRecord, {
    type: "video/webm;codecs=vp9",
    recorderType: CanvasRecorder,
    mimeType: "video/webm",
    canvas: {
      width: 1280,
      height: 720
    },
    width: 1280,
    height: 720,
    frameRate: 200,
    quality: 10,
    videoBitsPerSecond: 128000,
    frameInterval: 90
  });

  var recordedChunks = [];
  // recorder.stopRecording(function(e) {
  //   if (recorder.getState() === "inactive" || recorder.getState() === "stopped") {
  //     getSeekableBlob(recorder.getBlob(), function(seekableBlob) {
  //       recordedAnimations[num].blob = seekableBlob;
  //       console.log(seekableBlob);
  //     });
  //   }
  // });
  recorder.startRecording();
}


async function playVideo(videoElem) {
  try {
    await videoElem.play();
    playButton.classList.add("playing");
  } catch (err) {
    playButton.classList.remove("playing");
  }
}

/**
 * need to build the controls in html according to classes vjs-control vjs-play-button vjs-record-button.... etc.
 */
function loadRecorder() {
//   var options = {
//     controls: true,
//     width: 320,
//     height: 240,
//     fluid: false,
//     bigPlayButton: false,
//     controlBar: {
//         volumePanel: false
//     },
//     plugins: {
//         record: {
//             audio: false,
//             video: true,
//             maxLength: 20,
//             debug: true,
//             displayMilliseconds: false,
//             convertEngine: 'ts-ebml'
//         }
//     }
// };
  let options = {
    // video.js options
    controls: false,
    bigPlayButton: true,
    fullscreenToggle: false,
    loop: false,
    fluid: true,
    plugins: {
      // videojs-record plugin options
      record: {
        audio: true,
        video: {
            // video media constraints: set resolution of camera
            width: 1280,
            height: 720
          },
        debug: true,
        videoBitRate: 30000,
        videoFrameRate: 60,
        frameWidth: 1280,
        frameHeight: 720,
        convertEngine: 'ts-ebml'
      }
    }
  };

  player = videojs("video", options, function() {
    // print version information at startup
    const msg =
      "Using video.js " +
      videojs.VERSION +
      " with videojs-record " +
      videojs.getPluginVersion("record");
    videojs.log(msg);

    console.log("videojs-record is ready!");
  });



  function changeControls() {
    controlBar.innerHTML = getFinishedControls();
    const replay = document.querySelector("#replay");
    const record = document.querySelector("#record");
    const save = document.querySelector("#save");
    replay.addEventListener("click", () => {
      player.play();
    });
    record.addEventListener("click", () => {
      location.reload();
    });
    save.addEventListener("click", () => {
      upload(player.convertedData);
    });
  }

  player.on("finishRecord", function() {
    // the blob object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    console.log("finished recording:", player.recordedData);
    // finish recording
    changeControls();
    player.play();
    player.pause();
    bodymovin.destroy();
  });
  player.on("deviceReady", function() {
    playButton.disabled = false;
    stopAnim.disabled = false;
  });
  player.on('startConvert', function() {
    console.log('started converting!');
  });
  
  player.on('finishConvert', function() {
    // the convertedData object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    console.log('finished converting: ', player.convertedData);
  });
  playButton.addEventListener("click", recording);
}

function recording() {
  if (player.record().isRecording()) {
    if (recorder && (recorder.getState() !== "inactive" || recorder.getState() !== "stopped")) {
      recorder.stopRecording(function(e) {
        if (recorder.getState() === "inactive" || recorder.getState() === "stopped") {
          getSeekableBlob(recorder.getBlob(), function(seekableBlob) {
            recordedAnimations[animNum - 1].blob = seekableBlob;
            console.log(seekableBlob);
          });
        }
      });
    }
    player.record().stop();
    player.record().stopDevice();
  } else {
    player.record().start();
    playButton.innerHTML = `עצירה <i class="material-icons icon-btn" style="color: #ffffff;">stop</i>`;
    playButton.classList.replace("btn-danger", "btn-dark")
  }
}

async function upload(blob) {
  if (recorder && (recorder.getState() !== "inactive" || recorder.getState() !== "stopped")) {
    await   recorder.stopRecording(function(e) {
      if (recorder.getState() === "inactive" || recorder.getState() === "stopped") {
        getSeekableBlob(recorder.getBlob(), function(seekableBlob) {
          recordedAnimations[animNum - 1].blob = seekableBlob;
          console.log(seekableBlob);
        });
      }
    });
  }

  var serverUrl = "/upload";
  var formData = new FormData();
  formData.append("files[]", blob, blob.name);

  recordedAnimations.forEach(function(animation) {
    formData.append("files[]", animation.blob, animation.blob.name);
  });

  console.log("upload recording " + blob.name + " to " + serverUrl);

  // start upload
  fetch(serverUrl, {
    method: "POST",
    body: formData
  })
    .then(success => console.log("upload recording complete."))
    .catch(error => console.error("an upload error occurred!"));
}

function handleFullScreenButton() {
  if (fullscreenBtn.classList.contains("isFull")) {
    closeFullscreen();
  } else {
    openFullscreen();
  }
}

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
  fullscreenBtn.classList.add("isFull");
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE/Edge */
    document.msExitFullscreen();
  }
  fullscreenBtn.classList.remove("isFull");
}

function getFinishedControls() {
  const finishControls = `
<button type="button" id="save" class="btn btn-dark rounded-pill mr-3">שמירה
  <i class="material-icons icon-btn">publish</i>
</button>
<button type="button" id="replay" class="btn btn-dark rounded-pill mr-3">צפייה בהקלטה
  <i class="material-icons icon-btn">replay</i>
</button>
<button type="button" id="record" class="btn btn-danger rounded-pill">הקלטה מחדש
  <i class="material-icons icon-btn">stop_circle</i>
</button>`;

  return finishControls;
}

function getStartingControls() {
  controlBar = document.querySelector("#myControlBar");
  const initialButtons = `
  <button type="button" id="stopAnim" class="btn rounded-pill mr-3 btn-dark primaryBTN">אנימציה הבאה
  <i class="material-icons icon-btn">reply_all</i>
</button>
<button type="button" id="play" class="btn btn-danger rounded-pill" disabled>הקלטה
  <i class="material-icons icon-btn">stop_circle</i>
</button>
`;

controlBar.innerHTML = initialButtons;

playButton = document.getElementById("play");
fullscreenBtn = document.querySelector("#fullScreen");
stopAnim = document.querySelector("#stopAnim");
}
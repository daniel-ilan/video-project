// import * as ebml from 'ts-ebml';
const elem = document.documentElement;
let animItem;
let recordedAnimItem;
let smallAnimItem;
let animNum = 0;
let player = "";
let isFrameEmpty = false;
// let mediaRecorder = false;
let recorder = false;
const recordedAnimations = [];

let controlBar;
let playButton;
let fullscreenBtn;
let stopAnim;
let clicksToPlay = 0;

document.addEventListener("DOMContentLoaded", function(event) {
  getStartingControls();
  breadCrumbs();
  createMainSlide();
  loadNextAnim(animNum);
  createSmallSlide(animNum);
  stopAnim.disabled = true;
  stopAnim.addEventListener("click", clickerClicked, false);
  fullscreenBtn.addEventListener("click", handleFullScreenButton, false);

  document.querySelector("#displayNumSlides").innerHTML =
    "שקף " + (animNum + 1) + " מתוך " + myFrames[1].length;
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
    rendererSettings: {
      id: "canvasElem"
    }
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
    rendererSettings: {
      id: "canvasRecord"
    }
  };
  recordedAnimItem = lottie.loadAnimation(animData);

  // recordedAnimItem.addEventListener("DOMLoaded", function() {
  //   const recAnim = document.querySelector("#canvasRecord");
  // });
}

/**
 * 
 * @param {int} num = @param{animNam + 1} 
 * @event clickerClicked when clicks = 0
 * loads the next small animation and plays it aoutomatically to 50%
 */
function createSmallSlide(num) {
  //check if there are more frames to play
  if (num >= myFrames[1].length) {
    //pass --> means no more "next slides"
  } else {
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
  createSmallSlide(animNum + 1);

  if (animNum + 1 < myFrames[1].length) {
    if (!isFrameEmpty) {
      stopCanvasRecording();
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
      "שקף " + (animNum + 1) + " מתוך " + myFrames[1].length;
  } else {
    stopCanvasRecording();
    stopAnim.removeEventListener("click", clickerClicked);
    stopAnim.disabled = true;
    smallAnimItem.destroy();
  }
}

/**
 * @param clicks {int} counts the number of clicker clicks
 * @param curFrame {int} used to save the current frame of the animation object
 * @param lastFrame {int} used to save the last frame of the animation object
 */

let clicks = 0;
let curFrame;
let lastFrame;
let framseToPlay = 0;

function clickerClicked() {
  /**
   * todo: change playSegments to play the frames according to each animation (list is not working I am
   *  thinking of doing a while loop with a different variable for each animation so:
   *  while (var < animationsClicks){play until next click - still all the timing between clicks needs to be equal}
   *
   */
  const frameKind = myFrames[1][animNum][1].split("_")[0];
  totalClicks = myFrames[1][animNum][6];
  if (frameKind === "empty") {
    isFrameEmpty = true;
  } else {
    isFrameEmpty = false;
  }

  if (clicks < totalClicks - 1) {
    const enableNextClick = function() {
      stopAnim.disabled = false;
      animItem.removeEventListener("complete", enableNextClick);
    };

    if (!isFrameEmpty) {
      if (clicks === 0) {
        recordAnimation(animNum);
        lastFrame = animItem.totalFrames;
        framseToPlay = lastFrame / totalClicks;
        //gets the name of the current animation + the time in the main recorded timeline and appends to recordedAnimations
        const recordingTime = player.record().getDuration();
        recordedAnimations.push({
          time: recordingTime,
          canvasName: animItem.name + ".webm"
        });
      }
      animItem.playSegments(
        [
          animItem.firstFrame + animItem.currentFrame,
          framseToPlay * (clicksToPlay + 1)
        ],
        true
      );
      recordedAnimItem.playSegments(
        [
          animItem.firstFrame + animItem.currentFrame,
          framseToPlay * (clicksToPlay + 1)
        ],
        true
      );
      stopAnim.disabled = true;

      animItem.addEventListener("complete", enableNextClick);
      curFrame = animItem.currentFrame;
      clicks++;
      clicksToPlay++;
    } 
  } else if (clicks >= totalClicks - 1 && !isFrameEmpty) {
    // when the animation enters the screen
    // start recordeing
    // gets the last frame of the animation to global variable
    //visible animation
    //invisible animation: this one is being recorded
    // checks if frame is empty - determins in @function recordAnimation
    stopAnim.disabled = true;
    animItem.playSegments(
      [animItem.firstFrame + animItem.currentFrame, lastFrame],
      true
    );
    recordedAnimItem.playSegments(
      [animItem.firstFrame + animItem.currentFrame, lastFrame],
      true
    );
    clicks = 0;
    clicksToPlay = 0;
    framseToPlay = 0;
    animItem.addEventListener("complete", completed, false);
  }
  else if (isFrameEmpty) {
    stopAnim.disabled = true;
    clicks = 0;
    clicksToPlay = 0;
    framseToPlay = 0;
    completed();
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
  //line below gets the kind of the current animation by spliting the string '_'
  const frameKind = myFrames[1][animNum][1].split("_")[0];
  if (frameKind === "empty") {
    //pass
    isFrameEmpty = true;
    console.log("Frame is empty - not recording");
  } else {
    isFrameEmpty = false;
    const theCanvasElementToRecord = document.querySelector("#canvasRecord");
    recorder = new RecordRTC(theCanvasElementToRecord, {
      type: "video/video/x-matroska;codecs=avc1",
      recorderType: CanvasRecorder,
      mimeType: "video/webm",
      frameRate: 200,
      quality: 10,
      videoBitsPerSecond: 128000,
      frameInterval: 90
    });
    recorder.startRecording();
  }
}

/**
 * need to build the controls in html according to classes vjs-control vjs-play-button vjs-record-button.... etc.
 */
function loadRecorder() {
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
        maxLength: 3000,
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
        convertEngine: "ts-ebml"
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
    // can be downloaded by the user, stored on server
    console.log("finished recording:", player.recordedData);
    // finish recording
    changeControls();
    player.play();
    player.pause();
    bodymovin.destroy();
  });
  player.on("deviceReady", function() {
    playButton.disabled = false;
    playButton.classList.replace("btn-dark", "btn-danger");
  });
  player.on("startConvert", function() {
    console.log("started converting!");
  });

  player.on("finishConvert", function() {
    // the convertedData object contains the recorded data that
    // can be downloaded by the user, stored on server
    console.log("finished converting: ", player.convertedData);
  });
  playButton.addEventListener("click", recording);
}

function stopCanvasRecording() {
  if (
    recorder &&
    (recorder.getState() !== "inactive" || recorder.getState() !== "stopped")
  ) {
    recorder.stopRecording(function(e) {
      if (
        recorder.getState() === "inactive" ||
        recorder.getState() === "stopped"
      ) {
        getSeekableBlob(recorder.getBlob(), function(seekableBlob) {
          recordedAnimations[recordedAnimations.length - 1].blob = seekableBlob;
          console.log("finishied!: " + seekableBlob);
        });
      }
    });
  }
}

function recording() {
  if (player.record().isRecording()) {
    animNum++;
    player.record().stop();
    player.record().stopDevice();
    stopCanvasRecording();
  } else {
    player.record().start();
    stopAnim.disabled = false;
    playButton.innerHTML = `סיום <i class="iconify icon-btn" data-icon="mdi:stop" data-inline="false"></i>`;
    playButton.classList.replace("btn-danger", "btn-dark");
  }
}

function upload(blob) {
  $("#uploadModal").modal("show");
  var serverUrl = "/upload";
  var formData = new FormData();
  const blobAttrs = {
    name: blob.name,
    start_time: "main"
  };
  formData.append("files[]", blob, JSON.stringify(blobAttrs));

  recordedAnimations.forEach(function(animation) {
    const attrs = {
      name: animation.canvasName,
      start_time: animation.time
    };
    formData.append("files[]", animation.blob, JSON.stringify(attrs));
  });

  console.log("upload recording " + blob.name + " to " + serverUrl);

  // start upload
  fetch(serverUrl, {
    method: "POST",
    body: formData
  })
    .then(success => completeMessage())
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
<span class="iconify icon-btn" data-icon="mdi:cloud-upload-outline" data-inline="false"></span>
</button>
<button type="button" id="replay" class="btn btn-dark rounded-pill mr-3">צפייה בהקלטה
<span class="iconify icon-btn" data-icon="mdi:replay" data-inline="false"></span>
</button>
<button type="button" id="record" class="btn btn-danger rounded-pill">הקלטה מחדש
<span class="iconify icon-btn" data-icon="mdi:record" data-inline="false"></span>
</button>`;

  return finishControls;
}

function getStartingControls() {
  controlBar = document.querySelector("#myControlBar");
  const initialButtons = `
  <button type="button" id="stopAnim" class="btn rounded-pill mr-3 btn-dark primaryBTN">אנימציה הבאה
  <span class="iconify icon-btn" data-icon="mdi:reply-all-outline" data-inline="false"></span>
</button>
<button type="button" id="play" class="btn btn-dark rounded-pill" disabled>הקלטה
<span class="iconify icon-btn" data-icon="mdi:record" data-inline="false"></span>
</button>
`;

  controlBar.innerHTML = initialButtons;

  playButton = document.getElementById("play");
  fullscreenBtn = document.querySelector("#fullScreen");
  stopAnim = document.querySelector("#stopAnim");
}

function completeMessage() {
  const modalBody = document.querySelector("#uploadBody");
  const statusBar = document.querySelector("#statusBar");
  const msg = `
  <div class="modal-footer animated fadeInUp">
    <p>התחלנו ליצור את הסרטון עבורך ובעוד כמה רגעים הוא יהיה זמין לצפייה ולהורדה :)
        אפשר להמשיך לנווט בממשק ונודיע לך במייל שהסרטון יהיה מוכן
    </p>
    <button id="modalBtn" type="button" class="btn secondaryBtn " data-dismiss="modal">סגירה</button>
    <button id="modal_main_btn" type="button" class="btn primaryBTN disabled">בחירה</button>
</div>
`;

  statusBar.innerHTML = `
  <h2 class="modal-title">העלאה הושלמה בהצלחה</h2>
  <span class="iconify icon-big" data-icon="mdi:cloud-check-outline" data-inline="false"></span> 
  `;

  modalBody.innerHTML = msg;
}



function breadCrumbs() {
  let video_name = project_props[1]
  let project_name = project_props[0][0][1]
  let project_name_div= ""
  if (project_name.length >= 17) {
    project_name_div = project_name.slice(0, 16) + "..";
  } else {
    project_name_div = project_name;
  }

  let div = `<nav id="page_breadcrumb" class="mr-auto pt-1 " aria-label="breadcrumb" dir="rtl">
                      <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#" class="" style="cursor: not-allowed">
                             <svg id="home_icon" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 10H7V10.5V14.5H4.25V9V8.5H3.75H2.80298L9 2.92268L15.197 8.5H14.25H13.75V9V14.5H11V10.5V10H10.5H7.5Z"/>
                             </svg>
                                דף הבית
                        </a></li>
                        <li class="breadcrumb-item"><a id="project_${project_props[0][0][0]}" href="projectPage" data-toggle="tooltip" data-placement="bottom"
                                    title="${project_name}">
                            <svg id="project_icon" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.5 3H3C2.175 3 1.5075 3.675 1.5075 4.5L1.5 13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V6C16.5 5.175 15.825 4.5 15 4.5H9L7.5 3Z" />
                            </svg>
                        ${project_name_div}</a></li>
                        <li class="breadcrumb-item" aria-current="page">  
                        <a id="current_page_breadcrumb_a" href="#">
                        <svg width="18" height="18" viewBox="0 0 24 24"  fill="none" xmlns="http://www.w3.org/2000/svg">
<!--                            <path d="M12.5 5A7.5 7.5 0 0 0 5 12.5a7.5 7.5 0 0 0 7.5 7.5a7.5 7.5 0 0 0 7.5-7.5A7.5 7.5 0 0 0 12.5 5M7 10h2a1 1 0 0 1 1 1v1c0 .5-.38.9-.86.97L10.31 15H9.15L8 13v2H7m5-5h2v1h-2v1h2v1h-2v1h2v1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m4 0h2v1h-2v3h2v1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m-8 1v1h1v-1" fill="#aeaeae"/>-->
                      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" fill="#aeaeae"/>
                        </svg>

                        <div id="current_page_breadcrumb" class="align-middle">${video_name}</div></a>                          
                         </li>
                      </ol>
                 </nav> `;
  $('#pageTitleH').html(div);
  $('[data-toggle="tooltip"]').tooltip();

  let user_div = `<img src="${project_props[2][1]}" class="img-thumbnail rounded-circle" style="width: 2.2vw;height:2.2vw;" alt="">
        <p>${project_props[2][0]}</p>

<!--<svg width="10" height="6" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--<path d="M8.81084 0.815816C8.71522 0.728061 8.56836 0.728061 8.47275 0.815816L5 4.00313L1.52725 0.815816C1.43164 0.728061 1.28478 0.728061 1.18916 0.815816L0.830955 1.14458C0.779366 1.19193 0.75 1.25874 0.75 1.32877C0.75 1.39879 0.779366 1.4656 0.830955 1.51295L4.83095 5.18418C4.92657 5.27194 5.07343 5.27194 5.16905 5.18418L9.16905 1.51295C9.22063 1.4656 9.25 1.39879 9.25 1.32877C9.25 1.25874 9.22063 1.19193 9.16905 1.14458L8.81084 0.815816Z" fill="#BDBDBD" stroke="#BDBDBD" stroke-width="0.5" stroke-linejoin="round"/>-->
<!--</svg>-->
`;
  $('#user_area_sidenav').html(user_div);
}

import { clearSliders, loadSliders, saveSlider } from "./local.js";
import { inputVideo, onDurationReady } from "./video.js";

// volume controller
let volumeControl = document.getElementById("volume-control");
let volumeButton = document.getElementById("volume-button");

// scanner elements
const trimStartDrag = document.getElementById("trim-start-drag");
const videoScanner = document.getElementById("video-scanner");

// play-pause button elements
const playPauseButton = document.getElementById("play-pause-button");
const playFilledButton = document.getElementById("play-button-filled");
const playEmptyButton = document.getElementById("play-button-empty");
const pauseEmptyButton = document.getElementById("pause-button-empty");

function waitForVideoDuration() {
  const spinner = document.getElementById("load-spinner");
  spinner.style.display = "block";
  return new Promise((resolve) => {
    onDurationReady((duration) => {
      spinner.style.display = "none"; // Hide the spinner

      resolve(duration); // Resolve the promise with the duration
    });
  });
}

window.addEventListener(
  "load",
  async () => {
    // wait for video duration
    let videoDuration;
    try {
      videoDuration = await waitForVideoDuration();
    } catch (error) {
      console.error("Error waiting for video duration:", error);
    }

    // map scanner box width to videoDuration
    function scannerWidthDurationMapper(t) {
      const normalizedVal = (t / scannerWidth) * videoDuration;
      return normalizedVal;
    }

    // map videuDuration to scanner box width
    function inverseScannerWidthDurationMapper(t) {
      const normalizedVal = (t / videoDuration) * scannerWidth;
      return normalizedVal;
    }

    // show/hide volume controls
    volumeButton.addEventListener("click", () => {
      volumeControl.classList.toggle("collapse");

      if (!volumeControl.classList.contains("collapse")) {
        volumeControl.addEventListener("change", setVolume);
        volumeControl.addEventListener("input", setVolume);
      } else {
        volumeControl.removeEventListener("change", setVolume);
        volumeControl.removeEventListener("input", setVolume);
      }
    });

    // volume setter
    function setVolume() {
      inputVideo.volume = this.value / 100;
    }

    // visual scanner update
    function setScanner() {
      // update actual time of scanner
      const newX = inputVideo.currentTime;
      saveSlider("start_slider_video", newX);

      // update visual scanner
      const scannerNormalizedNewX = inverseScannerWidthDurationMapper(newX);
      saveSlider("start_slider_actual", scannerNormalizedNewX);
      trimStartDrag.style.left = Math.ceil(scannerNormalizedNewX) + "px";
    }

    // play pause button functionality
    let videoPlayIndicator = true;
    playPauseButton.addEventListener("click", () => {
      playFilledButton.classList.toggle("hidden");
      playEmptyButton.classList.toggle("hidden");
      pauseEmptyButton.classList.toggle("hidden");
      if (videoPlayIndicator) {
        // play video
        inputVideo.play();
        videoPlayIndicator = false;
      } else {
        inputVideo.pause();
        videoPlayIndicator = true;
      }
    });

    inputVideo.addEventListener("timeupdate", setScanner);

    // get bounding x values from scanner box
    const widthEndOffset = 12;
    const scannerWidth = videoScanner.offsetWidth - widthEndOffset;

    // Make the DIV element draggable:
    dragElement(trimStartDrag);

    function dragElement(elmnt) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

      elmnt.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.e;
        e.preventDefault();

        // Get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;

        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.e;
        e.preventDefault();

        // Calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Set the element's new position:
        let newX = elmnt.offsetLeft - pos1;
        if (newX / scannerWidth > 1) {
          newX = scannerWidth;
        } else if (newX < 0) {
          newX = 0;
        }

        // update slider visually
        elmnt.style.left = newX + "px";

        // save slider actual (visual on element) value
        saveSlider("start_slider_actual", newX);

        // convert to video time and save
        const videoNormalizedNewX = scannerWidthDurationMapper(newX);
        saveSlider("start_slider_video", videoNormalizedNewX);

        // set video start time
        inputVideo.currentTime = videoNormalizedNewX;

        // elmnt.style.top = elmnt.offsetTop - pos2 + "px"; // Update vertical position
      }

      function closeDragElement() {
        // Stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  },
  500
);

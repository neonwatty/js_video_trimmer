import { clearSliders, loadSliders, saveSlider } from "./local.js";
import { inputVideo, onDurationReady } from "./video.js";

// define elements
const trimStartDrag = document.getElementById("trim-start-drag");
const videoScanner = document.getElementById("video-scanner");

function waitForVideoDuration() {
  return new Promise((resolve) => {
    onDurationReady((duration) => {
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
      console.log("Video duration is ready:", videoDuration);
    } catch (error) {
      console.error("Error waiting for video duration:", error);
    }

    // get bounding x values from scanner box
    const widthEndOffset = 12;
    const scannerWidth = videoScanner.offsetWidth - widthEndOffset;

    // map scanner box width to videoDuration
    function scannerWidthDurationMapper(t) {
      const normalizedVal = (t / scannerWidth) * videoDuration;
      return normalizedVal;
    }

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

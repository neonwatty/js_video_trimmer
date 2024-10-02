const inputVideo = document.getElementById("input-video");
let videoDuration;
const videoStartTime = 0;
const durationReadyCallbacks = [];

inputVideo.addEventListener(
  "loadedmetadata",
  function () {
    // Ensure the video can be set to the desired current time
    if (this.duration >= videoStartTime) {
      this.currentTime = videoStartTime;
    } else {
      console.warn("The specified time exceeds the video's duration.");
    }

    // update videoTotalTime
    videoDuration = this.duration;
    durationReadyCallbacks.forEach((callback) => callback(videoDuration));
  },
  false
);

function onDurationReady(callback) {
  if (videoDuration !== undefined) {
    callback(videoDuration);
  } else {
    durationReadyCallbacks.push(callback);
  }
}

export { inputVideo, onDurationReady, videoDuration };

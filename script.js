window.addEventListener(
  "load",
  () => {
    // define elements
    const trimStartDrag = document.getElementById("trim-start-drag");
    const videoScanner = document.getElementById("video-scanner");

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

        elmnt.style.left = newX + "px";
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

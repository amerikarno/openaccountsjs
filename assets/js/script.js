function keyDown(ev) {
  let e = window.event || ev;
  let key = e.keyCode;
  //space pressed
  if (key == 32) { //space
      e.preventDefault();
  }
}


window.addEventListener(
  "resize",
  (e) => {
    resizeCanvas();
  },
  true
);
const resizeCanvas = () => {
  setTimeout(() => {
    let canvas = document.getElementById("canvas");
    const wh = window.innerHeight;
    const ww = window.innerWidth;
    const nw = 640;
    const nh = 480;
    const waspct = ww / wh;
    const naspct = nw / nh;

    if (waspct > naspct) {
      var val = wh / nh;
    } else {
      var val = ww / nw;
    }
    let ctrldiv = document.querySelector(".ctrl_div");
    canvas.style.height = 480 * val - ctrldiv.offsetHeight - 18 + "px";
    canvas.style.width = 640 * val - 24 + "px";
  }, 1200);
};
resizeCanvas();
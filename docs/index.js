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
    const nw = 256;
    const nh = 239;
    const waspct = ww / wh;
    const naspct = nw / nh;

    if (waspct > naspct) {
      var val = wh / nh;
    } else {
      var val = ww / nw;
    }
    let ctrldiv = document.querySelector(".ctrl_div");
    canvas.style.height = 239 * val - ctrldiv.offsetHeight - 18 + "px";
    canvas.style.width = 256 * val - 24 + "px";
  }, 1200);
};
resizeCanvas();
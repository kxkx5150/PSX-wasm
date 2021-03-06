"use strict";
var do_iter = true;
var padStatus1;
var padStatus2;
var vram_ptr;
var cout_print = function(){};
var pcsx_worker;
var SoundFeedStreamData;
var file_list;
var states_arrs = [];
var img_data32;
var Module = {
  preRun: [],
  postRun: [],
  print: (function () {
    return function (text) {};
  })(),
  printErr: function (text) {},
  canvas: (function () {
    var canvas = document.getElementById("canvas");
    return canvas;
  })(),
  parentElement: canvas.parentNode,
  setStatus: function (text) {},
  monitorRunDependencies: function (left) {},
};

function my_SDL_LockSurface(surf) {
  var surfData = SDL.surfaces[surf];
  surfData.locked++;
  if (surfData.locked > 1) return 0;
  if (!surfData.buffer) {
    surfData.buffer = _malloc(surfData.width * surfData.height * 4);
    HEAP32[(surf + 20) >> 2] = surfData.buffer;
  }
  HEAP32[(surf + 20) >> 2] = surfData.buffer;
  if (!surfData.image) {
    surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
  }
  return 0;
}
function my_SDL_UnlockSurface(surf) {
  assert(!SDL.GL);
  var surfData = SDL.surfaces[surf];
  if (!surfData.locked || --surfData.locked > 0) {
    return;
  }
  var data = surfData.image.data;
  var src = surfData.buffer >> 2;
  if (!img_data32) {
    img_data32 = new Uint32Array(data.buffer);
  }
  img_data32.set(HEAP32.subarray(src, src + img_data32.length));
  surfData.ctx.putImageData(surfData.image, 0, 0);
}
function var_setup() {
  SoundFeedStreamData = Module.cwrap("SoundFeedStreamData", "null", ["number", "number"]);
  vram_ptr = _get_ptr(0);
  padStatus1 = _get_ptr(1);
  padStatus2 = _get_ptr(2);
  SDL.defaults.copyOnLock = false;
  SDL.defaults.opaqueFrontBuffer = false;
  pcsx_worker = new Worker("pcsx_worker.js");
  pcsx_worker.onmessage = pcsx_worker_onmessage;
}
var check_controller = function () {
  _CheckJoy();
  _CheckKeyboard();
  var states_src = Module.HEAPU8.subarray(padStatus1, padStatus1 + 48);
  var states_arr;
  while (states_arrs.length > 50) {
    states_arrs.pop();
  }
  if (states_arrs.length > 0) {
    states_arr = states_arrs.pop();
    states_arr.set(states_src);
  } else {
    states_arr = new Uint8Array(states_src);
  }
  pcsx_worker.postMessage({ cmd: "padStatus", states: states_arr }, [states_arr.buffer]);
  setTimeout("check_controller()", 30);
};
var pcsx_readfile = function (controller) {
  file_list = controller.files;
  pcsx_worker.postMessage({ cmd: "loadfile", file: controller.files[0] });
  setTimeout("check_controller()", 30);
  return;
};
function pcsx_worker_onmessage(event) {
  var data = event.data;
  switch (data.cmd) {
    case "print":
      break;
    case "setStatus":
      break;
    case "setUI":
      break;
    case "render":
      var vram_arr = data.vram;
      Module.HEAPU8.set(vram_arr, vram_ptr);
      pcsx_worker.postMessage({ cmd: "return_vram", vram: vram_arr }, [vram_arr.buffer]);
      _render(data.x, data.y, data.sx, data.sy, data.dx, data.dy, data.rgb24);
      break;
    case "return_states":
      states_arrs.push(data.states);
      break;
    case "SoundFeedStreamData":
      var pSound_arr = data.pSound;
      var pSound_ptr = Module._malloc(pSound_arr.length);
      Module.HEAPU8.set(pSound_arr, pSound_ptr);
      SoundFeedStreamData(pSound_ptr, data.lBytes);
      Module._free(pSound_ptr);
      break;
  }
}

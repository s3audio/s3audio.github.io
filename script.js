const V2SA_DEMOS = [
  {
    id: "demo01",
    video360: "./assets/v2sa/1whJPpizoDA_86/1whJPpizoDA_86.mp4",
    foa: {
      gt: "./assets/v2sa/1whJPpizoDA_86/1whJPpizoDA_86_gt.wav",
      visage: "./assets/v2sa/1whJPpizoDA_86/1whJPpizoDA_visage.wav",
      omniaudio: "./assets/v2sa/1whJPpizoDA_86/1whJPpizoDA_86_omni.wav",
      s3audio: "./assets/v2sa/1whJPpizoDA_86/1whJPpizoDA_86.wav",
    }
  },
  {
    id: "demo02",
    video360: "./assets/v2sa/1WFJLucjK50_529/1WFJLucjK50_529.mp4",
    foa: {
      gt: "./assets/v2sa/1WFJLucjK50_529/1WFJLucjK50_529_gt.wav",
      visage: "./assets/v2sa/1WFJLucjK50_529/1WFJLucjK50_visage.wav",
      omniaudio: "./assets/v2sa/1WFJLucjK50_529/1WFJLucjK50_529_omni.wav",
      s3audio: "./assets/v2sa/1WFJLucjK50_529/1WFJLucjK50_529.wav",
    }
  },
  {
    id: "demo03",
    video360: "./assets/v2sa/9X2wM6HD_og_933/9X2wM6HD_og_933.mp4",
    foa: {
      gt: "./assets/v2sa/9X2wM6HD_og_933/9X2wM6HD_og_933_gt.wav",
      visage: "./assets/v2sa/9X2wM6HD_og_933/9X2wM6HD_og_visage.wav",
      omniaudio: "./assets/v2sa/9X2wM6HD_og_933/9X2wM6HD_og_933_omni.wav",
      s3audio: "./assets/v2sa/9X2wM6HD_og_933/9X2wM6HD_og_933.wav",
    }
  },
  {
    id: "demo04",
    video360: "./assets/v2sa/fQukntBmFvY_40/fQukntBmFvY_40.mp4",
    foa: {
      gt: "./assets/v2sa/fQukntBmFvY_40/fQukntBmFvY_40_gt.wav",
      visage: "./assets/v2sa/fQukntBmFvY_40/fQukntBmFvY_visage.wav",
      omniaudio: "./assets/v2sa/fQukntBmFvY_40/fQukntBmFvY_40_omni.wav",
      s3audio: "./assets/v2sa/fQukntBmFvY_40/fQukntBmFvY_40.wav",
    }
  },
  {
    id: "demo05",
    video360: "./assets/v2sa/OWN_J9FGZ5I_55/OWN_J9FGZ5I_55.mp4",
    foa: {
      gt: "./assets/v2sa/OWN_J9FGZ5I_55/OWN_J9FGZ5I_55_gt.wav",
      visage: "./assets/v2sa/OWN_J9FGZ5I_55/OWN_J9FGZ5I_visage.wav",
      omniaudio: "./assets/v2sa/OWN_J9FGZ5I_55/OWN_J9FGZ5I_55_omni.wav",
      s3audio: "./assets/v2sa/OWN_J9FGZ5I_55/OWN_J9FGZ5I_55.wav",
    }
  },
  {
    id: "demo06",
    video360: "./assets/v2sa/kMZSoni0etA_10/kMZSoni0etA_10.mp4",
    foa: {
      gt: "./assets/v2sa/kMZSoni0etA_10/kMZSoni0etA_10_gt.wav",
      visage: "./assets/v2sa/kMZSoni0etA_10/kMZSoni0etA_visage.wav",
      omniaudio: "./assets/v2sa/kMZSoni0etA_10/kMZSoni0etA_10_omni.wav",
      s3audio: "./assets/v2sa/kMZSoni0etA_10/kMZSoni0etA_10.wav",
    }
  },
];

let ACTIVE_CELL = null;
let AUDIO_CTX = null;
let FOA_RENDERER = null;

/* ========= Pagination ========= */
const PAGE_SIZE = 1;   // 每页 demo 数量：1 最稳；你可以改成 2
let currentPage = 0;

/* ========= Audio ========= */
async function ensureAudio(){
  if (!AUDIO_CTX) AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();

  // Omnitone 可能没加载成功（路径错），这里做个保护
  if (!FOA_RENDERER) {
    if (!window.Omnitone) {
      throw new Error("Omnitone is not loaded. Check ./assets/lib/omnitone.min.js");
    }
    FOA_RENDERER = Omnitone.createFOARenderer(AUDIO_CTX);
    await FOA_RENDERER.initialize();
    FOA_RENDERER.output.connect(AUDIO_CTX.destination);
  }

  if (AUDIO_CTX.state !== "running") await AUDIO_CTX.resume();
}

function stopAll(){
  // 停视频
  document.querySelectorAll("#v2saRows video").forEach(v => {
    try { v.pause(); } catch {}
  });

  // 强制释放 WebGL：销毁 a-scene 的 renderer/context
  document.querySelectorAll("#v2saRows a-scene").forEach(scene => {
    try {
      if (scene.renderer?.dispose) scene.renderer.dispose();
      if (scene.renderer?.forceContextLoss) scene.renderer.forceContextLoss();
    } catch {}
  });

  ACTIVE_CELL = null;
}

function makeCell(demo, key, label){
  const cell = document.createElement("div");
  cell.className = "cell";

  const viewer = document.createElement("div");
  viewer.className = "viewer";

  const vidId = `${demo.id}-${key}-vid`;
  const camId = `${demo.id}-${key}-cam`;

  viewer.innerHTML = `
    <a-scene embedded vr-mode-ui="enabled:false">
      <a-assets>
        <video id="${vidId}" src="${demo.video360}" crossorigin="anonymous" playsinline webkit-playsinline></video>
      </a-assets>
      <a-entity id="${camId}" camera look-controls position="0 1.6 0"></a-entity>
      <a-videosphere src="#${vidId}" rotation="0 -90 0"></a-videosphere>
    </a-scene>
  `;

  const controls = document.createElement("div");
  controls.className = "controls";

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";

  const stopBtn = document.createElement("button");
  stopBtn.textContent = "Stop";

  const status = document.createElement("div");
  status.className = "status";
  status.textContent = label;

  controls.appendChild(playBtn);
  controls.appendChild(stopBtn);
  controls.appendChild(status);

  cell.appendChild(viewer);
  cell.appendChild(controls);

  playBtn.addEventListener("click", async () => {
    if (ACTIVE_CELL) ACTIVE_CELL.stop();

    ACTIVE_CELL = {
      stop: () => {
        const v = document.getElementById(vidId);
        if (v) {
          try { v.pause(); } catch {}
          try { v.currentTime = 0; } catch {}
        }
      }
    };

    try {
      await ensureAudio();

      const videoEl = document.getElementById(vidId);
      videoEl.muted = true; // 视频静音，音频走 Omnitone
      await videoEl.play();

      // 这里你原本没接 FOA 播放逻辑（只是初始化 Omnitone）
      // 如果你后续要接入 FOA 播放，我们再加。
      status.textContent = `${label} (playing)`;
    } catch (e) {
      console.error(e);
      status.textContent = `${label} (failed)`;
    }
  });

  stopBtn.addEventListener("click", () => {
    const videoEl = document.getElementById(vidId);
    if (videoEl) {
      try { videoEl.pause(); } catch {}
    }
    status.textContent = `${label} (stopped)`;
  });

  return cell;
}

function buildRow(demo){
  const row = document.createElement("div");
  row.className = "row";
  row.appendChild(makeCell(demo, "gt", "Ground Truth"));
  row.appendChild(makeCell(demo, "visage", "ViSAGe"));
  row.appendChild(makeCell(demo, "omniaudio", "OmniAudio"));
  row.appendChild(makeCell(demo, "s3audio", "S3Audio"));
  return row;
}

/* ========= Pager UI (插入到标题下面，不改 HTML) ========= */
function insertPager(){
  const sections = Array.from(document.querySelectorAll("section.section.center"));
  const target = sections.find(sec => (sec.querySelector("h2")?.textContent || "").trim() === "Comparisons with Baselines");
  if (!target) return;

  if (target.querySelector(".pager")) return;

  const pager = document.createElement("div");
  pager.className = "pager";
  pager.style.display = "flex";
  pager.style.justifyContent = "center";
  pager.style.alignItems = "center";
  pager.style.gap = "16px";
  pager.style.margin = "10px auto 14px";

  pager.innerHTML = `
    <button class="pager-btn pill" id="pagerPrev">Prev</button>
    <button class="pager-btn pill" id="pagerNext">Next</button>
  `;

  const h2 = target.querySelector("h2");
  h2.insertAdjacentElement("afterend", pager);

  const prev = document.getElementById("pagerPrev");
  const next = document.getElementById("pagerNext");

  prev.addEventListener("click", () => {
    currentPage = (currentPage - 1 + V2SA_DEMOS.length) % V2SA_DEMOS.length;
    renderPage();
  });

  next.addEventListener("click", () => {
    currentPage = (currentPage + 1) % V2SA_DEMOS.length;
    renderPage();
  });
}


function renderPage(){
  stopAll();

  const root = document.getElementById("v2saRows");
  if (!root) return;

  // 清空旧 DOM（真正销毁 scene，释放 WebGL）
  root.innerHTML = "";

  const start = currentPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, V2SA_DEMOS.length);

  for (let i = start; i < end; i++) {
    root.appendChild(buildRow(V2SA_DEMOS[i]));
  }

}

function init(){
  insertPager();
  renderPage();
}

document.addEventListener("DOMContentLoaded", init);
console.log("script loaded");

// ==========================
// 1. CONFIG
// ==========================
const CONFIG = {
  cloudCount: 400,
  images: ["Cloud1.png", "Cloud2.png", "Cloud3.png", "Cloud4.png", "Cloud5.png", "Cloud6.png", "Cloud7.png", "Cloud8.png", "Cloud9.png", "Cloud10.png", "Cloud11.png"],
  hoverRadius: 180
};

// ==========================
// 2. STATE MACHINE
// ==========================
const STATE = {
  IDLE: 0,
  SELECTED: 1,
  FINAL: 2,
  MODAL: 3,
  POPUP: 4
};

const WORD_COLORS = [
  "#c5c8cc",
  "#b8bcc1",
  "#a9afb5",
  "#9ba2a9",
  "#8b939b"
];

let state = STATE.IDLE;
let selectedCloud = null;
let selectedTime = 0;

const archiveData = [];

let cursor = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

// ==========================
// 3. DOM / DATA
// ==========================
const container = document.getElementById("cloud-container");
const clouds = [];
let thunder = null;

// ==========================
// 4. INIT
// ==========================
function init() {
  try {
    createClouds();
    bindEvents();
    initModalEvents(); 
    initArchiveEvents(); 
    updateRainCounter();
    animate();

    thunder = new Audio("thunder.mp3");
  } catch (err) {
    console.error("Init error:", err);
  }
}

// ==========================
// 5. CLOUD CREATION
// ==========================
function createClouds() {
  for (let i = 0; i < CONFIG.cloudCount; i++) {
    const img = document.createElement("img");

    img.src = CONFIG.images[Math.floor(Math.random() * CONFIG.images.length)];
    img.className = "cloud";

    const size = 30 + Math.random() * 50;

    img.style.width = `${size}px`;
    
    img.style.left = `${Math.random() * (window.innerWidth - size)}px`;
    img.style.top = `${Math.random() * (window.innerHeight - size)}px`;

    img.homeX = parseFloat(img.style.left);
    img.homeY = parseFloat(img.style.top);

    const rawNumber = i + 1;
    img.idNum = rawNumber < 10 ? `0${rawNumber}` : `${rawNumber}`;

    img.addEventListener("click", () => onCloudClick(img));

    container.appendChild(img);
    clouds.push(img);
  }
}

// ==========================
// 6. EVENT BINDING
// ==========================
function bindEvents() {
  window.addEventListener("mousemove", (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  });

  window.addEventListener("touchmove", (e) => {
    cursor.x = e.touches[0].clientX;
    cursor.y = e.touches[0].clientY;
  });
}

function initModalEvents() {
  const exchangeBtn = document.getElementById("exchangeBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  
}

  if (exchangeBtn) {
    exchangeBtn.addEventListener("click", () => {
      if (state !== STATE.MODAL) return;
      processExchange();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (state !== STATE.POPUP) return;
      returnToMainScreen();
    });
  }


function initArchiveEvents() {
  const trigger = document.getElementById("archive-trigger");
  const closeBtn = document.getElementById("close-archive");
  const archivePage = document.getElementById("archive-page");

  if (trigger && archivePage) {
    trigger.addEventListener("click", () => {
      renderArchive();
      archivePage.style.display = "flex";
    });
  }

  if (closeBtn && archivePage) {
    closeBtn.addEventListener("click", () => {
      archivePage.style.display = "none";
    });
  }
}

// ==========================
// 7. MAIN CLICK HANDLER
// ==========================
function onCloudClick(cloud) {
  if (!cloud) return;

  switch (state) {
    case STATE.IDLE:
      enterSelection(cloud);
      break;

    case STATE.SELECTED:
      if (cloud === selectedCloud) {
        enterFinal();
      }
      break;

    default:
      break;
  }
}

function enterSelection(cloud) {
  state = STATE.SELECTED;
  selectedCloud = cloud;
  selectedTime = Date.now();

  safeStyle(cloud, {
    filter: "brightness(0)",
    transition: "transform 2s ease",
    transform: "scale(1.8)"
  });

  scatterOthers(cloud);

  setTimeout(() => {
    if (state !== STATE.SELECTED) return;
    cloud.style.transform = "scale(1)";
  }, 2500);
}

function enterFinal() {
  if (!selectedCloud) return;

  state = STATE.FINAL;
  const heldTime = Date.now() - selectedTime;
  const scale = calcScale(heldTime);

  fadeOthers();
  playThunder();
flashLightning();
expandCloud(scale);
  openModalLater();
}

function calcScale(time) {
  if (time < 1000) return 5;
  if (time < 3000) return 15;
  return 30;
}

function scatterOthers(center) {
  const x = parseFloat(center.style.left);
  const y = parseFloat(center.style.top);

  clouds.forEach(c => {
    if (c === center) return;
    const angle = Math.random() * Math.PI * 2;
    const radius = 120 + Math.random() * 80;
    c.style.transition = "all 1s ease";
    c.style.left = `${x + Math.cos(angle) * radius}px`;
    c.style.top = `${y + Math.sin(angle) * radius}px`;
  });
}

function fadeOthers() {
  clouds.forEach(c => {
    if (c === selectedCloud) return;
    c.style.transition = "opacity 1s ease";
    c.style.opacity = "0";
  });
}

function expandCloud(scale) {
  setTimeout(() => {
    if (!selectedCloud) return;
    selectedCloud.style.transition =
"all 3.2s cubic-bezier(.18,.88,.25,1)";
    selectedCloud.style.left = `${window.innerWidth / 2}px`;
    selectedCloud.style.top = `${window.innerHeight / 2}px`;
    selectedCloud.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
  }, 500);
  
  
}

function playThunder() {
  setTimeout(() => {
    if (!thunder) return;
    thunder.currentTime = 0;
    thunder.play().catch(() => {});
  }, 300);
}
function flashLightning() {

  const flash = document.createElement("div");

  flash.style.position = "fixed";
  flash.style.left = "0";
  flash.style.top = "0";
  flash.style.width = "100vw";
  flash.style.height = "100vh";

  flash.style.background = "#eef6ff";
  flash.style.opacity = "0";

  flash.style.pointerEvents = "none";
  flash.style.zIndex = "9999";

  document.body.appendChild(flash);

  // 1차 강한 번쩍임
  setTimeout(() => {

    flash.style.transition = "opacity 0.05s";
    flash.style.opacity = "1";

  }, 0);

  setTimeout(() => {

    flash.style.transition = "opacity 0.12s";
    flash.style.opacity = "0";

  }, 70);

 // 2차 잔광
setTimeout(() => {

  flash.style.transition = "opacity 0.05s";
  flash.style.opacity = "0.55";

}, 180);

setTimeout(() => {

  flash.style.transition = "opacity 0.15s";
  flash.style.opacity = "0";

}, 300);

// 3차 아주 희미한 잔광
setTimeout(() => {

  flash.style.transition = "opacity 0.04s";
  flash.style.opacity = "0.28";

}, 420);

setTimeout(() => {

  flash.style.transition = "opacity 0.22s";
  flash.style.opacity = "0";

}, 620);

// 4차 거의 안 보이는 잔광
setTimeout(() => {

  flash.style.transition = "opacity 0.04s";
  flash.style.opacity = "0.08";

}, 760);

setTimeout(() => {

  flash.style.transition = "opacity 0.35s";

  // 완전히 끄지 않고 아주 희미하게 남겨둠
  flash.style.opacity = "0.05";

}, 1100);

  // 제거
  setTimeout(() => {

    flash.remove();

  }, 550);

}
function openModalLater() {

  setTimeout(() => {

    // 먹구름 주변 후광이 남아있는 상태에서 팝업 등장
    document.getElementById("wordModal").style.display = "flex";
    state = STATE.MODAL;

    // 팝업이 뜬 뒤 천천히 잔광 제거
    const flash = document.getElementById("lightningFlash");

    if (flash) {

      flash.style.transition = "opacity 0.8s ease";
      flash.style.opacity = "0";

    }

  }, 2500);

  

}

// ==========================
// 8. EXCHANGE PROCESS (🌟 시스템 간섭 요소를 완벽히 제거한 초안전 버전)
// ==========================
let pendingWordData = null;

function processExchange() {
  const wordInput = document.getElementById("wordInput");
  const userWord = wordInput.value.trim();

  if (!userWord) {
    alert("남기실 단어를 입력해주세요.");
    return;
  }

  let cloudName = "먹구름";
  if (selectedCloud && selectedCloud.idNum) {
    cloudName = `먹구름${selectedCloud.idNum}`;
  }

  

  // 데이터 백업 및 리스트 적재 (브라우저 기능 호출을 모두 걷어내어 튕김 원천 차단)
  pendingWordData = { word: userWord, cloudImg: selectedCloud.src, cloudName: cloudName };
  archiveData.push(pendingWordData);
 

  // 첫 번째 입력창 닫기
  document.getElementById("wordModal").style.display = "none";
  wordInput.value = ""; 

  // 두 번째 안내 팝업창 무조건 노출
  const saveModal = document.getElementById("saveModal");
  const saveModalTitle = document.getElementById("saveModalTitle");
  
  if (saveModal && saveModalTitle) {
    saveModalTitle.innerText = `[${cloudName}]을 소장하셨습니다.`;
    saveModal.style.display = "flex"; 
    state = STATE.POPUP;
  } else {
    returnToMainScreen();
  }
}

// ==========================
// 9. RETURN TO MAIN
// ==========================
function returnToMainScreen() {
  document.getElementById("saveModal").style.display = "none";

  if (selectedCloud && pendingWordData) {
    const wordDOM = document.createElement("div");

    wordDOM.className = "cloud placed-word";
    
    wordDOM.innerText = pendingWordData.word;

    wordDOM.style.color =
WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)];
    
    wordDOM.style.position = "absolute";
    wordDOM.style.left = `${selectedCloud.homeX}px`;
    wordDOM.style.top = `${selectedCloud.homeY}px`;
    
    wordDOM.homeX = selectedCloud.homeX;
    wordDOM.homeY = selectedCloud.homeY;
    
    container.appendChild(wordDOM);
    
    clouds.push(wordDOM);

    const idx = clouds.indexOf(selectedCloud);
    if (idx > -1) clouds.splice(idx, 1);
    selectedCloud.remove();
  }

  clouds.forEach(c => {
    c.style.transition = "all 1.5s ease";
    c.style.opacity = "1";
    c.style.left = `${c.homeX}px`;
    c.style.top = `${c.homeY}px`;
  });

 // ⭐ 아카이브를 즉시 연다
renderArchive();
document.getElementById("archive-page").style.display = "flex";

// 뒤에서 상태만 정리
setTimeout(() => {

  clouds.forEach(c => {
    c.style.transition = "left 1.2s ease, top 1.2s ease, opacity 1.2s ease";
  });

  state = STATE.IDLE;
  selectedCloud = null;
  pendingWordData = null;

}, 1500);
}

// ==========================
// ARCHIVE RENDER
// ==========================
function renderArchive() {
  console.log(archiveData);
  const listCont = document.getElementById("archive-list");
  if (!listCont) return;
  
  listCont.innerHTML = "";

  if (archiveData.length === 0) {
    listCont.innerHTML = "<p style='grid-column: 1/-1; color:#999; text-align:center; margin-top:50px;'>아직 교환된 구름이 없습니다.</p>";
    return;
  }

  archiveData.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "archive-item";

    const img = document.createElement("img");
    img.src = item.cloudImg;

    const tagSpan = document.createElement("div");
    tagSpan.className = "cloud-tag";
    tagSpan.innerText = `[${item.cloudName}]`;

    const textSpan = document.createElement("div");
    textSpan.className = "word-text";
    textSpan.innerText = `“ ${item.word} ”`;

    itemDiv.appendChild(img);
    itemDiv.appendChild(tagSpan);
    itemDiv.appendChild(textSpan);
    listCont.appendChild(itemDiv);
    updateRainCounter();
  });
}

function safeStyle(el, styles) {
  if (!el) return;
  Object.entries(styles).forEach(([k, v]) => { el.style[k] = v; });
}

// ==========================
// 10. ANIMATION LOOP
// ==========================
function animate() {
  if (state === STATE.IDLE) {
    clouds.forEach(c => {
      if (c === selectedCloud) return;

      const x = parseFloat(c.style.left);
      const y = parseFloat(c.style.top);
      const dx = x - cursor.x;
      const dy = y - cursor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.hoverRadius) {
        c.style.left = `${x + dx * 0.15}px`;
        c.style.top = `${y + dy * 0.15}px`;
      } else {
        c.style.left = `${x + (c.homeX - x) * 0.02}px`;
        c.style.top = `${y + (c.homeY - y) * 0.02}px`;
      }
    });
  }
  requestAnimationFrame(animate);
}

init();
function updateRainCounter(){

  const target = document.getElementById("rain-days");

  if(!target) return;

  const rainDays = archiveData.length * 0.5;

  target.innerText = rainDays.toFixed(1);

}
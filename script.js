// ===== 表示画面（プロジェクターにつなぐタブレット側） =====
// 候補リストと色ルールは common.js にあります

const resultElement = document.getElementById('result');
const drawButton = document.getElementById('drawButton');
const historyList = document.getElementById('historyList');
const remotePanel = document.getElementById('remotePanel');
const qrBox = document.getElementById('qrBox');
const remoteStatus = document.getElementById('remoteStatus');
const statusDot = document.getElementById('statusDot');

const STATE_KEY = 'bnk2025-bingo-state';
const ROOM_KEY = 'bnk2025-bingo-room';
const HISTORY_SIZE = 5;

// ---- 保存（誤ってページを再読み込みしても続きから再開できるように） ----
function storageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* 保存できない環境では無視 */ }
}

let drawn = []; // 出た順の全結果
try {
  const saved = JSON.parse(storageGet(STATE_KEY) || '[]');
  if (Array.isArray(saved)) drawn = saved.filter(c => candidates.includes(c));
} catch (e) { drawn = []; }

let availableCandidates = candidates.filter(c => !drawn.includes(c)); // まだ出ていない候補
let history = drawn.slice(-HISTORY_SIZE).reverse();
let isDrawing = false;
let displayText = '';
let displayStyleKey = '';

function saveState() {
  storageSet(STATE_KEY, JSON.stringify(drawn));
}

// ---- 表示 ----
function showResult(text, styleKey) {
  displayText = text;
  displayStyleKey = styleKey;
  resultElement.textContent = text;
  applyStyle(resultElement, styleKey);
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.style.display = 'inline-block';
    li.style.margin = '3px';
    applyStyle(li, item);
    historyList.appendChild(li);
  });
}

function addToHistory(result) {
  history.unshift(result);
  if (history.length > HISTORY_SIZE) history.pop();
  renderHistory();
}

// ---- 抽選 ----
function drawRandomCandidate() {
  const index = Math.floor(Math.random() * availableCandidates.length);
  const selectedCandidate = availableCandidates[index];
  availableCandidates.splice(index, 1); // 選んだ候補はリストから削除（二度と出ない）
  return selectedCandidate;
}

function startDraw() {
  if (isDrawing) return; // 抽選中の連打を無視

  if (availableCandidates.length === 0) {
    showResult("ALL COMPLETED!", "");
    broadcastState();
    return;
  }

  isDrawing = true;
  broadcastState();

  const interval = setInterval(() => {
    const randomCandidate = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
    showResult(randomCandidate, randomCandidate);
  }, 150); // 0.15秒ごとにランダム表示

  setTimeout(() => {
    clearInterval(interval);
    const finalResult = drawRandomCandidate();
    drawn.push(finalResult);
    saveState();
    showResult(finalResult, finalResult);
    addToHistory(finalResult);
    isDrawing = false;
    broadcastState();

    // 最後の1つだった場合、完了メッセージを表示
    if (availableCandidates.length === 0) {
      setTimeout(() => {
        showResult("FINAL RESULT: " + finalResult + " - ALL COMPLETED!", finalResult);
        broadcastState();
      }, 2000);
    }
  }, 3000);
}

function resetGame() {
  if (isDrawing) return;
  drawn = [];
  availableCandidates = [...candidates];
  history = [];
  saveState();
  showResult('', '');
  renderHistory();
  broadcastState();
}

drawButton.addEventListener('click', startDraw);

// ---- リモコン接続（PeerJS） ----
let peer = null;
let connections = [];
let peerRetryTimer = null;
let manualPanel = null; // null=自動, true=表示, false=非表示

function getRoomId() {
  let id = storageGet(ROOM_KEY);
  if (!id) {
    id = 'bnk2025-bingo-' + Math.random().toString(36).slice(2, 8);
    storageSet(ROOM_KEY, id);
  }
  return id;
}
const roomId = getRoomId();

function controllerUrl() {
  const url = new URL('controller.html', location.href);
  url.search = '?room=' + encodeURIComponent(roomId);
  url.hash = '';
  return url.toString();
}

function stateMessage() {
  return {
    type: 'state',
    text: displayText,
    styleKey: displayStyleKey,
    history: history,
    remaining: availableCandidates.length,
    total: candidates.length,
    drawing: isDrawing,
  };
}

function broadcastState() {
  const msg = stateMessage();
  connections.forEach(conn => {
    if (conn.open) {
      try { conn.send(msg); } catch (e) { /* 無視 */ }
    }
  });
}

function updateRemoteUI(statusText) {
  const count = connections.filter(c => c.open).length;
  if (statusText) remoteStatus.textContent = statusText;
  else if (count > 0) remoteStatus.textContent = 'Remote connected (' + count + ')';
  else remoteStatus.textContent = 'Scan to control';

  statusDot.className = count > 0 ? 'connected' : (peer && peer.open ? 'waiting' : 'offline');

  // リモコンがつながったらQRは自動で隠す（右上の丸をタップで手動表示切替）
  const show = manualPanel !== null ? manualPanel : count === 0;
  remotePanel.style.display = show ? 'block' : 'none';
}

statusDot.addEventListener('click', () => {
  const visible = remotePanel.style.display !== 'none';
  manualPanel = !visible;
  updateRemoteUI();
});

function schedulePeerRestart(delay) {
  if (peerRetryTimer) return;
  peerRetryTimer = setTimeout(() => {
    peerRetryTimer = null;
    if (peer) { try { peer.destroy(); } catch (e) {} }
    initPeer();
  }, delay);
}

function initPeer() {
  if (typeof Peer === 'undefined') {
    updateRemoteUI('Remote unavailable (offline)');
    return;
  }
  updateRemoteUI('Connecting...');
  peer = new Peer(roomId);

  peer.on('open', () => {
    qrBox.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrBox, { text: controllerUrl(), width: 180, height: 180 });
    }
    updateRemoteUI();
  });

  peer.on('connection', conn => {
    conn.on('open', () => {
      connections.push(conn);
      conn.send(stateMessage());
      updateRemoteUI();
    });
    conn.on('data', data => {
      if (!data || typeof data !== 'object') return;
      if (data.type === 'draw') startDraw();
      else if (data.type === 'reset') resetGame();
      else if (data.type === 'sync') conn.send(stateMessage());
    });
    const remove = () => {
      connections = connections.filter(c => c !== conn);
      updateRemoteUI();
    };
    conn.on('close', remove);
    conn.on('error', remove);
  });

  peer.on('disconnected', () => {
    updateRemoteUI('Reconnecting...');
    setTimeout(() => {
      if (peer && !peer.destroyed && peer.disconnected) peer.reconnect();
    }, 2000);
  });

  peer.on('error', err => {
    // 再読み込み直後は前の接続IDがまだ残っていることがあるので少し待って再試行
    updateRemoteUI('Reconnecting...');
    schedulePeerRestart(err && err.type === 'unavailable-id' ? 5000 : 3000);
  });
}

// ---- 画面スリープ防止（対応ブラウザのみ） ----
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (e) { /* 非対応・拒否時は無視 */ }
}
document.addEventListener('click', requestWakeLock, { once: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});

// ---- 起動時 ----
if (drawn.length > 0) {
  const last = drawn[drawn.length - 1];
  if (availableCandidates.length === 0) {
    showResult("FINAL RESULT: " + last + " - ALL COMPLETED!", last);
  } else {
    showResult(last, last);
  }
}
renderHistory();
initPeer();

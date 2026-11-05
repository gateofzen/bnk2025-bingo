// ===== リモコン（iPhone / Android スマホ側） =====

const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const remainingEl = document.getElementById('remaining');
const drawButton = document.getElementById('drawButton');
const resetButton = document.getElementById('resetButton');
const historyList = document.getElementById('historyList');

const roomId = new URLSearchParams(location.search).get('room');

let peer = null;
let conn = null;
let lastState = null;
let retryTimer = null;

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = cls || '';
}

function isConnected() {
  return conn && conn.open;
}

function updateButtons() {
  const ready = isConnected() && lastState;
  drawButton.disabled = !ready || lastState.drawing || lastState.remaining === 0;
  resetButton.disabled = !ready || lastState.drawing;
}

function render(state) {
  lastState = state;

  if (state.drawing) {
    resultEl.textContent = 'DRAWING...';
    applyStyle(resultEl, '');
    resultEl.classList.add('drawing');
  } else {
    resultEl.classList.remove('drawing');
    resultEl.textContent = state.text || '';
    applyStyle(resultEl, state.styleKey);
  }

  remainingEl.textContent = state.remaining === 0
    ? 'ALL COMPLETED'
    : 'Remaining: ' + state.remaining + ' / ' + state.total;

  historyList.innerHTML = '';
  (state.history || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    applyStyle(li, item);
    li.style.padding = '6px 12px';
    historyList.appendChild(li);
  });

  updateButtons();
}

function scheduleReconnect(delay) {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connect();
  }, delay);
}

function connect() {
  if (!peer || peer.destroyed) return start();
  if (peer.disconnected) {
    peer.reconnect();
    return;
  }
  if (isConnected()) return;

  setStatus('Connecting...');
  conn = peer.connect(roomId, { reliable: true });

  conn.on('open', () => {
    setStatus('Connected', 'connected');
    conn.send({ type: 'sync' });
    updateButtons();
  });
  conn.on('data', data => {
    if (data && data.type === 'state') render(data);
  });
  conn.on('close', () => {
    setStatus('Disconnected - retrying...', 'error');
    updateButtons();
    scheduleReconnect(2000);
  });
  conn.on('error', () => {
    updateButtons();
    scheduleReconnect(3000);
  });
}

function start() {
  if (!roomId) {
    setStatus('Scan the QR code on the display', 'error');
    return;
  }
  if (typeof Peer === 'undefined') {
    setStatus('No internet connection', 'error');
    return;
  }
  peer = new Peer();
  peer.on('open', connect);
  peer.on('disconnected', () => {
    setStatus('Reconnecting...', 'error');
    setTimeout(() => { if (peer && !peer.destroyed && peer.disconnected) peer.reconnect(); }, 2000);
  });
  peer.on('error', err => {
    if (err && err.type === 'peer-unavailable') {
      setStatus('Display not found - retrying...', 'error');
    } else {
      setStatus('Connection error - retrying...', 'error');
    }
    updateButtons();
    scheduleReconnect(3000);
  });
}

drawButton.addEventListener('click', () => {
  if (!isConnected()) return;
  drawButton.disabled = true; // 応答が来るまで二度押し防止
  conn.send({ type: 'draw' });
});

resetButton.addEventListener('click', () => {
  if (!isConnected()) return;
  if (confirm('Reset all results and start over?')) {
    conn.send({ type: 'reset' });
  }
});

// スマホがスリープから復帰したときに再接続
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !isConnected()) connect();
});

start();

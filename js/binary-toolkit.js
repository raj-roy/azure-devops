let BITS = 8;
let value = 0n;

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':');
}
setInterval(updateClock, 1000);
updateClock();

const abacus = document.getElementById('abacus');

function buildAbacus() {
  abacus.innerHTML = '';
  for (let i = BITS - 1; i >= 0; i--) {
    const tile = document.createElement('div');
    tile.className = 'bit-tile';
    tile.id = `tile-${i}`;

    const label = document.createElement('div');
    label.className = 'bit-label';
    label.textContent = `Bit ${i}`;

    const bead = document.createElement('div');
    bead.className = 'bead';
    bead.id = `bead-${i}`;

    const bitVal = document.createElement('div');
    bitVal.className = 'bit-value';
    bitVal.id = `bitval-${i}`;
    bitVal.textContent = '0';

    tile.addEventListener('click', () => toggle(i));
    tile.append(label, bead, bitVal);
    abacus.appendChild(tile);
  }
}

buildAbacus();

function render() {
  for (let i = 0; i < BITS; i++) {
    const on = !!((value >> BigInt(i)) & 1n);
    const bead = document.getElementById(`bead-${i}`);
    const bitVal = document.getElementById(`bitval-${i}`);
    const tile = document.getElementById(`tile-${i}`);
    bead.className = 'bead' + (on ? ' on' : '');
    bitVal.textContent = on ? '1' : '0';
    bitVal.className = 'bit-value' + (on ? ' on' : '');
    tile.className = 'bit-tile' + (on ? ' on' : '');
  }
  document.getElementById('dec').textContent = value.toString();
  const hexPad = Math.max(2, Math.ceil(BITS / 4));
  document.getElementById('hex').textContent = '0x' + value.toString(16).toUpperCase().padStart(hexPad, '0');
  const binStr = value.toString(2).padStart(BITS, '0');
  const half = Math.ceil(BITS / 2);
  const top = binStr.slice(0, BITS - half).padStart(half, '0');
  const bot = binStr.slice(BITS - half);
  const fmt = s => (s.match(/.{1,8}/g) || [s]).join(' ');
  document.getElementById('bin-top').textContent = fmt(top);
  document.getElementById('bin-bot').textContent = fmt(bot);
}

function toggle(bit) {
  value = value ^ (1n << BigInt(bit));
  render();
}

function maxVal() { return (1n << BigInt(BITS)) - 1n; }

function clearOverflow() { document.getElementById('overflow-flag').textContent = ''; }

function increment() { value = (value + 1n) & maxVal(); clearOverflow(); render(); }
function decrement() { value = value === 0n ? maxVal() : value - 1n; clearOverflow(); render(); }
function reset() { value = 0n; clearOverflow(); render(); }

function parseBigInput(id) {
  try { const v = BigInt(document.getElementById(id).value.trim()); return v >= 0n ? v : null; }
  catch { return null; }
}

function arithOp(sign) {
  const operand = parseBigInput('arithInput');
  if (operand === null) return;
  const max = maxVal();
  const result = sign === 1 ? value + operand : value - operand;
  const overflow = result > max || result < 0n;
  value = ((result % (max + 1n)) + (max + 1n)) % (max + 1n);
  document.getElementById('overflow-flag').textContent = overflow ? '\u26a0 OVERFLOW' : '';
  render();
}

function setFromInput() {
  const v = parseBigInput('numInput');
  if (v !== null && v <= maxVal()) { value = v; render(); }
}

function applyBits() {
  const b = parseInt(document.getElementById('bitInput').value);
  if (isNaN(b) || b < 1 || b > 64) return;
  BITS = b;
  const max = maxVal();
  if (value > max) value = max;
  const numInput = document.getElementById('numInput');
  numInput.max = max.toString();
  numInput.placeholder = `0\u2013${max}`;
  buildAbacus();
  requestAnimationFrame(render);
}

// Calendar
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];
let calDate = new Date();
let selectedDate = new Date();

function formatSelectedDate(d) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function updateDateDisplay() {
  document.getElementById('cal-date-text').textContent = formatSelectedDate(selectedDate);
}

function renderCalendar() {
  const today = new Date();
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  document.getElementById('cal-title').textContent = `${MONTHS[month]} ${year}`;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  DAY_NAMES.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    el.className = 'cal-day' + (isToday ? ' today' : '') + (isSelected ? ' selected' : '');
    el.textContent = d;
    el.addEventListener('click', () => {
      selectedDate = new Date(year, month, d);
      updateDateDisplay();
      renderCalendar();
    });
    grid.appendChild(el);
  }
}

function calNav(dir) {
  calDate.setMonth(calDate.getMonth() + dir);
  renderCalendar();
}

function calToday() {
  calDate = new Date();
  selectedDate = new Date();
  updateDateDisplay();
  renderCalendar();
}

renderCalendar();
updateDateDisplay();

requestAnimationFrame(render);

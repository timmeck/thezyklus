import { COURSE } from './academy.js';

const KEY = 'mars-arena-daily-v1';
const VERSION = 1;
const GRADES = { 'A+': 4, A: 3, B: 2, C: 1, RETAKE: 0 };
const CAST = ['iona', 'rook', 'sera', 'tavi', 'beam'];
// Daily orders are deliberately more demanding than the introductory course.
// Each tuple is [source, field, required amount, short progress label].
const DAILY_GOALS = Object.freeze({
  lowg: [['training', 'travel', 320, 'MOVE'], ['training', 'jumps', 4, 'JUMPS'],
    ['stats', 'hits', 12, 'HITS'], ['training', 'specials', 2, 'SPECIALS']],
  rescue: [['training', 'deliveries', 3, 'CAPSULES']],
  camera: [['training', 'points', 16, 'ON-CAMERA HITS']],
  centrifuge: [['training', 'heavyTime', 12, 'HEAVY-g'], ['stats', 'hits', 12, 'HITS']],
  medal: [['training', 'medalTime', 12, 'MEDAL'], ['stats', 'hits', 16, 'HITS']],
  salvage: [['stats', 'pickups', 4, 'SUPPLIES'], ['stats', 'hits', 12, 'HITS']],
});
const DAILY_TARGETS = Object.freeze({
  lowg: '320 MOVE · 4 JUMPS · 12 HITS · 2 SPECIALS',
  rescue: 'DELIVER 3 PRACTICE CAPSULES',
  camera: '16 ON-CAMERA HITS',
  centrifuge: '12s HEAVY-g FOOTING · 12 HITS',
  medal: '12s WITH THE MEDAL · 16 HITS',
  salvage: '4 SUPPLY DROPS · 12 HITS',
});

export function berlinDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function hash(value) {
  let seed = 2166136261;
  for (const letter of value) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619) >>> 0;
  return seed || 2705;
}

// Only the original six drills participate. A release or a local rank therefore
// cannot silently change the challenge already being played on this date.
export function getDailyDrill({ date = new Date() } = {}) {
  const dateKey = berlinDate(date);
  const seed = hash(`MARS-DAILY-${VERSION}/${dateKey}`);
  const lessonIndex = seed % 6;
  const lesson = COURSE[lessonIndex];
  const character = CAST[(seed >>> 5) % CAST.length];
  const candidates = CAST.filter(id => id !== character);
  const offset = (seed >>> 9) % candidates.length;
  const bots = [candidates[offset], candidates[(offset + 1) % candidates.length]];
  return Object.freeze({ version: VERSION, dateKey,
    label: `${dateKey.slice(8, 10)}.${dateKey.slice(5, 7)}.`, seed,
    lessonIndex, lesson: lesson.id, arena: lesson.arena, character, bots,
    target: DAILY_TARGETS[lesson.id],
    duration: lesson.duration, difficulty: 1, compact: true });
}

function goalValue(match, source, field) {
  return Number((source === 'stats' ? match.fighters?.[0]?.stats : match.training)?.[field]) || 0;
}

export function assessDailyDrill(match, drill) {
  const goals = DAILY_GOALS[drill.lesson] || [];
  const checks = goals.map(([source, field, amount]) => goalValue(match, source, field) >= amount);
  const passed = checks.length > 0 && checks.every(Boolean);
  const stats = match.fighters?.[0]?.stats || {};
  const merit = (stats.hits || 0) + (stats.ringouts || 0) * 4 - (stats.recoveries || 0) * 2;
  const grade = passed ? merit > 30 ? 'A+' : merit > 14 ? 'A' : 'B' : 'RETAKE';
  return { passed, checks, grade, rank: 'Daily Drill',
    labels: goals.map(([, field, amount, label]) => `${amount}${field.endsWith('Time') ? 's' : ''} ${label}`),
    comment: passed ? 'Daily orders met. Keep the way home open.' : 'Finish every daily objective before the bell.' };
}

export function dailyProgressText(match, drill) {
  const progress = (DAILY_GOALS[drill.lesson] || []).map(([source, field, amount, label]) => {
    const value = Math.min(amount, Math.max(0, goalValue(match, source, field)));
    return `${label} ${field.endsWith('Time') ? value.toFixed(1) : Math.floor(value)}/${amount}${field.endsWith('Time') ? 's' : ''}`;
  });
  if (drill.lesson === 'rescue') {
    const training = match.training || {}, fighter = match.fighters?.[0];
    const destination = training.carrying ? training.bayX : training.capsule?.x;
    progress.push(`${training.carrying ? 'CYAN BAY' : 'YELLOW CAPSULE'} ${destination > (fighter?.x || 0) ? '→' : '←'}`);
  }
  if (drill.lesson === 'camera') progress.push(match.fighters?.[0]?.onCamera ? 'IN FRAME' : 'FIND THE GOLD BEAM');
  return progress.join(' · ');
}

function readAll() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function valid(result, drill) {
  return Boolean(result && result.version === VERSION && result.seed === drill.seed &&
    result.passed === true && Number.isFinite(result.seconds) && result.seconds > 0 &&
    result.seconds <= drill.duration && (GRADES[result.grade] || 0) > 0);
}

export function readDailyBest(drill = getDailyDrill()) {
  const record = readAll()[drill.dateKey];
  return valid(record, drill) ? record : null;
}

export function saveDailyResult(drill, { seconds, grade, passed }) {
  const candidate = { version: VERSION, seed: drill.seed, dateKey: drill.dateKey,
    seconds: Math.round(Number(seconds) * 100) / 100, grade, passed: passed === true };
  const data = readAll();
  const previous = valid(data[drill.dateKey], drill) ? data[drill.dateKey] : null;
  const improved = valid(candidate, drill) && (!previous || candidate.seconds < previous.seconds ||
    (candidate.seconds === previous.seconds && GRADES[candidate.grade] > GRADES[previous.grade]));
  if (improved) {
    data[drill.dateKey] = candidate;
    // Keep a year of personal cards without touching the established course save.
    const dates = Object.keys(data).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key)).sort().reverse();
    for (const key of dates.slice(366)) delete data[key];
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }
  return { best: improved ? candidate : previous, improved: Boolean(improved) };
}

export function dailyShareText(drill, result) {
  const seconds = Number.isFinite(result?.seconds) ? `${Math.ceil(result.seconds)} s` : 'practice';
  return `Daily Drill ${drill.label} · ${seconds} · Rank ${result?.grade || 'RETAKE'} · thezyklus.com/mars/arena`;
}

export async function dailyPNG(drill, result) {
  await document.fonts.ready;
  await Promise.all([document.fonts.load('600 140px Condensed'), document.fonts.load('500 25px Barlow')]);
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 1500;
  const c = canvas.getContext('2d');
  const paper = '#f2ebdc', ink = '#112735', orange = '#cf5333', gold = '#d9be7d';
  c.fillStyle = ink; c.fillRect(0, 0, 1200, 1500);
  c.strokeStyle = gold; c.lineWidth = 3; c.strokeRect(32, 32, 1136, 1436);
  c.fillStyle = paper; c.font = '600 54px Condensed,sans-serif'; c.fillText('// MARS', 72, 112);
  c.fillStyle = gold; c.font = '600 25px Barlow,sans-serif'; c.fillText('ONE DAY. THE SAME ORDERS FOR EVERYONE.', 74, 178);
  c.fillStyle = paper; c.font = 'italic 600 140px Condensed,sans-serif'; c.fillText('DAILY DRILL.', 65, 352);
  c.fillStyle = gold; c.font = '600 116px Condensed,sans-serif'; c.fillText(drill.label, 74, 484);
  c.font = '500 24px Barlow,sans-serif'; c.fillText(`${drill.dateKey} / EUROPE · BERLIN`, 78, 536);
  try {
    const image = new Image(); image.src = `assets/${drill.character}-victory.webp`; await image.decode();
    const scale = Math.min(360 / image.width, 500 / image.height);
    c.drawImage(image, 915 - image.width * scale / 2, 374, image.width * scale, image.height * scale);
  } catch {}
  c.fillStyle = orange; c.fillRect(0, 827, 1200, 164);
  c.fillStyle = paper; c.font = '600 98px Condensed,sans-serif';
  c.fillText(Number.isFinite(result?.seconds) ? `${Math.ceil(result.seconds)} s` : 'RETAKE', 76, 945);
  c.font = '600 70px Condensed,sans-serif'; c.fillText(`RANK ${result?.grade || 'RETAKE'}`, 647, 938);
  c.fillStyle = paper; c.fillRect(0, 991, 1200, 509);
  c.fillStyle = ink; c.font = '600 48px Condensed,sans-serif';
  c.fillText(COURSE[drill.lessonIndex].title.toUpperCase(), 74, 1092);
  c.font = '600 31px Condensed,sans-serif'; c.fillText(drill.target, 74, 1148);
  c.font = '500 23px Barlow,sans-serif'; c.fillText('Same crew. Same arena. Same sequence. Your own best.', 74, 1194);
  c.font = '600 44px Condensed,sans-serif'; c.fillText('PLAY FREE · THEZYKLUS.COM/MARS/ARENA', 74, 1283);
  c.font = '500 21px Barlow,sans-serif'; c.fillText('@talesbytim / Saved on this device / No account', 74, 1344);
  c.fillStyle = '#586963'; c.font = '500 17px Barlow,sans-serif';
  c.fillText('© Tim Mecklenburg · Original MARS game · AI-assisted artwork & software', 74, 1438);
  return new Promise((resolve, reject) => canvas.toBlob(blob =>
    blob ? resolve(blob) : reject(new Error('Daily card export unavailable')), 'image/png'));
}

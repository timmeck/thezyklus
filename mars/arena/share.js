export const PLAY_URL = 'https://thezyklus.com/mars/arena/';

export function xIntent(text) {
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text', text.replaceAll(PLAY_URL, '').replaceAll('thezyklus.com/mars/arena', '').trim());
  url.searchParams.set('url', PLAY_URL);
  url.searchParams.set('via', 'talesbytim');
  return url.href;
}

export function downloadPNG(blob, filename = 'mars-result.png') {
  if (!(blob instanceof Blob)) return false;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

// Prepare the PNG before enabling the button. navigator.share() is then called
// before any await, preserving Safari's transient user activation.
export async function sharePrepared({ blob, filename = 'mars-result.png', text, title = 'MARS · Out of Orbit' }, { onFallback = () => {} } = {}) {
  const file = blob instanceof Blob ? new File([blob], filename, { type: 'image/png' }) : null;
  try {
    if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, title });
      return { method: 'native', cancelled: false };
    }
  } catch (error) {
    if (error?.name === 'AbortError') return { method: 'native', cancelled: true };
    // Files unsupported or a browser policy rejected the native sheet.
  }
  if (file) downloadPNG(blob, filename);
  const result = { method: 'download', intent: xIntent(text), text, downloaded: Boolean(file) };
  onFallback(result);
  return result;
}

import { Preferences } from "@capacitor/preferences";

const KEY = "robocod_slice_save_v1";

export async function loadSave() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) return JSON.parse(value);
  } catch (_) {
    // ignore
  }
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function writeSave(data) {
  const payload = JSON.stringify(data);
  try {
    await Preferences.set({ key: KEY, value: payload });
    return;
  } catch (_) {
    // ignore
  }
  localStorage.setItem(KEY, payload);
}

export async function clearSave() {
  try { await Preferences.remove({ key: KEY }); } catch (_) {}
  localStorage.removeItem(KEY);
}

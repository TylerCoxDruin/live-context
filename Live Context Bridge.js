// Variables used by Scriptable.
// icon-color: light-blue; icon-glyph: bolt-horizontal-circle;

// Live Context Bridge — receives data from iOS/iPadOS Shortcuts
// automations and writes it into the same shared cache Live Context.js
// reads, so a Shortcut can feed the widget information Scriptable has no
// API for on its own (HealthKit steps/sleep/activity, media playback,
// Apple's own weather), or react to something instantly in a way a
// widget's own refresh-only timing never can — Shortcuts' "Arrive/Leave"
// automations are real background OS triggers, not polling, so they fire
// immediately, unlike the widget's existing Home/Work/Gym geofence, which
// only gets checked whenever iOS happens to refresh the widget next.
// There's also a generic "message" type for anything else you come up
// with later, without needing a new bridge type for it.
//
// This script does nothing when opened directly — it's meant to be
// called FROM a Shortcut, via a "Run Script in Scriptable" action passing
// a dictionary as input. Build one small Shortcut per automation you
// want; each just needs a "Dictionary" action (with the fields listed
// below for that type) feeding into "Run Script in Scriptable" targeting
// this script by name. This script only validates and stores what it's
// given — it has no opinion about when or why a Shortcut runs.

// MARK: - Shared cache plumbing
//
// Deliberately duplicated from Live Context.js rather than imported via
// importModule() — this keeps both scripts fully independent, so a
// refactor in one can't silently break the other. The cache entry shape
// ({ data, timestamp }) has to match Live Context.js's own getCacheEntry
// exactly, since that's what reads these entries back out.

const CACHE_FILENAME = "live-context-cache.json";
// The project's pre-rename cache name — see migrateCacheFromPixelWidget.
// Kept in sync with the same constants in Live Context.js.
const LEGACY_CACHE_FILENAME = "pixel-widget-cache.json";

let fileManagerMemo = null;
function getFileManager() {
  if (fileManagerMemo) return fileManagerMemo;
  try {
    const iCloudFM = FileManager.iCloud();
    iCloudFM.documentsDirectory();
    fileManagerMemo = iCloudFM;
  } catch {
    fileManagerMemo = FileManager.local();
  }
  return fileManagerMemo;
}

// This script and Live Context.js each independently migrate the old
// cache file, and whichever runs first wins — safe, since the copy only
// happens when the new file doesn't exist yet. Without this here, a
// Shortcut automation firing before Live Context.js had migrated would
// create a fresh empty cache under the new name, and the real migration
// would then skip copying the old data over — silently losing it.
function migrateCacheFromPixelWidget() {
  const fm = getFileManager();
  const oldPath = fm.joinPath(fm.documentsDirectory(), LEGACY_CACHE_FILENAME);
  const newPath = fm.joinPath(fm.documentsDirectory(), CACHE_FILENAME);
  if (!fm.fileExists(oldPath) || fm.fileExists(newPath)) return;

  try {
    if (fm.isFileStoredIniCloud(oldPath) && !fm.isFileDownloaded(oldPath)) {
      fm.downloadFileFromiCloud(oldPath);
    }
    fm.copy(oldPath, newPath);
  } catch (e) {
    console.warn(`Couldn't migrate ${LEGACY_CACHE_FILENAME} to ${CACHE_FILENAME}: ${e}`);
  }
}

function readCacheFile() {
  const fm = getFileManager();
  const path = fm.joinPath(fm.documentsDirectory(), CACHE_FILENAME);
  if (!fm.fileExists(path)) return {};
  try {
    if (fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) {
      fm.downloadFileFromiCloud(path);
    }
    const parsed = JSON.parse(fm.readString(path));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.warn(`Couldn't read the existing cache, starting fresh: ${e}`);
    return {};
  }
}

// Throws on failure rather than swallowing it — run() reports handler
// errors to the console already, and a Shortcut automation that silently
// "succeeded" without writing anything would be worse to debug than one
// whose log says what went wrong.
function writeCache(cache) {
  const fm = getFileManager();
  const path = fm.joinPath(fm.documentsDirectory(), CACHE_FILENAME);
  fm.writeString(path, JSON.stringify(cache));
}

function writeCacheEntry(key, data) {
  const cache = readCacheFile();
  cache[key] = { data, timestamp: Date.now() };
  writeCache(cache);
}

// MARK: - Field contracts
//
// Each Shortcut sends a dictionary with a "type" field selecting one of
// these, plus that type's own fields below. The field names are this
// script's own contract — not Apple's internal Shortcuts variable names —
// so build each field explicitly in the Shortcut's Dictionary action
// using the magic-variable picker (e.g. pick "Temperature" from a Weather
// action's output, whatever Apple happens to call it internally).

// { type: "arrival", place: "home" | "work" | "gym" }
// Pair with a Shortcuts "Arrive at Location" automation. Live Context
// prefers this instant flag over its own polling-based geofence check
// whenever it's fresh (see shortcutArrivalFreshMinutes in settings).
function handleArrival(input) {
  const place = String(input.place ?? "").toLowerCase();
  if (!["home", "work", "gym"].includes(place)) {
    throw new Error(`"place" must be "home", "work", or "gym" — got "${input.place}"`);
  }
  writeCacheEntry("shortcutArrival", { place });
  console.log(`Recorded arrival at ${place}.`);
}

// { type: "departure" } — pair with a Shortcuts "Leave Location"
// automation. Clears the arrival flag immediately so the widget doesn't
// keep showing "Near Home" after you've actually left, rather than
// waiting for the flag to just age out.
function handleDeparture() {
  const cache = readCacheFile();
  delete cache.shortcutArrival;
  writeCache(cache);
  console.log("Cleared the arrival flag.");
}

// { type: "steps", count: 8432 }
// Pair with a Shortcut using the Health app's "Find Health Samples"
// action (steps, today) — something Scriptable has no API for on its own.
function handleSteps(input) {
  const count = Number(input.count);
  if (!Number.isFinite(count) || count < 0) {
    throw new Error(`"count" must be a non-negative number — got "${input.count}"`);
  }
  writeCacheEntry("shortcutSteps", { count: Math.round(count) });
  console.log(`Recorded ${Math.round(count)} steps.`);
}

// { type: "weather", tempF, condition, humidityPercent?, windMph?,
//   sunriseISO?, sunsetISO? }
// Pair with a Shortcut using "Get Current Weather" / "Get Weather
// Details" — Apple's own weather data, free, often more accurate than
// what Live Context calls out to on its own. `condition` should be one of
// Clear/Clouds/Rain/Drizzle/Thunderstorm/Snow/Fog for the widget's icon
// logic to recognize; anything else just falls back to a generic cloud
// icon rather than erroring.
function handleWeather(input) {
  const tempF = Number(input.tempF);
  if (!Number.isFinite(tempF)) {
    throw new Error(`"tempF" must be a number — got "${input.tempF}"`);
  }
  const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
  writeCacheEntry("shortcutWeather", {
    tempF,
    condition: String(input.condition ?? "Clouds"),
    humidityPercent: num(input.humidityPercent),
    windMph: num(input.windMph),
    sunriseISO: input.sunriseISO ?? null,
    sunsetISO: input.sunsetISO ?? null,
  });
  console.log(`Recorded weather: ${tempF}°F, ${input.condition ?? "Clouds"}.`);
}

// { type: "sleep", hours: 7.2 }
// Pair with a Shortcut that sums last night's "Asleep" Health samples (via
// "Find Health Samples") into a single decimal-hours number — something
// Scriptable has no API for on its own.
function handleSleep(input) {
  const hours = Number(input.hours);
  if (!Number.isFinite(hours) || hours < 0) {
    throw new Error(`"hours" must be a non-negative number — got "${input.hours}"`);
  }
  writeCacheEntry("shortcutSleep", { hours });
  console.log(`Recorded ${hours} hours of sleep.`);
}

// { type: "activity", exerciseMinutes?, standHours?, activeCalories? }
// Pair with a Shortcut reading today's Activity rings. Each field is
// independently optional — wire up just the ring(s) you actually want to
// see — but at least one must come through as a valid number, or there's
// nothing here worth recording.
function handleActivity(input) {
  const num = (value) => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null);
  const exerciseMinutes = num(input.exerciseMinutes);
  const standHours = num(input.standHours);
  const activeCalories = num(input.activeCalories);
  if (exerciseMinutes == null && standHours == null && activeCalories == null) {
    throw new Error('At least one of "exerciseMinutes", "standHours", or "activeCalories" must be a non-negative number.');
  }
  writeCacheEntry("shortcutActivity", { exerciseMinutes, standHours, activeCalories });
  console.log(`Recorded activity: ${exerciseMinutes ?? "–"} min exercise, ${standHours ?? "–"} stand hours, ${activeCalories ?? "–"} active kcal.`);
}

// { type: "nowPlaying", title, artist? }
// Pair with a Shortcut using "Get Currently Playing Media" (or the
// Music/Podcasts app's own now-playing details) — Scriptable has no
// media-playback API of its own.
function handleNowPlaying(input) {
  const title = String(input.title ?? "").trim();
  if (!title) {
    throw new Error(`"title" must be a non-empty string — got "${input.title}"`);
  }
  writeCacheEntry("shortcutNowPlaying", {
    title,
    artist: input.artist ? String(input.artist).trim() : null,
  });
  console.log(`Recorded now playing: ${title}${input.artist ? ` — ${input.artist}` : ""}.`);
}

// { type: "message", title, subtitle?, glyph? }
// A generic escape hatch, not tied to any specific app — any Shortcut can
// push an arbitrary short message onto the widget (e.g. "Package
// delivered", "Laundry done", "Guest arriving") without needing its own
// dedicated bridge type. `glyph` is an optional SF Symbol name; an invalid
// one just falls back to a default icon at render time instead of
// breaking the widget.
function handleCustomMessage(input) {
  const title = String(input.title ?? "").trim();
  if (!title) {
    throw new Error(`"title" must be a non-empty string — got "${input.title}"`);
  }
  writeCacheEntry("shortcutMessage", {
    title,
    subtitle: input.subtitle ? String(input.subtitle).trim() : null,
    glyph: input.glyph ? String(input.glyph).trim() : null,
  });
  console.log(`Recorded custom message: ${title}`);
}

const HANDLERS = {
  arrival: handleArrival,
  departure: handleDeparture,
  steps: handleSteps,
  weather: handleWeather,
  sleep: handleSleep,
  activity: handleActivity,
  nowPlaying: handleNowPlaying,
  message: handleCustomMessage,
};

async function run() {
  migrateCacheFromPixelWidget();

  const raw = args.shortcutParameter;
  if (!raw) {
    const alert = new Alert();
    alert.title = "Live Context Bridge";
    alert.message =
      "This script isn't meant to be run directly — it's called from a Shortcut, via a \"Run Script in Scriptable\" action with a dictionary input. See the comments at the top of this file for the exact fields each automation needs to send.";
    alert.addAction("OK");
    await alert.presentAlert();
    return;
  }

  let input;
  try {
    // shortcutParameter arrives already-parsed when the Shortcut passes a
    // native Dictionary; it arrives as a string if the Shortcut passes
    // Text instead (e.g. JSON built by hand) — handling both means either
    // approach works when building the Shortcut.
    input = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error(`Couldn't parse the Shortcut's input as JSON: ${e}`);
    return;
  }

  const handler = HANDLERS[input?.type];
  if (!handler) {
    console.error(`Unknown or missing "type" ("${input?.type}") — expected one of: ${Object.keys(HANDLERS).join(", ")}`);
    return;
  }

  try {
    handler(input);
  } catch (e) {
    console.error(`Live Context Bridge failed: ${e.message}`);
  }
}

await run();
// Tells Scriptable (and therefore the calling Shortcut) the script is done
// the moment work finishes — without this, the Shortcut waits for the
// run-script action to time out on its own, making every automation that
// calls this feel slower than it is.
Script.complete();

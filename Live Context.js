// Variables used by Scriptable.
// icon-color: deep-blue; icon-glyph: magic;

// Live Context — a modern, single-file "At a Glance" widget for Scriptable.
// Formerly "Pixel Widget"; existing settings/cache/background files carry
// over automatically (see migrateFromPixelWidget).
//
// If this is useful to you, tips are welcome but never required:
// https://www.buymeacoffee.com/t.cd

// MARK: - Configuration

const DEFAULT_SETTINGS = {
  weather: {
    apiKey: "YOUR_OPENWEATHERMAP_API_KEY",
    units: "imperial", // "imperial" | "metric" | "standard"
    cityId: null, // OpenWeatherMap city ID; leave null to use device location
    cacheLimitMinutes: 30, // how long cached weather data stays fresh
    // Real active alerts from the National Weather Service — free and
    // keyless, unlike OpenWeatherMap's own alerts field (paid tier).
    // US locations only.
    severeAlertsEnabled: true,
    // How long a new alert takes over the entire widget before demoting to
    // a small ambient note under whatever's normally showing (see
    // "MARK: - Severe Weather Alerts"). A "Watch" can run for hours — it
    // shouldn't block the rest of the widget the whole time.
    severeAlertProminentMinutes: 20,
    // Free, keyless daily/15-minute forecast data from Open-Meteo — powers
    // the rain nowcast, morning high, temp-swing heads-up, and UV alerts.
    // Master switch; each of those features also has its own toggle.
    forecastEnabled: true,
  },
  user: {
    name: "there",
    locale: "en-US",
    birthday: null, // "MM-DD", e.g. "03-15"; null = no personalized birthday message
  },
  behavior: {
    eventLookaheadHours: 6, // how far ahead to look for upcoming calendar events
    largeAgendaEnabled: true, // the "Coming up" event list under the main content on the large widget
    eventAlertEnabled: true, // whether an upcoming event can take over the widget
    lowBatteryThreshold: 0.2, // battery fraction (0-1) considered "low"
    batteryAlertEnabled: true, // whether low battery can take over the widget
    weatherAlertEnabled: true, // whether active precipitation can take over the widget
    showDate: !Device.isPad(), // iPad's status bar already shows the date, so default it off there
    // Rain nowcast now runs on Open-Meteo's free 15-minute precipitation
    // data (see forecastEnabled above) — on by default since it no longer
    // needs OpenWeatherMap's paid One Call subscription.
    rainNowcastEnabled: true,
    rainNowcastLookaheadMinutes: 30, // how soon rain must be to trigger the alert
    feelsLikeEnabled: true, // show "Feels 97°F" instead of the raw temp when they diverge notably
    morningBriefingEnabled: true, // fold today's forecast high into the default view during the morning
    tempSwingAlertEnabled: true, // evening heads-up when tomorrow's high swings hard from today's
    tempSwingThresholdDegrees: 15, // how big the swing must be, in your temperature units
    uvAlertEnabled: true, // daytime heads-up when today's max UV index is extreme
    uvAlertThreshold: 8, // UV index at or above which the alert shows
    aqiAlertEnabled: true, // heads-up when air quality is unhealthy (US AQI scale)
    aqiAlertThreshold: 101, // US AQI at or above which the alert shows (101 = unhealthy for sensitive groups)
    // Weekday-morning commute estimate to the Work address in Places —
    // same straight-line-distance approximation (and same caveat) as
    // travelEstimateEnabled below, so also off by default.
    commuteEstimateEnabled: false,
    // Data fed in from iOS/iPadOS Shortcuts automations, via the separate
    // "Live Context Bridge.js" script — see its own file for what each
    // Shortcut needs to send. Every piece is independently optional; none
    // of this does anything unless you've actually built the matching
    // Shortcut, since Live Context itself never triggers or waits on one.
    shortcutArrivalEnabled: true, // prefer an instant Shortcuts "arrived" flag over the polling geofence, when fresh
    shortcutArrivalFreshMinutes: 20, // how long an arrival flag stays valid before being ignored as stale
    shortcutStepsEnabled: false,
    shortcutStepsFreshMinutes: 90,
    shortcutWeatherEnabled: false, // prefer Shortcuts-sourced weather (e.g. Apple's own) over the OpenWeatherMap fetch, when fresh
    shortcutWeatherFreshMinutes: 30,
    shortcutSleepEnabled: false, // last night's sleep total, from Health — a once-a-day stat, so this stays fresh most of the day
    shortcutSleepFreshMinutes: 720,
    shortcutActivityEnabled: false, // today's Activity rings (exercise/stand/active calories)
    shortcutActivityFreshMinutes: 180,
    shortcutNowPlayingEnabled: false, // currently playing song/podcast — goes stale fast, so this window is deliberately short
    shortcutNowPlayingFreshMinutes: 10,
    shortcutMessageEnabled: false, // generic freeform message from any Shortcut you build — see Live Context Bridge.js's "message" type
    shortcutMessageFreshMinutes: 60,
    // Tapping certain states can run a named Shortcut instead of opening
    // an app — e.g. a "Low Power Mode" shortcut when battery's low. Blank
    // means that state keeps its normal tap-to-open behavior.
    batteryShortcutName: "",
    windDownShortcutName: "",
    windDownEnabled: true, // whether the nightly dark reminder screen ever takes over
    windDownStartHour: 22, // hour of day (0-23) wind-down begins
    windDownEndHour: 5, // hour of day (0-23) wind-down ends
    windDownUseSunset: false, // when on, wind-down begins at today's actual sunset hour instead of the fixed one above
    windDownMessage: "Plug in and get some rest",
    windDownChargeReminderEnabled: true, // remind to charge at wind-down when the battery won't comfortably last the night
    windDownChargeThresholdPercent: 30, // battery percent at or below which that reminder shows
    windDownTomorrowEnabled: true, // show tomorrow's first event during wind-down
    windDownMoonPhaseEnabled: true, // use tonight's actual moon phase as the wind-down icon on clear nights
    calendarIds: [], // calendar identifiers to include; empty means all calendars
    holidayAlertEnabled: true, // whether a recognized US holiday gets its own greeting
    contactBirthdaysEnabled: true, // whether a birthday on the auto-generated Contacts "Birthdays" calendar takes over the widget
    reminderAlertEnabled: false, // off by default — routine daily reminders would otherwise hijack the widget constantly
    // A rough "time to leave" for the featured event: straight-line
    // distance to its location divided by this assumed average speed. Not
    // real traffic/routing data — that needs a paid directions API — so
    // it's an approximation, off by default so nobody mistakes it for one.
    travelEstimateEnabled: false,
    assumedTravelSpeedMph: 25,
    // An event whose title matches any of these (case-insensitive regex)
    // patterns jumps straight to the top of the whole priority stack,
    // searched over highValueLookaheadHours rather than eventLookaheadHours.
    highValueEventAlertEnabled: true,
    highValueKeywords: ["urgent", "asap", "interview", "flight", "birthday", "anniversary", "deadline"],
    highValueLookaheadHours: 72, // wider net than eventLookaheadHours, since these matter days out
    arrivalMessageLingerMinutes: 15, // how long the "Welcome to..." message keeps showing after an event starts
    iconStyle: "glyph", // "glyph" (system SF Symbols) | "emoji"
    textAlignment: "center", // "left" | "center" | "right" — every row, every widget size
    // Custom ordering for the priority cascade, or null for the built-in
    // default order (see DEFAULT_PRIORITY_ORDER — declared later in the
    // file, which is also why this can't reference it directly here).
    // Edited via Settings > Priorities, not typed by hand.
    priorityOrder: null,
    // How data badges render — "filled" | "outlined" | "text". Filled is
    // the classic solid-color pill. The other two exist because some Home
    // Screen icon styles (iOS 26's "Clear," confirmed by direct testing)
    // strip the color out of a pill's background fill entirely, turning
    // every filled badge blank. Both alternatives are confirmed to survive
    // Clear: "outlined" (a colored border with matching text, no fill to
    // strip — the recommended choice there, since it keeps the badge look)
    // and "text" (plain text, no badges at all). Replaces the older
    // plainTextPillsEnabled boolean, which sanitizeSettings still migrates.
    pillStyle: "filled",
    // Optional darkening baked into the background image for legibility on
    // very bright wallpapers — "off" | "subtle" | "standard". Off by
    // default: any dimming makes the widget region visibly darker than the
    // wallpaper around it, breaking the seamless-transparency effect (the
    // per-glyph text shadows handle legibility on their own for most
    // wallpapers).
    backgroundDimming: "off",
    // Tapping the widget opens whatever app matches what's currently shown
    // (Calendar for an event, Maps for a nearby place, etc.) — see
    // resolveWidgetURL. Some states have no confident deep link (battery,
    // holiday, reminders) and just do nothing when tapped either way.
    tapToOpenEnabled: true,
    // Set via the settings menu's image picker, not typed — true once an
    // image has been imported (see MARK: - Background Image).
    backgroundImageEnabled: false,
    // Text color over a background image. White + the per-glyph text
    // shadows read fine on most wallpapers; "dark" is for genuinely bright
    // ones (see also backgroundDimming below for a stronger measure).
    backgroundImageTextColor: "white", // "white" | "dark"
    // Pills normally supply their own vivid fill (see PILL_COLORS), so
    // white pill text is right almost always — separate from
    // backgroundImageTextColor above. This is only for a Home Screen
    // transparency/"Liquid Glass" style that overrides the pills' own fill
    // to solid white, which nothing here can detect (no API surfaces it) —
    // pick "dark" by eye if pills go blank/unreadable in that style.
    backgroundImagePillTextColor: "white", // "white" | "dark"
    // The per-glyph shadow applied to every line of text (and pill/date-
    // badge text) while a background image is set — see
    // resolvedTextShadow/resolvedPillTextShadow. On by default since it's
    // pure upside in the normal case, but it does add a soft dark/light
    // halo around every letter, which not everyone wants purely stylistically
    // — this turns it off entirely, independent of the two colors above.
    backgroundImageTextShadowEnabled: true,
    // A second, optional background image matching the Home Screen's Dark
    // Mode wallpaper — Device.isUsingDarkAppearance() exists in Scriptable,
    // but is explicitly documented as unsupported inside a widget (exactly
    // where this matters most), so there's no reliable way to read the
    // device's *actual current* appearance from here. This schedule is the
    // best available substitute — see isDarkBackgroundTime.
    darkBackgroundImageEnabled: false,
    darkBackgroundUseSunset: false, // when on, uses today's real sunset/sunrise instead of the fixed hours below
    darkBackgroundStartHour: 20, // hour of day (0-23) the dark background begins
    darkBackgroundEndHour: 7, // hour of day (0-23) the dark background ends
  },
  location: {
    geofenceEnabled: false, // off until at least one address below is set
    radiusMeters: 150,
    // Plain street addresses rather than lat/lon — geocoded on demand (and
    // cached, since geocoding needs the network) via Nominatim; see
    // geocodeAddress / geocodeViaNominatim.
    homeAddress: "",
    workAddress: "",
    gymAddress: "",
    // The calendar your actual work shifts appear on (a scheduling app's
    // synced calendar, a shared calendar, etc.) — when set, the morning
    // commute estimate only shows on days with a real shift on this
    // calendar, not just any weekday morning. See isWorkDayToday. Blank
    // (the default) preserves the old any-weekday-morning behavior, since
    // most people don't have a dedicated shift calendar to point at.
    workScheduleCalendarId: "",
  },
  stocks: {
    enabled: true, // inert until tickers are added below
    tickers: [], // up to 4 symbols, e.g. ["AAPL", "TSLA"]
    displayMinutes: 60, // how long after market close the recap stays on the widget
  },
};

// A per-widget parameter can override any setting: either a JSON object
// (e.g. `{"weather":{"units":"metric"}}`) or a bare string/number treated
// as an OpenWeatherMap city ID shorthand.
function parseWidgetParameter(rawParameter) {
  if (!rawParameter) return {};

  try {
    const parsed = JSON.parse(rawParameter);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // Not JSON — fall through to the city ID shorthand below.
  }
  return { weather: { cityId: rawParameter } };
}

function mergeSettings(...layers) {
  return layers.reduce((merged, layer) => ({
    weather: { ...merged.weather, ...layer.weather },
    user: { ...merged.user, ...layer.user },
    behavior: { ...merged.behavior, ...layer.behavior },
    location: { ...merged.location, ...layer.location },
    stocks: { ...merged.stocks, ...layer.stocks },
  }));
}

// Repairs numeric settings that may have been corrupted by older builds:
// before the settings menu validated numeric input, a bad entry could save
// as NaN, which JSON serializes as null — and a stored null *overrides*
// the default during the merge above. A null eventLookaheadHours, for
// example, silently made the calendar window zero hours wide: no events
// would ever show, with no error anywhere.
function sanitizeSettings(s) {
  const orNum = (value, fallback) => (Number.isFinite(value) ? value : fallback);
  const d = DEFAULT_SETTINGS;
  s.weather.cacheLimitMinutes = orNum(s.weather.cacheLimitMinutes, d.weather.cacheLimitMinutes);
  s.behavior.eventLookaheadHours = orNum(s.behavior.eventLookaheadHours, d.behavior.eventLookaheadHours);
  s.behavior.tempSwingThresholdDegrees = orNum(s.behavior.tempSwingThresholdDegrees, d.behavior.tempSwingThresholdDegrees);
  s.behavior.uvAlertThreshold = orNum(s.behavior.uvAlertThreshold, d.behavior.uvAlertThreshold);
  s.behavior.aqiAlertThreshold = orNum(s.behavior.aqiAlertThreshold, d.behavior.aqiAlertThreshold);
  s.behavior.windDownChargeThresholdPercent = orNum(s.behavior.windDownChargeThresholdPercent, d.behavior.windDownChargeThresholdPercent);
  s.weather.severeAlertProminentMinutes = orNum(s.weather.severeAlertProminentMinutes, d.weather.severeAlertProminentMinutes);
  s.behavior.lowBatteryThreshold = orNum(s.behavior.lowBatteryThreshold, d.behavior.lowBatteryThreshold);
  s.behavior.rainNowcastLookaheadMinutes = orNum(s.behavior.rainNowcastLookaheadMinutes, d.behavior.rainNowcastLookaheadMinutes);
  s.behavior.windDownStartHour = orNum(s.behavior.windDownStartHour, d.behavior.windDownStartHour);
  s.behavior.windDownEndHour = orNum(s.behavior.windDownEndHour, d.behavior.windDownEndHour);
  s.behavior.darkBackgroundStartHour = orNum(s.behavior.darkBackgroundStartHour, d.behavior.darkBackgroundStartHour);
  s.behavior.darkBackgroundEndHour = orNum(s.behavior.darkBackgroundEndHour, d.behavior.darkBackgroundEndHour);
  s.behavior.highValueLookaheadHours = orNum(s.behavior.highValueLookaheadHours, d.behavior.highValueLookaheadHours);
  s.behavior.arrivalMessageLingerMinutes = orNum(s.behavior.arrivalMessageLingerMinutes, d.behavior.arrivalMessageLingerMinutes);
  s.location.radiusMeters = orNum(s.location.radiusMeters, d.location.radiusMeters);
  s.stocks.displayMinutes = orNum(s.stocks.displayMinutes, d.stocks.displayMinutes);
  if (!Array.isArray(s.stocks.tickers)) s.stocks.tickers = [];
  s.behavior.assumedTravelSpeedMph = orNum(s.behavior.assumedTravelSpeedMph, d.behavior.assumedTravelSpeedMph);
  if (!["left", "center", "right"].includes(s.behavior.textAlignment)) {
    s.behavior.textAlignment = d.behavior.textAlignment;
  }
  // normalizePriorityOrder tolerates junk entries inside a valid array,
  // but a non-array value (bad hand-typed parameter JSON) is reset here
  // so it doesn't linger in the stored settings forever.
  if (s.behavior.priorityOrder != null && !Array.isArray(s.behavior.priorityOrder)) {
    s.behavior.priorityOrder = null;
  }
  if (!["off", "subtle", "standard"].includes(s.behavior.backgroundDimming)) {
    s.behavior.backgroundDimming = d.behavior.backgroundDimming;
  }
  // Migrates the older plainTextPillsEnabled boolean into pillStyle —
  // anyone who had turned it on keeps their plain-text pills without
  // touching a setting.
  if (!["filled", "outlined", "text"].includes(s.behavior.pillStyle)) {
    s.behavior.pillStyle = s.behavior.plainTextPillsEnabled === true ? "text" : d.behavior.pillStyle;
  }
  // The settings menu itself can only ever produce a valid value now (see
  // its own get/apply mapping), but a per-widget parameter override is
  // hand-typed JSON — easy to type the human label ("celsius") instead of
  // the internal one ("metric") there, so this guards that entry point too.
  if (!VALID_WEATHER_UNITS.includes(s.weather.units)) {
    s.weather.units = d.weather.units;
  }
  s.behavior.shortcutArrivalFreshMinutes = orNum(s.behavior.shortcutArrivalFreshMinutes, d.behavior.shortcutArrivalFreshMinutes);
  s.behavior.shortcutStepsFreshMinutes = orNum(s.behavior.shortcutStepsFreshMinutes, d.behavior.shortcutStepsFreshMinutes);
  s.behavior.shortcutWeatherFreshMinutes = orNum(s.behavior.shortcutWeatherFreshMinutes, d.behavior.shortcutWeatherFreshMinutes);
  s.behavior.shortcutSleepFreshMinutes = orNum(s.behavior.shortcutSleepFreshMinutes, d.behavior.shortcutSleepFreshMinutes);
  s.behavior.shortcutActivityFreshMinutes = orNum(s.behavior.shortcutActivityFreshMinutes, d.behavior.shortcutActivityFreshMinutes);
  s.behavior.shortcutNowPlayingFreshMinutes = orNum(s.behavior.shortcutNowPlayingFreshMinutes, d.behavior.shortcutNowPlayingFreshMinutes);
  s.behavior.shortcutMessageFreshMinutes = orNum(s.behavior.shortcutMessageFreshMinutes, d.behavior.shortcutMessageFreshMinutes);
  return s;
}

// Settings are assembled fresh on every call, from lowest to highest priority:
// the built-in defaults, anything the user saved via the settings menu, and
// (highest priority) a one-off per-widget parameter.
function getCurrentSettings() {
  return sanitizeSettings(
    mergeSettings(DEFAULT_SETTINGS, loadStoredSettings(), parseWidgetParameter(args.widgetParameter))
  );
}

// MARK: - File System / Cache

const CACHE_FILENAME = "live-context-cache.json";
const LEGACY_CACHE_FILENAME = "pixel-widget-cache.json"; // pre-rename name — see migrateFromPixelWidget

// Prefer iCloud so the cache follows the user across devices, but fall back
// to local storage if iCloud Drive isn't set up on this device. Memoized —
// the iCloud probe (constructing the FileManager and checking its
// documents directory) is pure overhead to repeat on the 10+ calls a
// single render makes.
let fileManagerMemo = null;
function getFileManager() {
  if (fileManagerMemo) return fileManagerMemo;
  try {
    const iCloudFM = FileManager.iCloud();
    iCloudFM.documentsDirectory(); // throws if no iCloud container is available
    fileManagerMemo = iCloudFM;
  } catch {
    fileManagerMemo = FileManager.local();
  }
  return fileManagerMemo;
}

// An iCloud-synced file can exist as a remote placeholder that hasn't been
// materialized on this device yet; reading it in that state returns
// nothing useful. Every read of a possibly-iCloud file goes through this
// first. No-op for local files.
function ensureFileDownloaded(fm, path) {
  if (fm.isFileStoredIniCloud(path) && !fm.isFileDownloaded(path)) {
    fm.downloadFileFromiCloud(path);
  }
}

// One-time migration from this project's old name ("Pixel Widget") to its
// current one ("Live Context"): copies each stored file (settings, cache,
// background images) to its new name, only when the new one doesn't exist
// yet but the old one does, so already-configured data survives the
// rename. FileManager.copy refuses to overwrite an existing destination
// on its own, so the fileExists check is a belt-and-suspenders guard. Old
// files are left in place — harmless once unused, and it keeps this safe
// to run any number of times. Once the new files exist, each check below
// is one cheap fileExists() and nothing more.
function migrateFromPixelWidget() {
  const fm = getFileManager();
  const renames = [
    [LEGACY_CACHE_FILENAME, CACHE_FILENAME],
    [LEGACY_SETTINGS_FILENAME, SETTINGS_FILENAME],
    [LEGACY_BACKGROUND_IMAGE_FILENAMES.light, BACKGROUND_IMAGE_FILENAMES.light],
    [LEGACY_BACKGROUND_IMAGE_FILENAMES.dark, BACKGROUND_IMAGE_FILENAMES.dark],
  ];

  for (const [oldName, newName] of renames) {
    const oldPath = fm.joinPath(fm.documentsDirectory(), oldName);
    const newPath = fm.joinPath(fm.documentsDirectory(), newName);
    if (!fm.fileExists(oldPath) || fm.fileExists(newPath)) continue;

    try {
      ensureFileDownloaded(fm, oldPath);
      fm.copy(oldPath, newPath);
    } catch (e) {
      console.warn(`Couldn't migrate ${oldName} to ${newName}: ${e}`);
    }
  }
}

function readJSONFile(filename, fallback) {
  const fm = getFileManager();
  const path = fm.joinPath(fm.documentsDirectory(), filename);
  if (!fm.fileExists(path)) return fallback;

  try {
    ensureFileDownloaded(fm, path);
    const parsed = JSON.parse(fm.readString(path));
    // JSON.parse("null") succeeds (null is valid JSON) and so does any
    // other non-object JSON value, which would silently skip the fallback
    // below and hand callers something like `null` instead of `{}` —
    // exactly what crashed mergeSettings() with "layer.weather" on null.
    return parsed !== null && typeof parsed === "object" ? parsed : fallback;
  } catch (e) {
    console.warn(`Couldn't read ${filename}, using fallback: ${e}`);
    return fallback;
  }
}

function writeJSONFile(filename, data) {
  const fm = getFileManager();
  const path = fm.joinPath(fm.documentsDirectory(), filename);
  try {
    fm.writeString(path, JSON.stringify(data));
  } catch (e) {
    console.warn(`Couldn't write ${filename}: ${e}`);
  }
}

// The cache file, parsed once per run and shared by every reader/writer.
// Two reasons this is a memo rather than a fresh read each time:
//  1. A single render hits the cache 3-6+ times (weather, minutely
//     forecast, geocode lookups) — re-reading and re-parsing the whole
//     JSON file from disk for each is pure waste on a widget refresh
//     budget.
//  2. checkEventArrival and checkGeofence run concurrently (Promise.all),
//     each doing read-modify-write on this same file under different
//     keys. With independent reads, whichever wrote second would clobber
//     the first's entry (a lost update across the awaits). Sharing one
//     in-memory object makes concurrent writers additive instead.
// Script runs are short-lived processes, so cross-run staleness isn't a
// concern.
let cacheFileMemo = null;
function loadCacheFile() {
  if (cacheFileMemo === null) cacheFileMemo = readJSONFile(CACHE_FILENAME, {});
  return cacheFileMemo;
}

// Stores `data` under `key` with the current timestamp. Before writing,
// merges with whatever is on disk right now, newest timestamp winning per
// key — the Bridge script can write to this same file at any moment (a
// Shortcuts automation firing mid-render, e.g. an arrival flag landing
// while iOS refreshes the widget on that same location change), and
// writing the memoized copy wholesale would silently erase that entry.
function setCacheEntry(key, data) {
  const cache = loadCacheFile();
  cache[key] = { data, timestamp: Date.now() };

  const disk = readJSONFile(CACHE_FILENAME, {});
  for (const [diskKey, diskEntry] of Object.entries(disk)) {
    const memoEntry = cache[diskKey];
    if (!memoEntry || (diskEntry?.timestamp ?? 0) > (memoEntry.timestamp ?? 0)) {
      cache[diskKey] = diskEntry;
    }
  }

  writeJSONFile(CACHE_FILENAME, cache);
}

// Removes a single entry outright, rather than just letting it age out.
// Needed when a setting changes the *meaning* of already-cached data (e.g.
// switching Temperature Units) — OpenWeatherMap and Open-Meteo both convert
// server-side based on a units query param, so the cached response is only
// valid for whichever units it was originally fetched under. Without this,
// flipping the setting would keep showing stale-unit numbers for up to a
// full cache window instead of refreshing immediately.
function clearCacheEntry(key) {
  const cache = loadCacheFile();
  delete cache[key];
  writeJSONFile(CACHE_FILENAME, cache);
}

// Returns `{ data, ageMinutes, stale }` for `key`, or null if nothing is cached.
// `stale` is true once the entry is older than maxAgeMinutes.
function getCacheEntry(key, maxAgeMinutes) {
  const entry = loadCacheFile()[key];
  if (!entry) return null;

  const ageMinutes = (Date.now() - entry.timestamp) / 60000;
  return {
    data: entry.data,
    ageMinutes,
    stale: maxAgeMinutes != null && ageMinutes > maxAgeMinutes,
  };
}

// MARK: - Settings Storage

const SETTINGS_FILENAME = "live-context-settings.json";
const LEGACY_SETTINGS_FILENAME = "pixel-widget-settings.json"; // pre-rename name — see migrateFromPixelWidget

function loadStoredSettings() {
  return readJSONFile(SETTINGS_FILENAME, {});
}

function saveStoredSettings(settings) {
  writeJSONFile(SETTINGS_FILENAME, settings);
}

// MARK: - Background Image

// Pairs with the separate "Transparent & Blurred Widgets.js" utility: that
// script is a one-time (or occasional — new wallpaper, moved widget)
// wizard that screenshots the Home Screen and exports a cropped, blurred
// PNG matching this exact widget's size/position. This section just picks
// up whatever image it produced and uses it as the widget's background —
// it doesn't run that wizard itself.
//
// "dark" is a second, optional slot for a background matching the Home
// Screen's Dark Mode wallpaper (that script can export one of these too —
// see its own Dark Mode step). Every function below is parameterized by
// `variant` rather than duplicated, since the light and dark slots need
// identical handling (scrim, cache, import, clear) — just against two
// different files.
//
// Live Context Bridge.js's "background" type writes these same files (and
// clears the scrimmed cache by filename prefix) so a Shortcut can replace
// the background — if these filenames or the scrimmed naming pattern ever
// change, update handleBackground there to match.
const BACKGROUND_IMAGE_FILENAMES = {
  light: "live-context-background.png",
  dark: "live-context-background-dark.png",
};
// Pre-rename names — see migrateFromPixelWidget.
const LEGACY_BACKGROUND_IMAGE_FILENAMES = {
  light: "pixel-widget-background.png",
  dark: "pixel-widget-background-dark.png",
};

function getBackgroundImagePath(variant) {
  const fm = getFileManager();
  return fm.joinPath(fm.documentsDirectory(), BACKGROUND_IMAGE_FILENAMES[variant]);
}

// Optional darkening of the background image with a translucent black
// overlay, for wallpapers so bright the per-glyph text shadows aren't
// enough on their own. Off by default: any amount of dimming makes the
// widget region permanently darker than the identical wallpaper around
// it, which reads as a "dark tint" that defeats the seamless-transparency
// effect people set the background up for in the first place.
const BACKGROUND_DIMMING_OPACITY = { off: 0, subtle: 0.1, standard: 0.2 };

function backgroundDimmingOpacity(settings) {
  return BACKGROUND_DIMMING_OPACITY[settings.behavior.backgroundDimming] ?? 0;
}

function applyLegibilityScrim(image, opacity) {
  const draw = new DrawContext();
  draw.size = image.size;
  draw.opaque = false;
  draw.drawImageInRect(image, new Rect(0, 0, image.size.width, image.size.height));
  draw.setFillColor(new Color("#000000", opacity));
  draw.fillRect(new Rect(0, 0, image.size.width, image.size.height));
  return draw.getImage();
}

// The dimmed result is cached to its own file so the full-resolution
// composite above runs once per imported image, not on every widget
// refresh — image decoding + compositing is the biggest single allocation
// in the memory-constrained widget process, and the result never changes
// between imports. The opacity is baked into the filename so changing the
// Background Dimming setting automatically invalidates the old render.
function getScrimmedBackgroundPath(variant, opacity) {
  const fm = getFileManager();
  return fm.joinPath(fm.documentsDirectory(), `live-context-background-scrimmed-${variant}-${opacity}.png`);
}

// Removes every cached dimmed render for the variant regardless of which
// opacity produced it (the level may have changed since it was written) —
// same prefix-matching approach Live Context Bridge.js uses.
function clearScrimmedBackground(variant) {
  const fm = getFileManager();
  const docs = fm.documentsDirectory();
  const prefix = `live-context-background-scrimmed-${variant}-`;
  for (const name of fm.listContents(docs)) {
    if (name.startsWith(prefix)) fm.remove(fm.joinPath(docs, name));
  }
}

function loadBackgroundImage(variant, settings) {
  const fm = getFileManager();

  try {
    const path = getBackgroundImagePath(variant);
    const opacity = backgroundDimmingOpacity(settings);

    // No dimming: serve the imported image untouched — no derived file,
    // no compositing, and the widget region matches the real wallpaper
    // around it exactly.
    if (opacity === 0) {
      if (!fm.fileExists(path)) return null;
      ensureFileDownloaded(fm, path);
      return fm.readImage(path);
    }

    const scrimmedPath = getScrimmedBackgroundPath(variant, opacity);
    if (fm.fileExists(scrimmedPath)) {
      ensureFileDownloaded(fm, scrimmedPath);
      return fm.readImage(scrimmedPath);
    }

    if (!fm.fileExists(path)) return null;
    ensureFileDownloaded(fm, path);

    const scrimmed = applyLegibilityScrim(fm.readImage(path), opacity);
    fm.writeImage(scrimmedPath, scrimmed);
    return scrimmed;
  } catch (e) {
    console.warn(`Couldn't read ${variant} background image: ${e}`);
    return null;
  }
}

// Imports the PNG exported by the blur utility, from wherever the user
// saved it — Photos.save() and DocumentPicker.exportImage() are the two
// export paths that script offers, so both need a corresponding import
// path here. Copies it into this script's own storage so it survives even
// if the original file/photo is later moved or deleted.
async function pickBackgroundImage(source, variant) {
  try {
    const image = source === "photos"
      ? await Photos.fromLibrary()
      : FileManager.local().readImage(await DocumentPicker.openFile());

    const fm = getFileManager();
    fm.writeImage(getBackgroundImagePath(variant), image);
    clearScrimmedBackground(variant); // stale render of the previous image
    return true;
  } catch (e) {
    console.warn(`Couldn't import ${variant} background image: ${e}`);
    return false;
  }
}

function clearBackgroundImage(variant) {
  const fm = getFileManager();
  const path = getBackgroundImagePath(variant);
  if (fm.fileExists(path)) fm.remove(path);
  clearScrimmedBackground(variant);
}

// MARK: - Weather

const WEATHER_CACHE_KEY = "weather";
const WEATHER_REQUEST_TIMEOUT_SECONDS = 8;
const VALID_WEATHER_UNITS = ["imperial", "metric", "standard"];

function hasApiKey(settings) {
  const key = settings.weather.apiKey?.trim();
  return Boolean(key) && key !== DEFAULT_SETTINGS.weather.apiKey;
}

async function fetchWeather(settings) {
  // A fresh Shortcuts-sourced reading (see MARK: - Shortcuts Bridge) wins
  // over OpenWeatherMap entirely while it's fresh — checked first, ahead
  // of even the OpenWeatherMap cache, so turning the bridge on actually
  // takes effect immediately rather than waiting for the old cache to expire.
  const shortcutWeather = readShortcutWeather(settings);
  if (shortcutWeather) return shortcutWeather;

  const cached = getCacheEntry(WEATHER_CACHE_KEY, settings.weather.cacheLimitMinutes);
  if (cached && !cached.stale) {
    console.log(`Weather: using cache (${cached.ageMinutes.toFixed(1)}m old)`);
    return cached.data;
  }

  if (!hasApiKey(settings)) {
    console.warn("Weather: no OpenWeatherMap API key configured; skipping request.");
    return cached ? cached.data : null;
  }

  try {
    const data = await requestWeather(settings);
    setCacheEntry(WEATHER_CACHE_KEY, data);
    return data;
  } catch (e) {
    console.warn(`Couldn't reach OpenWeatherMap (${e.message}); using cached data if we have it.`);
    return cached ? cached.data : null;
  }
}

async function requestWeather(settings) {
  const { apiKey, units, cityId } = settings.weather;

  // cityId and apiKey are user-typed (and cityId is even settable through
  // the hand-written per-widget parameter), so they're encoded rather than
  // interpolated raw — a stray "&" or space would otherwise silently
  // corrupt the query string. Coordinates get Number() for the same
  // reason URL-building code everywhere else in this file coerces them:
  // guaranteeing a number is what ends up in the URL, whatever shape the
  // source object took.
  let query;
  if (cityId) {
    query = `id=${encodeURIComponent(cityId)}`;
  } else {
    const location = await Location.current();
    query = `lat=${Number(location.latitude)}&lon=${Number(location.longitude)}`;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${query}&units=${units}&appid=${encodeURIComponent(apiKey)}`;
  const request = new Request(url);
  request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;

  const json = await request.loadJSON();
  if (json.cod && Number(json.cod) !== 200) {
    throw new Error(`OpenWeatherMap error ${json.cod}: ${json.message}`);
  }
  return json;
}

// MARK: - Forecast (Open-Meteo)

// Daily forecast + 15-minute precipitation from Open-Meteo — free and
// keyless, which is what lets the rain nowcast, morning high, temp-swing
// heads-up, and UV alerts exist without OpenWeatherMap's paid One Call
// tier. Reuses the coordinates already returned by the current-weather
// fetch rather than geocoding again. One request serves all four features.
const FORECAST_CACHE_KEY = "openMeteoForecast";
const FORECAST_CACHE_MINUTES = 30;

async function fetchForecast(settings, weather) {
  if (!settings.weather.forecastEnabled) return null;

  const coord = weather?.coord;
  if (!coord) return null;

  const cached = getCacheEntry(FORECAST_CACHE_KEY, FORECAST_CACHE_MINUTES);
  if (cached && !cached.stale) return cached.data;

  try {
    const temperatureUnit = settings.weather.units === "imperial" ? "fahrenheit" : "celsius";
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${Number(coord.lat)}&longitude=${Number(coord.lon)}` +
      `&daily=temperature_2m_max,temperature_2m_min,uv_index_max&minutely_15=precipitation` +
      `&forecast_days=2&timezone=auto&temperature_unit=${temperatureUnit}`;
    const request = new Request(url);
    request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;

    const json = await request.loadJSON();
    if (!json?.daily?.temperature_2m_max) {
      throw new Error(json?.reason ?? "unexpected response shape");
    }

    // The minutely_15 series covers two full days; only the next few hours
    // matter for the nowcast, and trimming before caching keeps the shared
    // cache file small. Times arrive as ISO strings without a zone suffix,
    // which JS parses as *local* time — correct here, since timezone=auto
    // makes Open-Meteo report in the coordinates' own timezone.
    const now = Date.now();
    const minutely15 = (json.minutely_15?.time ?? [])
      .map((time, i) => ({ time: new Date(time).getTime(), precipitation: json.minutely_15.precipitation[i] }))
      .filter((entry) => entry.time >= now - 15 * 60000 && entry.time <= now + 3 * 3600000);

    const data = {
      todayHigh: json.daily.temperature_2m_max[0],
      todayLow: json.daily.temperature_2m_min[0],
      tomorrowHigh: json.daily.temperature_2m_max[1],
      uvMaxToday: json.daily.uv_index_max?.[0] ?? null,
      minutely15,
    };
    setCacheEntry(FORECAST_CACHE_KEY, data);
    return data;
  } catch (e) {
    console.warn(`Couldn't reach Open-Meteo (${e.message}); using cached forecast if we have it.`);
    return cached ? cached.data : null;
  }
}

// US AQI from Open-Meteo's separate (also free, keyless) air-quality API.
// Only fetched while the AQI alert is enabled, and cached long — air
// quality moves on the scale of hours.
const AQI_CACHE_KEY = "airQuality";
const AQI_CACHE_MINUTES = 60;

async function fetchAirQuality(settings, weather) {
  if (!settings.behavior.aqiAlertEnabled) return null;

  const coord = weather?.coord;
  if (!coord) return null;

  const cached = getCacheEntry(AQI_CACHE_KEY, AQI_CACHE_MINUTES);
  if (cached && !cached.stale) return cached.data;

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${Number(coord.lat)}&longitude=${Number(coord.lon)}&current=us_aqi`;
    const request = new Request(url);
    request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;

    const json = await request.loadJSON();
    const aqi = json?.current?.us_aqi;
    if (!Number.isFinite(aqi)) throw new Error(json?.reason ?? "unexpected response shape");

    setCacheEntry(AQI_CACHE_KEY, aqi);
    return aqi;
  } catch (e) {
    console.warn(`Couldn't reach the air-quality API (${e.message}); using cached AQI if we have it.`);
    return cached ? cached.data : null;
  }
}

// Both the sunrise/sunset and the moment-of-sunset wind-down toggle read
// straight off the plain weather fetch above, which already returns the
// full OpenWeatherMap payload (including `sys.sunrise`/`sys.sunset`) rather
// than a trimmed-down shape — so this needs no fetch of its own.
function getSunTimes(weather) {
  if (!weather?.sys?.sunrise || !weather?.sys?.sunset) return null;
  return {
    sunrise: new Date(weather.sys.sunrise * 1000),
    sunset: new Date(weather.sys.sunset * 1000),
  };
}

function formatClockTime(date, settings) {
  return new Intl.DateTimeFormat(settings.user.locale, { hour: "numeric", minute: "2-digit" }).format(date);
}

// A short "Until 9:00 PM" from the alert's own `expires` field — the real
// NWS `headline` is a full run-on sentence that's guaranteed to truncate
// under a one-line pill/row, and isn't actually as useful at a glance.
function formatAlertUntil(alert, settings) {
  const expires = alert?.expires ? new Date(alert.expires) : null;
  if (!expires || Number.isNaN(expires.getTime())) return "Check the Weather app for details";
  return `Until ${formatClockTime(expires, settings)}`;
}

// MARK: - Severe Weather Alerts

// Real active alerts from the National Weather Service — free and keyless,
// unlike OpenWeatherMap's own `alerts` field, which needs the same paid
// One Call subscription as the rain nowcast. US locations only. Reuses the
// coordinates already returned by the plain weather fetch rather than
// geocoding or requesting location again.
const NWS_ALERTS_CACHE_KEY = "nwsAlerts";
const NWS_ALERTS_CACHE_MINUTES = 15;
const NWS_USER_AGENT = "LiveContext-Scriptable/1.0 (personal iOS widget script, no public contact)";

async function fetchSevereWeatherAlerts(settings, weather) {
  if (!settings.weather.severeAlertsEnabled) return null;
  const coord = weather?.coord;
  if (!coord) return null;

  const cached = getCacheEntry(NWS_ALERTS_CACHE_KEY, NWS_ALERTS_CACHE_MINUTES);
  if (cached && !cached.stale) return cached.data;

  try {
    const url = `https://api.weather.gov/alerts/active?point=${Number(coord.lat)},${Number(coord.lon)}`;
    const request = new Request(url);
    request.headers = { "User-Agent": NWS_USER_AGENT, Accept: "application/geo+json" };
    request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;

    const json = await request.loadJSON();
    const alerts = (json.features ?? [])
      .map((feature) => feature.properties)
      .filter((properties) => properties && ["Severe", "Extreme"].includes(properties.severity));
    setCacheEntry(NWS_ALERTS_CACHE_KEY, alerts);
    return alerts;
  } catch (e) {
    console.warn(`Couldn't reach the National Weather Service (${e.message}); using cached alerts if any.`);
    return cached ? cached.data : null;
  }
}

// Tracks when each alert (by its NWS-issued id) was first seen, so
// buildWidgetModel can tell "just started, worth taking over the widget"
// apart from "still active, but we've already shown it prominently" — a
// multi-hour Watch shouldn't dominate the whole widget for its entire
// duration. Pruned on every write so this can't grow unbounded across many
// issuances over time; a day is generous since NWS alerts don't run longer.
const SEVERE_ALERT_SEEN_KEY = "severeAlertFirstSeen";
const SEVERE_ALERT_SEEN_PRUNE_MS = 24 * 3600000;

function trackAlertFirstSeen(alertId) {
  const cached = getCacheEntry(SEVERE_ALERT_SEEN_KEY, null); // null maxAge = never stale
  const seenMap = cached?.data ?? {};
  const now = Date.now();

  for (const [id, seenAt] of Object.entries(seenMap)) {
    if (now - seenAt > SEVERE_ALERT_SEEN_PRUNE_MS) delete seenMap[id];
  }
  if (!seenMap[alertId]) {
    seenMap[alertId] = now;
    setCacheEntry(SEVERE_ALERT_SEEN_KEY, seenMap);
  }
  return seenMap[alertId];
}

// MARK: - Holidays

// A small, US-centric fixed/floating holiday table — enough to catch the
// major "at a glance"-worthy days without an external calendar or API.
// Deliberately skips movable feasts like Easter, whose date needs a much
// fussier calculation for a feature this minor.
const FIXED_HOLIDAYS = {
  "1-1": "New Year's Day",
  "2-14": "Valentine's Day",
  "3-17": "St. Patrick's Day",
  "7-4": "Independence Day",
  "10-31": "Halloween",
  "11-11": "Veterans Day",
  "12-25": "Christmas Day",
  "12-31": "New Year's Eve",
};

function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - offset);
}

function todaysHoliday(settings, date = new Date()) {
  if (!settings.behavior.holidayAlertEnabled) return null;

  const key = `${date.getMonth() + 1}-${date.getDate()}`;
  if (FIXED_HOLIDAYS[key]) return FIXED_HOLIDAYS[key];

  const year = date.getFullYear();
  const isToday = (d) => d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  if (isToday(lastWeekdayOfMonth(year, 4, 1))) return "Memorial Day"; // last Monday of May
  if (isToday(nthWeekdayOfMonth(year, 8, 1, 1))) return "Labor Day"; // 1st Monday of September
  if (isToday(nthWeekdayOfMonth(year, 10, 4, 4))) return "Thanksgiving"; // 4th Thursday of November
  return null;
}

// MARK: - Stocks

// After-close market recap. Quotes come from Yahoo Finance's chart
// endpoint — unofficial but keyless (every no-signup stock source is
// unofficial; the official ones all require an API-key account), so it's
// cached hard and every failure degrades to "no recap shown" rather than
// an error state.
const STOCKS_CACHE_KEY = "stockQuotes";
const MAX_STOCK_TICKERS = 4;

// Minutes since the most recent 4:00 PM ET market close, or null if the
// market hasn't closed yet today / it's a weekend. Computed in the
// exchange's own timezone via Intl, so it's correct wherever the user is.
// US market holidays aren't special-cased — on those days the recap just
// shows the prior session's closing prices.
function minutesSinceMarketClose(now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);
    const part = (type) => parts.find((p) => p.type === type)?.value;

    const weekday = part("weekday");
    if (weekday === "Sat" || weekday === "Sun") return null;

    const minutesIntoDay = (Number(part("hour")) % 24) * 60 + Number(part("minute"));
    const closeMinutes = 16 * 60; // 4:00 PM ET
    return minutesIntoDay >= closeMinutes ? minutesIntoDay - closeMinutes : null;
  } catch (e) {
    console.warn(`Couldn't determine market-close time (${e.message}); skipping stock recap.`);
    return null;
  }
}

function isStockRecapWindow(settings) {
  if (!settings.stocks.enabled || settings.stocks.tickers.length === 0) return null;
  const since = minutesSinceMarketClose();
  if (since == null || since >= settings.stocks.displayMinutes) return null;
  return since;
}

// Fetches closing quotes for the configured tickers, or null if the recap
// window isn't active (which also means zero network cost for the rest of
// the day). Quotes are cached for the whole display window — they're
// closing prices, so they don't change — keyed to the ticker list so
// editing tickers refetches. Each ticker fails independently: one bad
// symbol doesn't take down the rest.
async function fetchStockQuotesForRecap(settings) {
  if (isStockRecapWindow(settings) == null) return null;
  const tickers = settings.stocks.tickers.slice(0, MAX_STOCK_TICKERS);
  const tickersKey = tickers.join(",");

  const cached = getCacheEntry(STOCKS_CACHE_KEY, settings.stocks.displayMinutes);
  if (cached && !cached.stale && cached.data.tickersKey === tickersKey) {
    return cached.data.quotes;
  }

  const quotes = [];
  for (const ticker of tickers) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d`;
      const request = new Request(url);
      request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;
      const json = await request.loadJSON();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!Number.isFinite(meta?.regularMarketPrice)) continue;
      quotes.push({
        symbol: meta.symbol ?? ticker,
        price: meta.regularMarketPrice,
        previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
      });
    } catch (e) {
      console.warn(`Couldn't fetch quote for ${ticker} (${e.message}); skipping it.`);
    }
  }

  if (quotes.length === 0) return cached ? cached.data.quotes : null;
  setCacheEntry(STOCKS_CACHE_KEY, { tickersKey, quotes });
  return quotes;
}

// "AAPL 234.56 ▲1.2%" — plain text arrows, no color, since a row's text
// is a single color and red/green tinting per-word isn't available here.
function formatStockQuote(quote) {
  const price = quote.price.toFixed(2);
  if (!Number.isFinite(quote.previousClose) || quote.previousClose <= 0) {
    return `${quote.symbol} ${price}`;
  }
  const changePct = ((quote.price - quote.previousClose) / quote.previousClose) * 100;
  const arrow = changePct > 0.005 ? "▲" : changePct < -0.005 ? "▼" : "–";
  return `${quote.symbol} ${price} ${arrow}${Math.abs(changePct).toFixed(1)}%`;
}

// Same up/flat/down threshold formatStockQuote's arrow uses, exposed
// separately so the stock pill's fill color can match its own arrow.
function stockPillColor(quote) {
  if (!Number.isFinite(quote.previousClose) || quote.previousClose <= 0) return PILL_COLORS.stockFlat;
  const changePct = ((quote.price - quote.previousClose) / quote.previousClose) * 100;
  if (changePct > 0.005) return PILL_COLORS.stockUp;
  if (changePct < -0.005) return PILL_COLORS.stockDown;
  return PILL_COLORS.stockFlat;
}

// MARK: - Calendar

// The full calendar list, fetched from EventKit once per run and shared —
// event fetching and the birthdays check both need it, and they run
// concurrently in the same Promise.all, so this memoizes the *promise*
// (not the result): the second caller awaits the first caller's in-flight
// request instead of kicking off a duplicate EventKit round-trip. The
// calendar list can't change mid-run, so per-run staleness isn't a concern.
let eventCalendarsPromise = null;
function getEventCalendars() {
  if (!eventCalendarsPromise) eventCalendarsPromise = Calendar.forEvents();
  return eventCalendarsPromise;
}

// Resolves stored calendar identifiers into Calendar objects for
// CalendarEvent.between()'s optional filter. Returns null (meaning "all
// calendars") if none are configured, or if every previously-selected
// calendar was deleted/re-synced since and no longer resolves.
//
// Scriptable's Calendar class has no by-identifier lookup (there is no
// `Calendar.forIdentifier()`), so this fetches the full list via
// Calendar.forEvents() and filters it in JS by identifier.
async function resolveSelectedCalendars(calendarIds) {
  if (!calendarIds || calendarIds.length === 0) return null;

  const allCalendars = await getEventCalendars();
  const idSet = new Set(calendarIds);
  const resolved = allCalendars.filter((calendar) => idSet.has(calendar.identifier));
  return resolved.length > 0 ? resolved : null;
}

// Fetches over the wider of the two lookahead windows (normal vs.
// high-value) in a single calendar read; buildWidgetModel splits the
// result back apart by window and keyword match. The wide window only
// applies while high-value alerts are actually on — with them off, its
// extra days of events would be fetched and then never looked at.
async function fetchUpcomingEvents(settings) {
  const now = new Date();
  const widestLookaheadHours = settings.behavior.highValueEventAlertEnabled
    ? Math.max(settings.behavior.eventLookaheadHours, settings.behavior.highValueLookaheadHours)
    : settings.behavior.eventLookaheadHours;
  const lookahead = new Date(now.getTime() + widestLookaheadHours * 3600000);

  try {
    const calendars = await resolveSelectedCalendars(settings.behavior.calendarIds);
    const events = calendars
      ? await CalendarEvent.between(now, lookahead, calendars)
      : await CalendarEvent.between(now, lookahead);
    return events
      .filter((event) => !event.isAllDay)
      .sort((a, b) => a.startDate - b.startDate);
  } catch (e) {
    console.warn(`Couldn't read calendar events (${e.message}); showing none.`);
    return [];
  }
}

// MARK: - Birthdays

// iOS auto-generates a read-only "Birthdays" calendar from Contacts, which
// Calendar.forEvents() already sees — no separate Contacts permission
// needed. Its events are all-day, so fetchUpcomingEvents above (which
// filters out all-day events) never touches them; this is the one place
// that deliberately looks at that calendar.
async function fetchTodaysBirthdays(settings) {
  if (!settings.behavior.contactBirthdaysEnabled) return [];

  try {
    const calendars = await getEventCalendars();
    const birthdayCalendars = calendars.filter((c) => c.title.toLowerCase().includes("birthday"));
    if (birthdayCalendars.length === 0) return [];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 3600000);

    const events = await CalendarEvent.between(startOfDay, endOfDay, birthdayCalendars);
    return events.map((event) => event.title);
  } catch (e) {
    console.warn(`Couldn't read birthdays (${e.message}); skipping.`);
    return [];
  }
}

// MARK: - Reminders

// How far back "overdue" reaches. A bounded window rather than
// epoch-to-now, so a years-old abandoned reminder list can't make this
// query scan (or surface) ancient junk.
const REMINDER_OVERDUE_LOOKBACK_DAYS = 60;

// One incompleteDueBetween() call covers both overdue and due-today, and
// only ever returns incomplete reminders — completed ones are excluded by
// the API itself, not by a filter here.
async function fetchDueReminders(settings) {
  if (!settings.behavior.reminderAlertEnabled) return [];

  try {
    const now = new Date();
    const lookbackStart = new Date(now.getTime() - REMINDER_OVERDUE_LOOKBACK_DAYS * 24 * 3600000);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const reminders = await Reminder.incompleteDueBetween(lookbackStart, endOfToday);
    // Most-overdue first, so the single title the widget shows is the one
    // that's been waiting longest.
    return reminders.sort((a, b) => a.dueDate - b.dueDate);
  } catch (e) {
    console.warn(`Couldn't read reminders (${e.message}); skipping.`);
    return [];
  }
}

// MARK: - Geofencing

// Great-circle distance between two coordinates, in meters.
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_METERS = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

// Street addresses are geocoded on demand rather than stored as lat/lon,
// since that's a much friendlier settings field. Geocoding needs the
// network, so results are cached indefinitely per address string — a home
// address's coordinates don't change, and re-geocoding on every render
// would be wasteful. Cache is keyed by the address text itself, so editing
// an address naturally invalidates the old entry rather than requiring
// explicit invalidation.
//
// Uses Nominatim (OpenStreetMap) over HTTP — Scriptable has no forward-
// geocoding API of its own (Location only offers current(), the accuracy
// setters, and reverseGeocode(), which goes the opposite direction).
const GEOCODE_CACHE_KEY = "geocodedAddresses";

// Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
// requires a descriptive User-Agent and forbids hammering it with repeat
// queries — every caller here caches indefinitely per input string, since
// a given address/location's coordinates don't change. Shared by
// geocodeAddress (Home/Work/Gym) and geocodeEventLocation (calendar event
// locations) below — same API, same shape, different cache namespace.
const NOMINATIM_USER_AGENT = "LiveContext-Scriptable/1.0 (personal iOS widget script, no public contact)";

// One request to Nominatim's /search, with either a freeform `q` or a set
// of structured fields (street/city/state/postalcode/country) — the two
// are mutually exclusive per Nominatim's API, never combined in one call.
async function requestNominatimCoords(params) {
  const query = Object.entries({ ...params, format: "json", limit: "1" })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  const request = new Request(`https://nominatim.openstreetmap.org/search?${query}`);
  request.headers = { "User-Agent": NOMINATIM_USER_AGENT };
  request.timeoutInterval = WEATHER_REQUEST_TIMEOUT_SECONDS;

  const results = await request.loadJSON();
  const first = results?.[0];
  if (!first) return null;
  return { latitude: Number(first.lat), longitude: Number(first.lon) };
}

// Best-effort split of a typical US "street, city, state zip" address into
// Nominatim's structured fields. Returns null for anything that doesn't
// look like this exact shape — an event location is often a business name
// or informal text ("Mom's House"), not a formatted mailing address, and
// those should just fall straight through to the freeform search below
// rather than being forced through this parser.
function parseUSAddressParts(text) {
  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const stateZipMatch = parts[parts.length - 1].match(/^([A-Za-z]{2})\s+(\d{5})(-\d{4})?$/);
  if (!stateZipMatch) return null;

  const city = parts[parts.length - 2];
  const street = parts.slice(0, parts.length - 2).join(", ");
  if (!street || !city) return null;

  return { street, city, state: stateZipMatch[1], postalcode: stateZipMatch[2], country: "US" };
}

// Nominatim's freeform text search can fail to resolve a well-formed
// address that its own structured search handles fine, since its
// tokenizer sometimes can't split a standard US mailing address (e.g.
// "742 Evergreen Terrace, Springfield, IL 62704") into the right pieces
// on its own. Structured fields are tried first for anything that looks
// like a standard address, then the plain freeform search either way,
// covering informal text (event locations, POI names) that structured
// fields can't represent at all.
async function geocodeViaNominatim(text, cacheKey) {
  if (!text) return null;

  const cached = getCacheEntry(cacheKey, null); // null maxAge = never stale
  const coordsByText = cached?.data ?? {};
  if (coordsByText[text]) return coordsByText[text];

  try {
    const structured = parseUSAddressParts(text);
    const coords = (structured && (await requestNominatimCoords(structured))) || (await requestNominatimCoords({ q: text }));
    if (!coords) return null;

    setCacheEntry(cacheKey, { ...coordsByText, [text]: coords });
    return coords;
  } catch (e) {
    console.warn(`Couldn't geocode "${text}" via Nominatim (${e.message}); skipping.`);
    return null;
  }
}

async function geocodeAddress(address) {
  return geocodeViaNominatim(address, GEOCODE_CACHE_KEY);
}

const GEOFENCE_PLACES = [
  { settingsKey: "homeAddress", label: "Home" },
  { settingsKey: "workAddress", label: "Work" },
  { settingsKey: "gymAddress", label: "the Gym" },
];

// Shared by geofence and event-arrival checks so a render that needs both
// only triggers one GPS fix rather than two. Location.current() rejects if
// the user hasn't granted (or has denied) location permission — caught
// here, once, so that's a silent skip rather than a crashed widget.
async function getCurrentLocationSafely() {
  try {
    return await Location.current();
  } catch (e) {
    console.warn(`Couldn't determine current location (${e.message}); skipping location-based checks.`);
    return null;
  }
}

// A GPS/Wi-Fi/cell fix is never exact — Location.current()'s own
// horizontalAccuracy reports how uncertain THIS particular reading is, in
// meters, and indoors (a workplace, a gym) that can easily be 50-150m. A
// hard "distance <= radius" comparison with no allowance for that means a
// device that hasn't physically moved can still flicker in and out of a
// geofence purely because one fix happened to be noisier than the last —
// exactly the "keeps intermittently showing" symptom this fixes. Widening
// the effective radius by the reading's own accuracy (capped, so a truly
// bad fix can't make the geofence match almost anywhere) treats "might
// still be inside, given how uncertain this fix is" as inside, rather than
// as a false "you left."
const GEOFENCE_ACCURACY_BUFFER_CAP_METERS = 100;

function effectiveGeofenceRadius(currentLocation, radiusMeters) {
  const accuracy = currentLocation?.horizontalAccuracy;
  if (!Number.isFinite(accuracy) || accuracy <= 0) return radiusMeters;
  return radiusMeters + Math.min(accuracy, GEOFENCE_ACCURACY_BUFFER_CAP_METERS);
}

// Returns `{ label, distanceMeters }` for the first configured place the
// device is currently within range of, or null if the feature is off, no
// place is configured, or currentLocation is null (permission denied/error).
async function checkGeofence(settings, currentLocation) {
  // A fresh Shortcuts "arrived" flag (see MARK: - Shortcuts Bridge) wins
  // immediately — independent of the Geofence Alert toggle below, and
  // without needing a live GPS fix at all. That's the actual point of
  // wiring it in: Shortcuts' own "Arrive at Location" automation already
  // confirmed you're there via a real background OS trigger, so there's
  // nothing left here to poll for. distanceMeters is reported as 0 (not
  // measured) since that confirmation, not a live GPS reading, is what's
  // being trusted.
  const shortcutPlace = readShortcutArrival(settings);
  if (shortcutPlace) {
    const matched = GEOFENCE_PLACES.find((p) => p.settingsKey.toLowerCase().startsWith(shortcutPlace));
    const address = matched && settings.location[matched.settingsKey];
    if (matched && address) {
      const coords = await geocodeAddress(address);
      return { label: matched.label, distanceMeters: 0, coords };
    }
  }

  const { geofenceEnabled, radiusMeters } = settings.location;
  if (!geofenceEnabled || !currentLocation) return null;

  const configuredPlaces = GEOFENCE_PLACES
    .map((place) => ({ ...place, address: settings.location[place.settingsKey] }))
    .filter((place) => place.address);
  if (configuredPlaces.length === 0) return null;

  const effectiveRadius = effectiveGeofenceRadius(currentLocation, radiusMeters);
  for (const place of configuredPlaces) {
    const coords = await geocodeAddress(place.address);
    if (!coords) continue;

    const distanceMeters = haversineDistanceMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      coords.latitude,
      coords.longitude
    );
    if (distanceMeters <= effectiveRadius) {
      // coords is kept around (not just distance/label) so tap-to-open can
      // route straight to this place in Maps instead of just naming it.
      return { label: place.label, distanceMeters, coords };
    }
  }

  return null;
}

// MARK: - Event Arrival

const NOMINATIM_CACHE_KEY = "nominatimGeocodedLocations";
const EVENT_ARRIVAL_RADIUS_METERS = 150;
const EVENT_ARRIVAL_LEAD_MINUTES = 30; // how early the arrival window opens before the event's start

async function geocodeEventLocation(locationText) {
  return geocodeViaNominatim(locationText, NOMINATIM_CACHE_KEY);
}

// True from EVENT_ARRIVAL_LEAD_MINUTES before the event's start through
// arrivalMessageLingerMinutes after it.
function isWithinArrivalWindow(event, settings, now = Date.now()) {
  const windowStart = event.startDate.getTime() - EVENT_ARRIVAL_LEAD_MINUTES * 60000;
  const windowEnd = event.startDate.getTime() + settings.behavior.arrivalMessageLingerMinutes * 60000;
  return now >= windowStart && now <= windowEnd;
}

// Returns `{ event, distanceMeters }` for the first event, among ones
// already known to be in their arrival time window, whose geocoded
// location is within EVENT_ARRIVAL_RADIUS_METERS of currentLocation.
async function checkEventArrival(candidateEvents, currentLocation) {
  if (!currentLocation || candidateEvents.length === 0) return null;

  // Same fix-uncertainty allowance as checkGeofence above — otherwise a
  // noisier-than-usual fix while genuinely at the event's location can
  // read as just outside EVENT_ARRIVAL_RADIUS_METERS and flicker the
  // "Welcome to..." message on and off.
  const effectiveRadius = effectiveGeofenceRadius(currentLocation, EVENT_ARRIVAL_RADIUS_METERS);
  for (const event of candidateEvents) {
    const coords = await geocodeEventLocation(event.location);
    if (!coords) continue;

    const distanceMeters = haversineDistanceMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      coords.latitude,
      coords.longitude
    );
    if (distanceMeters <= effectiveRadius) {
      return { event, distanceMeters };
    }
  }

  return null;
}

// MARK: - Travel Estimate

// A rough, no-API-cost "time to leave" using straight-line distance and an
// assumed average speed — not real traffic/routing data (that needs a paid
// directions API), so it's framed as an approximation everywhere it's
// shown. Reuses the same Nominatim geocoding already relied on for event
// arrival detection above.
async function computeTravelEstimate(event, currentLocation, settings) {
  if (!currentLocation || !event?.location) return null;

  const coords = await geocodeEventLocation(event.location);
  if (!coords) return null;

  const distanceMeters = haversineDistanceMeters(
    currentLocation.latitude,
    currentLocation.longitude,
    coords.latitude,
    coords.longitude
  );
  const metersPerMinute = (settings.behavior.assumedTravelSpeedMph * 1609.34) / 60;
  const minutes = Math.round(distanceMeters / metersPerMinute);
  return { distanceMeters, minutes };
}

function formatTravelEstimate(travelEstimate) {
  if (!travelEstimate) return "";
  return travelEstimate.minutes <= 1 ? " · ~1 min away" : ` · ~${travelEstimate.minutes} min away`;
}

// MARK: - Morning Commute

// Weekday-morning window during which the commute estimate (and the
// morning-high briefing) are relevant at all. Fixed hours rather than yet
// another pair of settings fields — the toggles are the customization.
const MORNING_START_HOUR = 5;
const MORNING_END_HOUR = 10;

function isWeekdayMorning(date = new Date()) {
  const day = date.getDay();
  const hour = date.getHours();
  return day >= 1 && day <= 5 && hour >= MORNING_START_HOUR && hour < MORNING_END_HOUR;
}

// Whether the commute estimate should consider today a work day at all.
// Without a work-schedule calendar configured, every weekday morning is
// assumed to be one (the original behavior) — most people don't have a
// dedicated shift calendar, so this needs to fail open rather than
// demanding a setting nobody's filled in. Once configured, "today" only
// counts if there's an actual event on that specific calendar, so a day
// off (no shift scheduled) correctly skips the commute instead of
// guessing from the weekday alone. Same fail-open logic if the saved
// calendar identifier no longer resolves (deleted/renamed) — silently
// hiding the commute forever because of a stale identifier would be worse
// than occasionally showing it on an actual day off.
async function isWorkDayToday(settings) {
  const calendarId = settings.location.workScheduleCalendarId;
  if (!calendarId) return true;

  const calendars = await getEventCalendars();
  const calendar = calendars.find((c) => c.identifier === calendarId);
  if (!calendar) return true;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 3600000);
  const events = await CalendarEvent.between(startOfDay, endOfDay, [calendar]);
  return events.length > 0;
}

// Same straight-line-distance ÷ assumed-speed approximation (and same
// honesty caveat) as the event travel estimate. Skips itself when already
// at work (within the geofence radius) or implausibly far away (>100km —
// almost certainly traveling, where a "commute" number is meaningless).
const COMMUTE_MAX_DISTANCE_METERS = 100000;

async function checkMorningCommute(settings, currentLocation, isWorkDay) {
  if (!settings.behavior.commuteEstimateEnabled || !currentLocation) return null;
  if (!isWeekdayMorning()) return null;
  if (!isWorkDay) return null;
  const address = settings.location.workAddress;
  if (!address) return null;

  const coords = await geocodeAddress(address);
  if (!coords) return null;

  const distanceMeters = haversineDistanceMeters(
    currentLocation.latitude,
    currentLocation.longitude,
    coords.latitude,
    coords.longitude
  );
  if (distanceMeters <= settings.location.radiusMeters) return null;
  if (distanceMeters > COMMUTE_MAX_DISTANCE_METERS) return null;

  const metersPerMinute = (settings.behavior.assumedTravelSpeedMph * 1609.34) / 60;
  return { minutes: Math.max(Math.round(distanceMeters / metersPerMinute), 1), distanceMeters, coords };
}

// MARK: - Shortcuts Bridge
//
// Reads whatever "Live Context Bridge.js" (a separate script) has written
// into the shared cache from an iOS/iPadOS Shortcuts automation — nothing
// here ever triggers a Shortcut or waits on one; it just checks, on each
// normal render, whether fresh data happens to be sitting in the cache
// already. Freshness is checked the same way as every other cached fetch
// in this file (getCacheEntry's own maxAgeMinutes), so a flag from a
// Shortcut that hasn't run in hours is treated as stale, not authoritative.

function readShortcutArrival(settings) {
  if (!settings.behavior.shortcutArrivalEnabled) return null;
  const cached = getCacheEntry("shortcutArrival", settings.behavior.shortcutArrivalFreshMinutes);
  return cached && !cached.stale ? cached.data.place : null;
}

function readShortcutSteps(settings) {
  if (!settings.behavior.shortcutStepsEnabled) return null;
  const cached = getCacheEntry("shortcutSteps", settings.behavior.shortcutStepsFreshMinutes);
  return cached && !cached.stale ? cached.data.count : null;
}

// SF Symbol condition ids (weatherSymbolName's own switch) don't apply
// here — Shortcuts-sourced weather instead carries a plain condition
// name, mapped to the same OpenWeatherMap `main` category strings
// (Clear/Clouds/Rain/...) the rest of this file's icon/priority logic
// already keys off of, so downstream code doesn't need its own separate
// path for a Shortcuts-sourced reading versus an OpenWeatherMap one.
// The bridge's contract always sends Fahrenheit/mph (see Live Context
// Bridge.js) regardless of this widget's own Temperature Units setting —
// every downstream formatter (formatTemperature, formatWeatherDetail)
// assumes weather.main.temp/wind.speed are already in whatever unit
// settings.weather.units says, the same way OpenWeatherMap's own response
// arrives pre-converted by its `units` query param. Converting here once
// is what keeps every one of those formatters correct without needing a
// separate code path for a Shortcuts-sourced reading.
function convertFromFahrenheit(tempF, units) {
  if (units === "imperial") return tempF;
  const celsius = (tempF - 32) * (5 / 9);
  return units === "standard" ? celsius + 273.15 : celsius;
}

function convertFromMph(mph, units) {
  return units === "imperial" ? mph : mph * 0.44704; // mph -> m/s
}

function readShortcutWeather(settings) {
  if (!settings.behavior.shortcutWeatherEnabled) return null;
  const cached = getCacheEntry("shortcutWeather", settings.behavior.shortcutWeatherFreshMinutes);
  if (!cached || cached.stale) return null;

  const d = cached.data;
  const units = settings.weather.units;
  const conditionToId = { Thunderstorm: 200, Drizzle: 300, Rain: 500, Snow: 600, Fog: 741, Clear: 800, Clouds: 803 };

  // Only known if the Shortcut provided sunrise/sunset — without them this
  // just defaults to day icons rather than guessing.
  const now = Date.now();
  const isNight =
    d.sunriseISO && d.sunsetISO &&
    (now < new Date(d.sunriseISO).getTime() || now > new Date(d.sunsetISO).getTime());

  return {
    main: {
      temp: convertFromFahrenheit(d.tempF, units),
      feels_like: convertFromFahrenheit(d.tempF, units),
      humidity: d.humidityPercent ?? undefined,
    },
    weather: [{
      main: d.condition,
      description: d.condition,
      id: conditionToId[d.condition] ?? 803,
      icon: isNight ? "01n" : "01d",
    }],
    wind: { speed: d.windMph != null ? convertFromMph(d.windMph, units) : undefined },
    sys: {
      sunrise: d.sunriseISO ? Math.floor(new Date(d.sunriseISO).getTime() / 1000) : undefined,
      sunset: d.sunsetISO ? Math.floor(new Date(d.sunsetISO).getTime() / 1000) : undefined,
    },
    // No coordinates from Shortcuts — severe alerts, the Open-Meteo
    // forecast, and air quality (which all need coord) simply skip
    // themselves while this is in use, same as if geocoding failed.
    coord: null,
  };
}

function readShortcutSleep(settings) {
  if (!settings.behavior.shortcutSleepEnabled) return null;
  const cached = getCacheEntry("shortcutSleep", settings.behavior.shortcutSleepFreshMinutes);
  return cached && !cached.stale ? cached.data.hours : null;
}

function readShortcutActivity(settings) {
  if (!settings.behavior.shortcutActivityEnabled) return null;
  const cached = getCacheEntry("shortcutActivity", settings.behavior.shortcutActivityFreshMinutes);
  return cached && !cached.stale ? cached.data : null;
}

function readShortcutNowPlaying(settings) {
  if (!settings.behavior.shortcutNowPlayingEnabled) return null;
  const cached = getCacheEntry("shortcutNowPlaying", settings.behavior.shortcutNowPlayingFreshMinutes);
  return cached && !cached.stale ? cached.data : null;
}

function readShortcutCustomMessage(settings) {
  if (!settings.behavior.shortcutMessageEnabled) return null;
  const cached = getCacheEntry("shortcutMessage", settings.behavior.shortcutMessageFreshMinutes);
  return cached && !cached.stale ? cached.data : null;
}

// MARK: - Widget Model

// The order the priority cascade checks states in — first match wins.
// Severe weather (in its prominent window) and Wind Down are deliberately
// NOT in this list: one is a safety override that should never be
// demotable below anything, the other is a whole-widget mode that
// preempts the cascade entirely. "default" is the fallback when nothing
// matches, so it isn't listed either.
const DEFAULT_PRIORITY_ORDER = [
  "high-value-event",
  "rain-incoming",
  "event-arrival",
  "event",
  "custom-message",
  "commute",
  "geofence",
  "battery",
  "weather",
  "air-quality",
  "uv",
  "holiday",
  "birthdays",
  "reminders",
  "steps",
  "sleep",
  "activity",
  "stocks",
  "temp-swing",
  "now-playing",
];

// Human-readable names for the priority picker UI.
const PRIORITY_LABELS = {
  "high-value-event": "Starred Event",
  "rain-incoming": "Rain Incoming",
  "event-arrival": "Event Arrival",
  event: "Upcoming Event",
  "custom-message": "Custom Message (Shortcuts)",
  commute: "Morning Commute",
  geofence: "Near a Place",
  battery: "Low Battery",
  weather: "Active Weather",
  "air-quality": "Air Quality",
  uv: "UV Alert",
  holiday: "Holiday",
  birthdays: "Birthdays",
  reminders: "Reminders Due",
  steps: "Steps (Shortcuts)",
  sleep: "Sleep (Shortcuts)",
  activity: "Activity Rings (Shortcuts)",
  stocks: "Stocks Recap",
  "temp-swing": "Temp Swing",
  "now-playing": "Now Playing (Shortcuts)",
};

// Repairs a stored priority order into something safe to iterate: drops
// keys that no longer exist (or duplicates), then appends any known key
// the stored list is missing — so an order saved before a new state was
// added still includes that state (at its default position among the
// leftovers) instead of silently never showing it.
function normalizePriorityOrder(storedOrder) {
  const known = new Set(DEFAULT_PRIORITY_ORDER);
  const seen = new Set();
  const order = [];
  for (const key of Array.isArray(storedOrder) ? storedOrder : []) {
    if (known.has(key) && !seen.has(key)) {
      order.push(key);
      seen.add(key);
    }
  }
  for (const key of DEFAULT_PRIORITY_ORDER) {
    if (!seen.has(key)) order.push(key);
  }
  return order;
}

// Compiles each keyword into a case-insensitive regex, silently skipping
// any pattern that isn't valid regex rather than letting bad user input
// (typed into a plain settings text field) crash the widget.
function buildHighValueKeywordPatterns(keywords) {
  const patterns = (keywords ?? [])
    .map((keyword) => {
      try {
        return new RegExp(keyword, "i");
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return patterns.length > 0 ? patterns : null;
}

// Finds the first event (searched over the full, wide-lookahead list)
// whose title matches any high-value pattern — this is what lets it bypass
// the normal event lookahead window entirely.
function findHighValueEvent(events, patterns) {
  if (!patterns) return null;
  return events.find((event) => patterns.some((pattern) => pattern.test(event.title))) ?? null;
}

// Every render re-evaluates calendar, battery, weather, forecast, air
// quality, and location, and picks the single most relevant thing to show:
//   1. "severe-weather"   — an active NWS Severe/Extreme alert for this location
//   2. "high-value-event" — a title-matched keyword event, any time within its own wider window
//   3. "rain-incoming"    — rain/snow is about to start (15-minute nowcast)
//   4. "event-arrival"    — physically at an event's location during its arrival window
//   5. "event"            — a calendar event is starting within the lookahead window
//   6. "commute"          — weekday-morning travel estimate to the Work address
//   7. "geofence"         — the device is within range of a configured place
//   8. "battery"          — battery is low and not charging
//   9. "weather"          — precipitation is happening right now
//  10. "air-quality"      — US AQI at/above the unhealthy threshold
//  11. "uv"               — today's max UV index at/above the extreme threshold, daytime only
//  12. "holiday"          — a recognized US holiday, today
//  13. "birthdays"        — someone on the Contacts "Birthdays" calendar has one today
//  14. "reminders"        — reminders due today or overdue (off by default)
//  15. "steps"            — today's step count, fed in from a Shortcuts automation (off by default)
//  16. "stocks"           — post-market-close ticker recap, for a limited window
//  17. "temp-swing"       — evening heads-up that tomorrow's high swings hard from today's
//  18. "default"          — time-aware greeting, date, and current weather
//
// event-arrival ranks below high-value-event/rain-incoming (a real weather
// emergency or a keyword match elsewhere still wins) but above the plain
// "event" countdown — once you've actually arrived, a countdown to the
// same event is redundant, so arrival should win over it. Commute outranks
// geofence because on a weekday morning you're usually *at* home — the
// "Near Home" card would otherwise mask the commute for the whole window.
// Health-adjacent heads-ups (AQI, UV) sit just under live weather; the
// rare-and-personal ones (holiday, birthdays) above the routine recaps.
async function buildWidgetModel(settings, weather) {
  const [events, forecast, stockQuotes, severeAlerts, contactBirthdays, dueReminders, airQuality] = await Promise.all([
    fetchUpcomingEvents(settings),
    fetchForecast(settings, weather),
    fetchStockQuotesForRecap(settings),
    fetchSevereWeatherAlerts(settings, weather),
    fetchTodaysBirthdays(settings),
    fetchDueReminders(settings),
    fetchAirQuality(settings, weather),
  ]);

  const battery = { level: Device.batteryLevel(), isCharging: Device.isCharging() };

  // Calendar.between() returns events that *overlap* [now, lookahead] — so
  // a long block that already started (an all-morning "Work" shift, say)
  // stays in `events` for its entire duration, with a startDate in the
  // past. Without this filter, that event would keep winning "next event"
  // forever (sorted first by startDate) and its countdown would just tick
  // upward as elapsed time instead of the widget ever moving on. Only
  // arrivalCandidates below deliberately keeps using the unfiltered
  // `events` — arrival detection specifically wants events that may have
  // just started, within their own linger window.
  const now = Date.now();
  const futureEvents = events.filter((event) => event.startDate.getTime() > now);

  // `events` covers the wider of the two lookahead windows (see
  // fetchUpcomingEvents), so the normal "event" priority still needs to
  // filter back down to its own, typically-shorter window.
  const normalHorizon = new Date(now + settings.behavior.eventLookaheadHours * 3600000);
  const standardEvents = futureEvents.filter((event) => event.startDate <= normalHorizon);
  const nextEvent = standardEvents[0] ?? null;

  const keywordPatterns = buildHighValueKeywordPatterns(settings.behavior.highValueKeywords);
  const highValueEvent = settings.behavior.highValueEventAlertEnabled
    ? findHighValueEvent(futureEvents, keywordPatterns)
    : null;

  // Geofence, event-arrival, the travel estimate, and the morning commute
  // all need the device's current location — fetched at most once per
  // render, and only if one of them could actually apply.
  const arrivalCandidates = events.filter((event) => event.location && isWithinArrivalWindow(event, settings));
  const featuredEventForTravel = highValueEvent ?? nextEvent;
  // Only worth the extra calendar check when the commute could otherwise
  // apply at all — a Tuesday afternoon shouldn't pay for it just because a
  // work-schedule calendar happens to be configured.
  const couldBeCommuteMorning = settings.behavior.commuteEstimateEnabled && isWeekdayMorning() && Boolean(settings.location.workAddress);
  const isWorkDay = couldBeCommuteMorning ? await isWorkDayToday(settings) : true;
  const needsCurrentLocation =
    settings.location.geofenceEnabled ||
    arrivalCandidates.length > 0 ||
    (settings.behavior.travelEstimateEnabled && Boolean(featuredEventForTravel?.location)) ||
    (couldBeCommuteMorning && isWorkDay);
  const currentLocation = needsCurrentLocation ? await getCurrentLocationSafely() : null;

  const [eventArrival, geofence, commute] = await Promise.all([
    checkEventArrival(arrivalCandidates, currentLocation),
    checkGeofence(settings, currentLocation),
    checkMorningCommute(settings, currentLocation, isWorkDay),
  ]);

  const isBatteryLow =
    !battery.isCharging && battery.level >= 0 && battery.level <= settings.behavior.lowBatteryThreshold;
  const minutesUntilRain = settings.behavior.rainNowcastEnabled
    ? findImminentRainMinutes(forecast?.minutely15, settings.behavior.rainNowcastLookaheadMinutes)
    : null;
  const holiday = todaysHoliday(settings);
  const shortcutSteps = readShortcutSteps(settings);
  const shortcutSleep = readShortcutSleep(settings);
  const shortcutActivity = readShortcutActivity(settings);
  const shortcutNowPlaying = readShortcutNowPlaying(settings);
  const shortcutMessage = readShortcutCustomMessage(settings);
  const hour = new Date().getHours();

  // Morning briefing: today's high, folded into the default view's
  // temperature pill (not its own state — it enriches, not interrupts).
  const todayHighText =
    settings.behavior.morningBriefingEnabled && forecast && hour >= MORNING_START_HOUR && hour < 12
      ? `↑${Math.round(forecast.todayHigh)}°`
      : null;

  // Evening heads-up when tomorrow's high swings hard against today's.
  const swing = forecast ? forecast.tomorrowHigh - forecast.todayHigh : 0;
  const tempSwing =
    settings.behavior.tempSwingAlertEnabled && forecast &&
    hour >= 16 && hour <= 22 &&
    Math.abs(swing) >= settings.behavior.tempSwingThresholdDegrees
      ? { delta: swing, tomorrowHigh: forecast.tomorrowHigh, todayHigh: forecast.todayHigh }
      : null;

  // UV only matters while there's meaningful sun left in the day.
  const uvToday =
    settings.behavior.uvAlertEnabled && forecast?.uvMaxToday != null &&
    hour >= MORNING_START_HOUR && hour < 16 &&
    forecast.uvMaxToday >= settings.behavior.uvAlertThreshold
      ? Math.round(forecast.uvMaxToday)
      : null;

  const badAir =
    settings.behavior.aqiAlertEnabled && Number.isFinite(airQuality) &&
    airQuality >= settings.behavior.aqiAlertThreshold
      ? Math.round(airQuality)
      : null;

  // A brand-new alert takes over the whole widget for severeAlertProminentMinutes;
  // after that, it demotes to ambientAlert — a small note attached to
  // whatever priority the rest of this cascade decides on, rather than
  // continuing to block the widget for a Watch that can run for hours.
  let ambientAlert = null;
  if (severeAlerts && severeAlerts.length > 0) {
    const alert = severeAlerts[0];
    const firstSeenAt = trackAlertFirstSeen(alert.id ?? alert.event);
    const prominentWindowMs = settings.weather.severeAlertProminentMinutes * 60000;
    if (Date.now() - firstSeenAt < prominentWindowMs) {
      return { priority: "severe-weather", weather, alert, events: standardEvents };
    }
    ambientAlert = alert.event ?? "Weather Alert";
  }

  // One candidate per state: returns a model when the state applies right
  // now, or null to let the cascade move on. Checked in the user's chosen
  // order (Settings > Priorities), first match wins — this is what makes
  // the order reorderable without duplicating any of the checks.
  const priorityCandidates = {
    "high-value-event": async () => {
      if (!highValueEvent) return null;
      const travelEstimate = settings.behavior.travelEstimateEnabled
        ? await computeTravelEstimate(highValueEvent, currentLocation, settings)
        : null;
      return { priority: "high-value-event", weather, event: highValueEvent, travelEstimate, events: standardEvents };
    },
    "rain-incoming": () => (minutesUntilRain != null ? { priority: "rain-incoming", weather, minutesUntilRain, events: standardEvents } : null),
    "event-arrival": () => (eventArrival ? { priority: "event-arrival", weather, event: eventArrival.event, events: standardEvents } : null),
    event: async () => {
      if (!nextEvent || !settings.behavior.eventAlertEnabled) return null;
      const travelEstimate = settings.behavior.travelEstimateEnabled
        ? await computeTravelEstimate(nextEvent, currentLocation, settings)
        : null;
      return { priority: "event", weather, event: nextEvent, travelEstimate, events: standardEvents };
    },
    "custom-message": () => (shortcutMessage ? { priority: "custom-message", weather, message: shortcutMessage, events: standardEvents } : null),
    commute: () => (commute ? { priority: "commute", weather, commute, events: standardEvents } : null),
    geofence: () => (geofence ? { priority: "geofence", weather, geofence, events: standardEvents } : null),
    battery: () => (isBatteryLow && settings.behavior.batteryAlertEnabled ? { priority: "battery", weather, battery, events: standardEvents } : null),
    weather: () => (isPrecipitationImminent(weather) && settings.behavior.weatherAlertEnabled ? { priority: "weather", weather, events: standardEvents } : null),
    "air-quality": () => (badAir != null ? { priority: "air-quality", weather, aqi: badAir, events: standardEvents } : null),
    uv: () => (uvToday != null ? { priority: "uv", weather, uvIndex: uvToday, events: standardEvents } : null),
    holiday: () => (holiday ? { priority: "holiday", weather, holiday, events: standardEvents } : null),
    birthdays: () => (contactBirthdays.length > 0 ? { priority: "birthdays", weather, contactBirthdays, events: standardEvents } : null),
    reminders: () => (dueReminders.length > 0 ? { priority: "reminders", weather, dueReminders, events: standardEvents } : null),
    steps: () => (shortcutSteps != null ? { priority: "steps", weather, steps: shortcutSteps, events: standardEvents } : null),
    sleep: () => (shortcutSleep != null ? { priority: "sleep", weather, hours: shortcutSleep, events: standardEvents } : null),
    activity: () => {
      // handleActivity (Live Context Bridge.js) already requires at least
      // one field to be non-null before writing the cache entry — this
      // re-checks it defensively so a hand-edited/corrupted cache file
      // can't produce an "activity" state with nothing in it to render.
      const hasActivityData = shortcutActivity && (
        shortcutActivity.exerciseMinutes != null ||
        shortcutActivity.standHours != null ||
        shortcutActivity.activeCalories != null
      );
      return hasActivityData ? { priority: "activity", weather, activity: shortcutActivity, events: standardEvents } : null;
    },
    stocks: () => (stockQuotes && stockQuotes.length > 0 ? { priority: "stocks", weather, stockQuotes, events: standardEvents } : null),
    "temp-swing": () => (tempSwing ? { priority: "temp-swing", weather, tempSwing, events: standardEvents } : null),
    "now-playing": () => (shortcutNowPlaying ? { priority: "now-playing", weather, nowPlaying: shortcutNowPlaying, events: standardEvents } : null),
  };

  async function pickPriority() {
    for (const key of normalizePriorityOrder(settings.behavior.priorityOrder)) {
      const candidate = await priorityCandidates[key]?.();
      if (candidate) return candidate;
    }
    return { priority: "default", weather, todayHighText, events: standardEvents };
  }

  const model = await pickPriority();
  return ambientAlert ? { ...model, ambientAlert } : model;
}

function isPrecipitationImminent(weather) {
  const condition = weather?.weather?.[0]?.main;
  return ["Thunderstorm", "Drizzle", "Rain", "Snow"].includes(condition);
}

// Minutes until rain/snow starts, or null if nothing's imminent within the
// lookahead window. Works on Open-Meteo's 15-minute buckets (each entry
// covers [time, time+15m)), so the answer is quantized to that resolution.
// Already-raining-now is intentionally excluded — that's what the
// "weather" priority is for; this is only for rain that hasn't started yet.
function findImminentRainMinutes(minutely15, lookaheadMinutes) {
  if (!minutely15 || minutely15.length === 0) return null;
  const now = Date.now();

  for (const bucket of minutely15) {
    if (bucket.precipitation <= 0) continue;
    const bucketEnd = bucket.time + 15 * 60000;
    if (bucketEnd <= now) continue; // already over
    if (bucket.time <= now) return null; // raining right now — "weather" state's job
    const minutesUntil = Math.round((bucket.time - now) / 60000);
    return minutesUntil <= lookaheadMinutes ? minutesUntil : null;
  }
  return null;
}

// MARK: - Refresh Scheduling

const MIN_REFRESH_MINUTES = 10;
const MAX_REFRESH_MINUTES = 60;
const ERROR_RETRY_MINUTES = 15;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Tells iOS when it's worth asking for a fresh render. Refreshes are a
// budget iOS grants sparingly, so this only asks for what each state
// actually needs: a tight cadence to keep an event countdown accurate, a
// moderate one while something time-sensitive (battery/rain) is showing,
// and otherwise just often enough to pick up the next weather cache cycle.
function computeRefreshDate(model, settings) {
  const now = Date.now();

  switch (model.priority) {
    case "rain-incoming": {
      const rainStart = now + model.minutesUntilRain * 60000;
      const nextTick = now + MIN_REFRESH_MINUTES * 60000;
      return rainStart < nextTick ? new Date(rainStart) : new Date(nextTick);
    }
    // A high-value event can be days out, so refreshing every
    // MIN_REFRESH_MINUTES the whole time would waste refresh budget for no
    // reason — only tighten to that cadence once it's getting close.
    case "high-value-event": {
      const minutesUntilStart = (model.event.startDate - now) / 60000;
      const cadenceMinutes = minutesUntilStart > MAX_REFRESH_MINUTES ? MAX_REFRESH_MINUTES : MIN_REFRESH_MINUTES;
      const nextTick = now + cadenceMinutes * 60000;
      return model.event.startDate < nextTick ? model.event.startDate : new Date(nextTick);
    }
    case "event": {
      const nextTick = now + MIN_REFRESH_MINUTES * 60000;
      return model.event.startDate < nextTick ? model.event.startDate : new Date(nextTick);
    }
    // Refresh right as the arrival window closes, so the widget promptly
    // falls back to the plain "event" (or whatever's next) state.
    case "event-arrival": {
      const windowEnd = model.event.startDate.getTime() + settings.behavior.arrivalMessageLingerMinutes * 60000;
      const nextTick = now + MIN_REFRESH_MINUTES * 60000;
      return windowEnd < nextTick ? new Date(windowEnd) : new Date(nextTick);
    }
    // Refresh right as the recap window ends, so the widget flips back to
    // its normal content promptly instead of lingering up to a full cycle.
    case "stocks": {
      const since = minutesSinceMarketClose() ?? settings.stocks.displayMinutes;
      const minutesLeft = Math.max(settings.stocks.displayMinutes - since, 1);
      const windowEnd = now + minutesLeft * 60000;
      const nextTick = now + MIN_REFRESH_MINUTES * 60000;
      return windowEnd < nextTick ? new Date(windowEnd) : new Date(nextTick);
    }
    case "severe-weather":
    case "battery":
    case "weather":
    case "geofence":
    case "commute":
      return new Date(now + MIN_REFRESH_MINUTES * 60000);
    // Holiday, birthdays, reminders, steps, sleep, activity, now-playing,
    // a custom Shortcuts message, AQI, UV, and the temp-swing heads-up are
    // all hour-scale (or, for now-playing/custom-message, simply not worth
    // burning extra refresh budget on — there's no way to force an early
    // refresh anyway, see MARK: - Shortcuts Bridge) — the normal
    // weather-cache cadence in `default` below is plenty for all of them.
    default: {
      const minutes = clamp(settings.weather.cacheLimitMinutes, MIN_REFRESH_MINUTES, MAX_REFRESH_MINUTES);
      return new Date(now + minutes * 60000);
    }
  }
}

// MARK: - Widget UI helpers

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

// The one-word form used by the small widget's tight layout — "Night",
// "Morning", etc. Same hour boundaries as getGreeting, just without room
// for "Good ".
function getShortGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Night";
}

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// A short, plain-text date for the small widget's tight 3-line layout —
// "Jul 11th". English-only ordinal suffix by design (small trades full
// localization for reliably fitting three lines); formatDate/
// formatDatePills elsewhere stay the locale-aware versions used everywhere
// else in the widget.
function formatShortOrdinalDate(settings, date = new Date()) {
  const month = new Intl.DateTimeFormat(settings.user.locale, { month: "short" }).format(date);
  const day = date.getDate();
  return `${month} ${day}${ordinalSuffix(day)}`;
}

// Checked against wall-clock month/day (not time), so it holds "all day"
// regardless of getGreeting()'s morning/afternoon/evening logic above.
function isBirthdayToday(settings, date = new Date()) {
  const birthday = settings.user.birthday;
  if (!birthday) return false;

  const [month, day] = birthday.split("-").map(Number);
  return date.getMonth() + 1 === month && date.getDate() === day;
}

function formatDate(settings, date = new Date()) {
  return new Intl.DateTimeFormat(settings.user.locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

// A compact month-abbreviation + day-number pair for the two-pill date
// badge (e.g. "JUL" / "10") — deliberately different from formatDate's
// full "Friday, July 10", which is too long to fit a pill.
function formatDatePills(settings, date = new Date()) {
  const month = new Intl.DateTimeFormat(settings.user.locale, { month: "short" }).format(date).toUpperCase();
  const day = String(date.getDate());
  return { month, day };
}

// Same countdown math as formatCountdown below, minus the "In " prefix —
// used when the value sits inside a pill and "In" is its own plain text
// segment beside it.
function formatCountdownValue(startDate) {
  const minutesUntil = Math.round((startDate - new Date()) / 60000);
  if (minutesUntil <= 1) return "Now";
  if (minutesUntil < 60) return `${minutesUntil}m`;

  const totalHours = Math.floor(minutesUntil / 60);
  const minutes = minutesUntil % 60;
  if (totalHours < 24) {
    return minutes > 0 ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

// Adds a day-scale format on top of the original hours/minutes one — a
// high-value event can be up to highValueLookaheadHours out (days), where
// "In 71h 45m" reads far worse than "In 2d 23h".
function formatCountdown(startDate) {
  const minutesUntil = Math.round((startDate - new Date()) / 60000);
  return minutesUntil <= 1 ? "Starting now" : `In ${formatCountdownValue(startDate)}`;
}

function formatRainCountdown(minutes) {
  if (minutes <= 1) return "Rain starting now";
  return `Rain starting in ${minutes} min${minutes === 1 ? "" : "s"}`;
}

function formatTemperature(weather, settings) {
  if (!weather?.main) return "--°";
  const unitLetter = { imperial: "F", metric: "C", standard: "K" }[settings.weather.units] ?? "";
  return `${Math.round(weather.main.temp)}°${unitLetter}`;
}

// Divergence at which "feels like" becomes the more useful number to show
// (heat index / wind chill days). Scale-dependent: 8°F ≈ 4.5°C/K.
function feelsLikeThreshold(settings) {
  return settings.weather.units === "imperial" ? 8 : 4.5;
}

// The text for every temperature pill. Normally the plain temperature;
// switches to "Feels 97°F" when the feels-like diverges notably (the
// number your skin actually cares about on those days). `todayHighText`
// (morning briefing) appends the day's forecast high: "86°F ↑96°".
function temperaturePillText(weather, settings, todayHighText) {
  let text = formatTemperature(weather, settings);
  const feels = weather?.main?.feels_like;
  const actual = weather?.main?.temp;
  if (
    settings.behavior.feelsLikeEnabled &&
    Number.isFinite(feels) && Number.isFinite(actual) &&
    Math.abs(feels - actual) >= feelsLikeThreshold(settings)
  ) {
    const unitLetter = { imperial: "F", metric: "C", standard: "K" }[settings.weather.units] ?? "";
    text = `Feels ${Math.round(feels)}°${unitLetter}`;
  }
  return todayHighText ? `${text} ${todayHighText}` : text;
}

function describeWeather(weather) {
  const description = weather?.weather?.[0]?.description;
  if (!description) return "Weather update";
  return description.charAt(0).toUpperCase() + description.slice(1);
}

// Reuses the weather units setting (imperial vs. metric/standard) rather
// than adding a separate distance-unit setting, since the two naturally
// travel together.
function formatDistance(meters, settings) {
  if (settings.weather.units === "imperial") {
    const feet = meters * 3.28084;
    return feet >= 1000 ? `${(feet / 5280).toFixed(1)} mi` : `${Math.round(feet)} ft`;
  }
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

// Extra context that only fits on medium/large layouts.
function formatWeatherDetail(weather, settings) {
  if (!weather?.main) return null;

  const windSpeed = weather.wind?.speed;
  const windUnit = settings.weather.units === "imperial" ? "mph" : "m/s";

  const parts = [];
  if (weather.main.humidity != null) parts.push(`${weather.main.humidity}% humidity`);
  if (windSpeed != null) parts.push(`${Math.round(windSpeed)} ${windUnit} wind`);

  // Only surfaced in the few hours before sunset — always-on would make
  // this row noisy for the other 20 hours of the day it's not relevant.
  const sunTimes = getSunTimes(weather);
  if (sunTimes) {
    const hoursUntilSunset = (sunTimes.sunset - Date.now()) / 3600000;
    if (hoursUntilSunset > 0 && hoursUntilSunset <= 4) {
      parts.push(`Sunset ${formatClockTime(sunTimes.sunset, settings)}`);
    }
  }
  return parts.length ? parts.join(" · ") : null;
}

function weatherSymbolName(weather) {
  const condition = weather?.weather?.[0];
  if (!condition) return "cloud.slash";

  const { id, icon } = condition;
  const isNight = icon?.endsWith("n");

  if (id >= 200 && id <= 232) return "cloud.bolt.rain.fill";
  if (id >= 300 && id <= 321) return "cloud.drizzle.fill";
  if (id >= 500 && id <= 531) return "cloud.rain.fill";
  if (id >= 600 && id <= 622) return "cloud.snow.fill";
  if (id >= 701 && id <= 781) return "cloud.fog.fill";
  if (id === 800) return isNight ? "moon.stars.fill" : "sun.max.fill";
  if (id === 801) return isNight ? "cloud.moon.fill" : "cloud.sun.fill";
  return "cloud.fill";
}

function batterySymbolName(level) {
  const percent = Math.round(level * 100);
  if (percent <= 10) return "battery.0";
  if (percent <= 35) return "battery.25";
  if (percent <= 65) return "battery.50";
  if (percent <= 90) return "battery.75";
  return "battery.100";
}

// MARK: - Widget UI

const PRIMARY_COLOR = Color.dynamic(Color.black(), Color.white());
const SECONDARY_COLOR = Color.dynamic(new Color("#5f6368"), new Color("#9aa0a6"));

// When a custom background image is active, text uses a fixed color
// instead of the system light/dark dynamic — white + the per-glyph text
// shadows read fine on most wallpapers, and "dark" is the escape hatch
// for genuinely bright ones (Background Dimming is the stronger measure).
// Only applies within the normal reactive rendering path (renderWidget);
// the error state renders on its own fixed background regardless.
//
// Takes `hasBackgroundImage` — whether an image actually loaded — rather
// than re-checking the enabled setting itself. If the setting is on but
// the file is missing/unreadable, the widget silently falls back to its
// default (dark) card, and forcing text based on the *setting* alone would
// then render, say, dark text (because "Dark" was picked for an image
// that isn't actually showing) on that default dark card — illegible.
function resolvedPrimaryColor(settings, hasBackgroundImage) {
  if (!hasBackgroundImage) return PRIMARY_COLOR;
  return settings.behavior.backgroundImageTextColor === "dark" ? Color.black() : Color.white();
}

function resolvedSecondaryColor(settings, hasBackgroundImage) {
  if (!hasBackgroundImage) return SECONDARY_COLOR;
  return settings.behavior.backgroundImageTextColor === "dark" ? new Color("#3c3c3c") : new Color("#d0d0d0");
}

// A soft shadow behind text sitting directly over a custom background image
// gives it the same "reads regardless of what's behind it" resilience a
// solid backing would, without needing to know what's actually behind any
// given letter — useful since a background image's own brightness varies by
// crop/blur style, and since iOS's own Home Screen appearance settings (a
// "Liquid Glass"/tinted icon theme, for instance) can layer additional
// translucency on top of the widget after this script has already rendered
// it, which is outside anything Scriptable can see or control. Polarity
// always opposes the text color it's paired with — a same-color shadow adds
// nothing — so this mirrors resolvedPrimaryColor/resolvedSecondaryColor's
// own light/dark branch exactly.
const BACKGROUND_TEXT_SHADOW_ON_LIGHT = { shadowColor: new Color("#000000", 0.45), shadowRadius: 2, shadowOffset: new Point(0, 1) };
const BACKGROUND_TEXT_SHADOW_ON_DARK = { shadowColor: new Color("#ffffff", 0.6), shadowRadius: 2, shadowOffset: new Point(0, 1) };

function resolvedTextShadow(settings, hasBackgroundImage) {
  if (!hasBackgroundImage || !settings.behavior.backgroundImageTextShadowEnabled) return null;
  return settings.behavior.backgroundImageTextColor === "dark"
    ? BACKGROUND_TEXT_SHADOW_ON_DARK
    : BACKGROUND_TEXT_SHADOW_ON_LIGHT;
}

function applyTextShadow(label, shadow) {
  label.shadowColor = shadow.shadowColor;
  label.shadowRadius = shadow.shadowRadius;
  label.shadowOffset = shadow.shadowOffset;
}

// Pill text/icon color — independent of resolvedPrimaryColor/
// resolvedSecondaryColor above, since a pill's own fill (not the widget's
// background image) is normally what it's read against. See
// backgroundImagePillTextColor's own comment in DEFAULT_SETTINGS for why
// this exists as its own setting rather than following backgroundImageTextColor.
function resolvedPillTextColor(settings, hasBackgroundImage) {
  if (!hasBackgroundImage) return Color.white();
  return settings.behavior.backgroundImagePillTextColor === "dark" ? Color.black() : Color.white();
}

function resolvedPillTextShadow(settings, hasBackgroundImage) {
  if (!hasBackgroundImage || !settings.behavior.backgroundImageTextShadowEnabled) return null;
  return settings.behavior.backgroundImagePillTextColor === "dark"
    ? BACKGROUND_TEXT_SHADOW_ON_DARK
    : BACKGROUND_TEXT_SHADOW_ON_LIGHT;
}

// Base sizes are tuned for "medium"; small scales down and large scales up
// so the same visual hierarchy holds at every widget size. The top line is
// a full tier bigger and bold; the two rows beneath it share a smaller,
// regular-weight size; a large-only "Coming up" list is smaller still.
const FAMILY_FONT_SCALE = { small: 0.85, medium: 1, large: 1.15 };
const BASE_PRIMARY_SIZE = 26;
const BASE_SECONDARY_SIZE = 20;
const BASE_TERTIARY_SIZE = 16;

function fontScale(family) {
  return FAMILY_FONT_SCALE[family] ?? FAMILY_FONT_SCALE.medium;
}

function primaryStyle(family) {
  const size = Math.round(BASE_PRIMARY_SIZE * fontScale(family));
  return { color: PRIMARY_COLOR, size, iconSize: size, font: Font.boldSystemFont(size) };
}

function secondaryStyle(family) {
  const size = Math.round(BASE_SECONDARY_SIZE * fontScale(family));
  return { color: SECONDARY_COLOR, size, iconSize: Math.round(size * 0.9), font: Font.systemFont(size) };
}

function tertiaryStyle(family) {
  const size = Math.round(BASE_TERTIARY_SIZE * fontScale(family));
  return { color: SECONDARY_COLOR, size, iconSize: Math.round(size * 0.9), font: Font.systemFont(size) };
}

// A smaller variant of a (non-bold) style — for rows that need to fit
// more text than usual onto a single line. Reads `size` rather than
// introspecting `style.font`: Font objects don't expose their point size
// back to JS in Scriptable, which is why every style function above
// carries a numeric `size` alongside the opaque `font` object.
function scaledStyle(style, factor) {
  const size = Math.round(style.size * factor);
  return { ...style, size, iconSize: Math.round(style.iconSize * factor), font: Font.systemFont(size) };
}

// Every fixed (non-data-dependent) icon used anywhere in the widget, paired
// with its emoji equivalent. Dynamic ones (weather condition, battery
// level) have their own resolver functions below since they can't be a
// flat lookup.
const ICON_LIBRARY = {
  windDownMoon: { glyph: "moon.zzz.fill", emoji: "😴" },
  reminder: { glyph: "bolt.fill", emoji: "🔌" },
  error: { glyph: "exclamationmark.triangle.fill", emoji: "⚠️" },
  retry: { glyph: "arrow.clockwise", emoji: "🔄" },
  rain: { glyph: "cloud.rain.fill", emoji: "🌧️" },
  thermometer: { glyph: "thermometer", emoji: "🌡️" },
  highValue: { glyph: "star.circle.fill", emoji: "⭐" },
  calendar: { glyph: "calendar", emoji: "📅" },
  arrival: { glyph: "figure.walk", emoji: "🚶" },
  arrivalLocation: { glyph: "mappin.and.ellipse", emoji: "📍" },
  geofence: { glyph: "mappin.circle.fill", emoji: "📌" },
  wind: { glyph: "wind", emoji: "🌬️" },
  agenda: { glyph: "list.bullet", emoji: "📋" },
  gift: { glyph: "gift.fill", emoji: "🎁" },
  stocks: { glyph: "chart.line.uptrend.xyaxis", emoji: "📈" },
  severeWeather: { glyph: "exclamationmark.triangle.fill", emoji: "🚨" },
  holiday: { glyph: "sparkles", emoji: "🎉" },
  reminderDue: { glyph: "checkmark.circle.fill", emoji: "✅" },
  commute: { glyph: "car.fill", emoji: "🚗" },
  airQuality: { glyph: "aqi.medium", emoji: "😮‍💨" },
  uv: { glyph: "sun.max.fill", emoji: "🧴" },
  tempColder: { glyph: "thermometer.snowflake", emoji: "🥶" },
  tempWarmer: { glyph: "thermometer.sun.fill", emoji: "🥵" },
  tomorrow: { glyph: "calendar.badge.clock", emoji: "🌅" },
  steps: { glyph: "figure.walk.circle.fill", emoji: "👟" },
  sleep: { glyph: "bed.double.fill", emoji: "💤" },
  activity: { glyph: "figure.run.circle.fill", emoji: "🏃" },
  nowPlaying: { glyph: "music.note", emoji: "🎵" },
  // The default/fallback for a custom Shortcuts message — used whenever
  // the message didn't specify its own glyph, or specified one that turns
  // out not to exist (see customMessageIcon).
  customMessage: { glyph: "bell.badge.fill", emoji: "📣" },
};

// Resolves a library key to whichever style the user has chosen. Returns an
// icon descriptor — `{ glyph }` or `{ emoji }` — consumed by addIconTextRow.
function icon(settings, key) {
  const entry = ICON_LIBRARY[key];
  return settings.behavior.iconStyle === "emoji" ? { emoji: entry.emoji } : { glyph: entry.glyph };
}

function weatherEmoji(weather) {
  const condition = weather?.weather?.[0];
  if (!condition) return "🌫️";

  const { id, icon: iconCode } = condition;
  const isNight = iconCode?.endsWith("n");

  if (id >= 200 && id <= 232) return "⛈️";
  if (id >= 300 && id <= 321) return "🌦️";
  if (id >= 500 && id <= 531) return "🌧️";
  if (id >= 600 && id <= 622) return "🌨️";
  if (id >= 701 && id <= 781) return "🌫️";
  if (id === 800) return isNight ? "🌙" : "☀️";
  if (id === 801) return isNight ? "☁️" : "🌤️";
  return "☁️";
}

function weatherIcon(settings, weather) {
  if (settings.behavior.iconStyle === "emoji") return { emoji: weatherEmoji(weather) };
  return { glyph: weatherSymbolName(weather) };
}

// Emoji has no equivalent to the five-step battery.0/25/50/75/100 glyph
// tier — but this row only ever renders while battery is already low, so a
// single "empty battery" emoji is the semantically correct choice anyway.
function batteryIcon(settings, level) {
  if (settings.behavior.iconStyle === "emoji") return { emoji: "🪫" };
  return { glyph: batterySymbolName(level) };
}

// The custom message's glyph is arbitrary Shortcut input, unlike every
// other icon in this file (all fixed, trusted names) — SFSymbol.named()
// returns null for an unknown name rather than throwing, but a null
// symbol would still crash the render the moment something uses it.
// Validating eagerly means a typo'd glyph falls back to the default icon
// instead of losing the whole message to the widget's error state.
function customMessageIcon(settings, message) {
  if (settings.behavior.iconStyle === "emoji") return icon(settings, "customMessage");
  if (message.glyph && SFSymbol.named(message.glyph)) return { glyph: message.glyph };
  return icon(settings, "customMessage");
}

// Set once per render, right at the top of createWidget, and read by
// addAlignedRow below. addIconTextRow and addMixedRow are the only two
// functions any state in this file uses to draw a row of content — routing
// horizontal alignment through this one shared flag is far less invasive
// than threading a settings/alignment parameter through their many call
// sites individually, and it's safe because Scriptable only ever runs one
// render per script invocation (no concurrent renders to interfere with
// each other).
let currentTextAlignment = "center";

// Same reasoning and lifecycle as currentTextAlignment above — set once
// per render, read by the pill primitives below rather than threaded
// through every individual state's rendering case. "filled" is the classic
// solid badge; "outlined" draws a colored border with matching text and no
// fill; "text" drops the badge entirely. The latter two exist because some
// Home Screen icon styles (iOS 26's "Clear," confirmed by direct testing)
// strip the color out of a pill's background fill, turning every filled
// badge into an unreadable blank shape — a border and plain text have no
// fill to strip.
let currentPillStyle = "filled";

// Wraps `buildContent(row)` in an outer stack with spacers placed
// according to currentTextAlignment: both sides (centered, the original
// and still-default behavior), just the trailing side (left — content
// hugs the leading edge, remaining space pushed right), or just the
// leading side (right — mirrored).
// `url`, when given, makes the whole row — full width, spacers included —
// one tap target, same medium/large-only WidgetStack.url mechanism as the
// pills use.
function addAlignedRow(container, buildContent, url) {
  const outerRow = container.addStack();
  if (url) outerRow.url = url;
  if (currentTextAlignment !== "left") outerRow.addSpacer();

  const row = outerRow.addStack();
  row.centerAlignContent();
  buildContent(row);

  if (currentTextAlignment !== "right") outerRow.addSpacer();
}

// `iconDescriptor` comes from icon()/weatherIcon()/batteryIcon() above:
// `{ glyph: "sf.symbol.name" }` renders as a tinted SF Symbol image;
// `{ emoji: "🔤" }` renders the character directly as text instead.
function addIconTextRow(container, iconDescriptor, text, { color, iconSize, font, shadow }, url) {
  addAlignedRow(container, (row) => {
    if (iconDescriptor.emoji) {
      const emojiCell = row.addText(iconDescriptor.emoji);
      emojiCell.font = Font.systemFont(iconSize);
    } else {
      const symbol = SFSymbol.named(iconDescriptor.glyph);
      symbol.applyFont(Font.systemFont(iconSize));
      const image = row.addImage(symbol.image);
      // Battery glyphs are a wide, short shape (~2:1), unlike every other
      // icon here (calendar, gift, pins, ...), which are roughly square. A
      // square frame aspect-fits a wide glyph by its width, leaving visible
      // empty space above/below — it ends up looking noticeably smaller
      // than the rest despite the same iconSize. Widening the frame while
      // keeping height at iconSize fills it the same as everything else.
      const isBattery = iconDescriptor.glyph.startsWith("battery.");
      image.imageSize = isBattery ? new Size(iconSize * 1.8, iconSize) : new Size(iconSize, iconSize);
      image.tintColor = color;
    }

    row.addSpacer(6);

    const label = row.addText(text);
    label.font = font;
    label.textColor = color;
    label.lineLimit = 1;
    label.minimumScaleFactor = 0.8;
    if (shadow) applyTextShadow(label, shadow);
  }, url);
}

// Fixed, vivid badge colors used by addPill — deliberately independent of
// dark mode or a custom background image, since each pill supplies its own
// solid fill and white text, unlike the plain PRIMARY/SECONDARY text this
// sits alongside.
const PILL_COLORS = {
  dateMonth: new Color("#e5484d"),
  // The neutral outer "frame" behind an accent chip (date, temperature) —
  // a muted capsule with a vivid chip inset in it, rather than two
  // separate same-weight pills sitting side by side.
  frame: new Color("#52525b"),
  temperature: new Color("#f59e0b"),
  countdown: new Color("#3b82f6"),
  battery: new Color("#ef4444"),
  distance: new Color("#10b981"),
  stockUp: new Color("#22c55e"),
  stockDown: new Color("#ef4444"),
  stockFlat: new Color("#6b7280"),
  uv: new Color("#8b5cf6"),
  coldSwing: new Color("#0ea5e9"),
  warmSwing: new Color("#f97316"),
};

// US AQI severity coloring, matching the EPA scale's own bands.
function aqiPillColor(aqi) {
  if (aqi >= 201) return new Color("#8b5cf6"); // very unhealthy+
  if (aqi >= 151) return new Color("#ef4444"); // unhealthy
  return new Color("#f97316"); // unhealthy for sensitive groups
}

// A single colored, rounded badge — white text (and, optionally, a white
// icon) on a solid fill, normally. cornerRadius is deliberately larger than
// it needs to be for a true pill/stadium shape; Scriptable just clips to
// the stack's actual size, so over-rounding is a safe way to guarantee the
// fully-rounded look without computing the pill's exact rendered height.
// The text (+ optional icon) content shared by every pill shape below —
// factored out so a standalone flat pill and a chip nested inside a frame
// draw their content identically instead of one wrapping the other and
// compounding two independent paddings into a lopsided result.
// `contentColor` overrides the default white/black pill text — used by the
// outlined style, where the text matches the border color instead of
// sitting on a fill.
function addPillContent(pillStack, text, style, iconDescriptor, contentColor) {
  const pillTextColor = contentColor ?? style.pillTextColor ?? Color.white();

  const label = pillStack.addText(text);
  label.font = style.font;
  label.textColor = pillTextColor;
  label.lineLimit = 1;
  label.minimumScaleFactor = 0.8;
  if (style.pillShadow) applyTextShadow(label, style.pillShadow);

  if (iconDescriptor) {
    pillStack.addSpacer(4);
    // Font objects don't expose their point size back to JS (write-only
    // style values in Scriptable), so this reuses the style's own
    // already-numeric iconSize instead of trying to introspect the Font.
    const iconSize = style.iconSize;
    if (iconDescriptor.emoji) {
      const emojiCell = pillStack.addText(iconDescriptor.emoji);
      emojiCell.font = Font.systemFont(iconSize);
    } else {
      const symbol = SFSymbol.named(iconDescriptor.glyph);
      symbol.applyFont(Font.systemFont(iconSize));
      const image = pillStack.addImage(symbol.image);
      image.imageSize = new Size(iconSize, iconSize);
      image.tintColor = pillTextColor;
    }
  }
}

// cornerRadius on every shape below is deliberately oversized for a full
// stadium shape — Scriptable just clips to the stack's actual rendered
// size, so over-rounding is a safe way to guarantee the fully-rounded
// look without computing each shape's exact height.
// `url` is optional and, when given, makes just this pill its own tap
// target — WidgetStack.url only takes effect on medium/large (small
// widgets have exactly one tap region system-wide, an iOS constraint),
// so setting it unconditionally is safe: it's simply ignored on small.
function addPill(container, text, backgroundColor, style, iconDescriptor, url) {
  const pill = container.addStack();
  // Outlined: a colored border with matching text, no fill — nothing for a
  // fill-stripping icon style (see currentPillStyle) to blank out.
  if (currentPillStyle === "outlined") {
    pill.borderWidth = 2;
    pill.borderColor = backgroundColor;
  } else {
    pill.backgroundColor = backgroundColor;
  }
  pill.cornerRadius = style.iconSize;
  pill.setPadding(4, 10, 4, 10);
  pill.centerAlignContent();
  if (url) pill.url = url;
  addPillContent(pill, text, style, iconDescriptor, currentPillStyle === "outlined" ? backgroundColor : null);
}

// A vivid chip inset in a thin, even gray frame (the temperature pill).
// The frame's own padding is small and uniform — the chip supplies its
// own full padding around its text, so the frame reads as a ring around
// an otherwise-normal pill rather than a second, independently-sized layer.
// `url` goes on the outer frame so the whole badge (not just the chip) is
// tappable. In the outlined style the frame-in-frame look collapses to a
// single outlined capsule (a ring inside a ring just reads as clutter), so
// it delegates to addPill, whose outlined branch handles that.
function addFramedPill(container, text, color, style, iconDescriptor, url) {
  if (currentPillStyle === "outlined") {
    addPill(container, text, color, style, iconDescriptor, url);
    return;
  }

  const outer = container.addStack();
  outer.backgroundColor = PILL_COLORS.frame;
  outer.cornerRadius = style.iconSize;
  outer.setPadding(3, 3, 3, 3);
  outer.centerAlignContent();
  if (url) outer.url = url;

  const chip = outer.addStack();
  chip.backgroundColor = color;
  chip.cornerRadius = style.iconSize;
  chip.setPadding(4, 10, 4, 10);
  chip.centerAlignContent();
  addPillContent(chip, text, style, iconDescriptor);
}

// The two-part date badge — a vivid "JUL" chip inset in the same thin gray
// frame as addFramedPill, with the day number as plain text directly on
// that frame (no padding of its own to compound), e.g. [JUL 11] as one
// compound badge instead of two separate same-weight pills. `url` goes on
// the outer frame so both the month chip and the day number are one
// shared tap target.
function addDateBadge(container, month, day, style, url) {
  // Outlined: one capsule, month in the accent color, day in the row's own
  // text color — the chip-in-frame layering needs fills to read at all.
  if (currentPillStyle === "outlined") {
    const outer = container.addStack();
    outer.borderWidth = 2;
    outer.borderColor = PILL_COLORS.dateMonth;
    outer.cornerRadius = style.iconSize;
    outer.setPadding(4, 10, 4, 10);
    outer.centerAlignContent();
    if (url) outer.url = url;

    addPillContent(outer, month, style, null, PILL_COLORS.dateMonth);
    outer.addSpacer(6);
    const dayLabel = outer.addText(day);
    dayLabel.font = style.font;
    dayLabel.textColor = style.color;
    dayLabel.lineLimit = 1;
    if (style.shadow) applyTextShadow(dayLabel, style.shadow);
    return;
  }

  const outer = container.addStack();
  outer.backgroundColor = PILL_COLORS.frame;
  outer.cornerRadius = style.iconSize;
  outer.setPadding(3, 3, 3, 10);
  outer.centerAlignContent();
  if (url) outer.url = url;

  const chip = outer.addStack();
  chip.backgroundColor = PILL_COLORS.dateMonth;
  chip.cornerRadius = style.iconSize;
  chip.setPadding(4, 10, 4, 10);
  chip.centerAlignContent();
  addPillContent(chip, month, style);

  outer.addSpacer(6);
  const dayLabel = outer.addText(day);
  dayLabel.font = style.font;
  dayLabel.textColor = style.pillTextColor ?? Color.white();
  dayLabel.lineLimit = 1;
  if (style.pillShadow) applyTextShadow(dayLabel, style.pillShadow);
}

// One centered horizontal line mixing plain text and colored pill badges —
// e.g. "It's [JUL 10] and [86°F]". `segments` is an array of either a
// plain string, `{ pill: text, color, icon?, url? }` for a flat badge,
// `{ framedPill: text, color, icon?, url? }` for a chip-in-a-frame badge,
// or `{ dateBadge: { month, day }, url? }` for the two-part date badge.
// `url`, where given, makes that one segment its own tap target — see
// addPill's comment for why that's medium/large only and safe to always set.
//
// Countdown pills are deliberately computed text, not a live-ticking
// native timer — a live element ticking in real time while everything
// else on the widget is a frozen snapshot (refreshed only when iOS
// decides to) is actively misleading: once the target time passes, the
// clock just counts *up* as elapsed time while the title above it sits
// stale. Static text stays internally consistent with the rest of the
// card and gets recomputed correctly at the next real refresh.
// `url`, when given, makes the whole row one tap target — for plain
// single-string rows (no per-segment pill urls to fall back on), like the
// small wind-down layout's title/message lines.
// The "text" pill-style fallback for any pill/framedPill/dateBadge
// segment — same text/shadow/tap-target handling as the plain-string
// branch just below, factored out since three segment types need it.
function addPlainTextSegment(row, text, style, url) {
  const label = row.addText(text);
  label.font = style.font;
  label.textColor = style.color;
  label.lineLimit = 1;
  if (style.shadow) applyTextShadow(label, style.shadow);
  if (url) label.url = url;
}

function addMixedRow(widget, segments, style, url) {
  addAlignedRow(widget, (row) => {
    segments.forEach((segment, index) => {
      if (index > 0) row.addSpacer(6);
      if (typeof segment === "string") {
        const label = row.addText(segment);
        label.font = style.font;
        label.textColor = style.color;
        label.lineLimit = 1;
        if (style.shadow) applyTextShadow(label, style.shadow);
      } else if (segment.dateBadge) {
        if (currentPillStyle === "text") {
          addPlainTextSegment(row, `${segment.dateBadge.month} ${segment.dateBadge.day}`, style, segment.url);
        } else {
          addDateBadge(row, segment.dateBadge.month, segment.dateBadge.day, style, segment.url);
        }
      } else if (segment.framedPill) {
        if (currentPillStyle === "text") {
          addPlainTextSegment(row, segment.framedPill, style, segment.url);
        } else {
          addFramedPill(row, segment.framedPill, segment.color, style, segment.icon, segment.url);
        }
      } else if (currentPillStyle === "text") {
        addPlainTextSegment(row, segment.pill, style, segment.url);
      } else {
        addPill(row, segment.pill, segment.color, style, segment.icon, segment.url);
      }
    });
  }, url);
}

// MARK: - Wind-Down Mode

// A hard time-of-day gate that preempts the entire state machine below.
// The window may or may not span midnight, and the two shapes need
// opposite logic: 22->5 (spanning) is "after start OR before end", while
// 1->5 (same day) is "after start AND before end" — using OR for both
// would make any same-day window cover all 24 hours. Equal start/end is a
// zero-length window, i.e. never.
// `weather` is optional — only needed when windDownUseSunset is on, so
// nothing downstream breaks if it's unavailable (falls back to the fixed
// start hour, same as if the toggle were off).
function isWindDownTime(settings, weather) {
  if (!settings.behavior.windDownEnabled) return false;

  const sunset = settings.behavior.windDownUseSunset ? getSunTimes(weather)?.sunset : null;
  const start = sunset ? sunset.getHours() : settings.behavior.windDownStartHour;
  const { windDownEndHour: end } = settings.behavior;
  if (start === end) return false;

  const hour = new Date().getHours();
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

// Refreshes right at the next local hour boundary. Built from local date
// components (not epoch-millisecond arithmetic) so the midnight rollover
// (e.g. 11pm -> 12am) is correct in every timezone — epoch math floors to
// the nearest *UTC* hour, which only matches the local hour boundary for
// whole-hour UTC offsets and would drift for zones like India or Nepal.
// Passing an out-of-range hour (e.g. 24) to the Date constructor is
// standard, spec-guaranteed rollover, not an implementation quirk.
function computeWindDownRefreshDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
}

function withColor(style, color, shadow, pillTextColor, pillShadow) {
  return {
    ...style,
    color,
    shadow: shadow || null,
    pillTextColor: pillTextColor || Color.white(),
    pillShadow: pillShadow || null,
  };
}

// True if wind speed is notably high for the night, in whatever units the
// current weather is reported in. The threshold differs by unit — imperial
// reports mph, metric/standard report m/s, and those scales aren't
// interchangeable (9 m/s and 9 mph are very different amounts of wind).
function isWindyTonight(weather, settings) {
  const windSpeed = weather?.wind?.speed;
  if (windSpeed == null) return false;
  const threshold = settings.weather.units === "imperial" ? 20 : 9; // ~20 mph either way
  return windSpeed >= threshold;
}

// A short heads-up about tonight's weather, or null when there's nothing
// worth mentioning (the caller picks its own fallback).
function windDownWeatherHeadsUp(settings, weather) {
  const condition = weather?.weather?.[0]?.main;
  if (condition === "Thunderstorm") return "Storms tonight";
  if (condition === "Snow") return "Snow tonight";
  if (condition === "Rain" || condition === "Drizzle") return "Rain tonight";
  if (isWindyTonight(weather, settings)) return "Windy tonight";
  return null;
}

// Tonight's actual moon phase, as one of the eight standard phase glyphs.
// Pure date math against a known new moon (Jan 6 2000 18:14 UTC) and the
// mean synodic month — accurate to well under a day, plenty for an icon.
const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);
const MOON_PHASE_GLYPHS = [
  "moonphase.new.moon", "moonphase.waxing.crescent", "moonphase.first.quarter", "moonphase.waxing.gibbous",
  "moonphase.full.moon", "moonphase.waning.gibbous", "moonphase.last.quarter", "moonphase.waning.crescent",
];
const MOON_PHASE_EMOJI = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

function moonPhaseIcon(settings, date = new Date()) {
  const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86400000;
  const phase = ((daysSinceNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const index = Math.round((phase / SYNODIC_MONTH_DAYS) * 8) % 8;

  if (settings.behavior.iconStyle === "emoji") return { emoji: MOON_PHASE_EMOJI[index] };
  // The moonphase.* symbols are newer (iOS 16) than most glyphs this
  // script uses — verify before trusting, since SFSymbol.named() returns
  // null for unknown names and a null image would crash the render.
  const glyph = MOON_PHASE_GLYPHS[index];
  return SFSymbol.named(glyph) ? { glyph } : { glyph: "moon.stars.fill" };
}

// Fetches tomorrow's first timed event — the wind-down "First up
// tomorrow" preview. Reuses the same calendar selection as everything else.
async function fetchTomorrowFirstEvent(settings) {
  if (!settings.behavior.windDownTomorrowEnabled) return null;

  try {
    const now = new Date();
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0, 0);
    const calendars = await resolveSelectedCalendars(settings.behavior.calendarIds);
    const events = calendars
      ? await CalendarEvent.between(tomorrowStart, tomorrowEnd, calendars)
      : await CalendarEvent.between(tomorrowStart, tomorrowEnd);
    const timed = events.filter((event) => !event.isAllDay).sort((a, b) => a.startDate - b.startDate);
    return timed[0] ?? null;
  } catch (e) {
    console.warn(`Couldn't read tomorrow's events (${e.message}); skipping the preview.`);
    return null;
  }
}

// Deliberately dark regardless of system light/dark mode — a bright card
// at 11pm defeats the point — so colors are forced rather than using the
// PRIMARY/SECONDARY_COLOR dynamics, which would go invisible on black in
// light mode.
//
// The second line is a smart slot, most-useful-first: a charge reminder
// (battery won't comfortably last the night) beats a weather heads-up
// beats tomorrow's first event beats the configured message. When both a
// warning and a tomorrow-event exist, the event gets the one permitted
// third line rather than being dropped — the only state that uses it
// outside the large-only weather footer.
async function renderWindDownWidget(settings, family, weather) {
  const widget = new ListWidget();
  // A custom background image wins here too — anyone who set one up
  // expects the whole widget transparent, wind-down included, and the
  // dark-variant slot (schedule-aware via selectedBackgroundVariant) means
  // nighttime gets the matching dark image rather than something bright.
  // Without one, the original soft night-sky gradient: same overall
  // darkness as flat black (a bright card at 11pm defeats the point of
  // this mode), just with a bit of depth.
  const variant = selectedBackgroundVariant(settings, weather);
  const backgroundImage = variant ? loadBackgroundImage(variant, settings) : null;
  if (backgroundImage) {
    widget.backgroundImage = backgroundImage;
  } else {
    const gradient = new LinearGradient();
    gradient.colors = [new Color("#161d34"), Color.black()];
    gradient.locations = [0, 1];
    gradient.startPoint = new Point(0, 0);
    gradient.endPoint = new Point(0, 1);
    widget.backgroundGradient = gradient;
  }
  const windDownShadow = resolvedTextShadow(settings, Boolean(backgroundImage));
  widget.setPadding(14, 14, 14, 14);

  const ACCENT = new Color("#a5b4fc"); // soft lavender — the one accent color here, calm rather than bright/alarming
  const MUTED = new Color("#9aa0a6");

  const batteryPercent = Math.round(Device.batteryLevel() * 100);
  const isChargeWarning =
    settings.behavior.windDownChargeReminderEnabled &&
    !Device.isCharging() &&
    Device.batteryLevel() >= 0 &&
    batteryPercent <= settings.behavior.windDownChargeThresholdPercent;
  const weatherHeadsUp = windDownWeatherHeadsUp(settings, weather);
  const tomorrowEvent = await fetchTomorrowFirstEvent(settings);
  // Bare "title · time" rather than a full "First up: ... at ..."
  // sentence — with the row's icon plus an event title that can carry its
  // own emoji, the sentence form overflows even on large.
  const tomorrowText = tomorrowEvent
    ? `${tomorrowEvent.title} · ${formatClockTime(tomorrowEvent.startDate, settings)}`
    : null;

  const hasWarning = isChargeWarning || Boolean(weatherHeadsUp);

  // Wind-down is a separate render path from the reactive states, so it
  // wires its own tap targets instead of resolveWidgetURL. The primary
  // line goes to Weather by default (its icon is weather-related either
  // way) — or runs the Wind Down Shortcut if one is configured, since
  // that's a more deliberate choice. The second/third lines go to
  // Calendar when showing tomorrow's event, Weather for the weather
  // heads-up, and nowhere for the charge warning or the plain fallback
  // message (no reliable deep link for either).
  const tapEnabled = settings.behavior.tapToOpenEnabled;
  const weatherURL = tapEnabled ? "weather://" : null;
  const primaryUrl = !tapEnabled
    ? null
    : settings.behavior.windDownShortcutName
    ? shortcutURL(settings.behavior.windDownShortcutName)
    : "weather://";
  const tomorrowUrl = tapEnabled && tomorrowEvent ? calendarURL(tomorrowEvent.startDate) : null;
  const secondLineUrl = isChargeWarning ? null : weatherHeadsUp ? weatherURL : tomorrowUrl;

  // Small's own minimal layout — same reasoning as renderSmallDefaultView:
  // roughly 150pt of width isn't enough for a bold icon+title line plus a
  // full sentence below without truncating. No icons at all, the tomorrow
  // preview drops to just the event title, and the title itself is scaled
  // down — medium/large keep the fuller layout below untouched. Leading
  // and trailing spacers together center the content vertically.
  if (family === "small") {
    widget.addSpacer();
    addMixedRow(widget, ["Wind Down"], withColor(scaledStyle(primaryStyle(family), 0.75), ACCENT, windDownShadow), primaryUrl);
    widget.addSpacer(4);
    const shortSecondLine = isChargeWarning
      ? `Charge — ${batteryPercent}%`
      : weatherHeadsUp ?? (tomorrowEvent ? tomorrowEvent.title : settings.behavior.windDownMessage);
    addMixedRow(widget, [shortSecondLine], withColor(secondaryStyle(family), MUTED, windDownShadow), secondLineUrl);
    widget.addSpacer();
    widget.refreshAfterDate = computeWindDownRefreshDate();
    return widget;
  }

  // The real current condition wins whenever weather data is actually
  // available — clear nights already get a moon+stars glyph out of
  // weatherIcon/weatherSymbolName same as everywhere else in the widget,
  // so there's no need for a separate, less-reliable moon-phase computation
  // to compete with it. Moon phase only ever appears as a fallback for the
  // rare case weather couldn't be fetched at all — better than a plain
  // generic icon, but never preferred over real data.
  const windDownIcon = weather
    ? weatherIcon(settings, weather)
    : settings.behavior.windDownMoonPhaseEnabled
    ? moonPhaseIcon(settings)
    : icon(settings, "windDownMoon");

  widget.addSpacer();
  addIconTextRow(widget, windDownIcon, "Wind Down", withColor(primaryStyle(family), ACCENT, windDownShadow), primaryUrl);
  widget.addSpacer(4);

  if (isChargeWarning) {
    // A real colored pill for the number — matching the "Battery Low"
    // state's own visual language — instead of plain text, since this is
    // the one wind-down case that's an actual warning worth the emphasis.
    addMixedRow(widget, [{ pill: `${batteryPercent}%`, color: PILL_COLORS.battery }, "— charge tonight"], withColor(secondaryStyle(family), MUTED, windDownShadow));
  } else {
    // Match the icon to whichever content actually ended up on this line —
    // the bolt/plug glyph only makes sense for the charge-related fallback
    // message, not for a weather note or tomorrow's event. weatherHeadsUp
    // deliberately does *not* get weatherIcon(): it's only ever truthy
    // when weather data exists, which is exactly when windDownIcon above
    // is already showing that same condition icon — one weather glyph per
    // card, same as everywhere else.
    const secondLine = weatherHeadsUp ?? tomorrowText ?? settings.behavior.windDownMessage;
    const secondLineIcon = weatherHeadsUp
      ? icon(settings, "windDownMoon")
      : tomorrowText
      ? icon(settings, "tomorrow")
      : icon(settings, "reminder");
    addIconTextRow(widget, secondLineIcon, secondLine, withColor(secondaryStyle(family), MUTED, windDownShadow), secondLineUrl);
  }

  if (hasWarning && tomorrowText) {
    widget.addSpacer(4);
    addIconTextRow(widget, icon(settings, "tomorrow"), tomorrowText, withColor(tertiaryStyle(family), MUTED, windDownShadow), tomorrowUrl);
  }
  widget.addSpacer();

  widget.refreshAfterDate = computeWindDownRefreshDate();
  return widget;
}

async function createWidget(settings, family = "small") {
  // iPad's extra-large widget family gets the large layout — without this,
  // "extraLarge" matches none of the small/medium/large checks downstream,
  // so the biggest widget would render with medium fonts and none of the
  // large-only extras (weather detail row, agenda).
  if (family === "extraLarge") family = "large";
  // Set before anything below can render a single row — including the
  // error fallback, if something throws immediately — so every row this
  // render produces (see addAlignedRow) picks it up consistently.
  currentTextAlignment = settings.behavior.textAlignment ?? "center";
  currentPillStyle = settings.behavior.pillStyle ?? "filled";

  try {
    // Fetched once here (cached, so cheap) and threaded through both
    // branches below — isWindDownTime needs it for the sunset-based start
    // hour, and both renderWindDownWidget and buildWidgetModel already
    // wanted their own copy, which just meant a second cache lookup before.
    const weather = await fetchWeather(settings);

    // Lock Screen (accessory) widgets get their own minimal, text-only
    // rendering — iOS forces them monochrome and tiny, so none of the
    // pill/color/background system below applies. Same model, same
    // priority order; only the presentation differs.
    if (String(family).startsWith("accessory")) {
      if (isWindDownTime(settings, weather)) {
        const widget = renderAccessoryWidget(
          { glyph: "moon.zzz.fill", title: "Wind Down", subtitle: settings.behavior.windDownMessage },
          family
        );
        widget.refreshAfterDate = computeWindDownRefreshDate();
        return widget;
      }
      const model = await buildWidgetModel(settings, weather);
      const widget = renderAccessoryWidget(accessoryLines(model, settings), family);
      widget.refreshAfterDate = computeRefreshDate(model, settings);
      return widget;
    }

    if (isWindDownTime(settings, weather)) {
      return await renderWindDownWidget(settings, family, weather);
    }

    const model = await buildWidgetModel(settings, weather);
    return renderWidget(model, settings, family);
  } catch (e) {
    console.error(`Widget failed to build: ${e}`);
    return renderErrorWidget(settings, family);
  }
}

// MARK: - Lock Screen (Accessory) Widgets

// Boils the full model down to two short plain-text lines. Reuses the
// same formatters as the Home Screen rendering so numbers/times read
// identically in both places — only the layout is simpler.
function accessoryLines(model, settings) {
  const weather = model.weather;
  const temp = weather ? formatTemperature(weather, settings) : null;

  switch (model.priority) {
    case "severe-weather":
      return { glyph: "exclamationmark.triangle.fill", title: model.alert.event ?? "Severe Weather", subtitle: formatAlertUntil(model.alert, settings) };
    case "high-value-event":
    case "event":
      return { glyph: model.priority === "high-value-event" ? "star.circle.fill" : "calendar", title: model.event.title, subtitle: `In ${formatCountdownValue(model.event.startDate)}` };
    case "event-arrival":
      return { glyph: "figure.walk", title: `Welcome to ${model.event.title}!`, subtitle: model.event.location };
    case "rain-incoming":
      return { glyph: "cloud.rain.fill", title: `Rain in ${model.minutesUntilRain}m`, subtitle: temp };
    case "custom-message":
      return { glyph: model.message.glyph && SFSymbol.named(model.message.glyph) ? model.message.glyph : "bell.badge.fill", title: model.message.title, subtitle: model.message.subtitle };
    case "commute":
      return { glyph: "car.fill", title: `Commute ~${model.commute.minutes} min`, subtitle: formatDistance(model.commute.distanceMeters, settings) };
    case "geofence":
      return { glyph: "mappin.circle.fill", title: `Near ${model.geofence.label}`, subtitle: `${formatDistance(model.geofence.distanceMeters, settings)} away` };
    case "battery":
      return { glyph: batterySymbolName(model.battery.level), title: `Battery ${Math.round(model.battery.level * 100)}%`, subtitle: "Charge soon" };
    case "weather":
      return { glyph: weatherSymbolName(model.weather), title: describeWeather(model.weather), subtitle: temp };
    case "air-quality":
      return { glyph: "aqi.medium", title: `AQI ${model.aqi}`, subtitle: "Poor air quality" };
    case "uv":
      return { glyph: "sun.max.fill", title: `UV ${model.uvIndex}`, subtitle: "Wear sunscreen" };
    case "holiday":
      return { glyph: "sparkles", title: `Happy ${model.holiday}!`, subtitle: temp };
    case "birthdays":
      return {
        glyph: "gift.fill",
        title: model.contactBirthdays.length === 1 ? "Birthday Today" : `${model.contactBirthdays.length} Birthdays Today`,
        subtitle: model.contactBirthdays.join(", "),
      };
    case "reminders":
      return {
        glyph: "checkmark.circle.fill",
        title: model.dueReminders.length === 1 ? "1 Reminder Due" : `${model.dueReminders.length} Reminders Due`,
        subtitle: model.dueReminders[0].title,
      };
    case "steps":
      return { glyph: "figure.walk.circle.fill", title: `${model.steps.toLocaleString()} steps`, subtitle: "Today" };
    case "sleep": {
      const hours = Math.floor(model.hours);
      const minutes = Math.round((model.hours - hours) * 60);
      return { glyph: "bed.double.fill", title: minutes > 0 ? `${hours}h ${minutes}m sleep` : `${hours}h sleep`, subtitle: "Last night" };
    }
    case "activity": {
      const parts = [];
      if (model.activity.exerciseMinutes != null) parts.push(`${Math.round(model.activity.exerciseMinutes)}m exercise`);
      if (model.activity.activeCalories != null) parts.push(`${Math.round(model.activity.activeCalories)} cal`);
      if (model.activity.standHours != null) parts.push(`${Math.round(model.activity.standHours)}h stand`);
      return { glyph: "figure.run.circle.fill", title: "Activity", subtitle: parts.join(" · ") };
    }
    case "stocks":
      return { glyph: "chart.line.uptrend.xyaxis", title: "Markets Closed", subtitle: model.stockQuotes.map((quote) => formatStockQuote(quote)).join("  ") };
    case "temp-swing":
      return {
        glyph: model.tempSwing.delta < 0 ? "thermometer.snowflake" : "thermometer.sun.fill",
        title: model.tempSwing.delta < 0 ? "Colder Tomorrow" : "Warmer Tomorrow",
        subtitle: `High ${Math.round(model.tempSwing.tomorrowHigh)}° (today ${Math.round(model.tempSwing.todayHigh)}°)`,
      };
    case "now-playing":
      return { glyph: "music.note", title: model.nowPlaying.title, subtitle: model.nowPlaying.artist };
    default:
      return {
        glyph: weather ? weatherSymbolName(weather) : "sparkles",
        title: `${getGreeting()}, ${settings.user.name}`,
        subtitle: [settings.behavior.showDate ? formatShortOrdinalDate(settings) : null, temp].filter(Boolean).join(" · "),
      };
  }
}

// No explicit colors anywhere here — the Lock Screen applies its own
// vibrant/monochrome rendering, and fighting it with fixed colors is
// exactly the mistake the pill system makes under forced styles. The
// frosted addAccessoryWidgetBackground box is only used on circular
// (where it reads as the standard gauge circle); on rectangular it just
// looks like a gray slab behind the text, so that family renders its
// icon+text directly on the wallpaper the way Apple's own Lock Screen
// widgets do.
function renderAccessoryWidget(lines, family) {
  const widget = new ListWidget();
  widget.setPadding(0, 0, 0, 0);

  if (family === "accessoryInline") {
    // Inline is a single line of text next to the Lock Screen date — iOS
    // ignores most styling here, so it's just the two parts joined.
    widget.addText(lines.subtitle ? `${lines.title} · ${lines.subtitle}` : lines.title);
    return widget;
  }

  if (family === "accessoryCircular") {
    // A tiny circle fits one short value; the title (scaled down as far
    // as halved) is the most it can usefully show.
    widget.addAccessoryWidgetBackground = true;
    widget.addSpacer();
    const label = widget.addText(lines.title);
    label.font = Font.semiboldSystemFont(13);
    label.lineLimit = 2;
    label.minimumScaleFactor = 0.5;
    label.centerAlignText();
    widget.addSpacer();
    return widget;
  }

  // accessoryRectangular (and anything unrecognized): the fullest accessory
  // layout — an icon+title line with the state's own glyph, then up to two
  // lines of detail.
  widget.addSpacer();
  const titleRow = widget.addStack();
  titleRow.centerAlignContent();
  const glyph = lines.glyph && SFSymbol.named(lines.glyph) ? lines.glyph : null;
  if (glyph) {
    const symbol = SFSymbol.named(glyph);
    symbol.applyFont(Font.systemFont(13));
    const image = titleRow.addImage(symbol.image);
    image.imageSize = new Size(15, 15);
    titleRow.addSpacer(5);
  }
  const title = titleRow.addText(lines.title);
  title.font = Font.boldSystemFont(15);
  title.lineLimit = 1;
  title.minimumScaleFactor = 0.8;
  titleRow.addSpacer();

  if (lines.subtitle) {
    widget.addSpacer(2);
    const subtitle = widget.addText(lines.subtitle);
    subtitle.font = Font.systemFont(13);
    subtitle.textOpacity = 0.85;
    subtitle.lineLimit = 2;
    subtitle.minimumScaleFactor = 0.9;
  }
  widget.addSpacer();
  return widget;
}

function renderErrorWidget(settings, family = "small") {
  const widget = new ListWidget();
  widget.setPadding(14, 14, 14, 14);
  widget.addSpacer();
  addIconTextRow(widget, icon(settings, "error"), "Widget error", primaryStyle(family));
  widget.addSpacer(4);
  addIconTextRow(widget, icon(settings, "retry"), "Open the script to reconfigure", secondaryStyle(family));
  widget.addSpacer();
  widget.refreshAfterDate = new Date(Date.now() + ERROR_RETRY_MINUTES * 60000);
  return widget;
}

// The two-row primary status, shared by every widget size.
// Every state renders to exactly two lines: an icon+title line, then one
// line of ambient/context info — using addMixedRow's colored pills for
// whatever's the actual "data" (a date, a temperature, a countdown, a
// distance) so it reads at a glance instead of blurring into the
// surrounding plain text. A genuinely optional third line (an ambient
// severe-weather note, or — for the three weather-forward states, on
// "large" only — humidity/wind/sunset detail) is added separately in
// renderWidget via addOptionalThirdLine below; every other state stays a
// hard two lines.
function addPrimaryRows(widget, model, settings, family, hasBackgroundImage) {
  const primary = withColor(
    primaryStyle(family),
    resolvedPrimaryColor(settings, hasBackgroundImage),
    resolvedTextShadow(settings, hasBackgroundImage),
    resolvedPillTextColor(settings, hasBackgroundImage),
    resolvedPillTextShadow(settings, hasBackgroundImage)
  );
  const secondary = withColor(
    secondaryStyle(family),
    resolvedSecondaryColor(settings, hasBackgroundImage),
    resolvedTextShadow(settings, hasBackgroundImage),
    resolvedPillTextColor(settings, hasBackgroundImage),
    resolvedPillTextShadow(settings, hasBackgroundImage)
  );

  switch (model.priority) {
    // NWS's `headline` is a full run-on sentence ("Severe Thunderstorm
    // Watch issued July 17 at 4:00PM CDT until..."), guaranteed to
    // truncate under lineLimit: 1 — "Until 9:00 PM" from the alert's own
    // `expires` timestamp is short and actually more useful at a glance.
    case "severe-weather":
      addIconTextRow(widget, icon(settings, "severeWeather"), model.alert.event ?? "Severe Weather Alert", primary);
      widget.addSpacer(4);
      addIconTextRow(widget, icon(settings, "thermometer"), formatAlertUntil(model.alert, settings), secondary);
      break;

    // No icon on the temp pill here — the primary line already carries a
    // weather-ish glyph (the rain cloud), and the *current* condition icon
    // would often disagree with it anyway (it can't be raining yet, or
    // this would be "weather" not "rain-incoming").
    case "rain-incoming":
      addIconTextRow(widget, icon(settings, "rain"), formatRainCountdown(model.minutesUntilRain), primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: temperaturePillText(model.weather, settings), color: PILL_COLORS.temperature }], secondary);
      break;

    case "high-value-event":
      addIconTextRow(widget, icon(settings, "highValue"), model.event.title, primary);
      widget.addSpacer(6);
      addMixedRow(widget, eventCountdownSegments(model), secondary);
      break;

    case "event":
      addIconTextRow(widget, icon(settings, "calendar"), model.event.title, primary);
      widget.addSpacer(6);
      addMixedRow(widget, eventCountdownSegments(model), secondary);
      break;

    // A generic, freeform message from any Shortcut you build (see
    // Live Context Bridge.js's "message" type) — subtitle is optional, so
    // this is the one state that may render as a single line rather than
    // the usual two.
    case "custom-message":
      addIconTextRow(widget, customMessageIcon(settings, model.message), model.message.title, primary);
      if (model.message.subtitle) {
        widget.addSpacer(4);
        addMixedRow(widget, [model.message.subtitle], secondary);
      }
      break;

    // No countdown here — the point is you've already arrived, so a "clock"
    // row would be showing a number nobody needs anymore.
    case "event-arrival":
      addIconTextRow(widget, icon(settings, "arrival"), `Welcome to ${model.event.title}!`, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, icon(settings, "arrivalLocation"), model.event.location, secondary);
      break;

    case "commute":
      addIconTextRow(widget, icon(settings, "commute"), "Commute to Work", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [
        { pill: `~${model.commute.minutes} min`, color: PILL_COLORS.distance },
        `· ${formatDistance(model.commute.distanceMeters, settings)}`,
      ], secondary);
      break;

    case "geofence":
      addIconTextRow(widget, icon(settings, "geofence"), `Near ${model.geofence.label}`, primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: formatDistance(model.geofence.distanceMeters, settings), color: PILL_COLORS.distance }, "away"], secondary);
      break;

    case "battery":
      addIconTextRow(widget, batteryIcon(settings, model.battery.level), "Battery Low", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `${Math.round(model.battery.level * 100)}%`, color: PILL_COLORS.battery }, "— charge soon"], secondary);
      break;

    // No icon on the temp pill — the primary line already shows this
    // exact condition icon; repeating it here was a literal duplicate.
    case "weather":
      addIconTextRow(widget, weatherIcon(settings, model.weather), describeWeather(model.weather), primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: temperaturePillText(model.weather, settings), color: PILL_COLORS.temperature }], secondary);
      break;

    case "air-quality":
      addIconTextRow(widget, icon(settings, "airQuality"), "Poor Air Quality", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [
        { pill: `AQI ${model.aqi}`, color: aqiPillColor(model.aqi) },
        model.aqi >= 151 ? "· limit time outside" : "· sensitive groups take care",
      ], secondary);
      break;

    case "uv":
      addIconTextRow(widget, icon(settings, "uv"), "Very High UV Today", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `UV ${model.uvIndex}`, color: PILL_COLORS.uv }, "· wear sunscreen"], secondary);
      break;

    case "temp-swing": {
      const colder = model.tempSwing.delta < 0;
      addIconTextRow(widget, icon(settings, colder ? "tempColder" : "tempWarmer"), colder ? "Colder Tomorrow" : "Warmer Tomorrow", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [
        { pill: `${Math.round(model.tempSwing.tomorrowHigh)}°`, color: colder ? PILL_COLORS.coldSwing : PILL_COLORS.warmSwing },
        `high · today ${Math.round(model.tempSwing.todayHigh)}°`,
      ], secondary);
      break;
    }

    case "holiday":
      addIconTextRow(widget, icon(settings, "holiday"), `Happy ${model.holiday}!`, primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: temperaturePillText(model.weather, settings), color: PILL_COLORS.temperature, icon: weatherIcon(settings, model.weather) }], secondary);
      break;

    // Names are plain text, not pills — a person's name isn't "data" the
    // way a date or temperature is, so a colored badge around it would just
    // look arbitrary. Large gets one line per name since a birthday list is
    // exactly the case worth a few extra lines for.
    case "birthdays": {
      const isSingle = model.contactBirthdays.length === 1;
      addIconTextRow(widget, icon(settings, "gift"), isSingle ? "Birthday Today" : `${model.contactBirthdays.length} Birthdays Today`, primary);
      widget.addSpacer(4);
      if (family === "large") {
        for (const name of model.contactBirthdays) {
          widget.addSpacer(4);
          addIconTextRow(widget, icon(settings, "gift"), name, secondary);
        }
      } else {
        addIconTextRow(widget, icon(settings, "gift"), model.contactBirthdays.join(", "), secondary);
      }
      break;
    }

    case "reminders": {
      const count = model.dueReminders.length;
      addIconTextRow(widget, icon(settings, "reminderDue"), count === 1 ? "1 Reminder Due" : `${count} Reminders Due`, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, icon(settings, "reminderDue"), model.dueReminders[0].title, secondary);
      break;
    }

    // Fed in from a Shortcuts automation (see MARK: - Shortcuts Bridge) —
    // Scriptable has no Health app API of its own, so this data can only
    // ever exist if a Shortcut is actually feeding it in.
    case "steps":
      addIconTextRow(widget, icon(settings, "steps"), "Today's Steps", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: model.steps.toLocaleString(), color: PILL_COLORS.distance }], secondary);
      break;

    // Also Shortcuts-fed — a single decimal hours figure from last night's
    // Health sleep data.
    case "sleep": {
      const hours = Math.floor(model.hours);
      const minutes = Math.round((model.hours - hours) * 60);
      const durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      addIconTextRow(widget, icon(settings, "sleep"), "Last Night's Sleep", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: durationText, color: PILL_COLORS.distance }], secondary);
      break;
    }

    // Also Shortcuts-fed — today's Activity rings. Each ring is
    // independently optional (see handleActivity in Live Context
    // Bridge.js), so only the pills for whichever rings actually came
    // through get shown.
    case "activity": {
      const { exerciseMinutes, standHours, activeCalories } = model.activity;
      const segments = [];
      if (exerciseMinutes != null) segments.push({ pill: `${Math.round(exerciseMinutes)}m`, color: PILL_COLORS.distance });
      if (activeCalories != null) segments.push({ pill: `${Math.round(activeCalories)} cal`, color: PILL_COLORS.temperature });
      if (standHours != null) segments.push({ pill: `${Math.round(standHours)}h stand`, color: PILL_COLORS.uv });
      addIconTextRow(widget, icon(settings, "activity"), "Today's Activity", primary);
      widget.addSpacer(6);
      addMixedRow(widget, segments, secondary);
      break;
    }

    // Every ticker is its own pill (green up, red down, gray flat) on one
    // shared line — keeps multiple tickers to two lines total regardless
    // of family.
    case "stocks":
      addIconTextRow(widget, icon(settings, "stocks"), "Markets Closed", primary);
      widget.addSpacer(6);
      addMixedRow(widget, model.stockQuotes.map((quote) => ({ pill: formatStockQuote(quote), color: stockPillColor(quote) })), secondary);
      break;

    // Also Shortcuts-fed, and deliberately the lowest priority of all (see
    // buildWidgetModel) — genuinely ambient info shown only when nothing
    // else has anything to say. artist is optional, so this may render as
    // a single line.
    case "now-playing":
      addIconTextRow(widget, icon(settings, "nowPlaying"), model.nowPlaying.title, primary);
      if (model.nowPlaying.artist) {
        widget.addSpacer(4);
        addMixedRow(widget, [model.nowPlaying.artist], secondary);
      }
      break;

    default: {
      const isBirthday = isBirthdayToday(settings);
      if (family === "small" && !isBirthday) {
        renderSmallDefaultView(widget, model, settings, primary, secondary);
        break;
      }
      if (isBirthday) {
        addIconTextRow(widget, icon(settings, "gift"), `Happy Birthday, ${settings.user.name}!`, primary);
      } else {
        // No icon on the greeting itself — the weather glyph already shows
        // once, inside the temperature pill on the line below; putting it
        // here too was the same piece of information rendered twice.
        addMixedRow(widget, [`${getGreeting()}, ${settings.user.name}`], primary);
      }
      widget.addSpacer(6);
      addDefaultSubtitleRow(widget, model.weather, settings, secondary, model.todayHighText);
    }
  }
}

// Shared by "event" and "high-value-event": "In [pill] · ~N min away" (the
// travel estimate only appears when it's actually enabled and available).
function eventCountdownSegments(model) {
  const segments = ["In", { pill: formatCountdownValue(model.event.startDate), color: PILL_COLORS.countdown }];
  const travel = formatTravelEstimate(model.travelEstimate).replace(/^ · /, "");
  if (travel) segments.push(travel);
  return segments;
}

// The default view's second line: "It's [JUL] [10] and [86°F]", trimmed
// down to whichever of date/weather are actually enabled/available. On
// mornings the temperature pill also carries today's forecast high
// ("86°F ↑96°") — the morning-briefing behavior.
function addDefaultSubtitleRow(widget, weather, settings, style, todayHighText) {
  // The whole-widget fallback URL (see resolveWidgetURL) sends the default
  // view to Weather, which is wrong for the date badge specifically — so
  // it gets its own tap target here instead of inheriting that fallback.
  const tapEnabled = settings.behavior.tapToOpenEnabled;
  const showDate = settings.behavior.showDate;

  const tempText = weather ? temperaturePillText(weather, settings, todayHighText) : null;
  // "Feels 92°F" (or "86°F ↑96°" from the morning briefing, or both
  // combined) is well over double the length of a plain "86°F" — enough
  // to overflow the line once joined with "It's ... and ..." and the date
  // badge. Rather than spill onto a third line for what's still one piece
  // of information, this row shrinks a bit and drops the temperature
  // pill's weather icon specifically for the enriched case — the icon was
  // redundant there anyway (the "Feels"/arrow wording and the pill's own
  // color already say "this isn't the plain reading"), so dropping it
  // recovers width instead of just needing more of it.
  const isEnrichedTemp = tempText && tempText !== formatTemperature(weather, settings);
  const rowStyle = isEnrichedTemp ? scaledStyle(style, 0.88) : style;

  const tempSegment = weather ? {
    framedPill: tempText,
    color: PILL_COLORS.temperature,
    icon: isEnrichedTemp ? null : weatherIcon(settings, weather),
    url: tapEnabled ? "weather://" : null,
  } : null;

  const segments = [];
  if (showDate) {
    segments.push("It's");
    const { month, day } = formatDatePills(settings);
    segments.push({ dateBadge: { month, day }, url: tapEnabled ? calendarURL(new Date()) : null });
  }
  if (tempSegment) {
    if (segments.length > 0) segments.push("and");
    segments.push(tempSegment);
  }
  if (segments.length === 0) {
    // A missing API key gets an actionable message rather than a generic
    // "unavailable" — it's the single most common reason weather never
    // shows, and a bare "unavailable" reads like a transient outage the
    // user should wait out rather than a setup step they should take.
    segments.push(!hasApiKey(settings) ? "Add a weather API key in settings" : "Weather unavailable");
  }

  addMixedRow(widget, segments, rowStyle);
}

// The default view's small-only layout — three short, plain lines
// ("Night Ty" / "Jul 11th" / "86°F ☁️") instead of the pill-based
// medium/large layout above. Small has roughly 150pt of width — not
// enough for an icon + full greeting + date badges + a framed temperature
// pill on one line — so this uses no pills at all. Medium and large are
// untouched by this function.
function renderSmallDefaultView(widget, model, settings, primary, secondary) {
  addMixedRow(widget, [`${getShortGreeting()} ${settings.user.name}`], primary);

  let hasSecondLine = false;
  if (settings.behavior.showDate) {
    widget.addSpacer(4);
    addMixedRow(widget, [formatShortOrdinalDate(settings)], secondary);
    hasSecondLine = true;
  }

  if (model.weather) {
    widget.addSpacer(4);
    addIconTextRow(widget, weatherIcon(settings, model.weather), formatTemperature(model.weather, settings), secondary);
  } else if (!hasSecondLine) {
    widget.addSpacer(4);
    addMixedRow(widget, [!hasApiKey(settings) ? "Add API key in settings" : "Weather unavailable"], secondary);
  }
}

// The one deliberately-optional third line. A severe alert that's past its
// prominent window (see buildWidgetModel) always wins this slot — safety
// beats ambient detail — and shows on medium/large; small genuinely has no
// room for a third line at all. Otherwise, only the three states where
// weather is already the whole point (weather, rain-incoming, default) get
// humidity/wind/sunset detail here, and only on "large". Every other state
// (event, battery, geofence, ...) stays a hard two lines.
function addOptionalThirdLine(widget, model, settings, family, hasBackgroundImage) {
  const style = withColor(
    tertiaryStyle(family),
    resolvedSecondaryColor(settings, hasBackgroundImage),
    resolvedTextShadow(settings, hasBackgroundImage),
    resolvedPillTextColor(settings, hasBackgroundImage),
    resolvedPillTextShadow(settings, hasBackgroundImage)
  );

  if (model.ambientAlert) {
    if (family === "small") return;
    widget.addSpacer(4);
    addIconTextRow(widget, icon(settings, "severeWeather"), model.ambientAlert, style);
    return;
  }

  const weatherForwardStates = ["weather", "rain-incoming", "default"];
  if (family !== "large" || !weatherForwardStates.includes(model.priority)) return;
  const detail = formatWeatherDetail(model.weather, settings);
  if (!detail) return;
  widget.addSpacer(4);
  addIconTextRow(widget, icon(settings, "wind"), detail, style);
}

// Large has room for a short agenda beneath the primary content (any
// state, not just events — see renderWidget's gate). Excludes whatever
// event is already shown as primary by identifier rather than assuming
// it's always model.events[0] — with "high-value-event", the featured
// event comes from a separate, wider-window keyword search and may not be
// the same one that's first in the normal-lookahead list.
function addAgendaRows(widget, model, settings, family, hasBackgroundImage) {
  const upcoming = model.events.filter((event) => event.identifier !== model.event?.identifier).slice(0, 3);
  if (upcoming.length === 0) return;

  const tertiary = withColor(
    tertiaryStyle(family),
    resolvedSecondaryColor(settings, hasBackgroundImage),
    resolvedTextShadow(settings, hasBackgroundImage),
    resolvedPillTextColor(settings, hasBackgroundImage),
    resolvedPillTextShadow(settings, hasBackgroundImage)
  );
  widget.addSpacer(8);
  addIconTextRow(widget, icon(settings, "agenda"), "Coming up", tertiary);
  for (const event of upcoming) {
    addIconTextRow(widget, icon(settings, "calendar"), `${event.title} · ${formatCountdown(event.startDate)}`, tertiary);
  }
}

// MARK: - Tap to Open

// Confidence varies a lot by scheme here. calshow: and Apple's maps://
// query format are both documented by Apple and used throughout this
// project's own research, so those are solid. weather:// and stocks:// are
// real and widely relied upon by the Shortcuts/widget community, but
// undocumented by Apple and unable to target anything more specific than
// "open the app" — weather:// can't jump to a particular city, and
// stocks:// only accepts a ticker by convention, not by any published
// spec. Battery, holiday, and reminders have no known reliable deep link
// at all, so those states just leave the widget non-interactive, same as
// before this feature existed, rather than guessing at something that
// might silently misfire.
const APPLE_EPOCH_OFFSET_SECONDS = 978307200; // seconds between the Unix epoch (1970) and Apple's reference date (2001), which calshow: expects

function calendarURL(date) {
  const appleEpochSeconds = Math.round(date.getTime() / 1000) - APPLE_EPOCH_OFFSET_SECONDS;
  return `calshow:${appleEpochSeconds}`;
}

function mapsURL(coords, label) {
  return `maps://?ll=${coords.latitude},${coords.longitude}&q=${encodeURIComponent(label)}`;
}

// Tapping runs a named Shortcut instead of opening an app — e.g. a "Low
// Power Mode" shortcut for battery, since Scriptable itself has no API to
// toggle system settings directly but Shortcuts does. The name has to
// match a real Shortcut exactly (case-sensitive) or iOS just silently
// does nothing when tapped — there's no way to verify a name exists from
// here, only Diagnostics can remind you what's currently configured.
function shortcutURL(name) {
  return `shortcuts://run-shortcut?name=${encodeURIComponent(name)}`;
}

function resolveWidgetURL(settings, model) {
  if (!settings.behavior.tapToOpenEnabled) return null;

  switch (model.priority) {
    case "high-value-event":
    case "event":
    case "event-arrival":
      return calendarURL(model.event.startDate);
    // Birthdays live on a Calendar under the hood, so "today" is the
    // closest sensible destination even without a specific event to open.
    case "birthdays":
      return calendarURL(new Date());
    case "geofence":
      return model.geofence.coords ? mapsURL(model.geofence.coords, model.geofence.label) : null;
    case "commute":
      return mapsURL(model.commute.coords, "Work");
    case "stocks":
      // The symbol comes from Yahoo's response, not the user's settings —
      // encoded like every other interpolated URL piece in this file.
      return model.stockQuotes?.[0]?.symbol ? `stocks://${encodeURIComponent(model.stockQuotes[0].symbol)}` : "stocks://";
    case "battery":
      return settings.behavior.batteryShortcutName ? shortcutURL(settings.behavior.batteryShortcutName) : null;
    case "severe-weather":
    case "rain-incoming":
    case "weather":
    case "air-quality":
    case "uv":
    case "temp-swing":
    case "default":
      return "weather://";
    default:
      // holiday, reminders, steps, sleep, activity, now-playing,
      // custom-message: no single reliable deep link exists for any of
      // these (Health and Music both lack a documented, dependable custom
      // URL scheme in Scriptable, and a custom message's destination is
      // unknowable by definition), so they stay non-interactive.
      return null;
  }
}

// Whether the dark background slot should be used right now. Unlike
// isWindDownTime's sunset-to-fixed-hour shape (a bedtime window doesn't
// need to track actual sunrise), this tracks true sunset-to-sunrise when
// enabled, since that's the shape iOS's own Dark Mode "Automatic" schedule
// defaults to — the closer match for what this is standing in for.
// `weather` is optional — only needed when darkBackgroundUseSunset is on;
// returns false (not the fixed-hour fallback) when it's unavailable, since
// silently guessing wrong here means showing the wrong photo outright, not
// just a missing enhancement.
function isDarkBackgroundTime(settings, weather) {
  if (!settings.behavior.darkBackgroundUseSunset) {
    const { darkBackgroundStartHour: start, darkBackgroundEndHour: end } = settings.behavior;
    if (start === end) return false;
    const hour = new Date().getHours();
    return start < end ? hour >= start && hour < end : hour >= start || hour < end;
  }

  const sunTimes = getSunTimes(weather);
  if (!sunTimes) return false;
  const now = new Date();
  return now >= sunTimes.sunset || now < sunTimes.sunrise;
}

// Picks which background slot to load, if any. Prefers whichever variant
// matches the current schedule, but falls back to the other slot if only
// one has actually been set up — showing *a* custom background beats
// showing none just because the "wrong" one for right now is the only one
// configured.
function selectedBackgroundVariant(settings, weather) {
  const { backgroundImageEnabled, darkBackgroundImageEnabled } = settings.behavior;
  const wantsDark = isDarkBackgroundTime(settings, weather);

  if (wantsDark && darkBackgroundImageEnabled) return "dark";
  if (!wantsDark && backgroundImageEnabled) return "light";
  if (darkBackgroundImageEnabled) return "dark";
  if (backgroundImageEnabled) return "light";
  return null;
}

function renderWidget(model, settings, family) {
  const widget = new ListWidget();
  widget.setPadding(14, 14, 14, 14);

  // Only the normal reactive states get the custom background — wind-down
  // and the error fallback deliberately force their own solid background
  // regardless of this setting. hasBackgroundImage reflects whether an
  // image actually loaded (see resolvedPrimaryColor above for why that
  // distinction from the raw setting matters) — including the case where
  // the scheduled variant's file is missing/unreadable but the other slot
  // still has something usable.
  const variant = selectedBackgroundVariant(settings, model.weather);
  let backgroundImage = variant ? loadBackgroundImage(variant, settings) : null;
  if (!backgroundImage && variant === "dark" && settings.behavior.backgroundImageEnabled) {
    backgroundImage = loadBackgroundImage("light", settings);
  } else if (!backgroundImage && variant === "light" && settings.behavior.darkBackgroundImageEnabled) {
    backgroundImage = loadBackgroundImage("dark", settings);
  }
  if (backgroundImage) widget.backgroundImage = backgroundImage;
  const hasBackgroundImage = Boolean(backgroundImage);

  const url = resolveWidgetURL(settings, model);
  if (url) widget.url = url;

  widget.addSpacer();

  addPrimaryRows(widget, model, settings, family, hasBackgroundImage);
  addOptionalThirdLine(widget, model, settings, family, hasBackgroundImage);

  // Large has the room, so the agenda shows under every state when
  // enabled — not just the event-focused ones. Severe weather is the one
  // exception: that screen stays focused on the alert.
  if (family === "large" && settings.behavior.largeAgendaEnabled && model.priority !== "severe-weather") {
    addAgendaRows(widget, model, settings, family, hasBackgroundImage);
  }

  widget.addSpacer();

  widget.refreshAfterDate = computeRefreshDate(model, settings);
  return widget;
}

// MARK: - Settings Menu

const SUPPORT_URL = "https://www.buymeacoffee.com/t.cd";

async function presentMainMenu() {
  const alert = new Alert();
  alert.title = "Live Context";
  // Setup problems surface here, at the moment someone is actually in the
  // app to fix them — a widget can't prompt, and a console warning is
  // invisible to most people.
  const settings = getCurrentSettings();
  alert.message = hasApiKey(settings)
    ? "Running from the app. What would you like to do?"
    : "Running from the app. What would you like to do?\n\n⚠️ No weather API key is set, so all weather features are off. Add a free one from openweathermap.org under Edit Settings → Weather.";
  alert.addAction("Preview Widget");
  alert.addAction("Edit Settings");
  alert.addAction("Run Diagnostics");
  alert.addAction("🔐 Check Permissions");
  alert.addAction("🖼️ Create Transparent Background");
  alert.addAction("☕ Support the Developer");
  alert.addCancelAction("Cancel");
  return await alert.presentAlert(); // 0 = preview, 1 = edit, 2 = diagnostics, 3 = permissions, 4 = transparent background, 5 = support, -1 = cancelled
}

// Hands off to the separate "Transparent & Blurred Widgets.js" script via
// Scriptable's own URL scheme (scriptable:///run/<scriptName>, confirmed
// against Scriptable's docs) rather than merging its ~800-line interactive
// wizard (screenshot picking, the lettered-grid crop selector, WebView-
// based blur processing) into this file. That tool needs Alert/QuickLook/
// Photos, none of which are available when Scriptable runs a script as an
// actual widget anyway — same "only makes sense run interactively" constraint
// this main menu itself already has — so nothing is lost by keeping it as
// its own file and just linking to it from here.
async function openTransparentBackgroundTool() {
  const scriptName = "Transparent & Blurred Widgets";
  await Safari.open(`scriptable:///run/${encodeURIComponent(scriptName)}`);
}

// Walks the calendar/location/arrival pipeline with the user's real
// settings and reports what each stage actually sees — turning "the widget
// didn't show my event" from a guessing game into something inspectable.
// The widget itself swallows these failures by design (a Home Screen
// widget can't ask questions); this is where they become visible.
async function runDiagnostics() {
  const settings = getCurrentSettings();
  const lines = [];

  try {
    const calendars = await getEventCalendars();
    const calendarIds = settings.behavior.calendarIds ?? [];
    lines.push(`✅ Calendar access OK (${calendars.length} calendars, ${calendarIds.length === 0 ? "all" : calendarIds.length} selected)`);
    // Names the calendars actually being searched, since "6 selected" alone
    // doesn't tell you WHICH 6 — if your event lives on a calendar you
    // didn't check in the picker, this is where that becomes visible.
    if (calendarIds.length > 0) {
      const resolved = await resolveSelectedCalendars(calendarIds);
      if (resolved) {
        lines.push(`Searching: ${resolved.map((c) => c.title).join(", ")}`);
        if (resolved.length < calendarIds.length) {
          lines.push(`⚠️ ${calendarIds.length - resolved.length} selected calendar(s) no longer resolve (deleted or renamed) and are being skipped.`);
        }
      } else {
        lines.push("⚠️ None of the selected calendars resolved — falling back to searching ALL calendars.");
      }
    }
  } catch {
    lines.push("❌ No calendar access. Check iOS Settings → Privacy → Calendars → Scriptable.");
  }

  const events = await fetchUpcomingEvents(settings);
  const lookaheadHours = settings.behavior.eventLookaheadHours;
  const horizon = Date.now() + lookaheadHours * 3600000;
  const standardCount = events.filter((event) => event.startDate.getTime() <= horizon).length;
  lines.push(`📅 ${standardCount} event(s) within ${lookaheadHours}h, ${events.length} in the wider high-value window. All-day events are always excluded.`);
  if (events[0]) {
    const where = events[0].location ? ` @ ${events[0].location}` : " (no location set)";
    lines.push(`Next: "${events[0].title}" ${formatCountdown(events[0].startDate)}${where}`);
  }
  if (!settings.behavior.eventAlertEnabled) {
    lines.push("⚠️ Event Alerts are OFF in settings — events never take over the widget.");
  }

  const location = await getCurrentLocationSafely();
  lines.push(location ? "✅ Location access OK" : "❌ Location unavailable. Check iOS Settings → Privacy → Location Services → Scriptable.");

  const arrivalCandidates = events.filter((event) => event.location && isWithinArrivalWindow(event, settings));
  lines.push(`🚶 ${arrivalCandidates.length} event(s) currently in their arrival window (${EVENT_ARRIVAL_LEAD_MINUTES}m before start to ${settings.behavior.arrivalMessageLingerMinutes}m after).`);
  if (location) {
    for (const event of arrivalCandidates.slice(0, 2)) {
      const coords = await geocodeEventLocation(event.location);
      if (!coords) {
        lines.push(`"${event.title}": couldn't geocode "${event.location}" — the welcome message can't trigger for it.`);
        continue;
      }
      const distance = haversineDistanceMeters(location.latitude, location.longitude, coords.latitude, coords.longitude);
      lines.push(`"${event.title}": you're ${Math.round(distance)}m from it (needs ≤${EVENT_ARRIVAL_RADIUS_METERS}m).`);
    }
  }

  // Geocoding failures are swallowed during a normal render (a widget
  // can't ask questions) — this is where they become visible.
  if (settings.location.geofenceEnabled) {
    const configuredPlaces = GEOFENCE_PLACES
      .map((place) => ({ ...place, address: settings.location[place.settingsKey] }))
      .filter((place) => place.address);
    if (configuredPlaces.length === 0) {
      lines.push("📌 Geofence is on, but no Home/Work/Gym address is set in Places.");
    } else if (!location) {
      lines.push(`📌 Geofence configured for ${configuredPlaces.map((p) => p.label).join(", ")}, but location is unavailable to check distance.`);
    } else {
      for (const place of configuredPlaces) {
        const coords = await geocodeAddress(place.address);
        if (!coords) {
          lines.push(`${place.label}: couldn't geocode "${place.address}" — this place can't trigger.`);
          continue;
        }
        const distance = haversineDistanceMeters(location.latitude, location.longitude, coords.latitude, coords.longitude);
        lines.push(`${place.label}: you're ${Math.round(distance)}m away (needs ≤${settings.location.radiusMeters}m).`);
      }
    }
  }

  if (settings.location.workScheduleCalendarId) {
    const calendars = await getEventCalendars();
    const workCalendar = calendars.find((c) => c.identifier === settings.location.workScheduleCalendarId);
    if (!workCalendar) {
      lines.push("🧑‍💼 Work Schedule Calendar no longer resolves (deleted or renamed) — the commute estimate is falling back to any weekday morning until it's re-picked in settings.");
    } else {
      const isWorkDay = await isWorkDayToday(settings);
      lines.push(isWorkDay
        ? `🧑‍💼 Work Schedule Calendar ("${workCalendar.title}"): shift found today — commute estimate can apply.`
        : `🧑‍💼 Work Schedule Calendar ("${workCalendar.title}"): no shift today — commute estimate is being skipped.`);
    }
  }

  // Reports on whatever Live Context Bridge.js has (or hasn't) written —
  // the only way to confirm a Shortcut is actually feeding data in
  // correctly, since none of this runs unless a Shortcut triggers it.
  if (settings.behavior.shortcutArrivalEnabled) {
    const place = readShortcutArrival(settings);
    lines.push(place ? `🔗 Shortcuts arrival: at ${place} (within the last ${settings.behavior.shortcutArrivalFreshMinutes}m).` : "🔗 Shortcuts arrival: no fresh flag — falling back to the normal geofence check.");
  }
  if (settings.behavior.shortcutStepsEnabled) {
    const steps = readShortcutSteps(settings);
    lines.push(steps != null ? `🔗 Shortcuts steps: ${steps.toLocaleString()}.` : "🔗 Shortcuts steps: no fresh data from a Shortcut yet.");
  }
  if (settings.behavior.shortcutWeatherEnabled) {
    const shortcutWeather = readShortcutWeather(settings);
    lines.push(shortcutWeather ? `🔗 Shortcuts weather: in use (${Math.round(shortcutWeather.main.temp)}°, ${shortcutWeather.weather[0].main}) instead of OpenWeatherMap.` : "🔗 Shortcuts weather: no fresh data — using OpenWeatherMap instead.");
  }
  if (settings.behavior.shortcutSleepEnabled) {
    const hours = readShortcutSleep(settings);
    lines.push(hours != null ? `🔗 Shortcuts sleep: ${hours}h.` : "🔗 Shortcuts sleep: no fresh data from a Shortcut yet.");
  }
  if (settings.behavior.shortcutActivityEnabled) {
    const activity = readShortcutActivity(settings);
    lines.push(activity ? `🔗 Shortcuts activity: ${activity.exerciseMinutes ?? "–"}m exercise, ${activity.standHours ?? "–"}h stand, ${activity.activeCalories ?? "–"} cal.` : "🔗 Shortcuts activity: no fresh data from a Shortcut yet.");
  }
  if (settings.behavior.shortcutNowPlayingEnabled) {
    const nowPlaying = readShortcutNowPlaying(settings);
    lines.push(nowPlaying ? `🔗 Shortcuts now playing: "${nowPlaying.title}"${nowPlaying.artist ? ` — ${nowPlaying.artist}` : ""}.` : "🔗 Shortcuts now playing: no fresh data from a Shortcut yet.");
  }
  if (settings.behavior.shortcutMessageEnabled) {
    const message = readShortcutCustomMessage(settings);
    lines.push(message ? `🔗 Shortcuts custom message: "${message.title}".` : "🔗 Shortcuts custom message: no fresh message from a Shortcut yet.");
  }

  const weather = await fetchWeather(settings);
  if (weather) {
    lines.push(`🌤️ Weather OK: ${formatTemperature(weather, settings)}, ${describeWeather(weather)}.`);
  } else if (!hasApiKey(settings)) {
    lines.push("❌ Weather: no OpenWeatherMap API key set (Settings → Weather → API Key). Nothing weather-related can show until one is added — the free tier at openweathermap.org works.");
  } else {
    lines.push("❌ Weather: the OpenWeatherMap request failed and nothing is cached yet. Double-check the API key (new keys take a few minutes to activate) and that Scriptable has network access.");
  }
  if (settings.weather.severeAlertsEnabled) {
    const alerts = await fetchSevereWeatherAlerts(settings, weather);
    lines.push(alerts == null
      ? "⚠️ Couldn't check National Weather Service alerts (no weather coordinates yet, or the request failed)."
      : `🚨 ${alerts.length} active Severe/Extreme NWS alert(s) for this location.`);
  }

  if (settings.weather.forecastEnabled) {
    const forecast = await fetchForecast(settings, weather);
    if (forecast) {
      const rainMinutes = findImminentRainMinutes(forecast.minutely15, settings.behavior.rainNowcastLookaheadMinutes);
      lines.push(`🌦️ Forecast OK: today ${Math.round(forecast.todayHigh)}°/${Math.round(forecast.todayLow)}°, tomorrow high ${Math.round(forecast.tomorrowHigh)}°, max UV ${forecast.uvMaxToday ?? "?"}. ${rainMinutes != null ? `Rain in ~${rainMinutes}m.` : "No rain in the nowcast window."}`);
    } else {
      lines.push("⚠️ Couldn't fetch the Open-Meteo forecast (no weather coordinates yet, or the request failed).");
    }
  }

  if (settings.behavior.aqiAlertEnabled) {
    const aqi = await fetchAirQuality(settings, weather);
    lines.push(Number.isFinite(aqi)
      ? `🫁 Air quality: US AQI ${Math.round(aqi)} (alerts at ${settings.behavior.aqiAlertThreshold}+).`
      : "⚠️ Couldn't fetch air quality (no weather coordinates yet, or the request failed).");
  }

  const holiday = todaysHoliday(settings);
  lines.push(holiday ? `🎉 Today is recognized as: ${holiday}` : "🎉 No recognized holiday today.");

  if (settings.behavior.contactBirthdaysEnabled) {
    const birthdays = await fetchTodaysBirthdays(settings);
    lines.push(birthdays.length > 0
      ? `🎂 ${birthdays.length} birthday(s) today: ${birthdays.join(", ")}`
      : "🎂 No birthdays found today on a \"Birthdays\" calendar (or none exists — check that Contacts has birthdays set).");
  }

  if (settings.behavior.reminderAlertEnabled) {
    const dueReminders = await fetchDueReminders(settings);
    lines.push(dueReminders.length > 0
      ? `✅ ${dueReminders.length} reminder(s) due/overdue: "${dueReminders[0].title}"${dueReminders.length > 1 ? ", ..." : ""}`
      : "✅ No reminders due or overdue right now.");
  }

  const alert = new Alert();
  alert.title = "Diagnostics";
  alert.message = lines.join("\n\n");
  alert.addAction("Done");
  await alert.presentAlert();
}

// Mirrors the separate "Permission Check.js" utility script — exercises
// every permission-gated Scriptable API this project touches, one at a
// time, so each system "Allow / Don't Allow" prompt appears in turn
// instead of surprising you the first time some feature actually needs
// it. Location, Calendar, Reminders, and Photos are all genuinely used
// elsewhere in this widget's real features (geofencing/travel estimates,
// events, the reminders-due state, and importing a background image,
// respectively); Contacts and Notifications aren't used by anything else
// here, but are included since they're common permissions Scriptable can
// request — if either behaves unexpectedly, this is the only place in the
// project that touches them. Kept as its own standalone script too
// (Permission Check.js) for anyone who wants to run just this, without
// opening the full widget.
async function checkPermission(name, testFn) {
  try {
    await testFn();
    console.log(`${name}: granted`);
    return { name, granted: true };
  } catch (e) {
    console.warn(`${name}: not granted (${e.message})`);
    return { name, granted: false, error: e.message };
  }
}

async function presentPermissionResult(name, granted) {
  const alert = new Alert();
  alert.title = granted ? "Access Granted" : "Access Not Granted";
  alert.message = granted
    ? `${name} is successfully active.`
    : `${name} isn't available — it was denied, or the system prompt didn't get a chance to appear.`;
  alert.addAction("Continue");
  await alert.presentAlert();
}

async function runPermissionCheck() {
  const checks = [
    { name: "Location", run: async () => { await Location.current(); } },
    { name: "Calendar (Events)", run: async () => { await Calendar.forEvents(); } },
    { name: "Reminders", run: async () => { await Calendar.forReminders(); } },
    {
      name: "Contacts",
      run: async () => {
        const container = await ContactsContainer.default();
        await Contact.all([container]);
      },
    },
    {
      name: "Notifications",
      run: async () => {
        const notification = new Notification();
        notification.title = "Live Context Permission Check";
        notification.body = "This is a test notification — safe to dismiss.";
        await notification.schedule();
      },
    },
    // The one check that can't be fully automated: there's no "just ask
    // permission" call separate from actually picking a photo, so this
    // opens the photo picker — pick anything (or cancel), it doesn't
    // matter which for the purposes of this check.
    { name: "Photos", run: async () => { await Photos.fromLibrary(); } },
  ];

  const results = [];
  for (const check of checks) {
    const result = await checkPermission(check.name, check.run);
    results.push(result);
    await presentPermissionResult(result.name, result.granted);
  }

  const summary = new Alert();
  summary.title = "Permission Check Summary";
  summary.message = results.map((r) => `${r.granted ? "✅" : "❌"} ${r.name}`).join("\n");
  summary.addAction("Done");
  await summary.presentAlert();
}

async function presentPreviewSizeMenu() {
  const alert = new Alert();
  alert.title = "Preview Size";
  alert.addAction("Small");
  alert.addAction("Medium");
  alert.addAction("Large");
  alert.addAction("Lock Screen");
  alert.addCancelAction("Cancel");
  const choice = await alert.presentAlert();
  return ["small", "medium", "large", "accessoryRectangular"][choice] ?? null;
}

// Each field carries everything the settings list needs: a label, an emoji
// glyph matching what it controls, a plain-language description, how to
// read/write it on a settings object, and how to display its current value
// in the list row. Fields with a fixed set of valid values (`choices`) get
// a tap-to-pick action sheet instead of a free-text prompt.
//
// The glyph is a plain emoji prefixed onto the title text rather than a
// separate image cell: UITableCell's image sizing/tinting didn't behave as
// documented on-device (icons rendered oversized and untintable), while
// text rendering is already proven reliable everywhere else in this file.
//
// Fields are grouped into titled sections purely for the settings list's
// presentation (see presentSettingsMenu's render()) — the field objects
// themselves are unchanged and looked up/edited exactly as before.
const SETTINGS_SECTIONS = [
  {
    title: "Appearance",
    description: "Icons, background image, and text color.",
    fields: [
      {
        label: "🖼️ Icon Style",
        description: "Use system glyphs (clean, monochrome, and dark/light-mode aware) or emoji (colorful, but fixed-color) for every icon in the widget.",
        get: (s) => (s.behavior.iconStyle === "emoji" ? "Emoji" : "Glyphs"),
        apply: (s, value) => { s.behavior.iconStyle = value === "Emoji" ? "emoji" : "glyph"; },
        choices: ["Glyphs", "Emoji"],
      },
      {
        label: "↔️ Text Alignment",
        description: "Where every line of text (and its icons/pills) sits within the widget — Left, Center, or Right. Applies to every widget size and every state.",
        get: (s) => {
          const labels = { left: "Left", center: "Center", right: "Right" };
          return labels[s.behavior.textAlignment] ?? "Center";
        },
        apply: (s, value) => { s.behavior.textAlignment = value.toLowerCase(); },
        choices: ["Left", "Center", "Right"],
      },
      {
        label: "🎨 Background Image",
        description: "Use a transparent/blurred background image instead of the default system background. Generate one first with the separate \"Transparent & Blurred Widgets\" script (export to Photos or Files), then pick it here. If your Home Screen icon style is already set to \"Clear\" (iOS 26+), skip this entirely — iOS already makes the widget see-through on its own, and stacking this on top of that tends to wash out the pills instead of helping.",
        get: (s) => (s.behavior.backgroundImageEnabled ? "Set" : "Not set"),
        apply: (s, value) => { s.behavior.backgroundImageEnabled = value; },
        isBackgroundImagePicker: true,
        backgroundImageVariant: "light",
      },
      {
        label: "🌑 Dark Background Image",
        description: "An optional second background image matching your Home Screen's Dark Mode wallpaper. Generate one with the same \"Transparent & Blurred Widgets\" script's Dark Mode step, then pick it here. Which one shows follows the Dark Background Hours below — if only one of the two is set, that one always shows regardless of time.",
        get: (s) => (s.behavior.darkBackgroundImageEnabled ? "Set" : "Not set"),
        apply: (s, value) => { s.behavior.darkBackgroundImageEnabled = value; },
        isBackgroundImagePicker: true,
        backgroundImageVariant: "dark",
      },
      {
        label: "🕥 Dark Hours Start",
        description: "Hour of day (0-23) the Dark Background Image begins showing (instead of the regular one). 20 = 8 PM. Ignored while Use Actual Sunset/Sunrise below is on.",
        get: (s) => String(s.behavior.darkBackgroundStartHour),
        apply: (s, value) => {
          const hour = Number(value);
          if (Number.isFinite(hour)) s.behavior.darkBackgroundStartHour = clamp(Math.round(hour), 0, 23);
        },
      },
      {
        label: "🕖 Dark Hours End",
        description: "Hour of day (0-23) the Dark Background Image stops showing. 7 = 7 AM. Ignored while Use Actual Sunset/Sunrise below is on.",
        get: (s) => String(s.behavior.darkBackgroundEndHour),
        apply: (s, value) => {
          const hour = Number(value);
          if (Number.isFinite(hour)) s.behavior.darkBackgroundEndHour = clamp(Math.round(hour), 0, 23);
        },
      },
      {
        label: "🌇 Use Actual Sunset/Sunrise",
        description: "When on, the Dark Background Image shows from today's real sunset to sunrise (from live weather data) instead of the fixed hours above — matching how iOS's own Automatic Dark Mode schedule usually works. Scriptable can't read the device's actual current Dark Mode state from inside a widget, so this schedule is the closest available substitute.",
        get: (s) => (s.behavior.darkBackgroundUseSunset ? "On" : "Off"),
        apply: (s, value) => { s.behavior.darkBackgroundUseSunset = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🌓 Background Text Color",
        description: "Text color over your background image. White plus the built-in text shadow reads fine on most wallpapers and is the recommended default; switch to Dark for a genuinely bright background. Only matters while a background image is set.",
        get: (s) => (s.behavior.backgroundImageTextColor === "dark" ? "Dark" : "White"),
        apply: (s, value) => { s.behavior.backgroundImageTextColor = value === "Dark" ? "dark" : "white"; },
        choices: ["White", "Dark"],
      },
      {
        label: "🔅 Background Dimming",
        description: "Darkens your background image slightly to help text stand out on very bright wallpapers. Off is the default and keeps the widget matching the wallpaper around it exactly — any dimming makes the widget region read as a permanently darker rectangle, which defeats the seamless transparent look. Only matters while a background image is set.",
        get: (s) => {
          const labels = { off: "Off", subtle: "Subtle", standard: "Standard" };
          return labels[s.behavior.backgroundDimming] ?? "Off";
        },
        apply: (s, value) => {
          const internal = { Off: "off", Subtle: "subtle", Standard: "standard" };
          const newDimming = internal[value] ?? "off";
          // The cached dimmed renders are keyed by opacity, but clearing
          // eagerly keeps stale files from previous levels from lingering.
          if (newDimming !== s.behavior.backgroundDimming) {
            clearScrimmedBackground("light");
            clearScrimmedBackground("dark");
          }
          s.behavior.backgroundDimming = newDimming;
        },
        choices: ["Off", "Subtle", "Standard"],
      },
      {
        label: "🩶 Pill Text Color",
        description: "Pills (the date badge, temperature, etc.) normally use white text on their own colored fill, separately from the setting above. Confirmed by testing: this alone does not fix iOS 26's \"Clear\" Home Screen icon style, which strips pill colors regardless of this setting — see Pill Style below for the Outlined and Plain Text options that avoid the problem. Only matters while a background image is set.",
        get: (s) => (s.behavior.backgroundImagePillTextColor === "dark" ? "Dark" : "White"),
        apply: (s, value) => { s.behavior.backgroundImagePillTextColor = value === "Dark" ? "dark" : "white"; },
        choices: ["White", "Dark"],
      },
      {
        label: "🖤 Text Shadow",
        description: "Adds a soft shadow behind every piece of text and pill while a background image is set, so it stays readable regardless of what's behind it. On is recommended, but turn it off if you'd rather have flat text without the halo. Doesn't fix iOS 26's \"Clear\" Home Screen icon style either (see Pill Style below). Only matters while a background image is set.",
        get: (s) => (s.behavior.backgroundImageTextShadowEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.backgroundImageTextShadowEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "💊 Pill Style",
        description: "How data badges (the date, temperature, battery, etc.) render. Filled is the classic solid-color pill. Some Home Screen icon styles (confirmed with iOS 26's \"Clear\" style) strip the color out of filled pills entirely, turning them into blank shapes even without a background image set — switch to Outlined there: a colored border with matching text and no fill to strip, confirmed to survive Clear mode while keeping most of the badge look. Plain Text also survives, if you prefer no badges at all.",
        get: (s) => {
          const labels = { filled: "Filled", outlined: "Outlined", text: "Plain Text" };
          return labels[s.behavior.pillStyle] ?? "Filled";
        },
        apply: (s, value) => {
          const internal = { Filled: "filled", Outlined: "outlined", "Plain Text": "text" };
          s.behavior.pillStyle = internal[value] ?? "filled";
        },
        choices: ["Filled", "Outlined", "Plain Text"],
      },
      {
        label: "👆 Tap to Open",
        description: "When on, tapping the widget opens whatever app matches what's currently shown — Calendar for an event, Maps for a nearby place, Weather for weather, Stocks for the recap. Battery, holiday, and reminders have no reliable app to jump to, so those stay non-interactive either way.",
        get: (s) => (s.behavior.tapToOpenEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.tapToOpenEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
    ],
  },
  {
    title: "Priorities",
    description: "Which info wins when several apply at once.",
    fields: [
      {
        label: "🔢 Priority Order",
        description: "The widget shows exactly one thing at a time — whichever state highest on this list currently applies. Reorder it to match what you care about (e.g. put Steps above Stocks). Individual on/off toggles elsewhere still apply; this only decides who wins among the ones that are on. Severe weather alerts always stay above everything and can't be demoted.",
        get: (s) => (s.behavior.priorityOrder ? "Customized" : "Default"),
        apply: (s, value) => {
          // Storing null for "matches the default" keeps the row reading
          // "Default" instead of "Customized" after a no-op edit or reset.
          s.behavior.priorityOrder =
            JSON.stringify(value) === JSON.stringify(DEFAULT_PRIORITY_ORDER) ? null : value;
        },
        isPriorityOrderPicker: true,
      },
    ],
  },
  {
    title: "Weather",
    description: "Weather setup: API key, units, and display.",
    fields: [
      {
        label: "🔑 API Key",
        description: "Your free API key from openweathermap.org. Required to show live weather.",
        get: (s) => s.weather.apiKey,
        apply: (s, value) => { s.weather.apiKey = value; },
        mask: true,
      },
      {
        label: "🏙️ City ID",
        description: "An OpenWeatherMap city ID for a fixed location. Leave blank to use this device's current location instead.",
        get: (s) => s.weather.cityId ?? "",
        apply: (s, value) => { s.weather.cityId = value || null; },
        allowBlank: true,
        emptyLabel: "Current location",
      },
      {
        label: "🌡️ Temperature Units",
        description: "Which temperature scale shows everywhere in the widget — weather, feels-like, forecast highs/lows, the temp-swing alert, all of it.",
        get: (s) => {
          const labels = { imperial: "Fahrenheit", metric: "Celsius", standard: "Kelvin" };
          return labels[s.weather.units] ?? "Fahrenheit";
        },
        apply: (s, value) => {
          const internal = { Fahrenheit: "imperial", Celsius: "metric", Kelvin: "standard" };
          const newUnits = internal[value] ?? "imperial";
          // Both OpenWeatherMap and Open-Meteo convert server-side, so the
          // cached responses are only valid under whichever units they were
          // fetched with — without clearing them, switching this setting
          // would keep showing the old units until the cache next expires
          // on its own (up to Cache Limit minutes later).
          if (newUnits !== s.weather.units) {
            clearCacheEntry(WEATHER_CACHE_KEY);
            clearCacheEntry(FORECAST_CACHE_KEY);
          }
          s.weather.units = newUnits;
        },
        choices: ["Fahrenheit", "Celsius", "Kelvin"],
      },
      {
        label: "🔄 Cache Limit",
        description: "How many minutes to reuse the last weather fetch before checking again.",
        get: (s) => String(s.weather.cacheLimitMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.weather.cacheLimitMinutes = minutes;
        },
        suffix: "min",
      },
      {
        label: "🌦️ Forecast Data",
        description: "Free daily and 15-minute forecast data from Open-Meteo — no API key needed. Powers the Morning High below, plus the Rain Nowcast, Temp Swing, and UV alerts in the Weather Alerts section; turning this off disables all of them at once.",
        get: (s) => (s.weather.forecastEnabled ? "On" : "Off"),
        apply: (s, value) => { s.weather.forecastEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🥵 Feels-Like Temps",
        description: "When on, the temperature shows as \"Feels 97°F\" instead of the raw reading whenever the feels-like temperature diverges notably (heat index or wind chill days).",
        get: (s) => (s.behavior.feelsLikeEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.feelsLikeEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🌅 Morning High",
        description: "When on, mornings fold today's forecast high into the widget's temperature — e.g. \"86°F ↑96°\" — so you know what the day is heading toward.",
        get: (s) => (s.behavior.morningBriefingEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.morningBriefingEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
    ],
  },
  {
    title: "Weather Alerts",
    description: "Conditions that temporarily take over the widget.",
    fields: [
      {
        label: "🌧️ Active Precipitation",
        description: "When on, rain or snow that's happening right now takes over the widget instead of the default greeting.",
        get: (s) => (s.behavior.weatherAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.weatherAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "☔️ Rain Nowcast",
        description: "Shows an urgent \"Rain starting in N mins\" countdown before it arrives, from Open-Meteo's free 15-minute forecast. Overrides even an upcoming event.",
        get: (s) => (s.behavior.rainNowcastEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.rainNowcastEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏳ Rain Alert Window",
        description: "How soon rain must be, per the 15-minute forecast, to trigger the urgent alert.",
        get: (s) => String(s.behavior.rainNowcastLookaheadMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.rainNowcastLookaheadMinutes = minutes;
        },
        suffix: "min",
      },
      {
        label: "🚨 Severe Weather Alerts",
        description: "When on, an active Severe or Extreme alert from the National Weather Service takes over the widget — above everything else, including High-Value Alerts. Free, no extra API key, but US locations only.",
        get: (s) => (s.weather.severeAlertsEnabled ? "On" : "Off"),
        apply: (s, value) => { s.weather.severeAlertsEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Alert Prominent Window",
        description: "How many minutes a new severe alert takes over the entire widget before demoting to a small note under whatever's normally showing. A multi-hour Watch shouldn't block the widget the whole time.",
        get: (s) => String(s.weather.severeAlertProminentMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.weather.severeAlertProminentMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "🌡️ Temp Swing Alert",
        description: "When on, evenings get a heads-up if tomorrow's high swings hard against today's — \"Colder Tomorrow\" with the new high.",
        get: (s) => (s.behavior.tempSwingAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.tempSwingAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "↕️ Swing Threshold",
        description: "How many degrees (in your temperature units) tomorrow's high must differ from today's to trigger the Temp Swing alert.",
        get: (s) => String(s.behavior.tempSwingThresholdDegrees),
        apply: (s, value) => {
          const degrees = Number(value);
          if (Number.isFinite(degrees)) s.behavior.tempSwingThresholdDegrees = Math.max(degrees, 1);
        },
        suffix: "°",
      },
      {
        label: "☀️ UV Alerts",
        description: "When on, a daytime heads-up shows when today's max UV index reaches the threshold below.",
        get: (s) => (s.behavior.uvAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.uvAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🔆 UV Threshold",
        description: "UV index at or above which the UV alert shows. 8+ is \"very high\" on the standard scale; 11+ is \"extreme\".",
        get: (s) => String(s.behavior.uvAlertThreshold),
        apply: (s, value) => {
          const uv = Number(value);
          if (Number.isFinite(uv)) s.behavior.uvAlertThreshold = Math.max(uv, 1);
        },
      },
      {
        label: "😮‍💨 Air Quality Alerts",
        description: "When on, the widget flags unhealthy air using Open-Meteo's free air-quality data (US AQI scale).",
        get: (s) => (s.behavior.aqiAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.aqiAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🫁 AQI Threshold",
        description: "US AQI at or above which the alert shows. 101 = unhealthy for sensitive groups, 151 = unhealthy for everyone.",
        get: (s) => String(s.behavior.aqiAlertThreshold),
        apply: (s, value) => {
          const aqi = Number(value);
          if (Number.isFinite(aqi)) s.behavior.aqiAlertThreshold = Math.max(aqi, 1);
        },
      },
    ],
  },
  {
    title: "Stocks",
    description: "A ticker recap on the widget after the market closes.",
    fields: [
      {
        label: "📈 Market Recap",
        description: "When on, the widget shows your tickers' closing prices for a while after the US market closes (4 PM Eastern, weekdays), then returns to normal.",
        get: (s) => (s.stocks.enabled ? "On" : "Off"),
        apply: (s, value) => { s.stocks.enabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "💹 Tickers",
        description: "Up to 4 stock symbols, comma-separated — e.g. AAPL, TSLA, MSFT, VOO. Leave blank to clear (which also disables the recap).",
        get: (s) => s.stocks.tickers.join(", "),
        apply: (s, value) => {
          s.stocks.tickers = value
            .split(",")
            .map((ticker) => ticker.trim().toUpperCase())
            .filter(Boolean)
            .slice(0, MAX_STOCK_TICKERS);
        },
        allowBlank: true,
        emptyLabel: "None",
      },
      {
        label: "⏱️ Display Window",
        description: "How many minutes after market close the recap stays on the widget before it returns to normal.",
        get: (s) => String(s.stocks.displayMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.stocks.displayMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
    ],
  },
  {
    title: "Profile",
    description: "Your name, locale, birthday, and date display.",
    fields: [
      {
        label: "👤 Your Name",
        description: "Shown in the widget's greeting, e.g. \"Good morning, Alex\".",
        get: (s) => s.user.name,
        apply: (s, value) => { s.user.name = value; },
      },
      {
        label: "🌐 Locale",
        description: "Controls how the date is formatted, e.g. en-US or en-GB.",
        get: (s) => s.user.locale,
        apply: (s, value) => { s.user.locale = value; },
      },
      {
        label: "🎂 Birthday",
        description: "Your birthday as MM-DD, e.g. 03-15. Shows a personalized \"Happy Birthday\" message all day, every year, instead of the usual greeting. Leave blank to disable.",
        get: (s) => s.user.birthday ?? "",
        apply: (s, value) => {
          if (value === "") { s.user.birthday = null; return; }
          if (/^\d{1,2}-\d{1,2}$/.test(value)) s.user.birthday = value;
        },
        allowBlank: true,
        emptyLabel: "Not set",
      },
      {
        label: "🗓️ Show Date",
        description: "Shows the date in the default view. Off by default on iPad, since its status bar already shows the date.",
        get: (s) => (s.behavior.showDate ? "On" : "Off"),
        apply: (s, value) => { s.behavior.showDate = value === "On"; },
        choices: ["On", "Off"],
      },
    ],
  },
  {
    title: "Calendar & Events",
    description: "Which calendars to check, and how events get featured.",
    fields: [
      {
        label: "🗂️ Calendars",
        description: "Which calendars to include when looking for upcoming events. Applies to all calendars if none are selected.",
        get: (s) => {
          const ids = s.behavior.calendarIds ?? [];
          return ids.length === 0 ? "All calendars" : `${ids.length} selected`;
        },
        apply: (s, value) => { s.behavior.calendarIds = value; },
        isCalendarPicker: true,
      },
      {
        label: "🧑‍💼 Work Schedule Calendar",
        description: "The specific calendar your work shifts actually appear on (a scheduling app's synced calendar, a shared calendar, etc.). When set, the morning commute estimate only shows on days with a real shift on this calendar — not just any weekday morning. Leave as None to fall back to assuming every weekday morning could be a work day.",
        get: (s) => (s.location.workScheduleCalendarId ? "Set" : "Not set"),
        apply: (s, value) => { s.location.workScheduleCalendarId = value; },
        isSingleCalendarPicker: true,
      },
      {
        label: "📅 Event Lookahead",
        description: "How many hours ahead to check your calendar for an event to feature on the widget.",
        get: (s) => String(s.behavior.eventLookaheadHours),
        apply: (s, value) => {
          const hours = Number(value);
          if (Number.isFinite(hours)) s.behavior.eventLookaheadHours = hours;
        },
        suffix: "hr",
      },
      {
        label: "🔔 Event Alerts",
        description: "When on, an upcoming calendar event takes over the widget with a countdown.",
        get: (s) => (s.behavior.eventAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.eventAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⭐️ High-Value Alerts",
        description: "When on, an event whose title matches a keyword below jumps to the very top of the widget — above rain, above everything — regardless of the Event Lookahead or Event Alerts settings.",
        get: (s) => (s.behavior.highValueEventAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.highValueEventAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🔭 High-Value Lookahead",
        description: "How far ahead to search specifically for high-value keyword matches — separate from, and usually wider than, Event Lookahead.",
        get: (s) => String(s.behavior.highValueLookaheadHours),
        apply: (s, value) => {
          const hours = Number(value);
          if (Number.isFinite(hours)) s.behavior.highValueLookaheadHours = hours;
        },
        suffix: "hr",
      },
      {
        label: "🏷️ High-Value Keywords",
        description: "Comma-separated keywords or regex patterns (case-insensitive) that trigger a High-Value Alert. Leave blank to clear the list.",
        get: (s) => s.behavior.highValueKeywords.join(", "),
        apply: (s, value) => {
          s.behavior.highValueKeywords = value
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean);
        },
        allowBlank: true,
      },
      {
        label: "🚶 Arrival Message Linger",
        description: "How many minutes after an event's start time the \"Welcome to...\" arrival message keeps showing, once you've arrived at its location.",
        get: (s) => String(s.behavior.arrivalMessageLingerMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.arrivalMessageLingerMinutes = Math.max(minutes, 0);
        },
        suffix: "min",
      },
      {
        label: "🚗 Time-to-Leave Estimate",
        description: "When on, your featured event shows a rough \"~N min away\" alongside its countdown, based on straight-line distance and the assumed speed below. Not real traffic or routing data — just a quick approximation.",
        get: (s) => (s.behavior.travelEstimateEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.travelEstimateEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🏎️ Assumed Travel Speed",
        description: "Average speed used for the Time-to-Leave estimate above — lower it for city/walking-heavy days, raise it for highway commutes.",
        get: (s) => String(s.behavior.assumedTravelSpeedMph),
        apply: (s, value) => {
          const mph = Number(value);
          if (Number.isFinite(mph)) s.behavior.assumedTravelSpeedMph = Math.max(mph, 1);
        },
        suffix: "mph",
      },
      {
        label: "🎉 Holiday Greetings",
        description: "When on, a recognized US holiday (Christmas, Thanksgiving, July 4th, etc.) gets its own greeting for the day.",
        get: (s) => (s.behavior.holidayAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.holidayAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🎂 Contacts' Birthdays",
        description: "When on, a birthday today on your Contacts \"Birthdays\" calendar takes over the widget. Uses the same Calendar access as everything else here — no separate Contacts permission.",
        get: (s) => (s.behavior.contactBirthdaysEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.contactBirthdaysEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "✅ Reminders Due",
        description: "When on, overdue or due-today Reminders take over the widget. Off by default — turn on only if you want that surfaced here, since routine daily reminders would otherwise show constantly.",
        get: (s) => (s.behavior.reminderAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.reminderAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🗒 Agenda on Large Widget",
        description: "When on, the large widget adds a short \"Coming up\" list of your next few events beneath whatever it's currently showing (except during a severe weather alert, which stays focused). Small and medium widgets are unaffected — they don't have the room.",
        get: (s) => (s.behavior.largeAgendaEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.largeAgendaEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
    ],
  },
  {
    title: "Battery",
    description: "Low battery threshold and alerts.",
    fields: [
      {
        label: "🔋 Low Battery Threshold",
        description: "Battery percentage (0-100) at or below which the widget flags low battery.",
        get: (s) => String(Math.round(s.behavior.lowBatteryThreshold * 100)),
        apply: (s, value) => {
          const percent = Number(value);
          if (Number.isFinite(percent)) s.behavior.lowBatteryThreshold = percent / 100;
        },
        suffix: "%",
      },
      {
        label: "🔌 Battery Alerts",
        description: "When on, a low, non-charging battery takes over the widget.",
        get: (s) => (s.behavior.batteryAlertEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.batteryAlertEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⚡️ Battery Shortcut",
        description: "Name of a Shortcut to run when you tap the widget during a low-battery alert — e.g. one that turns on Low Power Mode. Must match a real Shortcut's name exactly. Leave blank for no tap action.",
        get: (s) => s.behavior.batteryShortcutName,
        apply: (s, value) => { s.behavior.batteryShortcutName = value; },
        allowBlank: true,
        emptyLabel: "None",
      },
    ],
  },
  {
    title: "Wind Down",
    description: "A nightly dark reminder screen.",
    fields: [
      {
        label: "🌙 Wind Down Mode",
        description: "When on, the widget shows a minimal dark reminder instead of its normal content during the night window below.",
        get: (s) => (s.behavior.windDownEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.windDownEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🕥 Start Hour",
        description: "Hour of day (0-23) wind-down mode begins. 22 = 10 PM.",
        get: (s) => String(s.behavior.windDownStartHour),
        apply: (s, value) => {
          const hour = Number(value);
          if (Number.isFinite(hour)) s.behavior.windDownStartHour = clamp(Math.round(hour), 0, 23);
        },
      },
      {
        label: "🕔 End Hour",
        description: "Hour of day (0-23) wind-down mode ends. 5 = 5 AM.",
        get: (s) => String(s.behavior.windDownEndHour),
        apply: (s, value) => {
          const hour = Number(value);
          if (Number.isFinite(hour)) s.behavior.windDownEndHour = clamp(Math.round(hour), 0, 23);
        },
      },
      {
        label: "🌇 Use Actual Sunset",
        description: "When on, wind-down begins at today's real sunset hour (from live weather data) instead of the fixed Start Hour above.",
        get: (s) => (s.behavior.windDownUseSunset ? "On" : "Off"),
        apply: (s, value) => { s.behavior.windDownUseSunset = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "💬 Message",
        description: "The fallback reminder shown during wind-down mode, when there's no charge warning, weather heads-up, or tomorrow preview to show instead.",
        get: (s) => s.behavior.windDownMessage,
        apply: (s, value) => { s.behavior.windDownMessage = value; },
      },
      {
        label: "🔋 Charge Reminder",
        description: "When on, wind-down reminds you to charge if the battery is at or below the threshold below and not already plugged in.",
        get: (s) => (s.behavior.windDownChargeReminderEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.windDownChargeReminderEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🪫 Charge Threshold",
        description: "Battery percentage at or below which the wind-down charge reminder shows. Higher than the daytime Low Battery threshold, since the battery has to last the whole night.",
        get: (s) => String(s.behavior.windDownChargeThresholdPercent),
        apply: (s, value) => {
          const percent = Number(value);
          if (Number.isFinite(percent)) s.behavior.windDownChargeThresholdPercent = clamp(Math.round(percent), 0, 100);
        },
        suffix: "%",
      },
      {
        label: "📅 Tomorrow Preview",
        description: "When on, wind-down shows tomorrow's first calendar event — \"First up: Standup at 9:00 AM\" — so you know what you're waking up to.",
        get: (s) => (s.behavior.windDownTomorrowEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.windDownTomorrowEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🌘 Moon Phase Icon",
        description: "When on, clear nights use tonight's actual moon phase as the wind-down icon instead of a generic moon.",
        get: (s) => (s.behavior.windDownMoonPhaseEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.windDownMoonPhaseEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🌙 Wind Down Shortcut",
        description: "Name of a Shortcut to run when you tap the widget during wind-down — e.g. a bedtime routine. Must match a real Shortcut's name exactly. Leave blank to just open Weather instead.",
        get: (s) => s.behavior.windDownShortcutName,
        apply: (s, value) => { s.behavior.windDownShortcutName = value; },
        allowBlank: true,
        emptyLabel: "None",
      },
    ],
  },
  {
    title: "Places",
    description: "Geofence alerts for saved addresses.",
    fields: [
      {
        label: "🧭 Geofence Alert",
        description: "When on, shows a context block whenever you're near one of the addresses below. Requires Location permission; silently does nothing if it's denied.",
        get: (s) => (s.location.geofenceEnabled ? "On" : "Off"),
        apply: (s, value) => { s.location.geofenceEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "📏 Radius",
        description: "How close you must be to an address below, in meters, to trigger the alert.",
        get: (s) => String(s.location.radiusMeters),
        apply: (s, value) => {
          const radius = Number(value);
          if (Number.isFinite(radius)) s.location.radiusMeters = Math.max(radius, 0);
        },
        suffix: "m",
      },
      {
        label: "🏠 Home Address",
        description: "Street address to check for the Home geofence, e.g. \"123 Main St, Springfield\". Geocoded and cached on first use. Leave blank to skip.",
        get: (s) => s.location.homeAddress,
        apply: (s, value) => { s.location.homeAddress = value; },
        allowBlank: true,
        emptyLabel: "Not set",
      },
      {
        label: "🏢 Work Address",
        description: "Street address to check for the Work geofence, and the destination for the Morning Commute estimate below. Leave blank to skip.",
        get: (s) => s.location.workAddress,
        apply: (s, value) => { s.location.workAddress = value; },
        allowBlank: true,
        emptyLabel: "Not set",
      },
      {
        label: "🚗 Morning Commute",
        description: "When on, weekday mornings show a rough travel time to your Work address — straight-line distance at the assumed speed from Calendar & Events, not live traffic. Skips itself once you're at work.",
        get: (s) => (s.behavior.commuteEstimateEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.commuteEstimateEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "🏋️ Gym Address",
        description: "Street address to check for the Gym geofence. Leave blank to skip.",
        get: (s) => s.location.gymAddress,
        apply: (s, value) => { s.location.gymAddress = value; },
        allowBlank: true,
        emptyLabel: "Not set",
      },
    ],
  },
  {
    title: "Shortcuts",
    description: "Data fed in from Shortcuts automations, if you've set any up.",
    fields: [
      {
        label: "🚶 Instant Arrival",
        description: "When on, a fresh \"arrived\" flag from a Shortcuts \"Arrive at Location\" automation takes over the widget immediately, instead of waiting for the normal Geofence Alert to next poll your location.",
        get: (s) => (s.behavior.shortcutArrivalEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutArrivalEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Arrival Freshness",
        description: "How many minutes an arrival flag from Shortcuts stays valid before being ignored as stale.",
        get: (s) => String(s.behavior.shortcutArrivalFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutArrivalFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "👟 Step Count",
        description: "When on, today's step count (fed in from a Shortcut using the Health app's \"Find Health Samples\" action) shows on the widget when nothing more important is happening. Scriptable has no Health app API of its own — this only ever works via a Shortcut.",
        get: (s) => (s.behavior.shortcutStepsEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutStepsEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Steps Freshness",
        description: "How many minutes a step count from Shortcuts stays valid before being ignored as stale.",
        get: (s) => String(s.behavior.shortcutStepsFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutStepsFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "🌦️ Shortcuts Weather",
        description: "When on, a fresh weather reading from a Shortcut (e.g. Apple's own \"Get Current Weather\") is used instead of the OpenWeatherMap fetch. Severe alerts, the Open-Meteo forecast, and air quality all need real coordinates, which Shortcuts weather doesn't provide — those features simply sit out while this is active.",
        get: (s) => (s.behavior.shortcutWeatherEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutWeatherEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Weather Freshness",
        description: "How many minutes a weather reading from Shortcuts stays valid before this widget falls back to its own OpenWeatherMap fetch.",
        get: (s) => String(s.behavior.shortcutWeatherFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutWeatherFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "😴 Sleep",
        description: "When on, last night's sleep total (fed in from a Shortcut summing the Health app's sleep samples) shows on the widget when nothing more important is happening. Scriptable has no Health app API of its own — this only ever works via a Shortcut.",
        get: (s) => (s.behavior.shortcutSleepEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutSleepEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Sleep Freshness",
        description: "How many minutes a sleep reading from Shortcuts stays valid before being ignored as stale. It's a once-a-night stat, so this is normally set much higher than the other freshness windows here.",
        get: (s) => String(s.behavior.shortcutSleepFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutSleepFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "🏃 Activity Rings",
        description: "When on, today's Activity rings (fed in from a Shortcut reading the Health app) show on the widget when nothing more important is happening. Exercise minutes, stand hours, and active calories are each independently optional — wire up just the ring(s) you want.",
        get: (s) => (s.behavior.shortcutActivityEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutActivityEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Activity Freshness",
        description: "How many minutes an Activity reading from Shortcuts stays valid before being ignored as stale.",
        get: (s) => String(s.behavior.shortcutActivityFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutActivityFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "🎵 Now Playing",
        description: "When on, the currently playing song/podcast (fed in from a Shortcut using \"Get Currently Playing Media\" or similar) shows on the widget, but only when absolutely nothing else has anything to say — this is the lowest-priority state there is. Scriptable has no media-playback API of its own.",
        get: (s) => (s.behavior.shortcutNowPlayingEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutNowPlayingEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Now Playing Freshness",
        description: "How many minutes a Now Playing reading stays valid before being ignored as stale. Kept deliberately short by default, since what's playing changes fast.",
        get: (s) => String(s.behavior.shortcutNowPlayingFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutNowPlayingFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
      {
        label: "📣 Custom Message",
        description: "When on, a freeform message from any Shortcut you build (see Live Context Bridge.js's \"message\" type) takes over the widget — for anything not covered by a dedicated type above, like \"Package delivered\" or \"Guest arriving\". Not tied to any specific app.",
        get: (s) => (s.behavior.shortcutMessageEnabled ? "On" : "Off"),
        apply: (s, value) => { s.behavior.shortcutMessageEnabled = value === "On"; },
        choices: ["On", "Off"],
      },
      {
        label: "⏱️ Custom Message Freshness",
        description: "How many minutes a custom message stays valid before being ignored as stale and the widget reverts to its normal content.",
        get: (s) => String(s.behavior.shortcutMessageFreshMinutes),
        apply: (s, value) => {
          const minutes = Number(value);
          if (Number.isFinite(minutes)) s.behavior.shortcutMessageFreshMinutes = Math.max(minutes, 1);
        },
        suffix: "min",
      },
    ],
  },
];

function maskSecret(value) {
  if (!value || value === DEFAULT_SETTINGS.weather.apiKey) return "Not set";
  return value.length <= 4 ? "••••" : `••••${value.slice(-4)}`;
}

function fieldDisplayValue(fieldDef, settings) {
  const raw = fieldDef.get(settings);
  if (fieldDef.mask) return maskSecret(raw);
  if (!raw && fieldDef.emptyLabel) return fieldDef.emptyLabel;
  return fieldDef.suffix ? `${raw} ${fieldDef.suffix}` : raw;
}

// A single-choice action sheet for fields with a fixed set of valid values.
async function presentChoicePicker(fieldDef) {
  const alert = new Alert();
  alert.title = fieldDef.label;
  alert.message = fieldDef.description;
  for (const choice of fieldDef.choices) alert.addAction(choice);
  alert.addCancelAction("Cancel");

  const choice = await alert.presentAlert();
  return choice === -1 ? null : fieldDef.choices[choice];
}

// A single labeled text prompt for everything else.
async function presentTextPrompt(fieldDef, currentValue) {
  const alert = new Alert();
  alert.title = fieldDef.label;
  alert.message = fieldDef.allowBlank
    ? fieldDef.description
    : `${fieldDef.description}\n\nLeave blank to keep the current value.`;
  alert.addTextField(fieldDef.label, currentValue);
  alert.addAction("Save");
  alert.addCancelAction("Cancel");

  const choice = await alert.presentAlert();
  return choice === -1 ? null : alert.textFieldValue(0);
}

// A multi-select list of every calendar available for events. Tapping a row
// toggles it (checkbox-style) without closing the screen; only Save & Close
// commits the selection. Returns an array of selected identifiers, or null
// if cancelled — mirrors presentSettingsMenu's own save/cancel convention.
async function presentCalendarPicker(selectedIds) {
  const calendars = await getEventCalendars();
  const selected = new Set(selectedIds ?? []);
  let saved = false;

  const table = new UITable();
  table.showSeparators = true;

  function render() {
    table.removeAllRows();

    const header = new UITableRow();
    header.isHeader = true;
    header.height = 54;
    const headerCell = header.addText("Select Calendars", "Tap to toggle. None selected = all calendars.");
    headerCell.titleFont = Font.boldSystemFont(19);
    headerCell.subtitleFont = Font.systemFont(15);
    headerCell.subtitleColor = SECONDARY_COLOR;
    table.addRow(header);

    for (const calendar of calendars) {
      const row = new UITableRow();
      row.dismissOnSelect = false;
      row.height = 50;
      const isSelected = selected.has(calendar.identifier);
      const cell = row.addText(`${isSelected ? "✅" : "⬜️"} ${calendar.title}`);
      cell.titleFont = Font.semiboldSystemFont(16);
      cell.titleColor = PRIMARY_COLOR;
      row.onSelect = () => {
        if (isSelected) selected.delete(calendar.identifier);
        else selected.add(calendar.identifier);
        render();
      };
      table.addRow(row);
    }

    const saveRow = new UITableRow();
    saveRow.dismissOnSelect = true;
    saveRow.height = 50;
    const saveCell = saveRow.addText("Save & Close");
    saveCell.titleFont = Font.semiboldSystemFont(18);
    saveCell.titleColor = Color.blue();
    saveCell.centerAligned();
    saveRow.onSelect = () => { saved = true; };
    table.addRow(saveRow);

    const cancelRow = new UITableRow();
    cancelRow.dismissOnSelect = true;
    cancelRow.height = 50;
    const cancelCell = cancelRow.addText("Cancel");
    cancelCell.titleFont = Font.semiboldSystemFont(18);
    cancelCell.titleColor = Color.red();
    cancelCell.centerAligned();
    cancelRow.onSelect = () => { saved = false; };
    table.addRow(cancelRow);

    table.reload();
  }

  render();
  await table.present(true);
  if (!saved) return null;

  // Drop any identifier not among the calendars just fetched — a synced
  // calendar (Google/Exchange/iCloud) can be silently reissued a new
  // identifier over time, and since this screen can only toggle what's
  // currently visible, an old identifier for the same-looking calendar
  // would otherwise linger in the saved list forever, invisible and
  // unremovable, slowly growing the selection past the real calendar count.
  const currentIds = new Set(calendars.map((c) => c.identifier));
  return Array.from(selected).filter((id) => currentIds.has(id));
}

// A single-select variant of the calendar picker above — for settings
// (like the work-schedule calendar) that need exactly one calendar or
// none, rather than a multi-select set. Tapping a row immediately picks
// it and dismisses; there's no separate Save step since there's nothing
// to accumulate. Returns the chosen identifier, "" for "None", or null if
// dismissed without choosing either.
async function presentSingleCalendarPicker(currentId, title, subtitle) {
  const calendars = await getEventCalendars();
  let result = null;

  const table = new UITable();
  table.showSeparators = true;

  const header = new UITableRow();
  header.isHeader = true;
  header.height = 54;
  const headerCell = header.addText(title, subtitle);
  headerCell.titleFont = Font.boldSystemFont(19);
  headerCell.subtitleFont = Font.systemFont(15);
  headerCell.subtitleColor = SECONDARY_COLOR;
  table.addRow(header);

  const noneRow = new UITableRow();
  noneRow.dismissOnSelect = true;
  noneRow.height = 50;
  const noneCell = noneRow.addText(`${!currentId ? "✅" : "⬜️"} None`);
  noneCell.titleFont = Font.semiboldSystemFont(16);
  noneCell.titleColor = PRIMARY_COLOR;
  noneRow.onSelect = () => { result = ""; };
  table.addRow(noneRow);

  for (const calendar of calendars) {
    const row = new UITableRow();
    row.dismissOnSelect = true;
    row.height = 50;
    const isSelected = calendar.identifier === currentId;
    const cell = row.addText(`${isSelected ? "✅" : "⬜️"} ${calendar.title}`);
    cell.titleFont = Font.semiboldSystemFont(16);
    cell.titleColor = PRIMARY_COLOR;
    row.onSelect = () => { result = calendar.identifier; };
    table.addRow(row);
  }

  await table.present(true);
  return result;
}

// The priority-order editor: every reorderable state listed top (wins
// first) to bottom, tap a row to move it up one spot. Follows
// presentCalendarPicker's render()/Save & Close pattern. Returns the new
// order array, or null if cancelled.
async function presentPriorityOrderPicker(storedOrder) {
  const order = normalizePriorityOrder(storedOrder);
  let saved = false;

  const table = new UITable();
  table.showSeparators = true;

  function render() {
    table.removeAllRows();

    const header = new UITableRow();
    header.isHeader = true;
    header.height = 76;
    const headerCell = header.addText(
      "Priority Order",
      "Tap a row to move it up one spot. The highest match wins. Severe weather alerts always stay above everything."
    );
    headerCell.titleFont = Font.boldSystemFont(19);
    headerCell.subtitleFont = Font.systemFont(13);
    headerCell.subtitleColor = SECONDARY_COLOR;
    table.addRow(header);

    order.forEach((key, index) => {
      const row = new UITableRow();
      row.dismissOnSelect = false;
      row.height = 44;
      const cell = row.addText(`${index + 1}.  ${PRIORITY_LABELS[key] ?? key}`);
      cell.titleFont = Font.semiboldSystemFont(16);
      cell.titleColor = PRIMARY_COLOR;
      row.onSelect = () => {
        if (index === 0) return;
        [order[index - 1], order[index]] = [order[index], order[index - 1]];
        render();
      };
      table.addRow(row);
    });

    const resetRow = new UITableRow();
    resetRow.dismissOnSelect = false;
    resetRow.height = 50;
    const resetCell = resetRow.addText("Reset to Default Order");
    resetCell.titleFont = Font.semiboldSystemFont(16);
    resetCell.centerAligned();
    resetRow.onSelect = () => {
      order.length = 0;
      order.push(...DEFAULT_PRIORITY_ORDER);
      render();
    };
    table.addRow(resetRow);

    const saveRow = new UITableRow();
    saveRow.dismissOnSelect = true;
    saveRow.height = 50;
    const saveCell = saveRow.addText("Save & Close");
    saveCell.titleFont = Font.semiboldSystemFont(18);
    saveCell.titleColor = Color.blue();
    saveCell.centerAligned();
    saveRow.onSelect = () => { saved = true; };
    table.addRow(saveRow);

    const cancelRow = new UITableRow();
    cancelRow.dismissOnSelect = true;
    cancelRow.height = 50;
    const cancelCell = cancelRow.addText("Cancel");
    cancelCell.titleFont = Font.semiboldSystemFont(18);
    cancelCell.titleColor = Color.red();
    cancelCell.centerAligned();
    cancelRow.onSelect = () => { saved = false; };
    table.addRow(cancelRow);

    table.reload();
  }

  render();
  await table.present(true);
  return saved ? order : null;
}

// A small action sheet for the background image: pick a new one from
// Photos or Files, clear the existing one, or cancel. Returns the new
// backgroundImageEnabled/darkBackgroundImageEnabled value, or null if
// cancelled. `variant` is "light" or "dark" — see BACKGROUND_IMAGE_FILENAMES.
async function presentBackgroundImagePicker(currentlyEnabled, variant) {
  const label = variant === "dark" ? "Dark Background Image" : "Background Image";
  const alert = new Alert();
  alert.title = label;
  alert.message = currentlyEnabled
    ? `A ${variant === "dark" ? "dark " : ""}background image is currently set. Pick a new one to replace it, or clear it to go back to the default background.`
    : "Pick the image exported by the separate \"Transparent & Blurred Widgets\" script, from wherever you saved it.";
  alert.addAction("Pick From Photos");
  alert.addAction("Pick From Files");
  if (currentlyEnabled) alert.addAction("Clear");
  alert.addCancelAction("Cancel");

  const choice = await alert.presentAlert();
  if (choice === -1) return null;

  if (choice === 0 || choice === 1) {
    const source = choice === 0 ? "photos" : "files";
    const success = await pickBackgroundImage(source, variant);
    if (!success) {
      const failureAlert = new Alert();
      failureAlert.title = "Couldn't Import Image";
      failureAlert.message = "Make sure you picked a valid image, then try again.";
      failureAlert.addAction("OK");
      await failureAlert.presentAlert();
      return null;
    }
    return true;
  }

  clearBackgroundImage(variant);
  return false;
}

// True for the common "On"/"Off" choice fields — derived structurally
// rather than tagged on each field definition, so any current or future
// on/off field picks up the toggle-style row automatically.
function isToggleField(fieldDef) {
  return Array.isArray(fieldDef.choices) && fieldDef.choices.length === 2
    && fieldDef.choices.includes("On") && fieldDef.choices.includes("Off");
}

// Two-level menu: the top level lists categories (one per SETTINGS_SECTIONS
// entry); tapping one drills into a sub-screen for that category's fields.
// The sub-screen needs no custom dismiss row — Scriptable adds its own
// "Close" button whenever a UITable is presented. Edits apply live to the
// shared settings object, so dismissing a sub-screen never loses anything.
// On/Off fields render with a colored dot (🟢/🔴) standing in for a toggle
// switch — UITable has no native switch control — and tapping the row
// opens the same On/Off picker as any other field. Returns the edited
// settings only if the user taps "Save & Close" at the top level, or null
// if they cancel or dismiss without saving.
async function presentSettingsMenu(currentSettings) {
  const settings = JSON.parse(JSON.stringify(currentSettings));
  let saved = false;

  async function editField(fieldDef, onUpdated) {
    if (fieldDef.isCalendarPicker) {
      const value = await presentCalendarPicker(settings.behavior.calendarIds);
      if (value != null) fieldDef.apply(settings, value);
    } else if (fieldDef.isSingleCalendarPicker) {
      const value = await presentSingleCalendarPicker(
        settings.location.workScheduleCalendarId,
        "Work Schedule Calendar",
        "Tap the calendar your shifts appear on, or None to turn this off."
      );
      if (value != null) fieldDef.apply(settings, value);
    } else if (fieldDef.isBackgroundImagePicker) {
      const variant = fieldDef.backgroundImageVariant ?? "light";
      const currentlyEnabled = variant === "dark" ? settings.behavior.darkBackgroundImageEnabled : settings.behavior.backgroundImageEnabled;
      const value = await presentBackgroundImagePicker(currentlyEnabled, variant);
      if (value != null) fieldDef.apply(settings, value);
    } else if (fieldDef.isPriorityOrderPicker) {
      const value = await presentPriorityOrderPicker(settings.behavior.priorityOrder);
      if (value != null) fieldDef.apply(settings, value);
    } else if (fieldDef.choices) {
      const value = await presentChoicePicker(fieldDef);
      if (value != null) fieldDef.apply(settings, value);
    } else {
      const value = await presentTextPrompt(fieldDef, fieldDef.get(settings));
      if (value != null) {
        const trimmed = value.trim();
        if (trimmed || fieldDef.allowBlank) fieldDef.apply(settings, trimmed);
      }
    }
    onUpdated();
  }

  async function presentCategoryMenu(section) {
    const table = new UITable();
    table.showSeparators = true;

    function render() {
      table.removeAllRows();

      const header = new UITableRow();
      header.isHeader = true;
      header.height = 42;
      const headerCell = header.addText(section.title.toUpperCase());
      headerCell.titleFont = Font.boldSystemFont(17);
      headerCell.titleColor = PRIMARY_COLOR;
      table.addRow(header);

      for (const fieldDef of section.fields) {
        const row = new UITableRow();
        row.dismissOnSelect = false;
        row.height = 56;

        if (isToggleField(fieldDef)) {
          const isOn = fieldDef.get(settings) === "On";

          const labelCell = row.addText(fieldDef.label);
          labelCell.titleFont = Font.semiboldSystemFont(17);
          labelCell.titleColor = PRIMARY_COLOR;
          labelCell.widthWeight = 80;

          const dotCell = row.addText(isOn ? "🟢" : "🔴");
          dotCell.titleFont = Font.systemFont(22);
          dotCell.rightAligned();
          dotCell.widthWeight = 20;
        } else {
          const cell = row.addText(fieldDef.label, fieldDisplayValue(fieldDef, settings));
          cell.titleFont = Font.semiboldSystemFont(17);
          cell.titleColor = PRIMARY_COLOR;
          cell.subtitleFont = Font.systemFont(15);
          cell.subtitleColor = SECONDARY_COLOR;
        }

        row.onSelect = () => editField(fieldDef, render);
        table.addRow(row);
      }

      table.reload();
    }

    render();
    await table.present(true);
  }

  const table = new UITable();
  table.showSeparators = true;

  function render() {
    table.removeAllRows();

    const header = new UITableRow();
    header.isHeader = true;
    header.height = 54;
    const headerCell = header.addText("Live Context Settings", "Tap a category to customize it.");
    headerCell.titleFont = Font.boldSystemFont(19);
    headerCell.subtitleFont = Font.systemFont(15);
    headerCell.subtitleColor = SECONDARY_COLOR;
    table.addRow(header);

    for (const section of SETTINGS_SECTIONS) {
      const row = new UITableRow();
      row.dismissOnSelect = false;
      row.height = 64; // fits ~2 lines of subtitle — keep each section's `description` a short one-liner (~50 chars) or it clips here

      const cell = row.addText(section.title, section.description);
      cell.titleFont = Font.boldSystemFont(18);
      cell.titleColor = PRIMARY_COLOR;
      cell.subtitleFont = Font.systemFont(14);
      cell.subtitleColor = SECONDARY_COLOR;

      row.onSelect = async () => {
        await presentCategoryMenu(section);
        render(); // refresh in case anything in that category changed
      };
      table.addRow(row);
    }

    const saveRow = new UITableRow();
    saveRow.dismissOnSelect = true;
    saveRow.height = 50;
    const saveCell = saveRow.addText("Save & Close");
    saveCell.titleFont = Font.semiboldSystemFont(18);
    saveCell.titleColor = Color.blue();
    saveCell.centerAligned();
    saveRow.onSelect = () => { saved = true; };
    table.addRow(saveRow);

    const cancelRow = new UITableRow();
    cancelRow.dismissOnSelect = true;
    cancelRow.height = 50;
    const cancelCell = cancelRow.addText("Cancel");
    cancelCell.titleFont = Font.semiboldSystemFont(18);
    cancelCell.titleColor = Color.red();
    cancelCell.centerAligned();
    cancelRow.onSelect = () => { saved = false; };
    table.addRow(cancelRow);

    table.reload();
  }

  render();
  await table.present(true);

  return saved ? settings : null;
}

// MARK: - Execution

async function run() {
  migrateFromPixelWidget();

  if (config.runsInWidget) {
    Script.setWidget(await createWidget(getCurrentSettings(), config.widgetFamily));
    Script.complete();
    return;
  }

  const choice = await presentMainMenu();

  if (choice === 1) {
    const updated = await presentSettingsMenu(getCurrentSettings());
    if (updated) saveStoredSettings(updated);
    Script.complete();
    return;
  }

  if (choice === 2) {
    await runDiagnostics();
    Script.complete();
    return;
  }

  if (choice === 3) {
    await runPermissionCheck();
    Script.complete();
    return;
  }

  if (choice === 4) {
    await openTransparentBackgroundTool();
    Script.complete();
    return;
  }

  if (choice === 5) {
    await Safari.openInApp(SUPPORT_URL, false);
    Script.complete();
    return;
  }

  if (choice !== 0) {
    Script.complete();
    return;
  }

  const family = await presentPreviewSizeMenu();
  if (!family) {
    Script.complete();
    return;
  }

  const widget = await createWidget(getCurrentSettings(), family);
  if (family === "medium") await widget.presentMedium();
  else if (family === "large") await widget.presentLarge();
  else if (family === "accessoryRectangular") await widget.presentAccessoryRectangular();
  else await widget.presentSmall();

  Script.complete();
}

await run();

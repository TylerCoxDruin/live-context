// Variables used by Scriptable.
// icon-color: purple; icon-glyph: photo-video;

// Live Context Showcase — a standalone demo tool for screenshotting every
// state Live Context can show, at any size, with realistic sample content.
// Pick a state, pick a size, get a full-screen preview to screenshot.
//
// This is a fully self-contained script — it duplicates Live Context's
// rendering/pill/color code rather than importing it. Scriptable has no
// documented, reliable way for one script to detect "am I being imported
// vs. run directly," and Live Context.js's own trailing `await run()`
// would otherwise fire as an unwanted side effect of importing it (it
// would pop up the real interactive menu). Given the real risk of
// misbehaving against a live Home Screen widget from an unverified guess,
// this stays independent instead. If Live Context's visual system changes
// (pill styling, colors, a new state), this file needs a matching manual
// update to stay accurate — it is a snapshot of that system, not a live
// mirror of it.

// MARK: - Styling (mirrors Live Context.js)

const PRIMARY_COLOR = Color.dynamic(Color.black(), Color.white());
const SECONDARY_COLOR = Color.dynamic(new Color("#5f6368"), new Color("#9aa0a6"));

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

function withColor(style, color) {
  return { ...style, color };
}

const PILL_COLORS = {
  dateMonth: new Color("#e5484d"),
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

function aqiPillColor(aqi) {
  if (aqi >= 201) return new Color("#8b5cf6");
  if (aqi >= 151) return new Color("#ef4444");
  return new Color("#f97316");
}

const ICON_LIBRARY = {
  windDownMoon: "moon.zzz.fill",
  reminder: "bolt.fill",
  rain: "cloud.rain.fill",
  thermometer: "thermometer",
  highValue: "star.circle.fill",
  calendar: "calendar",
  arrival: "figure.walk",
  arrivalLocation: "mappin.and.ellipse",
  geofence: "mappin.circle.fill",
  wind: "wind",
  agenda: "list.bullet",
  gift: "gift.fill",
  stocks: "chart.line.uptrend.xyaxis",
  severeWeather: "exclamationmark.triangle.fill",
  holiday: "sparkles",
  reminderDue: "checkmark.circle.fill",
  commute: "car.fill",
  airQuality: "aqi.medium",
  uv: "sun.max.fill",
  tempColder: "thermometer.snowflake",
  tempWarmer: "thermometer.sun.fill",
  tomorrow: "calendar.badge.clock",
  steps: "figure.walk.circle.fill",
};

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

// MARK: - Row primitives (mirrors Live Context.js's addPill family)

function addPillContent(pillStack, text, style, glyph) {
  const label = pillStack.addText(text);
  label.font = style.font;
  label.textColor = Color.white();
  label.lineLimit = 1;
  label.minimumScaleFactor = 0.8;

  if (glyph) {
    pillStack.addSpacer(4);
    const symbol = SFSymbol.named(glyph);
    symbol.applyFont(Font.systemFont(style.iconSize));
    const image = pillStack.addImage(symbol.image);
    image.imageSize = new Size(style.iconSize, style.iconSize);
    image.tintColor = Color.white();
  }
}

function addPill(container, text, backgroundColor, style, glyph) {
  const pill = container.addStack();
  pill.backgroundColor = backgroundColor;
  pill.cornerRadius = style.iconSize;
  pill.setPadding(4, 10, 4, 10);
  pill.centerAlignContent();
  addPillContent(pill, text, style, glyph);
}

function addFramedPill(container, text, color, style, glyph) {
  const outer = container.addStack();
  outer.backgroundColor = PILL_COLORS.frame;
  outer.cornerRadius = style.iconSize;
  outer.setPadding(3, 3, 3, 3);
  outer.centerAlignContent();

  const chip = outer.addStack();
  chip.backgroundColor = color;
  chip.cornerRadius = style.iconSize;
  chip.setPadding(4, 10, 4, 10);
  chip.centerAlignContent();
  addPillContent(chip, text, style, glyph);
}

function addDateBadge(container, month, day, style) {
  const outer = container.addStack();
  outer.backgroundColor = PILL_COLORS.frame;
  outer.cornerRadius = style.iconSize;
  outer.setPadding(3, 3, 3, 10);
  outer.centerAlignContent();

  const chip = outer.addStack();
  chip.backgroundColor = PILL_COLORS.dateMonth;
  chip.cornerRadius = style.iconSize;
  chip.setPadding(4, 10, 4, 10);
  chip.centerAlignContent();
  addPillContent(chip, month, style);

  outer.addSpacer(6);
  const dayLabel = outer.addText(day);
  dayLabel.font = style.font;
  dayLabel.textColor = Color.white();
  dayLabel.lineLimit = 1;
}

function addAlignedRow(container, buildContent) {
  const outerRow = container.addStack();
  outerRow.addSpacer();
  const row = outerRow.addStack();
  row.centerAlignContent();
  buildContent(row);
  outerRow.addSpacer();
}

function addIconTextRow(container, glyph, text, style) {
  addAlignedRow(container, (row) => {
    const symbol = SFSymbol.named(glyph);
    symbol.applyFont(Font.systemFont(style.iconSize));
    const image = row.addImage(symbol.image);
    const isBattery = glyph.startsWith("battery.");
    image.imageSize = isBattery ? new Size(style.iconSize * 1.8, style.iconSize) : new Size(style.iconSize, style.iconSize);
    image.tintColor = style.color;

    row.addSpacer(6);
    const label = row.addText(text);
    label.font = style.font;
    label.textColor = style.color;
    label.lineLimit = 1;
    label.minimumScaleFactor = 0.8;
  });
}

// `segments`: a plain string, `{ pill, color, glyph? }`, `{ framedPill, color, glyph? }`, or `{ dateBadge: { month, day } }`.
function addMixedRow(widget, segments, style) {
  addAlignedRow(widget, (row) => {
    segments.forEach((segment, index) => {
      if (index > 0) row.addSpacer(6);
      if (typeof segment === "string") {
        const label = row.addText(segment);
        label.font = style.font;
        label.textColor = style.color;
        label.lineLimit = 1;
      } else if (segment.dateBadge) {
        addDateBadge(row, segment.dateBadge.month, segment.dateBadge.day, style);
      } else if (segment.framedPill) {
        addFramedPill(row, segment.framedPill, segment.color, style, segment.glyph);
      } else {
        addPill(row, segment.pill, segment.color, style, segment.glyph);
      }
    });
  });
}

// MARK: - Formatting helpers

function formatTemperature(weather) {
  return `${Math.round(weather.main.temp)}°F`;
}

function describeWeather(weather) {
  const d = weather.weather[0].description;
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function formatDistance(meters) {
  const feet = meters * 3.28084;
  return feet >= 1000 ? `${(feet / 5280).toFixed(1)} mi` : `${Math.round(feet)} ft`;
}

function formatCountdown(startDate) {
  const minutesUntil = Math.round((startDate - new Date()) / 60000);
  if (minutesUntil <= 1) return "Now";
  if (minutesUntil < 60) return `${minutesUntil}m`;
  const hours = Math.floor(minutesUntil / 60);
  const minutes = minutesUntil % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatStockQuote(quote) {
  const price = quote.price.toFixed(2);
  const changePct = ((quote.price - quote.previousClose) / quote.previousClose) * 100;
  const arrow = changePct > 0.005 ? "▲" : changePct < -0.005 ? "▼" : "–";
  return `${quote.symbol} ${price} ${arrow}${Math.abs(changePct).toFixed(1)}%`;
}

function stockPillColor(quote) {
  const changePct = ((quote.price - quote.previousClose) / quote.previousClose) * 100;
  if (changePct > 0.005) return PILL_COLORS.stockUp;
  if (changePct < -0.005) return PILL_COLORS.stockDown;
  return PILL_COLORS.stockFlat;
}

// MARK: - Sample data

function sampleWeather({ id = 801, main = "Clouds", description = "scattered clouds", temp = 72 } = {}) {
  return {
    main: { temp, feels_like: temp, humidity: 55 },
    weather: [{ main, description, id, icon: "02d" }],
    wind: { speed: 8 },
    coord: { lat: 35.47, lon: -97.4 },
  };
}

const in_ = (minutes) => new Date(Date.now() + minutes * 60000);

// One realistic sample model per state, keyed the same way Live Context's
// own `model.priority` is. Menu order mirrors Live Context's own priority
// order, top (most urgent) to bottom.
const SAMPLES = {
  "severe-weather": {
    label: "Severe Weather Alert",
    model: { alert: { event: "Severe Thunderstorm Warning", expires: in_(120) }, weather: sampleWeather({ id: 211, main: "Thunderstorm", description: "thunderstorm" }) },
  },
  "high-value-event": {
    label: "High-Value Event",
    model: { event: { title: "Flight to Denver", startDate: in_(154) }, travelEstimate: { minutes: 22 }, weather: sampleWeather() },
  },
  "rain-incoming": {
    label: "Rain Incoming",
    model: { minutesUntilRain: 12, weather: sampleWeather() },
  },
  "event-arrival": {
    label: "Event Arrival",
    model: { event: { title: "Dinner with Sarah", location: "The Capital Grille" }, weather: sampleWeather() },
  },
  event: {
    label: "Upcoming Event",
    model: { event: { title: "Team Standup", startDate: in_(47) }, travelEstimate: null, weather: sampleWeather() },
  },
  commute: {
    label: "Morning Commute",
    model: { commute: { minutes: 18, distanceMeters: 14484 }, weather: sampleWeather({ temp: 68 }) },
  },
  geofence: {
    label: "Near a Place",
    model: { geofence: { label: "Home", distanceMeters: 42 }, weather: sampleWeather() },
  },
  battery: {
    label: "Battery Low",
    model: { battery: { level: 0.15 }, weather: sampleWeather() },
  },
  weather: {
    label: "Active Weather",
    model: { weather: sampleWeather({ id: 500, main: "Rain", description: "light rain", temp: 61 }) },
  },
  "air-quality": {
    label: "Poor Air Quality",
    model: { aqi: 156, weather: sampleWeather({ temp: 88 }) },
  },
  uv: {
    label: "High UV",
    model: { uvIndex: 9, weather: sampleWeather({ id: 800, main: "Clear", description: "clear sky", temp: 91 }) },
  },
  holiday: {
    label: "Holiday",
    model: { holiday: "Independence Day", weather: sampleWeather({ id: 800, main: "Clear", description: "clear sky", temp: 86 }) },
  },
  birthdays: {
    label: "Birthdays",
    model: { contactBirthdays: ["Jordan Lee"], weather: sampleWeather() },
  },
  reminders: {
    label: "Reminders Due",
    model: { dueReminders: [{ title: "Pick up dry cleaning" }, { title: "Call the dentist" }], weather: sampleWeather() },
  },
  steps: {
    label: "Step Count",
    model: { steps: 8432, weather: sampleWeather() },
  },
  stocks: {
    label: "Stocks Recap",
    model: {
      stockQuotes: [
        { symbol: "AAPL", price: 234.56, previousClose: 230.10 },
        { symbol: "TSLA", price: 182.30, previousClose: 185.75 },
      ],
      weather: sampleWeather(),
    },
  },
  "temp-swing": {
    label: "Temp Swing",
    model: { tempSwing: { delta: -14, tomorrowHigh: 68, todayHigh: 82 }, weather: sampleWeather({ temp: 82 }) },
  },
  default: {
    label: "Default (Greeting)",
    model: { todayHighText: "↑88°", weather: sampleWeather({ temp: 74 }) },
  },
  "wind-down": {
    label: "Wind Down",
    model: { weather: sampleWeather({ id: 801, main: "Clouds", description: "partly cloudy", temp: 64 }) },
  },
};

// MARK: - Per-state rendering (mirrors Live Context.js's addPrimaryRows)

function renderState(widget, key, model, family) {
  const primary = withColor(primaryStyle(family), PRIMARY_COLOR);
  const secondary = withColor(secondaryStyle(family), SECONDARY_COLOR);

  switch (key) {
    case "severe-weather":
      addIconTextRow(widget, ICON_LIBRARY.severeWeather, model.alert.event, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, ICON_LIBRARY.thermometer, `Until ${model.alert.expires.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`, secondary);
      break;

    case "high-value-event":
      addIconTextRow(widget, ICON_LIBRARY.highValue, model.event.title, primary);
      widget.addSpacer(6);
      addMixedRow(widget, ["In", { pill: formatCountdown(model.event.startDate), color: PILL_COLORS.countdown }, model.travelEstimate ? `~${model.travelEstimate.minutes} min away` : null].filter(Boolean), secondary);
      break;

    case "rain-incoming":
      addIconTextRow(widget, ICON_LIBRARY.rain, `Rain starting in ${model.minutesUntilRain} mins`, primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: formatTemperature(model.weather), color: PILL_COLORS.temperature, glyph: weatherSymbolName(model.weather) }], secondary);
      break;

    case "event-arrival":
      addIconTextRow(widget, ICON_LIBRARY.arrival, `Welcome to ${model.event.title}!`, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, ICON_LIBRARY.arrivalLocation, model.event.location, secondary);
      break;

    case "event":
      addIconTextRow(widget, ICON_LIBRARY.calendar, model.event.title, primary);
      widget.addSpacer(6);
      addMixedRow(widget, ["In", { pill: formatCountdown(model.event.startDate), color: PILL_COLORS.countdown }], secondary);
      break;

    case "commute":
      addIconTextRow(widget, ICON_LIBRARY.commute, "Commute to Work", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `~${model.commute.minutes} min`, color: PILL_COLORS.distance }, `· ${formatDistance(model.commute.distanceMeters)}`], secondary);
      break;

    case "geofence":
      addIconTextRow(widget, ICON_LIBRARY.geofence, `Near ${model.geofence.label}`, primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: formatDistance(model.geofence.distanceMeters), color: PILL_COLORS.distance }, "away"], secondary);
      break;

    case "battery":
      addIconTextRow(widget, batterySymbolName(model.battery.level), "Battery Low", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `${Math.round(model.battery.level * 100)}%`, color: PILL_COLORS.battery }, "— charge soon"], secondary);
      break;

    case "weather":
      addIconTextRow(widget, weatherSymbolName(model.weather), describeWeather(model.weather), primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: formatTemperature(model.weather), color: PILL_COLORS.temperature, glyph: weatherSymbolName(model.weather) }], secondary);
      break;

    case "air-quality":
      addIconTextRow(widget, ICON_LIBRARY.airQuality, "Poor Air Quality", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `AQI ${model.aqi}`, color: aqiPillColor(model.aqi) }, model.aqi >= 151 ? "· limit time outside" : "· sensitive groups take care"], secondary);
      break;

    case "uv":
      addIconTextRow(widget, ICON_LIBRARY.uv, "Very High UV Today", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `UV ${model.uvIndex}`, color: PILL_COLORS.uv }, "· wear sunscreen"], secondary);
      break;

    case "holiday":
      addIconTextRow(widget, ICON_LIBRARY.holiday, `Happy ${model.holiday}!`, primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ framedPill: formatTemperature(model.weather), color: PILL_COLORS.temperature, glyph: weatherSymbolName(model.weather) }], secondary);
      break;

    case "birthdays": {
      const isSingle = model.contactBirthdays.length === 1;
      addIconTextRow(widget, ICON_LIBRARY.gift, isSingle ? "Birthday Today" : `${model.contactBirthdays.length} Birthdays Today`, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, ICON_LIBRARY.gift, model.contactBirthdays.join(", "), secondary);
      break;
    }

    case "reminders":
      addIconTextRow(widget, ICON_LIBRARY.reminderDue, `${model.dueReminders.length} Reminders Due`, primary);
      widget.addSpacer(4);
      addIconTextRow(widget, ICON_LIBRARY.reminderDue, model.dueReminders[0].title, secondary);
      break;

    case "steps":
      addIconTextRow(widget, ICON_LIBRARY.steps, "Today's Steps", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: model.steps.toLocaleString(), color: PILL_COLORS.distance }], secondary);
      break;

    case "stocks":
      addIconTextRow(widget, ICON_LIBRARY.stocks, "Markets Closed", primary);
      widget.addSpacer(6);
      addMixedRow(widget, model.stockQuotes.map((quote) => ({ pill: formatStockQuote(quote), color: stockPillColor(quote) })), secondary);
      break;

    case "temp-swing": {
      const colder = model.tempSwing.delta < 0;
      addIconTextRow(widget, colder ? ICON_LIBRARY.tempColder : ICON_LIBRARY.tempWarmer, colder ? "Colder Tomorrow" : "Warmer Tomorrow", primary);
      widget.addSpacer(6);
      addMixedRow(widget, [{ pill: `${model.tempSwing.tomorrowHigh}°`, color: colder ? PILL_COLORS.coldSwing : PILL_COLORS.warmSwing }, `high · today ${model.tempSwing.todayHigh}°`], secondary);
      break;
    }

    case "default": {
      addMixedRow(widget, ["Good Morning, Ty"], primary);
      widget.addSpacer(6);
      const { month, day } = { month: new Date().toLocaleDateString("en-US", { month: "short" }).toUpperCase(), day: String(new Date().getDate()) };
      addMixedRow(widget, ["It's", { dateBadge: { month, day } }, "and", { framedPill: `${formatTemperature(model.weather)} ${model.todayHighText}`, color: PILL_COLORS.temperature, glyph: weatherSymbolName(model.weather) }], secondary);
      break;
    }
  }
}

function renderWindDown(widget, model, family) {
  const gradient = new LinearGradient();
  gradient.colors = [new Color("#161d34"), Color.black()];
  gradient.locations = [0, 1];
  gradient.startPoint = new Point(0, 0);
  gradient.endPoint = new Point(0, 1);
  widget.backgroundGradient = gradient;

  const ACCENT = new Color("#a5b4fc");
  const MUTED = new Color("#9aa0a6");

  widget.addSpacer();
  addIconTextRow(widget, "moon.stars.fill", "Wind Down", withColor(primaryStyle(family), ACCENT));
  widget.addSpacer(4);
  addIconTextRow(widget, ICON_LIBRARY.tomorrow, "First up: Standup · 9:00 AM", withColor(secondaryStyle(family), MUTED));
  widget.addSpacer();
}

// MARK: - Widget assembly

function buildDemoWidget(key, family) {
  const widget = new ListWidget();
  widget.setPadding(14, 14, 14, 14);

  if (key === "wind-down") {
    renderWindDown(widget, SAMPLES[key].model, family);
    return widget;
  }

  widget.addSpacer();
  renderState(widget, key, SAMPLES[key].model, family);
  widget.addSpacer();
  return widget;
}

// MARK: - Menu

async function pickState() {
  const table = new UITable();
  table.showSeparators = true;

  const header = new UITableRow();
  header.isHeader = true;
  header.height = 54;
  const headerCell = header.addText("Live Context Showcase", "Pick a state to preview and screenshot.");
  headerCell.titleFont = Font.boldSystemFont(19);
  headerCell.subtitleFont = Font.systemFont(14);
  headerCell.subtitleColor = SECONDARY_COLOR;
  table.addRow(header);

  let chosen = null;
  for (const key of Object.keys(SAMPLES)) {
    const row = new UITableRow();
    row.dismissOnSelect = true;
    row.height = 50;
    const cell = row.addText(SAMPLES[key].label);
    cell.titleFont = Font.semiboldSystemFont(16);
    cell.titleColor = PRIMARY_COLOR;
    row.onSelect = () => { chosen = key; };
    table.addRow(row);
  }

  await table.present(true);
  return chosen;
}

async function pickFamily() {
  const alert = new Alert();
  alert.title = "Widget Size";
  alert.addAction("Small");
  alert.addAction("Medium");
  alert.addAction("Large");
  alert.addCancelAction("Cancel");
  const choice = await alert.presentAlert();
  return ["small", "medium", "large"][choice] ?? null;
}

async function run() {
  const key = await pickState();
  if (!key) {
    Script.complete();
    return;
  }

  const family = await pickFamily();
  if (!family) {
    Script.complete();
    return;
  }

  const widget = buildDemoWidget(key, family);
  if (family === "medium") await widget.presentMedium();
  else if (family === "large") await widget.presentLarge();
  else await widget.presentSmall();

  Script.complete();
}

await run();

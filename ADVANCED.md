# Live Context, Advanced Guide

This one's for setting up Shortcuts, adding a transparent background, and
poking around the script itself. If you just want the widget running, go
read [`README.md`](README.md) instead.

## Project Files

| File | What it is |
|---|---|
| [`Live Context.js`](Live%20Context.js) | The widget itself. This is the only file you actually add to Scriptable as a Home Screen widget. |
| [`Live Context Bridge.js`](Live%20Context%20Bridge.js) | Receives data from Shortcuts automations. Don't run this one directly, see below. |
| [`Transparent & Blurred Widgets.js`](Transparent%20%26%20Blurred%20Widgets.js) | A little wizard that builds a background image matching your wallpaper, for the transparent/glass widget look. |
| [`Permission Check.js`](Permission%20Check.js) | Walks through every permission prompt (Location, Calendar, etc.) up front instead of letting them surprise you later. The same check is also built into the widget's own main menu. |

Everything lives in one script (`Live Context.js`). There's no separate
config file and no companion app.

## Full Settings Reference

Open the script in Scriptable and choose **Edit Settings** to get to all of
this. Every field has its own on-screen description too, so think of this
list as a map of what's grouped where, not a replacement for actually
reading those.

- **Appearance**: icon style (SF Symbols vs. emoji), text alignment,
  background image (light and dark variants), text color/shadow for
  background images, plain text pills (for Home Screen icon styles that
  break colored badges, more on that below), tap-to-open.
- **Priorities**: reorder which information wins when several things
  apply at once. The widget shows exactly one state at a time, whichever
  is highest on this list. Severe weather always stays on top and can't
  be demoted.
- **Weather**: API key, city ID, temperature units, cache limit, forecast
  data toggle, feels-like temps, morning high briefing.
- **Weather Alerts**: active precipitation, rain nowcast, severe weather
  alerts, temperature swing alerts, UV alerts, air quality alerts, plus a
  threshold/window for each.
- **Stocks**: after-hours market recap. On/off, tickers, display window.
- **Profile**: your name, locale, birthday.
- **Calendar & Events**: which calendars to search, the work schedule
  calendar (more on that below), event lookahead, high-value event
  keywords, arrival detection, travel time estimate, holidays, contacts'
  birthdays, reminders.
- **Battery**: low battery threshold, alerts, and a Shortcut to run when
  you tap the widget during a low-battery alert.
- **Wind Down**: the nightly quiet mode. Hours (fixed or sunset-based),
  message, charge reminder, tomorrow preview, moon phase icon, and a
  Shortcut to run when tapped.
- **Places**: geofence alert and radius, Home/Work/Gym addresses, morning
  commute estimate.
- **Shortcuts**: on/off plus a freshness window for every Shortcuts-fed
  data type (the full Bridge guide is further down).

One field worth calling out on its own: **Work Schedule Calendar**, under
Calendar & Events. Point it at whatever calendar your actual work shifts
show up on (a scheduling app's synced calendar, a shared one, whatever you
use), and the morning commute estimate will only show up on days you're
actually working, not just any weekday morning. Leave it unset and it
falls back to assuming every weekday morning could be a work day.

### Per-widget overrides

Long-press the widget, tap **Edit Widget**, then **Parameter**, and supply
either:

- a JSON object to override any setting for just that widget, like
  `{"weather":{"units":"imperial"}}`
- a bare string or number, treated as a shorthand OpenWeatherMap city ID

## Setting Up Shortcuts

Scriptable can't reach everything on its own. Health data, what's
currently playing, that kind of thing. Shortcuts can get to all of it
though, which is the whole reason `Live Context Bridge.js` exists: a
Shortcut runs it with a small dictionary of data, the Bridge validates and
stores it, and the widget picks it up on its next refresh.

Every one of these is off by default. Nothing changes until you build the
matching Shortcut and turn its toggle on under Settings > Shortcuts.

### The general pattern

For any of the types below, build a Shortcut that:

1. Gathers the data (a Health lookup, a location trigger, whatever fits)
2. Uses a **Dictionary** action to put together the fields listed for that
   type, plus a `"type"` field naming it
3. Feeds that dictionary into **Run Script in Scriptable**, targeting
   `Live Context Bridge` by name

### Arrival / Departure, instant "I'm here"

Faster than the widget's own location polling, since a Shortcuts
Arrive/Leave automation is a real background trigger rather than
something the widget has to go check on its own schedule.

- Automation trigger: **Arrive at Location** (Home, Work, or Gym)
- Dictionary: `{"type": "arrival", "place": "home"}` (use `"home"`,
  `"work"`, or `"gym"`)
- Pair it with a **Leave Location** automation sending
  `{"type": "departure"}`, so the flag clears the moment you actually
  leave instead of just waiting to expire on its own.

### Steps

Scriptable has no Health app API at all, so this is the only way to get
step data onto the widget.

- Get the data with **Find Health Samples** (Steps, Today), then sum it
  into a plain number
- Dictionary: `{"type": "steps", "count": 8432}`

### Weather (override)

Optional. This lets Apple's own weather stand in for the usual
OpenWeatherMap fetch.

- Get the data with **Get Current Weather** or **Get Weather Details**
- Dictionary: `{"type": "weather", "tempF": 72, "condition": "Clouds"}`.
  You can also add `"humidityPercent"`, `"windMph"`, `"sunriseISO"`, and
  `"sunsetISO"` if you want them. `condition` should be one of
  Clear/Clouds/Rain/Drizzle/Thunderstorm/Snow/Fog.

### Sleep

- Get the data with **Find Health Samples** (Sleep Analysis, last night),
  summed into decimal hours
- Dictionary: `{"type": "sleep", "hours": 7.2}`

### Activity Rings

Each ring is independent, so just send whichever ones you actually care
about.

- Get the data from Health's Activity data
- Dictionary: `{"type": "activity", "exerciseMinutes": 32, "standHours": 9,
  "activeCalories": 410}`. At least one of those three fields is required.

### Now Playing

- Get the data with **Get Currently Playing Media**, or whatever the
  Music/Podcasts app's own now-playing details give you
- Dictionary: `{"type": "nowPlaying", "title": "Song Name", "artist": "Artist"}`
  (`artist` is optional)

### Custom Message

A catch-all for anything the other types don't cover. Not tied to any
particular app.

- Dictionary: `{"type": "message", "title": "Package delivered", "subtitle": "From Amazon", "glyph": "shippingbox.fill"}`.
  `subtitle` and `glyph` are both optional. `glyph` is an SF Symbol name,
  and if you get it wrong it just falls back to a default icon instead of
  breaking anything.

### Background Image

Lets a Shortcut replace the widget's background image, handy if an
automation already changes your wallpaper and you want the widget to keep
up.

- Get the image from wherever (Photos, Files, the output of another
  action), then run it through a **Base64 Encode** action
- Dictionary: `{"type": "background", "imageBase64": <the encoded text>, "variant": "light"}`.
  `variant` is `"light"` or `"dark"` and defaults to light.
- This only swaps the image file. You still need Background Image (or
  Dark Background Image) turned on once in Live Context's own settings
  for the widget to use it.

## Transparent / Blurred Background

`Transparent & Blurred Widgets.js` builds a background image that makes
the widget blend right into your wallpaper, similar to Pixel's own look.
Run it directly, not from Live Context:

1. It'll ask you to go to your Home Screen, enter wiggle mode, scroll to
   an empty page, and take a screenshot, then come back to the script.
2. Pick that screenshot, then tap the exact grid cell your widget sits in.
   It shows you a lettered overlay so you can find the right spot.
3. Choose a style: fully transparent, light blur, dark blur, or just blur.
4. If you want, repeat the process for a Dark Mode version. Switch to Dark
   Mode, screenshot the same spot, and it'll reuse your crop position.
5. Export to Photos or Files.

Then back in Live Context: **Edit Settings > Appearance > Background
Image** (and **Dark Background Image**, if you made one), and pick the
image you just exported. If you made both, **Dark Hours Start/End** (or
**Use Actual Sunset/Sunrise**) controls when each one shows.

You can also launch this tool straight from Live Context's own main menu,
under **Create Transparent Background**, instead of hunting it down
separately.

One important caveat: if your Home Screen icon style is set to **Clear**
(iOS 26 and up), skip this tool entirely. iOS already makes widgets
see-through in that mode, and stacking a custom background under it washes
things out instead of helping. Clear mode also strips the color out of the
widget's pill badges no matter what settings you pick (confirmed by direct
testing), so if your dates and temperatures are showing up as blank
capsules, turn on **Appearance > Plain Text Pills**. That renders them as
plain text, which survives Clear mode fine.

## Lock Screen Widgets

Live Context works as a Lock Screen widget too (iOS 16 and up): add a
Scriptable widget to your Lock Screen, point it at the script, and it
shows a compact text version of whatever the Home Screen widget would be
showing, same priorities, same data. iOS forces Lock Screen widgets into
its own tiny monochrome style, so there are no pills or colors there by
design. You can preview it from the main menu under **Preview Widget >
Lock Screen**.

## Diagnostics & Permissions

From Live Context's main menu (run the script directly, don't tap a Home
Screen widget):

- **Run Diagnostics** walks through calendar access, event matching,
  location, geofencing, and every active Shortcuts feed, and tells you
  exactly what it found. It's the first place to check if something
  "should" be showing and isn't.
- **Check Permissions** exercises every permission-gated API one at a
  time (Location, Calendar, Reminders, Contacts, Notifications, Photos),
  so each system prompt shows up in a predictable order instead of
  catching you off guard the first time some feature needs it.

## Editing the Script

A rough map for anyone comfortable with JavaScript who wants to poke
around. The file is split into `MARK:` sections you can jump between in
Scriptable's editor.

- **`DEFAULT_SETTINGS`**, at the top of the file: every setting and its
  default value, each with a comment explaining what it does.
- **Data fetching** (the Weather, Forecast, Stocks, Calendar, Reminders,
  and Geofencing sections): every external call follows the same shape.
  Check a cache, fetch if it's stale or missing, cache the result, and
  fail quietly to cached or null data if something goes wrong. A widget
  can't pop up an error dialog, so nothing here is allowed to throw past
  its own `try`/`catch`.
- **`buildWidgetModel`** (MARK: Widget Model): this is the priority
  cascade, just a plain ordered list of `if` checks. The first one that
  matches wins and becomes `model.priority`. To add a new state, add a
  check here wherever it makes sense priority-wise, returning
  `{ priority: "your-state", ...whatever data the render needs }`.
- **`addPrimaryRows`** (MARK: Widget UI): one `switch` case per priority,
  rendering that state's two lines. A new priority needs a matching
  `case` here too.
- **`ICON_LIBRARY`**: every fixed icon as a `{ glyph, emoji }` pair, so
  both icon styles stay in sync without extra work.
- **`SETTINGS_SECTIONS`** (MARK: Settings Menu): the settings screen
  itself, described as plain data. Each field is
  `{ label, description, get, apply, choices? }`. Adding a field here is
  enough to get a working row in the settings UI. No extra UI code needed.

A couple of things worth knowing before you start changing things:

- Scriptable's own docs are the real source of truth for what its API can
  do, not general JavaScript or iOS knowledge. A few methods that sound
  like they ought to exist (calendar or reminder lookups by identifier,
  forward geocoding) just don't, and calling one tends to fail silently
  rather than throwing an obvious error. Check
  [docs.scriptable.app](https://docs.scriptable.app) before leaning on an
  API this file isn't already using somewhere else.
- `Live Context Bridge.js` deliberately duplicates a few small functions
  from `Live Context.js` (the cache file plumbing, mainly) instead of
  importing them, so a change in one script can't quietly break the
  other. If you ever change the cache entry shape in one file, update the
  other to match.

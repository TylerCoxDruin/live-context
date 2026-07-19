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
config file and no companion app. All the data it stores (settings,
cache, background images) sits in a single **Live Context** folder inside
Scriptable's own folder in the Files app, created automatically. Anything
older versions left loose in the Scriptable folder gets tidied into it on
the next run, so deleting that one folder is a full clean slate.

## Full Settings Reference

Open the script in Scriptable and choose **Edit Settings** to get to all of
this. Every field has its own on-screen description too, so think of this
list as a map of what's grouped where, not a replacement for actually
reading those.

- **Appearance**: icon style (SF Symbols vs. emoji), text alignment,
  background image (light and dark variants), text color/shadow and
  optional dimming for background images, pill style (filled, outlined,
  or plain text, for Home Screen icon styles that break filled badges,
  more on that below), tap-to-open.
- **Priorities**: reorder which information wins when several things
  apply at once, and toggle the secondary chips. The main card shows
  whichever state is highest on this list; on medium and large widgets,
  the next couple of applicable states show as small tappable chips
  underneath it (one on medium, up to two on large), like the real At a
  Glance. Severe weather always stays
  on top and can't be demoted. There's also an opt-in **Smart
  Priorities** mode: the widget learns which of your personal stats
  (steps, sleep, activity, stocks, now playing) tend to have data at
  which times of day (and, when place detection has a fix, at which of
  your places), and sorts just those five among themselves to match your
  routine. Nothing else ever moves, everything learned stays in the
  widget's own local cache, Diagnostics shows exactly what it has
  learned, and switching it off deletes the data.
- **Weather**: API key, city ID, temperature units, cache limit, forecast
  data toggle, feels-like temps, morning high briefing.
- **Weather Alerts**: active precipitation, rain nowcast, severe weather
  alerts, temperature swing alerts, UV alerts, air quality alerts, plus a
  threshold/window for each.
- **Stocks**: after-hours market recap. On/off, tickers, display window.
- **Profile**: your name, locale, birthday.
- **Calendar & Events**: which calendars to search, the work schedule
  calendar (more on that below), event lookahead, high-value event
  keywords, arrival detection, travel time estimate (real driving routes
  via the free OSRM service, with a straight-line fallback), holidays,
  contacts' birthdays, reminders, and the "Coming up" agenda on the large
  widget.
- **Battery**: low battery threshold, alerts, and a Shortcut to run when
  you tap the widget during a low-battery alert.
- **Wind Down**: the nightly quiet mode. Hours (fixed or sunset-based),
  message, charge reminder, tomorrow preview, moon phase icon, and a
  Shortcut to run when tapped.
- **Places**: geofence alert and radius, the Place Card mode (by
  default, being at Home/Work/Gym feeds the smart logic without ever
  being announced, since you already know where you are; a visible "At
  Home" card is the opt-in), how long that card stays up when shown,
  Home/Work/Gym addresses, morning commute estimate.
- **Shortcuts**: on/off plus a freshness window for every Shortcuts-fed
  data type (the full Bridge guide is further down). Once steps or sleep
  data has been flowing for a few days, those cards automatically gain
  trends ("up vs your avg") and streaks ("5-day streak") from a local
  rolling history; nothing to configure.

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
- `{"pin": "steps"}` to lock that one widget to a single state (see the
  Lock Screen section for details; works on Home Screen widgets too)
- a bare string or number, treated as a shorthand OpenWeatherMap city ID

## Setting Up Shortcuts

Scriptable can't reach everything on its own. Health data, what's
currently playing, that kind of thing. Shortcuts can get to all of it
though, which is the whole reason `Live Context Bridge.js` exists: a
Shortcut runs it with a small dictionary of data, the Bridge validates and
stores it, and the widget picks it up on its next refresh.

Every one of these is off by default. Nothing changes until you build the
matching Shortcut and turn its toggle on under Settings > Shortcuts.

### Start here: the ready-made sync shortcut

Building these by hand is the fiddliest part of the whole setup, so
there's one shortcut in the repo that covers most of it:
[`shortcuts/Live Context Sync.shortcut`](shortcuts/Live%20Context%20Sync.shortcut).
Download it on your iPhone, open it to import, and it feeds three things
in one run: today's steps, today's exercise minutes, and last night's
sleep.

Set it up as a Personal Automation on an hourly schedule (Shortcuts app >
Automation > Time of Day > Repeat Hourly) and those three stay current on
their own. Then turn on **Step Count**, **Activity Rings**, and **Sleep**
under Settings > Shortcuts.

Two things to check right after importing, because Shortcuts sometimes
drops third-party action settings on import: open it in the editor and
confirm each of the three **Run Script** actions points at **Live
Context Bridge**, has the Dictionary above it as its input, and has Run
in App switched off.

It's iPhone/iPad only (the Health actions don't configure on a Mac), and
if a shortcut with that name already exists the import silently skips, so
delete the old one first.

### The general pattern

To wire up anything the sync shortcut doesn't cover, or to build your own
version:

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

Fair warning: getting sleep data out of the Health app is the fiddliest
of these, because Health stores a night of sleep as a pile of separate
samples that the Shortcut has to add up itself. The bridge accepts hours,
minutes, or seconds so you can send whichever unit your Shortcut ends up
with and skip the conversion math.

The sync shortcut above already handles sleep, so most people don't need
anything else here. If you only want sleep and nothing else, there's a
smaller single-purpose version:
[`shortcuts/Live Context Sleep.shortcut`](shortcuts/Live%20Context%20Sleep.shortcut).
Use one or the other, not both on automations, or the bridge gets the
same sleep value sent twice.

Worth knowing either way: they sum all sleep samples in the window, and
on newer iOS versions Health may include "In Bed" or "Awake" stages in
that, which overcounts a bit. If your numbers look high, add a filter for
the Asleep stage in the Find Health Samples action.

- Dictionary: `{"type": "sleep", "hours": 7.2}`, or
  `{"type": "sleep", "minutes": 432}`, or `{"type": "sleep", "seconds": 25920}`
- One way to build it:
  1. **Find Health Samples** where Type is **Sleep Analysis**, Start Date
     is in the last 24 hours, Value is **Asleep** (not In Bed)
  2. **Get Details of Health Sample** > Duration on each result, then
     **Calculate Statistics** > Sum
  3. Put that number in the dictionary under whichever unit it came out
     as, and pass it to **Run Script in Scriptable** > `Live Context Bridge`
- If you already have a sleep-analysis Shortcut you like, you can also
  just take its total-time output and feed that into the dictionary. The
  bridge doesn't care where the number came from.

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

### Focus Mode

Lets the widget react to your Focus modes. Build two automations, same
pattern as Arrive/Leave:

- "When [Focus] turns on": Dictionary `{"type": "focus", "name": "Sleep"}`
- "When [Focus] turns off": Dictionary `{"type": "focusOff"}`

A Focus whose name looks sleep-related (Sleep, Bedtime, Wind Down) puts
the widget into Wind Down mode no matter what the clock says. Turn it on
under Settings > Shortcuts > Focus Awareness.

### Next Alarm

Shows your next alarm on the nightly Wind Down screen, which is exactly
the thing worth double-checking from bed. This is the one thing the sync
shortcut doesn't cover: reading upcoming alarms isn't something the
Shortcuts action set exposes reliably enough to ship pre-built, so it's
a build-your-own if you want it.

- Get it with **Get Upcoming Alarms**, take the first alarm's date, and
  run it through **Format Date** set to ISO 8601
- Dictionary: `{"type": "alarm", "timeISO": <that formatted text>}`
- An alarm whose time has passed is ignored automatically. Turn the
  display on under Settings > Shortcuts > Next Alarm.

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
image you just exported. The field should read "Set" afterward, which is
also the quickest way to confirm it saved. If you made both, **Dark Hours
Start/End** (or **Use Actual Sunset/Sunrise**) controls when each one
shows. The background applies everywhere, including the nightly Wind Down
screen (which prefers the dark variant if you made one).

The image renders exactly as exported, no darkening, so the widget should
match the wallpaper around it seamlessly. If text is hard to read on a
very bright wallpaper, **Appearance > Background Dimming** adds a slight
darkening on purpose; just know that any dimming makes the widget region
visibly darker than the rest of your wallpaper.

You can also launch this tool straight from Live Context's own main menu,
under **Create Transparent Background**, instead of hunting it down
separately.

One important caveat: if your Home Screen icon style is set to **Clear**
(iOS 26 and up), skip this tool entirely. iOS already makes widgets
see-through in that mode, and stacking a custom background under it washes
things out instead of helping. Clear mode also strips the color out of
filled pill badges no matter what color settings you pick, so if your
dates and temperatures are showing up as blank capsules, set
**Appearance > Pill Style** to **Outlined**. It draws each badge as a
colored border with no fill for Clear to strip, keeps most of the badge
look, and is confirmed to survive Clear mode (as is Plain Text, if you
prefer no badges at all).

## Lock Screen Widgets

Live Context works as a Lock Screen widget too (iOS 16 and up): add a
Scriptable widget to your Lock Screen and point it at the script. Same
priorities, same data, but each shape gets its own treatment:

- **Rectangular** shows an icon, a bold headline, and a detail line. Its
  idle state is deliberately different from the Home Screen's: the Lock
  Screen already shows the time and date, so instead of a greeting it
  leads with the weather and spends its second line on your next event.
- **Circular** works like a proper complication: the state's icon over
  one short value. "8.4k" under a walking figure, "84°" under a sun, a
  countdown under a calendar.
- **Inline** (the line above the clock) compresses everything to one
  short phrase.

iOS forces Lock Screen widgets into its own monochrome style, so there
are no pills or colors there by design. Preview from the main menu under
**Preview Widget > Lock Screen**.

### Widgets that don't repeat each other

Multiple Lock Screen widgets coordinate automatically: each one records
what it's showing, and the others check that and pick something
different when they can, so you get the event on one, steps on another,
instead of three copies of the weather. This is on by default
(Settings > Priorities > Lock Screen Teamwork). Two notes: widgets of
the same shape can't be told apart, so pin those (below) if you run two
circulars; and if your Lock Screen already has Apple's own weather
complication, flip on **Lock Screen Shows Weather** so Live Context
skips plain weather there too. The script can't see your Lock Screen,
so that one's a toggle rather than automatic.

At night the Lock Screen widgets don't announce Wind Down either. iOS's
Sleep Focus screen already dims itself, says "Sleep", and shows your
alarm, so instead each widget picks the most useful nighttime fact it
has: charge your phone, a weather heads-up for tonight, tomorrow's first
event, or your alarm. The plain "Wind Down" card only appears when none
of those apply.

### Pinning a widget to one thing

Any widget (Lock Screen or Home Screen) can be locked to a single state
instead of following the priority cascade: long-press it, tap **Edit
Widget**, and set the Parameter to `{"pin": "steps"}`. Three circular
Lock Screen widgets pinned to `steps`, `weather`, and `battery` behave
like a classic complication row. If the pinned state has no data right
now (no steps yet today, say), the widget falls back to the normal
cascade rather than sitting empty. Valid pin names are the ones in the
Priority Order list: `steps`, `sleep`, `activity`, `stocks`,
`now-playing`, `weather`, `battery`, `event`, `commute`, `uv`,
`air-quality`, and so on.

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
- **Every network call has to respect the render budget.** A widget gets
  a short, hard time limit from iOS, and blowing it kills the render
  outright with "Received timeout when running script" (no error card, no
  partial content). `hasRenderBudget(reserveMs)` is the guard: optional
  fetches check it and skip rather than risk the whole widget, request
  timeouts are deliberately short, and anything that can repeat per-item
  (geocoding runs once per configured address) caches its failures so a
  miss doesn't cost a full request every render. If you add a network
  call, gate it the same way.
- `Live Context Bridge.js` deliberately duplicates a few small functions
  from `Live Context.js` (the cache file plumbing, mainly) instead of
  importing them, so a change in one script can't quietly break the
  other. If you ever change the cache entry shape in one file, update the
  other to match.

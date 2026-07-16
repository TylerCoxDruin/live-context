# Live Context

An "At a Glance" style Home Screen widget for iPhone, built with
[Scriptable](https://apps.apple.com/app/scriptable/id1405459188). It doesn't
just sit there showing the same thing all day. It checks your calendar,
your location, your battery, the weather, and shows whatever's actually
useful in that moment.

## Quick Start

1. Install Scriptable from the App Store. It's free.
2. Open Scriptable, tap **+**, name the script `Live Context`, and paste in
   everything from [`Live Context.js`](Live%20Context.js).
3. Grab a free API key from [OpenWeatherMap](https://openweathermap.org/api).
   The free tier is plenty. The widget still runs without one, you just
   won't get anything weather related.
4. Run the script once from inside Scriptable and choose **Edit Settings**.
   Drop your API key into **Weather > API Key**, and add your name under
   **Profile**.
5. Add the widget to your Home Screen: long-press an empty spot, tap
   **Edit Home Screen**, then **+**, search for **Scriptable**, pick a
   size, add it, tap the widget once, and set its **Script** to
   `Live Context`.

That's the whole setup. From here it'll show your weather day to day and
switch over automatically when something more important comes up, like an
event or low battery.

## What Makes It "Smart"

Rather than one fixed layout, the widget figures out what's worth showing
right now: an upcoming event, an active severe weather alert, low battery,
rain about to start, a birthday today, and a couple dozen other things. If
nothing else applies, it just falls back to a greeting and the current
weather. Every one of these can be switched on or off from **Edit
Settings**.

There's also a Wind Down mode. During a nightly window you set, it swaps
to a quiet, minimal dark screen instead of showing everything at once.

## Want More?

Check out [`ADVANCED.md`](ADVANCED.md) if you want to feed it live data
from Health or other apps through Shortcuts, give it a transparent
background that matches your wallpaper, reorder which info wins when
several things apply, put it on your Lock Screen, or dig into how the
script itself is built.

## License

MIT. Do whatever you want with it.

// Variables used by Scriptable.
// icon-color: green; icon-glyph: shield-alt;

// Permission Check — a standalone diagnostic script that exercises every
// permission-gated Scriptable API relevant to this project, one at a
// time, so each system "Allow / Don't Allow" prompt appears in turn
// instead of surprising you the first time some feature needs it. The
// exact same check is also available from Live Context's own main menu
// ("🔐 Check Permissions") — this standalone copy is here for anyone who
// wants to run just this, without opening the full widget.
//
// Location, Calendar, Reminders, and Photos are already used successfully
// elsewhere in this project (Live Context's geofencing/travel estimates,
// events, reminders-due state, and background image import; the blur
// utility's own Photos use), so those four are on solid ground. Contacts
// and Notifications aren't used anywhere else in this project — they're
// included here because they're common permissions Scriptable can
// request, but they're less battle-tested in this specific codebase, so
// if one behaves unexpectedly, that's the first place to look.
//
// Photos is the one check that can't be fully automated: there's no
// "just ask permission" call separate from actually picking a photo, so
// that step will open the photo picker — pick anything (or cancel), it
// doesn't matter which for the purposes of this check.

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

async function presentResult(name, granted) {
  const alert = new Alert();
  alert.title = granted ? "Access Granted" : "Access Not Granted";
  alert.message = granted
    ? `${name} is successfully active.`
    : `${name} isn't available — it was denied, or the system prompt didn't get a chance to appear.`;
  alert.addAction("Continue");
  await alert.presentAlert();
}

async function main() {
  const checks = [
    {
      name: "Location",
      run: async () => {
        await Location.current();
      },
    },
    {
      name: "Calendar (Events)",
      run: async () => {
        await Calendar.forEvents();
      },
    },
    {
      name: "Reminders",
      run: async () => {
        await Calendar.forReminders();
      },
    },
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
        notification.title = "Permission Check";
        notification.body = "This is a test notification — safe to dismiss.";
        await notification.schedule();
      },
    },
    {
      name: "Photos",
      run: async () => {
        await Photos.fromLibrary();
      },
    },
  ];

  const results = [];
  for (const check of checks) {
    const result = await checkPermission(check.name, check.run);
    results.push(result);
    await presentResult(result.name, result.granted);
  }

  const summary = new Alert();
  summary.title = "Permission Check Summary";
  summary.message = results
    .map((r) => `${r.granted ? "✅" : "❌"} ${r.name}`)
    .join("\n");
  summary.addAction("Done");
  await summary.presentAlert();

  Script.complete();
}

await main();

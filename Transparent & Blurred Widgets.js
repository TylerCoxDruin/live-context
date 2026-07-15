// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: layer-group;

// This script was created by Max Zeryck.

// The amount of blurring. Default is 150.
let blur = 150

// Exact per-device widget-slot geometry, keyed by the screenshot's pixel
// height. These are the long-established Max Zeryck measurements — pixel-
// accurate for the devices listed, which is what lets an iPhone crop line
// up seamlessly with the wallpaper behind the real widget. Values, all in
// screenshot pixels:
//   small  = side of a square Small widget
//   medium = width of a Medium/Large widget (both span the two columns)
//   large  = height of a Large widget
//   left / right       = x of the two widget columns
//   top / middle / bottom = y of the three widget rows
// Newer iPhones whose height isn't listed fall through to PHONE_FALLBACK
// below, which keeps Apple's exact widget aspect ratios and approximates
// the grid positions (the on-screen confirm step is the safety net there).
// Declared before any top-level code runs — this is a plain script, not a
// module, so a `const` referenced before its own declaration line executes
// would throw even though the functions using it are hoisted.
const PHONE_PIXELS = {
  "2778": { small: 510, medium: 1092, large: 1146, left: 96, right: 678, top: 246, middle: 882, bottom: 1518 },
  "2688": { small: 507, medium: 1080, large: 1137, left: 81, right: 654, top: 228, middle: 858, bottom: 1488 },
  "2532": { small: 474, medium: 1014, large: 1062, left: 78, right: 618, top: 231, middle: 819, bottom: 1407 },
  "2208": { small: 471, medium: 1044, large: 1071, left: 99, right: 672, top: 114, middle: 696, bottom: 1278 },
  "1792": { small: 338, medium: 720,  large: 758,  left: 54, right: 436, top: 160, middle: 580, bottom: 1000 },
  "1624": { small: 310, medium: 658,  large: 690,  left: 46, right: 394, top: 142, middle: 522, bottom: 902 },
  "1334": { small: 296, medium: 642,  large: 648,  left: 54, right: 400, top: 60,  middle: 412, bottom: 764 },
  "1136": { small: 282, medium: 584,  large: 622,  left: 30, right: 332, top: 59,  middle: 399, bottom: 399 },
  "2001": { small: 444, medium: 963,  large: 972,  left: 81, right: 600, top: 90,  middle: 618, bottom: 1146 },
  // 11 Pro / XS / X / 12 mini all share this height but differ slightly in
  // row positions, so this entry asks which one.
  "2436": {
    variants: true,
    x:    { small: 465, medium: 987, large: 1035, left: 69, right: 591, top: 213, middle: 783, bottom: 1353 },
    mini: { small: 465, medium: 987, large: 1035, left: 69, right: 591, top: 231, middle: 801, bottom: 1371 },
  },
}

// Fallback for iPhones not in PHONE_PIXELS (mostly 2022+ models). Fractions
// of screen width/height, averaged from the table's own ratios — aspect
// ratios are Apple's spec, positions are approximate.
const PHONE_FALLBACK = {
  small: 0.403, medium: 0.860, largeH: 0.418,
  cols: [0.070, 0.527],
  rows: [0.089, 0.321, 0.552],
}

// iPad geometry is approximate — iPadOS's grid varies by model, orientation,
// and icon-density setting with no single verified constant. Widget aspect
// ratios are still Apple's spec; the positions rely on the confirm step.
const IPAD_FALLBACK = {
  portrait:  { small: 0.220, medium: 0.455, largeH: 0.300, xl: 0.930,
               cols: [0.060, 0.370, 0.680], rows: [0.050, 0.270, 0.490, 0.710] },
  landscape: { small: 0.165, medium: 0.342, largeH: 0.300, xl: 0.700,
               cols: [0.050, 0.290, 0.530, 0.770], rows: [0.070, 0.360, 0.650] },
}

// Determine if user has taken the screenshot.
var message
message = "Before you start, go to your Home Screen and enter wiggle/edit mode (the widgets will show a subtle outline). Scroll to an empty page and take a screenshot. This works for iPhone or iPad."
let options = ["Continue to select image","Exit to take screenshot"]
let response = await generateAlert(message,options)

// Return if we need to exit.
if (response == 1) return

// Get the screenshot, then pick the crop by choosing device, widget size,
// and which lettered grid slot the widget sits in — the widget's size is
// fixed by Apple's per-device spec (exact for known iPhones), so the user
// only chooses the position. No numbers to type, no manual resizing.
let img = await Photos.fromLibrary()
let crop = await selectWidgetCrop(img)
if (!crop) return

await runExportFlow(img, crop, null)

// Many iPhones show a different wallpaper in Dark Mode than in Light Mode
// (iOS's own Light/Dark appearance wallpaper pair, or an automatic
// schedule) — a single crop only ever matches whichever mode the first
// screenshot was taken in, so it'll visibly mismatch the real Home Screen
// once the device switches modes. This offers to repeat the same crop
// position against a second, Dark Mode screenshot right away, rather than
// making the user re-run the whole script (and re-pick device/size/
// position) from scratch to get a matching pair.
message = "Would you like to also make a matching Dark Mode version? Switch your phone to Dark Mode, take a screenshot of the same empty page, then come back and continue."
const darkOptions = ["Yes — pick the Dark Mode screenshot", "No, I'm done"]
const wantsDark = await generateAlert(message, darkOptions)

if (wantsDark === 0) {
  const darkImg = await Photos.fromLibrary()
  let darkCrop = crop

  // A same-size screenshot means the same device/orientation, so the exact
  // same crop rect still lines up. A different size means it can't be
  // trusted to line up — re-run the position picker for this one instead
  // of silently cropping the wrong region.
  if (darkImg.size.width !== img.size.width || darkImg.size.height !== img.size.height) {
    await generateAlert(
      "That screenshot is a different size than the first one, so the saved position can't carry over automatically. Let's pick the position again for this one.",
      ["Continue"]
    )
    darkCrop = await selectWidgetCrop(darkImg)
    if (!darkCrop) { Script.complete(); return }
  }

  await runExportFlow(darkImg, darkCrop, "Dark Mode")
}

Script.complete()

// Prompts for blur style, crops (and optionally blurs) the image, then
// exports it. `variantLabel` is null for the primary/light run, or "Dark
// Mode" for the second — used only to word prompts and suggest a matching
// filename so the two exports don't get confused with each other.
async function runExportFlow(sourceImage, cropRect, variantLabel) {
  const suffix = variantLabel ? ` (${variantLabel})` : ""

  message = `Do you want a fully transparent widget, or a translucent blur effect?${suffix}`
  let blurOptions = ["Transparent","Light blur","Dark blur","Just blur"]
  let blurred = await generateAlert(message,blurOptions)

  // We always need the cropped image.
  let imgCrop = cropImage(sourceImage, cropRect)

  // If it's blurred, set the blur style.
  if (blurred) {
    const styles = ["", "light", "dark", "none"]
    const style = styles[blurred]
    imgCrop = await blurImage(sourceImage,imgCrop,style,cropRect)
  }

  message = `Your${suffix ? " " + variantLabel.toLowerCase() : ""} widget background is ready. Choose where to save the image:`
  const exportPhotoOptions = ["Export to the Photos app","Export to the Files app"]
  const exportToFiles = await generateAlert(message,exportPhotoOptions)

  const suggestedName = variantLabel === "Dark Mode" ? "live-context-background-dark" : "live-context-background"

  if (exportToFiles) {
    await DocumentPicker.exportImage(imgCrop, suggestedName)
  } else {
    Photos.save(imgCrop)
  }
}

// Generate an alert with the provided array of options.
async function generateAlert(message,options) {
  
  let alert = new Alert()
  alert.message = message
  
  for (const option of options) {
    alert.addAction(option)
  }
  
  let response = await alert.presentAlert()
  return response
}

// A simple button list with a Cancel — returns the chosen index, or -1 for
// Cancel. Used for every step of the crop flow so nothing needs typing.
async function pickFrom(message, options) {
  const alert = new Alert()
  alert.message = message
  for (const option of options) alert.addAction(option)
  alert.addCancelAction("Cancel")
  return await alert.presentAlert()
}

// Turns an exact PHONE_PIXELS entry into the uniform geometry shape the rest
// of the flow uses. Duplicate row y's (e.g. the SE, whose "middle" and
// "bottom" coincide) are collapsed so it doesn't offer the same slot twice.
function geometryFromExact(e) {
  const rows = [e.top, e.middle, e.bottom].filter((y, i, all) => all.indexOf(y) === i)
  return {
    sizes: {
      small:  { w: e.small,  h: e.small },
      medium: { w: e.medium, h: e.small },
      large:  { w: e.medium, h: e.large },
    },
    cols: [e.left, e.right],
    rows,
  }
}

// Builds the same geometry shape from fractions of the screenshot, for
// devices without an exact table entry. Widget aspect ratios follow Apple's
// spec (Small square, Medium/Extra-Large 2:1 wide); positions are the
// approximate part.
function geometryFromFractions(W, H, f, includeExtraLarge) {
  const smallSide = f.small * W
  const sizes = {
    small:  { w: smallSide,   h: smallSide },
    medium: { w: f.medium * W, h: smallSide },
    large:  { w: f.medium * W, h: f.largeH * H },
  }
  if (includeExtraLarge && f.xl) {
    sizes.extraLarge = { w: f.xl * W, h: f.largeH * H }
  }
  return {
    sizes,
    cols: f.cols.map((c) => c * W),
    rows: f.rows.map((r) => r * H),
  }
}

// Enumerates every valid slot for a given widget size as { letter, label,
// x, y, w, h } (pixels). A Small sits in any row×column cell; Medium/Extra-
// Large span the full width at a given row; Large occupies two rows so its
// top edge anchors at the first ("Top") or second ("Bottom") row.
function widgetPositions(geometry, sizeKey) {
  const { cols, rows, sizes } = geometry
  const rowNames = rows.length === 2 ? ["Top", "Bottom"]
    : rows.length === 3 ? ["Top", "Middle", "Bottom"]
    : rows.map((_, i) => `Row ${i + 1}`)
  const colNames = cols.length === 2 ? ["Left", "Right"] : cols.map((_, i) => `Col ${i + 1}`)

  const out = []
  if (sizeKey === "small") {
    rows.forEach((y, ri) => cols.forEach((x, ci) => {
      out.push({ label: `${rowNames[ri]} ${colNames[ci]}`, x, y, w: sizes.small.w, h: sizes.small.h })
    }))
  } else if (sizeKey === "medium") {
    rows.forEach((y, ri) => out.push({ label: rowNames[ri], x: cols[0], y, w: sizes.medium.w, h: sizes.medium.h }))
  } else if (sizeKey === "large") {
    const anchors = rows.length >= 2
      ? [{ y: rows[0], label: "Top" }, { y: rows[1], label: "Bottom" }]
      : [{ y: rows[0], label: "Top" }]
    anchors.forEach((a) => out.push({ label: a.label, x: cols[0], y: a.y, w: sizes.large.w, h: sizes.large.h }))
  } else if (sizeKey === "extraLarge" && sizes.extraLarge) {
    rows.forEach((y, ri) => out.push({ label: rowNames[ri], x: cols[0], y, w: sizes.extraLarge.w, h: sizes.extraLarge.h }))
  }

  const letters = "ABCDEFGHIJKLMNOPQR"
  return out.map((p, i) => ({ ...p, letter: letters[i] || String(i + 1) }))
}

// Draws the screenshot with every candidate slot outlined and lettered, so
// the user can see where each option lands on their own wallpaper. When
// `highlightLetter` is set, that slot is drawn boldly and the rest are
// dimmed — used for the final confirm view.
function drawGridPreview(image, positions, highlightLetter) {
  const W = image.size.width
  const H = image.size.height
  const draw = new DrawContext()
  draw.size = new Size(W, H)
  draw.opaque = true
  draw.drawImageAtPoint(image, new Point(0, 0))

  const fontSize = Math.round(W * 0.05)
  draw.setFont(Font.boldSystemFont(fontSize))
  draw.setTextAlignedCenter()

  for (const p of positions) {
    const active = highlightLetter && p.letter === highlightLetter
    const rect = new Rect(p.x, p.y, p.w, p.h)
    draw.setFillColor(new Color("#4da3ff", active ? 0.45 : 0.18))
    draw.fillRect(rect)
    draw.setStrokeColor(new Color(active ? "#ffffff" : "#4da3ff", 1))
    draw.setLineWidth(active ? 10 : 5)
    draw.strokeRect(rect)
    draw.setTextColor(active ? Color.white() : new Color("#ffffff", 0.85))
    draw.drawTextInRect(p.letter, new Rect(p.x, p.y + p.h / 2 - fontSize, p.w, fontSize * 1.6))
  }

  return draw.getImage()
}

function clampInt(value, min, max) {
  return Math.max(min, Math.min(Math.round(value), max))
}

// The whole crop selector: pick device -> (which iPhone, if ambiguous) ->
// widget size -> tap the lettered box the widget sits in -> confirm. The
// widget's SIZE comes from Apple's per-device spec; the user only chooses
// WHERE. No typing, no manual resizing. Returns { x, y, w, h } in
// screenshot pixels, or null if cancelled.
async function selectWidgetCrop(image) {
  const W = image.size.width
  const H = image.size.height

  const deviceIdx = await pickFrom("What device is this screenshot from?", ["iPhone", "iPad"])
  if (deviceIdx < 0) return null
  const isPad = deviceIdx === 1

  let geometry
  if (isPad) {
    const orientation = W > H ? "landscape" : "portrait"
    geometry = geometryFromFractions(W, H, IPAD_FALLBACK[orientation], true)
  } else {
    const entry = PHONE_PIXELS[String(H)]
    if (entry && entry.variants) {
      const vi = await pickFrom("Which iPhone is this? (They differ slightly.)", ["iPhone 12 mini", "iPhone 11 Pro, XS, or X"])
      if (vi < 0) return null
      geometry = geometryFromExact(vi === 0 ? entry.mini : entry.x)
    } else if (entry) {
      geometry = geometryFromExact(entry)
    } else {
      geometry = geometryFromFractions(W, H, PHONE_FALLBACK, false)
    }
  }

  const sizeOptions = isPad ? ["Small", "Medium", "Large", "Extra Large"] : ["Small", "Medium", "Large"]
  const sizeIdx = await pickFrom("What size is your widget?", sizeOptions)
  if (sizeIdx < 0) return null
  const sizeKey = ["small", "medium", "large", "extraLarge"][sizeIdx]

  const positions = widgetPositions(geometry, sizeKey)
  if (positions.length === 0) return null

  while (true) {
    await QuickLook.present(drawGridPreview(image, positions, null), false)
    const pickIdx = await pickFrom(
      "Your screenshot just opened with lettered boxes. Which box is your widget sitting in?",
      positions.map((p) => `${p.letter}   ${p.label}`)
    )
    if (pickIdx < 0) return null
    const p = positions[pickIdx]

    await QuickLook.present(drawGridPreview(image, positions, p.letter), false)
    const confirm = await pickFrom("Is your widget inside the highlighted (white) box?", ["Yes — use this", "No — pick again"])
    if (confirm < 0) return null
    if (confirm === 0) {
      const x = clampInt(p.x, 0, W - 1)
      const y = clampInt(p.y, 0, H - 1)
      return { x, y, w: clampInt(p.w, 1, W - x), h: clampInt(p.h, 1, H - y) }
    }
  }
}

// Crop an image into the specified rect.
function cropImage(image, cropRect) {

  let draw = new DrawContext()
  let rect = new Rect(cropRect.x,cropRect.y,cropRect.w,cropRect.h)
  draw.size = new Size(rect.width, rect.height)

  draw.drawImageAtPoint(image,new Point(-rect.x, -rect.y))
  return draw.getImage()
}

async function blurImage(img,imgCrop,style,cropRect) {
  const js = `
  /*

  StackBlur - a fast almost Gaussian Blur For Canvas

  Version:   0.5
  Author:    Mario Klingemann
  Contact:   mario@quasimondo.com
  Website:  http://quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
  Twitter:  @quasimondo

  In case you find this class useful - especially in commercial projects -
  I am not totally unhappy for a small donation to my PayPal account
  mario@quasimondo.de

  Or support me on flattr: 
  https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

  Copyright (c) 2010 Mario Klingemann

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
  */

  var mul_table = [
          512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
          454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
          482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
          437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
          497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
          320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
          446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
          329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
          505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
          399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
          324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
          268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
          451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
          385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
          332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
          289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];
        
   
  var shg_table = [
         9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
      17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
      19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
      21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
      22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
      23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 
      23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
      24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

  function stackBlurCanvasRGB( id, top_x, top_y, width, height, radius )
  {
    if ( isNaN(radius) || radius < 1 ) return;
    radius |= 0;
  
    var canvas  = document.getElementById( id );
    var context = canvas.getContext("2d");
    var imageData;
  
    try {
      try {
      imageData = context.getImageData( top_x, top_y, width, height );
      } catch(e) {
    
      // NOTE: this part is supposedly only needed if you want to work with local files
      // so it might be okay to remove the whole try/catch block and just use
      // imageData = context.getImageData( top_x, top_y, width, height );
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        imageData = context.getImageData( top_x, top_y, width, height );
      } catch(e) {
        alert("Cannot access local image");
        throw new Error("unable to access local image data: " + e);
        return;
      }
      }
    } catch(e) {
      alert("Cannot access image");
      throw new Error("unable to access image data: " + e);
    }
      
    var pixels = imageData.data;
      
    var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
    r_out_sum, g_out_sum, b_out_sum,
    r_in_sum, g_in_sum, b_in_sum,
    pr, pg, pb, rbs;
      
    var div = radius + radius + 1;
    var w4 = width << 2;
    var widthMinus1  = width - 1;
    var heightMinus1 = height - 1;
    var radiusPlus1  = radius + 1;
    var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;
  
    var stackStart = new BlurStack();
    var stack = stackStart;
    for ( i = 1; i < div; i++ )
    {
      stack = stack.next = new BlurStack();
      if ( i == radiusPlus1 ) var stackEnd = stack;
    }
    stack.next = stackStart;
    var stackIn = null;
    var stackOut = null;
  
    yw = yi = 0;
  
    var mul_sum = mul_table[radius];
    var shg_sum = shg_table[radius];
  
    for ( y = 0; y < height; y++ )
    {
      r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
    
      r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
      g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
      b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
    
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
    
      stack = stackStart;
    
      for( i = 0; i < radiusPlus1; i++ )
      {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
    
      for( i = 1; i < radiusPlus1; i++ )
      {
        p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
        r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
        g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
        b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
      
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
      
        stack = stack.next;
      }
    
    
      stackIn = stackStart;
      stackOut = stackEnd;
      for ( x = 0; x < width; x++ )
      {
        pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
        pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
        pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;
      
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
      
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
      
        p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
      
        r_in_sum += ( stackIn.r = pixels[p]);
        g_in_sum += ( stackIn.g = pixels[p+1]);
        b_in_sum += ( stackIn.b = pixels[p+2]);
      
        r_sum += r_in_sum;
        g_sum += g_in_sum;
        b_sum += b_in_sum;
      
        stackIn = stackIn.next;
      
        r_out_sum += ( pr = stackOut.r );
        g_out_sum += ( pg = stackOut.g );
        b_out_sum += ( pb = stackOut.b );
      
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
      
        stackOut = stackOut.next;

        yi += 4;
      }
      yw += width;
    }

  
    for ( x = 0; x < width; x++ )
    {
      g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
    
      yi = x << 2;
      r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
      g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
      b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
    
      r_sum += sumFactor * pr;
      g_sum += sumFactor * pg;
      b_sum += sumFactor * pb;
    
      stack = stackStart;
    
      for( i = 0; i < radiusPlus1; i++ )
      {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }
    
      yp = width;
    
      for( i = 1; i <= radius; i++ )
      {
        yi = ( yp + x ) << 2;
      
        r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
        g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
        b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
      
        r_in_sum += pr;
        g_in_sum += pg;
        b_in_sum += pb;
      
        stack = stack.next;
    
        if( i < heightMinus1 )
        {
          yp += width;
        }
      }
    
      yi = x;
      stackIn = stackStart;
      stackOut = stackEnd;
      for ( y = 0; y < height; y++ )
      {
        p = yi << 2;
        pixels[p]   = (r_sum * mul_sum) >> shg_sum;
        pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
        pixels[p+2] = (b_sum * mul_sum) >> shg_sum;
      
        r_sum -= r_out_sum;
        g_sum -= g_out_sum;
        b_sum -= b_out_sum;
      
        r_out_sum -= stackIn.r;
        g_out_sum -= stackIn.g;
        b_out_sum -= stackIn.b;
      
        p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
      
        r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
        g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
        b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
      
        stackIn = stackIn.next;
      
        r_out_sum += ( pr = stackOut.r );
        g_out_sum += ( pg = stackOut.g );
        b_out_sum += ( pb = stackOut.b );
      
        r_in_sum -= pr;
        g_in_sum -= pg;
        b_in_sum -= pb;
      
        stackOut = stackOut.next;
      
        yi += width;
      }
    }
  
    context.putImageData( imageData, top_x, top_y );
  
  }

  function BlurStack()
  {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
  }
  
  // https://gist.github.com/mjackson/5311256

  function rgbToHsl(r, g, b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }

      return [h, s, l];
  }

  function hslToRgb(h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          var hue2rgb = function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  function lightBlur(hsl) {
  
    // Adjust the luminance.
    let lumCalc = 0.35 + (0.3 / hsl[2]);
    if (lumCalc < 1) { lumCalc = 1; }
    else if (lumCalc > 3.3) { lumCalc = 3.3; }
    const l = hsl[2] * lumCalc;
    
    // Adjust the saturation. 
    const colorful = 2 * hsl[1] * l;
    const s = hsl[1] * colorful * 1.5;
    
    return [hsl[0],s,l];
    
  }
  
  function darkBlur(hsl) {

    // Adjust the saturation. 
    const colorful = 2 * hsl[1] * hsl[2];
    const s = hsl[1] * (1 - hsl[2]) * 3;
    
    return [hsl[0],s,hsl[2]];
    
  }

  // Set up the canvas.
  const img = document.getElementById("blurImg");
  const canvas = document.getElementById("mainCanvas");

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  canvas.style.width  = w + "px";
  canvas.style.height = h + "px";
  canvas.width = w;
  canvas.height = h;

  const context = canvas.getContext("2d");
  context.clearRect( 0, 0, w, h );
  context.drawImage( img, 0, 0 );
  
  // Get the image data from the context.
  var imageData = context.getImageData(0,0,w,h);
  var pix = imageData.data;
  
  // Set the image function, if any.
  var imageFunc;
  var style = "${style}";
  if (style == "dark") { imageFunc = darkBlur; }
  else if (style == "light") { imageFunc = lightBlur; }

  for (let i=0; i < pix.length; i+=4) {

    // Convert to HSL.
    let hsl = rgbToHsl(pix[i],pix[i+1],pix[i+2]);
    
    // Apply the image function if it exists.
    if (imageFunc) { hsl = imageFunc(hsl); }
  
    // Convert back to RGB.
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
  
    // Put the values back into the data.
    pix[i] = rgb[0];
    pix[i+1] = rgb[1];
    pix[i+2] = rgb[2];

  }

  // Draw over the old image.
  context.putImageData(imageData,0,0);

  // Blur the image.
  stackBlurCanvasRGB("mainCanvas", 0, 0, w, h, ${blur});
  
  // Perform the additional processing for dark images.
  if (style == "dark") {
  
    // Draw the hard light box over it.
    context.globalCompositeOperation = "hard-light";
    context.fillStyle = "rgba(55,55,55,0.2)";
    context.fillRect(0, 0, w, h);

    // Draw the soft light box over it.
    context.globalCompositeOperation = "soft-light";
    context.fillStyle = "rgba(55,55,55,1)";
    context.fillRect(0, 0, w, h);

    // Draw the regular box over it.
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "rgba(55,55,55,0.4)";
    context.fillRect(0, 0, w, h);
  
  // Otherwise process light images.
  } else if (style == "light") {
    context.fillStyle = "rgba(255,255,255,0.4)";
    context.fillRect(0, 0, w, h);
  }

  // Return a base64 representation.
  canvas.toDataURL(); 
  `
  
  // Convert the images and create the HTML.
  let blurImgData = Data.fromPNG(img).toBase64String()
  let html = `
  <img id="blurImg" src="data:image/png;base64,${blurImgData}" />
  <canvas id="mainCanvas" />
  `
  
  // Make the web view and get its return value.
  let view = new WebView()
  await view.loadHTML(html)
  let returnValue = await view.evaluateJavaScript(js)
  
  // Remove the data type from the string and convert to data.
  let imageDataString = returnValue.slice(22)
  let imageData = Data.fromBase64String(imageDataString)
  
  // Convert to image and crop before returning.
  let imageFromData = Image.fromData(imageData)
  return cropImage(imageFromData, cropRect)
}

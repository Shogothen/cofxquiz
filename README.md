# Cofinity-X Pub Quiz Night

A two-screen quiz display for the internal pub quiz: a **control** surface on
your laptop and a **beamer** surface on the projector. Both run on the same
computer and sync live, no server required. Built as a static site for GitHub
Pages.

## What it does

- **Control** (`index.html`) — your laptop: pick the round, step through
  questions, run the timer, reveal the answer, award points. You read the
  questions out loud; the screen shows them so teams can read along.
- **Beamer** (`beamer.html`) — the projector: big question + timer, or the live
  scoreboard. Updates instantly as you act in control.
- **Question editor** — edit the whole question set in the browser (no code).
  Saved in the browser, so your set is there next time.
- **Fixed scoring** — one point per correct answer (`+1` button per team).

## Running it on the night

1. Open `index.html` on your laptop.
2. Click **Open beamer window**, drag that window to the projector, press
   **F11** for fullscreen.
3. Keep the control window on your laptop screen. Everything you do there
   mirrors to the beamer.

Both windows must be the **same browser on the same computer** — they sync via
BroadcastChannel, which is local to one machine. (For two separate computers
you would need a small relay server; out of scope for this build.)

### Keyboard shortcuts (control window)

| Key        | Action                          |
|------------|---------------------------------|
| Space      | Start / pause timer             |
| → / ←      | Next / previous question        |
| A          | Reveal / hide answer            |
| S          | Toggle question ↔ scoreboard    |

## Editing questions

Click **Edit questions** in the top bar. Add, remove, or change questions and
assign each to a round, then **Save**. The set is stored in your browser
(`localStorage`). **Reset to defaults** restores the starter set.

For a quick one-off change during the quiz you can also type into the
**Override question / answer** fields without touching the saved set.

## Deploy to GitHub Pages

1. Create a repo (e.g. `cx-pub-quiz`) and push these files to the root.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `main`, folder `/ (root)`.
3. After a minute it's live at
   `https://<your-user>.github.io/cx-pub-quiz/`.

That URL is the control surface. The beamer window opens automatically from the
button; no separate link needed.

## Files

```
index.html        control surface
beamer.html       projector surface
assets/
  style.css       shared Cofinity-X styling
  shared.js       state model, sync channel, defaults
  control.js      control logic
  beamer.js       beamer render
```

## Brand

Light grey canvas with the dot grid, black Inter headlines, the orange→red
gradient accent, rounded pill buttons — taken from cofinity-x.com. To match the
official hex values exactly, edit the `--o1 / --o2 / --o3` variables at the top
of `assets/style.css`.

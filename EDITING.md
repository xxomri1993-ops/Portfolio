# Editing this site

Everything you'll want to change is in **`index.html`**, as plain text. Search that
file for `EDIT` and you'll land on every editable piece — each one has a comment
above it explaining what it does.

You don't need to install anything, and you don't need me.

---

## How to make a change

1. Go to the repo on github.com and click **`index.html`**.
2. Click the **pencil icon** (top right of the file) to edit in the browser.
3. Make your change.
4. Click **Commit changes** (green button), then **Commit changes** again in the box.

The site rebuilds itself and goes live about a minute later. You can watch it happen
in the **Actions** tab.

> **Tip:** if something looks wrong after a change, open the **Actions** tab. A green
> tick means your change is live. Also try a hard refresh — `Ctrl+Shift+R`, or
> `Cmd+Shift+R` on a Mac — since browsers hold on to the old version for a while.

---

## Adding, removing or moving a video

Each video is **one line**. Find the section you want and copy an existing line:

```html
<article class="video-card" data-yt="dQw4w9WgXcQ" data-title="Product — Campaign"></article>
```

| What | What to put |
|---|---|
| `data-yt` | The video's ID — the part of the YouTube link after `/shorts/` or `?v=` or `youtu.be/`. **Not** the whole link. |
| `data-title` | The label under the card. |
| `data-orientation` | Leave it out for vertical (Shorts). Add `data-orientation="wide"` for a normal landscape video. Also accepts `"square"` and `"portrait"`. |

**To find a video ID:** from `https://youtube.com/shorts/K6O6zPC6_rU?feature=share`
the ID is `K6O6zPC6_rU` — everything between the last `/` and the `?`.

- **Add a video** → copy a line, paste it below, change the ID and title.
- **Remove one** → delete its line.
- **Reorder** → move lines up or down. The first card is what people see first.
- **Move between sections** → cut the line and paste it into the other section's
  `<div class="carousel-track">`.

The "2 videos / 8 videos" counts update themselves. So do the arrows — they only
appear when a row has more than fits on screen.

**The video must be Public or Unlisted on YouTube.** Private videos won't play, and
neither will videos with embedding turned off in YouTube Studio.

---

## Grid or scrolling row

Each section is one or the other, set by a single class in `index.html`:

```html
<div class="carousel carousel--grid">   <!-- grid: everything visible at once -->
<div class="carousel">                  <!-- row: scrolls sideways, loops forever -->
```

Add or delete `carousel--grid` to switch. Adding `carousel--no-labels` alongside it
hides the caption under each card, for when the thumbnails speak for themselves —
the title is still read out to screen readers and still appears when the video opens.

The grid is 4 across on a computer,
3 on a tablet, 2 on a phone, and the scroll arrows hide themselves since there
is nothing to scroll. Cards in a grid are noticeably larger.

A grid suits a section where you want every video seen. A row suits a long list
you would rather not have take over the page.

---

## The video playing behind your name

In the hero section, near the top:

```html
<iframe class="bg-yt"
  src="https://www.youtube.com/embed/Umf475f98Ns?autoplay=1&mute=1&loop=1&playlist=Umf475f98Ns&...
```

Replace `Umf475f98Ns` **in both places** on that line — once after `embed/`, once
after `playlist=`. Both have to match or it plays once and stops instead of looping.

If you swap in a **vertical** video, add `bg-yt--vertical` to the class:
`class="bg-yt bg-yt--vertical"`.

---

## The statement between the hero and the work

```html
<p class="statement-text">I make ads that look like <em>films</em> and perform like ads.</p>
<p class="statement-note">In-house at <strong>Particle For Men</strong> — ...</p>
```

Rewrite either line freely. Whatever sits inside `<em>` is set in the amber serif
italic, so put the word you want emphasised there — one word works better than
several. `<strong>` makes text bold and bright.

Keep it short. This line is set very large, and a long sentence at that size runs
across the screen and loses its punch.

## Special characters

Some characters are written in code form so they display reliably:

| You want | Type this |
|---|---|
| é (as in Gravité) | `&eacute;` |
| — (long dash) | `&mdash;` |
| – (shorter dash) | `&ndash;` |
| × (times sign) | `&times;` |
| & (ampersand) | `&amp;` |

Regular apostrophes and quotes are fine as-is.

---

## Turning on the social links

They're written but commented out at the bottom of `index.html`. Delete the
`<!--` line above them and the `-->` line below, then swap `YOUR-HANDLE` for your
real usernames. Delete any line for a platform you don't use.

---

## What NOT to touch

- Anything in `css/` or `js/` — that's how it looks and behaves, not what it says.
- `id="..."` and `class="..."` — these connect the text to its styling. Change the
  words between tags, not the tags.
- `.github/workflows/deploy.yml` — that's what publishes the site.

**If you break something:** nothing is lost. Every version is saved. On github.com go
to the **Commits** list, find the last good one, and you can restore it — or just ask
me and I'll put it back in a minute.

---

## Quick reference

| To change | Search `index.html` for |
|---|---|
| Your name, top left | `class="logo"` |
| Menu labels | `class="nav-link"` |
| Big opening headline + tagline | `class="hero-name"` |
| The big statement line | `class="statement-text"` |
| Tool list | `class="tools-list"` |
| Section headings | `class="section-title"` |
| The videos | `class="video-card"` |
| Grid vs scrolling row | `class="carousel"` |
| The four process steps | `class="process-step"` |
| Email, phone, WhatsApp | `class="contact-link"` |
| Browser tab title / link preview | the top of the file |

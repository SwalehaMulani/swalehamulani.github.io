# Swaleha Mulani — personal website

A single-page academic profile: plain HTML, CSS and a little JavaScript, with no build step.
It runs on GitHub Pages as-is.

```
index.html          all page content
assets/style.css    colours, fonts, layout (light + dark theme)
assets/main.js      theme toggle, nav highlight, 3D hero animation
assets/favicon.svg  browser-tab icon
```

## Preview locally

Double-click `index.html`, or run `python3 -m http.server` in this folder and open http://localhost:8000.

## Publish on GitHub Pages

1. Sign in at https://github.com and create a **new public repository** named exactly
   `<your-username>.github.io` (for example `swalehamulani.github.io`).
2. Upload the files:
   - **In the browser:** on the new repo page click *uploading an existing file*, drag in
     everything in this folder (including the `assets` folder and `.nojekyll`), and commit.
   - **Or with git:**
     ```sh
     git init
     git add .
     git commit -m "Initial site"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
     git push -u origin main
     ```
3. In the repo go to **Settings → Pages**. Under *Build and deployment*, choose
   **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute or two the site is live at `https://<your-username>.github.io`.

## Updating content

Everything is in `index.html`, one block per section (Research, Publications, Talks, …).
To add a paper, copy an existing `<li class="pub">…</li>` block and edit it. Numbering is automatic.
To add a talk, copy a `<li>` in the `timeline` list.

The accent colour is `--accent` near the top of `assets/style.css`.

# SeCo

A icon and color search library for your mockups and projects. Utilizes library from simpleicons.org. 

## 💫 Features

✨ Import brands primary colour

✨ Place SVG Brand Logos/Icons

✨ Sort alphabetically or by colour

✨ Quick Search / Auto complete

## 📦 Development
- Clone Repo
- First run `yarn` to install packages & dependencies
- Then, with hopefully no errors, run `yarn dev` to start running the plugin.
- Run the plugin in Figma to test (be sure to have that console open, just in case).

> For outdated packages, run `yarn outdated` to see what is upgradable, deprecated, etc.

---

## ✅ To Do
- cleanup and componentize code
- ~~Fix Favourites (currently does not store to local storage)~~
  - ~~Re-Do Favourites Style; right now a user can add many favourites and they will overflow the main viewing window.~~
- ~~implementing darkmode/theme support~~
- ~~Pinned or Favourites option~~
- ~~When placing icon, change position based on last icon placement~~
  - Though techincally fixed, the edge case to account for is when there is nothing selected, icons will always populate on 0 for x and y. Need context of shapes atop shapes.
- ~~reskin to flow more like Figma, and less like original application.~~
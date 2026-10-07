# Kiagus Fathur Rahman — Full Static Portfolio (GitHub Pages)

Static copy of the portfolio **and** all HSB dashboard demos.  
**No Node.js / no `portfolio.js`** — works on GitHub Pages.

## Structure

```
Github-Portfolio/
├── index.html                 ← portfolio landing
├── images/                    ← project screenshots
├── assets/
│   └── mock-socket.js         ← fake Socket.IO (dummy live numbers)
├── hsb/
│   ├── lpa.html, ect.html, drs.html, pd.html, ras.html, isr.html, tlm.html, ...
│   ├── drs/                   ← all DRS reports
│   └── tlm/
│       └── dev-mode.html
└── README.md
```

## Local preview

```bash
cd Github-Portfolio
python -m http.server 8080
```

Open http://localhost:8080

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload **all contents** of this folder to the **repo root** (so `index.html` is at the root).
3. **Settings → Pages**
   - Source: Deploy from a branch  
   - Branch: `main`  
   - Folder: `/ (root)`
4. Site URL: `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Git commands (example)

```bash
cd Github-Portfolio
git init
git add .
git commit -m "Full static portfolio + HSB demos"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Notes

- Dummy data is generated in the browser via `assets/mock-socket.js`.
- If the repo is a **project site** (`username.github.io/repo/`), keep using relative links (already set).
- For a user site (`username.github.io`), put these files at the root of that repo.

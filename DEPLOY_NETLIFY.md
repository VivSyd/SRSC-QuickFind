# SRSC App Mobile Deploy (Netlify)

## 1) Build deploy folder
Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\dasku\OneDrive\Documents\New project\scripts\build-dist.ps1"
```

This creates:

`C:\Users\dasku\OneDrive\Documents\New project\dist`

## 2) Publish to Netlify
1. Open [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this folder into the page:
   `C:\Users\dasku\OneDrive\Documents\New project\dist`
3. Netlify gives you a live HTTPS URL:
   `https://<your-site-name>.netlify.app`

## 3) Install on mobile
1. Open the Netlify URL on your phone.
2. In browser menu, choose **Add to Home Screen**.
3. SRSC App opens like a mobile app (PWA).

## Notes
- `manifest.webmanifest` and `sw.js` are already configured.
- App icon assets are already generated (`192` and `512`).

## GitHub Pages Setup (SRSC App)

### Option 1 (Recommended): publish from `/docs`
1. Push this whole folder to a GitHub repo.
2. In GitHub repo: `Settings` -> `Pages`.
3. Source: `Deploy from branch`.
4. Branch: `main` and folder: `/docs`.
5. Save.

Your live URL will be:
`https://<your-github-username>.github.io/<repo-name>/`

### Option 2: publish only `dist`
If you upload only the `dist` folder contents into repo root, set Pages folder to `/root`.

### Notes
- `.nojekyll` is already added.
- Build label in app header: `Build 2026.04.13.3`.

# Repository Guidelines

## Project Structure & Module Organization
- `scripts/`: POSIX shell exercises. Each script is related to an exercise. Each exercise will initialize an empty git repository and execute a series of commands that will put the user in a specific scenario, asking them to fix the situation.
- `web/`: React + Vite UI. See `web/*.jsx` and `web/vite.config.js`.
- `web/exercises.schema.json`: Exercise data schema.
- `web/exercises.db.json`: The list of exercises (file database).
- `file_server/`: Small Express server (`index.js`) used by the training environment.
- `docker/` + `docker-compose.yaml`: ShellInABox terminal, user setup, and services wiring.
- `docs/architecture.md`: Overall architecture and technical explanations.
- `docs/guide.md`: A user guide explaining how the program works.
- Generated at runtime: `workspace/`, `.git-repos/` (safe to delete when resetting exercises).

## Build, Test, and Development Commands
- Start full environment: `docker compose up --build`
- Dev frontend locally: `cd web && npm ci && npm run dev`
- Run file server: `cd file_server && npm ci && node index.js`
- Tests: none formal yet; validate exercises manually with `git lg` and `git s` aliases.

## Coding Style & Naming Conventions
- Shell: POSIX-compatible, `set -e` for scripts, snake_case file names (e.g., `undo_pushed_range_commits.sh`). Prefer small functions and clear echo prompts.
- JS/React: 2-space indent, camelCase variables, PascalCase components, but snake case file names (e.g., `hints.component.jsx`). Keep components small and pure.
- Filenames: React components `*.jsx`; CSS as `*.css`. Keep exercise data in `web/*.json` consistent with `web/exercise.shema.json`.
- Do not put comments that do not add anything significant for understanding the code.

## Testing Guidelines
- To determine later

## Commit & Pull Request Guidelines
- Do not perform any commit or pull actions

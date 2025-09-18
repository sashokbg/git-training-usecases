# Repository Guidelines

## Project Structure & Module Organization
- `scripts/`: POSIX shell exercises. Each script is related to an exercise. Each exercise will initialize an empty git repository and execute a series of commands that will put the user in a specific scenario, asking them to fix the situation.
- `web/`: React + Vite UI. See `web/*.jsx` and `web/vite.config.js`.
- `web/resources/exercise.schema.json`: Exercise data schema.
- `web/resources/exercises.db.json`: The list of exercises (file database).
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
- Avoid short variable names example: instead of "m", use "match", instead of "idx", use "index" etc

## Testing Guidelines
- To determine later
- You have a browser mcp tool at your disposal, when making visual edits, open the browser at http://localhost:5173/ to verify things are working as expected.

## Commit & Pull Request Guidelines
- Do not perform any commit or pull actions

## Exercise Migration Playbook

- Goal: Migrate a shell exercise from `scripts/*.sh` into the web DB at `web/resources/exercises.db.json` following `web/resources/exercise.schema.json`.
- Keep changes minimal and consistent with existing entries; do not reformat unrelated JSON.

### Steps
- Review the target script in `scripts/` to understand the scenario and commands run.
- Add a new object entry to `web/resources/exercises.db.json` with the fields below.
- Use concise, user-facing wording similar to existing entries.
- Validate JSON after editing (e.g., `node -e "JSON.parse(require('fs').readFileSync('web/resources/exercises.db.json','utf8'))"`).
- Optionally run the UI to sanity check rendering: `cd web && npm ci && npm run dev` then open http://localhost:5173/.

### Entry Fields
- `exercise_title`: Short, descriptive title (e.g., "Detached Head").
- `exercise_description`: Array of brief lines explaining the scenario and goal.
- `command_history`: Key command(s) the exercise revolves around (keep minimal).
- `script`: Exact script filename from `scripts/` (e.g., `detached_head.sh`).
- `hints`: 3–5 actionable hints. Start broad, then reveal specific tips. Prefer verbs: "Use", "Check", "Try".
- `checks`: Array of objects, each with:
  - `name`: User-friendly label of what is being verified.
  - `explanation`: Array with a short explanation of the intent.
  - `command`: Shell command returning exit code 0 on success (non-zero fails). Keep robust and self-contained.

### Checks Design Tips
- Prefer simple primitives:
  - Confirm branch/HEAD state: `git rev-parse --abbrev-ref HEAD`.
  - Confirm commit presence: grep commit subjects from `git log` or `git rev-list --all --pretty=%s`.
  - Confirm file content: `grep -q` exact lines; confirm files exist with `test -f`.
  - For split commits, inspect diffs: `git show -U0 <rev> -- <file>` and grep added lines.
- Make ordering flexible when reasonable (e.g., accept either HEAD/HEAD~1 mapping).
- Avoid brittle counts unless necessary; prefer presence checks and explicit messages on failure.
- Ensure commands run within the prepared workspace repo created by the script.

### Validation Checklist
- JSON parses successfully.
- `script` matches an existing file under `scripts/` and mirrors its scenario.
- Hints are informative but not spoilers unless a final hint explicitly is.
- Checks pass when the exercise is solved and fail otherwise; double-check edge cases.
- Keep naming, tone, and formatting consistent with existing DB entries.

### Codex CLI Workflow Notes
- Use small, clear plans and grouped preambles when running commands.
- Prefer `rg` for searching and read files in <=250-line chunks.
- Do not commit; use patch application only for scoped changes.
- Keep edits surgical; do not refactor unrelated content.

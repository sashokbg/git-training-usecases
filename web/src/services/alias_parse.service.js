/**
 * AliasImportService
 * Parses a user's .gitconfig (or just the [alias] section) and applies
 * aliases into the exercise shell using `git config --global alias.* ...`.
 *
 * Usage (simple):
 *   const svc = new AliasImportService();
 *   const { aliases } = svc.parseAliasesFromGitConfig(text);
 *   await svc.setAliasesInShell(aliases, shellService, loginService);
 *
 * Notes:
 * - We intentionally use `git config --global` to avoid manual file edits.
 * - Parsing supports basic INI-style gitconfig and focuses on the [alias] section.
 */

export default class AliasImportService {
  /**
   * Parse a git config text and extract aliases from the [alias] section.
   * Accepts either a full .gitconfig or just a [alias] block.
   *
   * @param {string} text
   * @returns {{ aliases: Record<string,string>, errors: string[] }}
   */
  parseAliasesFromGitConfig(text) {
    const errors = [];
    const aliases = {};
    if (!text || typeof text !== 'string') {
      return { aliases, errors: ['Empty content'] };
    }

    const lines = text.split(/\r?\n/);
    let section = '';

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      if (!line || line.startsWith('#') || line.startsWith(';')) {
        continue;
      }

      // Section header: [section] or [section "name"]
      const sec = line.match(/^\[(.+?)\]$/);
      if (sec) {
        // Normalize to lower-case base section (ignore subsection names)
        const header = sec[1];
        section = header.split(/\s+/)[0].toLowerCase();
        continue;
      }

      if (section !== 'alias') {
        continue;
      }

      // Key-value pairs can be in the form:
      // key = value
      // key value
      // Keep everything after the first '=' or first whitespace as value.
      let key = '';
      let value = '';

      const eqIdx = line.indexOf('=');
      if (eqIdx >= 0) {
        key = line.slice(0, eqIdx).trim();
        value = line.slice(eqIdx + 1).trim();
      } else {
        const m = line.match(/^(\S+)\s+(.*)$/);
        if (m) {
          key = m[1];
          value = m[2].trim();
        } else {
          // Malformed line inside [alias]
          errors.push(`Unrecognized alias line at ${i + 1}: ${raw}`);
          continue;
        }
      }

      if (!key) {
        errors.push(`Missing alias name at ${i + 1}`);
        continue;
      }
      if (!value) {
        errors.push(`Missing alias value for '${key}' at ${i + 1}`);
        continue;
      }

      aliases[key] = value;
    }

    return { aliases, errors };
  }
}


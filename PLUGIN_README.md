# Caboose AI Cursor Plugin

This repository is set up as a Cursor plugin that can be loaded directly from the GitHub URL.

## Plugin Structure

```
.cursor-plugin/
  plugin.json       # Plugin metadata and configuration
rules/              # Custom .cursorrules files
skills/             # Custom skills/commands
```

## Installation in Cursor

1. Open Cursor IDE
2. Go to: **Cursor → Settings → Plugins**
3. Click **"Add plugin from URL"**
4. Paste: `https://github.com/cxm6467/caboose-ai`
5. The plugin will be loaded automatically

## Adding Rules

Place `.cursorrules` files in the `rules/` directory. These will be automatically available in Cursor.

Example rule file structure:
```
rules/
  typescript.cursorrules
  react.cursorrules
  testing.cursorrules
```

## Adding Skills

Skills are custom commands that can be invoked in Cursor. Place skill definitions in the `skills/` directory.

## Updating the Plugin

After making changes:
```bash
git add .
git commit -m "Update plugin"
git push
```

Cursor will automatically pull the latest version from GitHub.

# Repository Guidelines

## Project Structure & Module Organization

This repository is an Obsidian knowledge vault organized around IPARA, not a standalone application.

- `Documents/I.P.A.R.A/`: notes grouped into work, learning, life, and inbox areas; use existing `收集/`, `项目/`, `资源/`, and `归档/` folders.
- `Documents/Dailynote/`, `Canvas/`, and `Excalidraw/`: journals and visual notes within `Documents/`.
- `Assistants/`: reusable modules, `.base` database definitions, Templater templates, and JavaScript helpers.
- `Books/` and `Connections/`: reading notes and contact records.
- `Extras/`: images, PDFs, and other attachments; `.obsidian/`: plugin configuration and CSS snippets.
- `数据库与导航.md` and `使用指南/`: navigation and usage documentation. `SCHEMA.md` defines the LLM Wiki conventions.

## Build, Test, and Development Commands

There is no build pipeline, package manifest, test runner, or configured linter. Do not introduce application tooling for ordinary note edits.

- `git status --short`: identify existing changes before editing.
- `git diff --check`: check tracked changes for whitespace errors.
- `git diff -- "path/to/note.md"`: review a specific tracked note.
- `git diff --cached`: inspect exactly what will be committed.

For interactive validation, open the folder as a vault on an Obsidian-equipped machine; shell inspection cannot verify plugin rendering.

## Coding Style & Naming Conventions

Use UTF-8 Markdown, existing Chinese names, and language-tagged code fences. Preserve YAML property names, wikilinks, embeds, and automation-dependent paths. Match surrounding indentation; use spaces in YAML and preserve each JavaScript file's style.

For IPARA notes, follow the frontmatter and body rules in `CLAUDE.md`: a filename-matching `##` title and the `meta-bind-embed` block referencing `[[笔记抬头模块]]`. Daily filenames use `YYYY-MM-DD.md`; Wiki pages use lowercase kebab-case and follow `SCHEMA.md` for metadata, links, index, and log updates.

Do not rename existing content or overwrite upstream `Assistants/` templates. Customize a renamed copy; preserve the `Scrip（用于更新，勿删）/` directory.

## Testing Guidelines

No automated tests, test-naming convention, or coverage threshold exists. Check frontmatter, link targets, attachments, and changed Canvas JSON. For module changes, manually verify the affected template, query, or button in Obsidian. Report checks performed and rendering checks left unverified.

## Commit & Pull Request Guidelines

Follow recent history: `docs: MMDD - 简要描述` or `feat: MMDD - 简要描述`. Keep commits focused. PR descriptions should identify affected notes/modules, explain intent, list validation, and link relevant issues; include screenshots for visible changes.

## Security & Configuration

Treat the vault as public: redact credentials with `【已脱敏】`. Review attachments and plugin configuration before staging. Respect `.gitignore`; never force-add session-token files or include unrelated workspace changes.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an **Obsidian vault** — a personal knowledge management system based on the IPARA (Inbox + PARA) structure. It is NOT a traditional software project. There are no build commands, tests, or linters.

The vault is a "预制仓库" (pre-built template vault) designed by "鱼先生", providing modular Obsidian configurations for note-taking, daily journals, book reading, and contact management.

## Vault Structure

- **Assistants/** — Modules, templates (Templater), base files, and chart modules. **Do not rename or delete existing files/folders here** — the author pushes remote updates that overwrite same-path files. To customize, copy and rename first.
- **Books/** — Book-related notes, PDF books, e-book shelf (`电子书架.md`), reading notes.
- **Connections/** — Contact/people management (`人物/`, `公司/`, `部门/`), items.
- **Documents/** — Main content area:
  - `I.P.A.R.A/` — Core PARA structure with 4 areas: `工作领域/`, `学习领域/`, `生活领域/`, `0-收集箱/`. Each area has subfolders: `收集/`, `归档/`, `项目/`, `资源/`.
  - `Canvas/` — Canvas files
  - `Dailynote/` — Daily notes and weekly notes (`周记/`)
  - `Douban/` — Douban media entries
  - `Excalidraw/` — Excalidraw drawings and scripts
- **Extras/** — Attachments (images, covers, avatars, etc.). Listed in `.gitignore`.
- **使用指南/** — Usage guides for the vault system.

## Key Obsidian Plugins

This vault relies heavily on these community plugins:
- **Templater** — Templates in `Assistants/Templater/` with JS scripts in `Scrip（用于更新，勿删）/`
- **Dataview** — Query-based dynamic content
- **Datacore** — Advanced data queries (experimental)
- **Meta Bind** — Interactive form fields embedded in notes
- **Bases View** — Database views (`.base` files)
- **Excalidraw** — Visual drawings with custom scripts in `Documents/Excalidraw/Scripts/`
- **Spaced Repetition** — Flashcard review
- **Dida Sync** — TickTick integration
- **Custom plugins**: FlowText, PDF Flow, Imagen, Title Manager, Note Rambler, etc.

## Editing Conventions

- File names and folder paths under `Assistants/`, `Books/`, `Connections/`, `Documents/` must not be renamed — automation depends on them.
- `.base` files are Bases View database definitions.
- `.canvas` files are Obsidian Canvas JSON files.
- CSS snippets live in `.obsidian/snippets/`.
- Templater JS scripts (`.js`) are in `Assistants/Templater/Scrip（用于更新，勿删）/` and `Assistants/Templater/辅助/JS辅助脚本/`.
- Notes use YAML frontmatter with properties like `Tag`, `searchText`, etc.

## Git

- Branch: `master` (single-branch workflow)
- `.gitignore` excludes `Extras/` (attachments/assets directory)
- Commit messages follow Chinese convention, e.g. `feat: 260404` (date-based)

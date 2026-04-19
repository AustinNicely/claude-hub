# Claude Hub

A desktop app for browsing your past [Claude Code](https://docs.anthropic.com/en/docs/claude-code) conversations — like ChatGPT's sidebar, but for your local CLI sessions.

![Electron](https://img.shields.io/badge/Electron-33-blue) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## What it does

- **Sidebar** — All your Claude Code sessions, searchable and grouped by date
- **Chat viewer** — Full conversation replay with markdown rendering, syntax-highlighted code blocks, collapsible thinking blocks, and tool-use details
- **Embedded terminal** — Start new Claude Code sessions without leaving the app
- **Live updates** — Sidebar refreshes automatically as you have new conversations

## Privacy

This app reads conversation data stored locally on your machine at `~/.claude/`. **Nothing is uploaded, transmitted, or shared.** Each user sees only their own conversations.

## Getting started

```bash
git clone https://github.com/AustinNicely/claude-hub.git
cd claude-hub
npm install
npm run dev
```

Requires [Node.js](https://nodejs.org/) 18+ and an existing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installation (so there are conversations to browse).

## Tech stack

- **Electron** + **electron-vite** — desktop shell and build tooling
- **React 18** + **TypeScript** — renderer
- **Tailwind CSS v4** — dark theme styling
- **node-pty** + **xterm.js** — embedded terminal
- **react-markdown** + rehype-highlight — message rendering
- **chokidar** — file watching for live sidebar updates

## Building

```bash
npm run build    # compile only
npm run dist     # package as standalone exe (Windows)
```

## License

MIT

# Contributing to FantasyBook Maker

First off, thanks for taking the time to contribute! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/neukkken/FantasyBookMaker/issues) to see if the problem has already been reported. If it hasn't, open a new issue using the **Bug Report** template.

When filing a bug report, include as many details as possible:

- **Steps to reproduce** — what did you do?
- **Expected behavior** — what should happen?
- **Actual behavior** — what actually happens?
- **Screenshots** — if applicable
- **Environment** — OS, app version, Node.js version

### Suggesting Features

Open a new issue using the **Feature Request** template. Describe the feature, why it would be useful, and any implementation ideas you have.

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run the type checker and linter:

   ```bash
   npm run typecheck
   npm run lint
   ```

5. Commit with a clear message (`git commit -m "Add feature X"`)
6. Push to your fork (`git push origin feature/my-feature`)
7. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/neukkken/FantasyBookMaker.git
cd FantasyBookMaker
npm install
npm run dev
```

## Code Standards

- **TypeScript** — all new code should use TypeScript where feasible
- **ESLint** — run `npm run lint` before committing
- **Prettier** — run `npm run format` to auto-format
- **No trailing semicolons** — project convention uses no semicolons
- **React** — functional components with hooks, no class components
- **Tailwind CSS** — use utility classes, avoid custom CSS unless necessary

## Project Conventions

- Components go in `src/renderer/src/components/`
- IPC handlers go in `src/main/index.ts`
- Database logic goes in `src/main/database.ts`
- The IPC bridge is defined in `src/preload/index.ts`

## Questions?

Open a [Discussion](https://github.com/neukkken/FantasyBookMaker/discussions) or ask in the issue tracker.

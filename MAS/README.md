# MAS — MAR Agent Scaffold

Portable scaffold that enforces the MAR (More Analysis Required) protocol and structured docs discipline on any project, for any AI agent (Kiro, Cursor, Copilot, Claude, etc.).

## What it installs

```
AGENTS.md              ← agent reads this first — enforces MAR + docs update
PHASES.md              ← implementation roadmap
TODO.md                ← pending work, prioritized
DONE.md                ← completed work log
mar-analysis/
  MAR-PROTOCOL.md      ← full MAR rules
  DEVRULES.md          ← dev rules (customize per project)
  TEMPLATE.md          ← blank MAR analysis file per task
.gitignore             ← blocks all .md except README.md from being committed
```

## Usage

```bash
cd /path/to/your-project
bash /path/to/MAS/init-mas.sh "Your Project Name"
```

## Rules enforced on every agent

1. Run MAR protocol before any code change
2. Read PHASES.md + TODO.md + DONE.md before starting
3. Update docs after finishing — never leave them stale

## .gitignore rule

All `.md` files except `README.md` are blocked from git. They are local working documents, not committed artifacts.

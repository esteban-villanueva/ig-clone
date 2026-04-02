# Skill Registry

**Generated**: 2026-04-01
**Project**: clon-ig-gentle

## Project Conventions

| File | Description |
|------|-------------|
| AGENTS.md | Next.js 16 breaking changes warning — MUST read before writing Next.js code |
| CLAUDE.md | References AGENTS.md |

## User-Level Skills

| Name | Trigger | Description |
|------|---------|-------------|
| issue-creation | Creating GitHub issues, reporting bugs, requesting features | Issue creation workflow for Agent Teams Lite following the issue-first enforcement system |
| branch-pr | Creating pull requests, opening PRs, preparing changes for review | PR creation workflow for Agent Teams Lite following the issue-first enforcement system |
| skill-creator | Creating new AI skills, adding agent instructions, documenting patterns | Creates new AI agent skills following the Agent Skills spec |
| go-testing | Writing Go tests, Bubbletea TUI testing | Go testing patterns for Gentleman.Dots, including Bubbletea TUI testing |
| judgment-day | "judgment day", "review adversarial", "dual review", "juzgar" | Parallel adversarial review protocol with two independent blind judge sub-agents |

## SDD Workflow Skills

| Name | Phase | Trigger |
|------|-------|---------|
| sdd-explore | Explore | Investigating ideas, thinking through features, clarifying requirements |
| sdd-propose | Propose | Creating change proposals with intent, scope, and approach |
| sdd-spec | Spec | Writing specifications with requirements and scenarios |
| sdd-design | Design | Creating technical design documents with architecture decisions |
| sdd-tasks | Tasks | Breaking down changes into implementation task checklists |
| sdd-apply | Apply | Implementing tasks from a change, writing actual code |
| sdd-verify | Verify | Validating implementation matches specs, design, and tasks |
| sdd-archive | Archive | Syncing delta specs to main specs and archiving completed changes |
| sdd-init | Init | Initializing SDD context in the project |

## Detection Notes

- **No project-level skills** found (no `.claude/skills/`, `.agent/skills/`, or `skills/` directories)
- **No test runner detected** — TDD skills will require setup before use
- **Next.js 16 specific**: AGENTS.md warns about breaking changes; always consult `node_modules/next/dist/docs/`

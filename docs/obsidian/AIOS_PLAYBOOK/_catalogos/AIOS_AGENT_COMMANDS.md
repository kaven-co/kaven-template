---
title: AIOS_AGENT_COMMANDS
version: 1.0.0
type: catalog
domain: aios
audience: [iniciante,avancado]
level: reference
status: active
lang: pt-BR
squads_scope: personal
updated: 2026-02-12
tags: [aios, playbook, quick-guide, squads-personais]
---

# AIOS - Comandos de Todos os Agentes

Fonte: \.aios-core/development/agents
Gerado em: 2026-02-12 23:20:52 -03

## Orion (`aios-master`)
**Título:** AIOS Master Orchestrator & Framework Developer
**Arquivo:** `.aios-core/development/agents/aios-master.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `-` |
| `*kb` | `-` | Toggle KB mode (loads AIOS Method knowledge) | `-` |
| `*status` | `-` | Show current context and progress | `-` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `-` |
| `*yolo` | `-` | Toggle confirmation skipping | `-` |
| `*exit` | `-` | Exit agent mode | `-` |
| `*create` | `-` | Create new AIOS component (agent, task, workflow, template, checklist) | `-` |
| `*modify` | `-` | Modify existing AIOS component | `-` |
| `*update-manifest` | `-` | Update team manifest | `-` |
| `*validate-component` | `-` | Validate component security and standards | `-` |
| `*deprecate-component` | `-` | Deprecate component with migration path | `-` |
| `*propose-modification` | `-` | Propose framework modifications | `-` |
| `*undo-last` | `-` | Undo last framework modification | `-` |
| `*validate-workflow` | `{name\|path} [--strict] [--all]` | Validate workflow YAML structure, agents, artifacts, and logic | `full` |
| `*run-workflow` | `{name} [start\|continue\|status\|skip\|abort] [--mode=guided\|engine]` | Workflow execution: guided (persona-switch) or engine (real subagent spawning) | `full` |
| `*analyze-framework` | `-` | Analyze framework structure and patterns | `-` |
| `*list-components` | `-` | List all framework components | `-` |
| `*test-memory` | `-` | Test memory layer connection | `-` |
| `*task` | `-` | Execute specific task (or list available) | `-` |
| `*execute-checklist` | `{checklist}` | Run checklist (or list available) | `-` |
| `*workflow` | `{name} [--mode=guided\|engine]` | Start workflow (guided=manual, engine=real subagent spawning) | `-` |
| `*plan` | `[create\|status\|update] [id]` | Workflow planning (default: create) | `-` |
| `*create-doc` | `{template}` | Create document (or list templates) | `-` |
| `*doc-out` | `-` | Output complete document | `-` |
| `*shard-doc` | `{document} {destination}` | Break document into parts | `-` |
| `*document-project` | `-` | Generate project documentation | `-` |
| `*add-tech-doc` | `{file-path} [preset-name]` | Create tech-preset from documentation file | `-` |
| `*create-next-story` | `-` | Create next user story | `-` |
| `*advanced-elicitation` | `-` | Execute advanced elicitation | `-` |
| `*chat-mode` | `-` | Start conversational assistance | `-` |
| `*agent` | `{name}` | Get info about specialized agent (use @ to transform) | `-` |
| `*correct-course` | `-` | Analyze and correct process/quality deviations | `-` |
| `*index-docs` | `-` | Index documentation for search | `-` |

## Atlas (`analyst`)
**Título:** Business Analyst
**Arquivo:** `.aios-core/development/agents/analyst.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*create-project-brief` | `-` | Create project brief document | `[full, quick]` |
| `*perform-market-research` | `-` | Create market research analysis | `[full, quick]` |
| `*create-competitor-analysis` | `-` | Create competitive analysis | `[full, quick]` |
| `*research-prompt` | `{topic}` | Generate deep research prompt | `[full]` |
| `*brainstorm` | `{topic}` | Facilitate structured brainstorming | `[full, quick, key]` |
| `*elicit` | `-` | Run advanced elicitation session | `[full]` |
| `*research-deps` | `-` | Research dependencies and technical constraints for story | `[full]` |
| `*extract-patterns` | `-` | Extract and document code patterns from codebase | `[full]` |
| `*doc-out` | `-` | Output complete document | `[full]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full, quick]` |
| `*yolo` | `-` | Toggle confirmation skipping | `[full]` |
| `*exit` | `-` | Exit analyst mode | `[full]` |

## Aria (`architect`)
**Título:** Architect
**Arquivo:** `.aios-core/development/agents/architect.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*create-full-stack-architecture` | `-` | Complete system architecture | `[full, quick, key]` |
| `*create-backend-architecture` | `-` | Backend architecture design | `[full, quick]` |
| `*create-front-end-architecture` | `-` | Frontend architecture design | `[full, quick]` |
| `*create-brownfield-architecture` | `-` | Architecture for existing projects | `[full]` |
| `*document-project` | `-` | Generate project documentation | `[full, quick]` |
| `*execute-checklist` | `{checklist}` | Run architecture checklist | `[full]` |
| `*research` | `{topic}` | Generate deep research prompt | `[full, quick]` |
| `*analyze-project-structure` | `-` | Analyze project for new feature implementation (WIS-15) | `[full, quick, key]` |
| `*validate-tech-preset` | `{name}` | Validate tech preset structure (--fix to create story) | `[full]` |
| `*validate-tech-preset-all` | `-` | Validate all tech presets | `[full]` |
| `*assess-complexity` | `-` | Assess story complexity and estimate effort | `[full]` |
| `*create-plan` | `-` | Create implementation plan with phases and subtasks | `[full]` |
| `*create-context` | `-` | Generate project and files context for story | `[full]` |
| `*map-codebase` | `-` | Generate codebase map (structure, services, patterns, conventions) | `[full]` |
| `*doc-out` | `-` | Output complete document | `[full]` |
| `*shard-prd` | `-` | Break architecture into smaller parts | `[full]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full, quick]` |
| `*yolo` | `-` | Toggle confirmation skipping | `[full]` |
| `*exit` | `-` | Exit architect mode | `[full]` |

## Dara (`data-engineer`)
**Título:** Database Architect & Operations Engineer
**Arquivo:** `.aios-core/development/agents/data-engineer.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*-` | `help` | Show all available commands with descriptions | `-` |
| `*-` | `guide` | Show comprehensive usage guide for this agent | `-` |
| `*-` | `yolo` | Toggle confirmation skipping | `-` |
| `*-` | `exit` | Exit data-engineer mode | `-` |
| `*-` | `doc-out` | Output complete document | `-` |
| `*-` | `execute-checklist {checklist}` | Run DBA checklist | `-` |
| `*-` | `create-schema` | Design database schema | `-` |
| `*-` | `create-rls-policies` | Design RLS policies | `-` |
| `*-` | `create-migration-plan` | Create migration strategy | `-` |
| `*-` | `design-indexes` | Design indexing strategy | `-` |
| `*-` | `model-domain` | Domain modeling session | `-` |
| `*-` | `env-check` | Validate database environment variables | `-` |
| `*-` | `bootstrap` | Scaffold database project structure | `-` |
| `*-` | `apply-migration {path}` | Run migration with safety snapshot | `-` |
| `*-` | `dry-run {path}` | Test migration without committing | `-` |
| `*-` | `seed {path}` | Apply seed data safely (idempotent) | `-` |
| `*-` | `snapshot {label}` | Create schema snapshot | `-` |
| `*-` | `rollback {snapshot_or_file}` | Restore snapshot or run rollback | `-` |
| `*-` | `smoke-test {version}` | Run comprehensive database tests | `-` |
| `*-` | `security-audit {scope}` | Database security and quality audit (rls, schema, full) | `-` |
| `*-` | `analyze-performance {type} [query]` | Query performance analysis (query, hotpaths, interactive) | `-` |
| `*-` | `policy-apply {table} {mode}` | Install RLS policy (KISS or granular) | `-` |
| `*-` | `test-as-user {user_id}` | Emulate user for RLS testing | `-` |
| `*-` | `verify-order {path}` | Lint DDL ordering for dependencies | `-` |
| `*-` | `load-csv {table} {file}` | Safe CSV loader (staging→merge) | `-` |
| `*-` | `run-sql {file_or_inline}` | Execute raw SQL with transaction | `-` |
| `*-` | `setup-database [type]` | Interactive database project setup (supabase, postgresql, mongodb, mysql, sqlite) | `-` |
| `*-` | `research {topic}` | Generate deep research prompt for technical DB topics | `-` |

## Dex (`dev`)
**Título:** Full Stack Developer
**Arquivo:** `.aios-core/development/agents/dev.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*develop` | `-` | Implement story tasks (modes: yolo, interactive, preflight) | `[full, quick]` |
| `*develop-yolo` | `-` | Autonomous development mode | `[full, quick]` |
| `*develop-interactive` | `-` | Interactive development mode (default) | `[full]` |
| `*develop-preflight` | `-` | Planning mode before implementation | `[full]` |
| `*execute-subtask` | `-` | Execute a single subtask from implementation.yaml (13-step Coder Agent workflow) | `[full, quick]` |
| `*verify-subtask` | `-` | Verify subtask completion using configured verification (command, api, browser, e2e) | `[full, quick]` |
| `*track-attempt` | `-` | Track implementation attempt for a subtask (registers in recovery/attempts.json) | `[full, quick]` |
| `*rollback` | `-` | Rollback to last good state for a subtask (--hard to skip confirmation) | `[full, quick]` |
| `*build-resume` | `-` | Resume autonomous build from last checkpoint | `[full, quick]` |
| `*build-status` | `-` | Show build status (--all for all builds) | `[full, quick]` |
| `*build-log` | `-` | View build attempt log for debugging | `[full]` |
| `*build-cleanup` | `-` | Cleanup abandoned build state files | `[full]` |
| `*build-autonomous` | `-` | Start autonomous build loop for a story (Coder Agent Loop with retries) | `[full, quick]` |
| `*build` | `-` | Complete autonomous build: worktree → plan → execute → verify → merge (*build {story-id}) | `[full, quick]` |
| `*capture-insights` | `-` | Capture session insights (discoveries, patterns, gotchas, decisions) | `[full, quick]` |
| `*list-gotchas` | `-` | List known gotchas from .aios/gotchas.md | `[full, quick]` |
| `*gotcha` | `-` | Add a gotcha manually (*gotcha {title} - {description}) | `[full, quick]` |
| `*gotchas` | `-` | List and search gotchas (*gotchas [--category X] [--severity Y]) | `[full, quick]` |
| `*gotcha-context` | `-` | Get relevant gotchas for current task context | `[full]` |
| `*worktree-create` | `-` | Create isolated worktree for story (*worktree-create {story-id}) | `[full, quick]` |
| `*worktree-list` | `-` | List active worktrees with status | `[full, quick]` |
| `*worktree-cleanup` | `-` | Remove completed/stale worktrees | `[full]` |
| `*worktree-merge` | `-` | Merge worktree branch back to base (*worktree-merge {story-id}) | `[full]` |
| `*create-service` | `-` | Create new service from Handlebars template (api-integration, utility, agent-tool) | `[full, quick]` |
| `*waves` | `-` | Analyze workflow for parallel execution opportunities (--visual for ASCII art) | `[full, quick]` |
| `*apply-qa-fixes` | `-` | Apply QA feedback and fixes | `[quick, key]` |
| `*fix-qa-issues` | `-` | Fix QA issues from QA_FIX_REQUEST.md (8-phase workflow) | `[full, quick]` |
| `*run-tests` | `-` | Execute linting and all tests | `[quick, key]` |
| `*backlog-debt` | `-` | Register technical debt item (prompts for details) | `[full]` |
| `*load-full` | `-` | Load complete file from devLoadAlwaysFiles (bypasses cache/summary) | `[full]` |
| `*clear-cache` | `-` | Clear dev context cache to force fresh file load | `[full]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*explain` | `-` | Explain what I just did in teaching detail | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full]` |
| `*exit` | `-` | Exit developer mode | `[full, quick, key]` |

## Gage (`devops`)
**Título:** GitHub Repository Manager & DevOps Specialist
**Arquivo:** `.aios-core/development/agents/devops.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*-` | `help` | Show all available commands with descriptions | `-` |
| `*-` | `detect-repo` | Detect repository context (framework-dev vs project-dev) | `-` |
| `*-` | `version-check` | Analyze version and recommend next | `-` |
| `*-` | `pre-push` | Run all quality checks before push | `-` |
| `*-` | `push` | Execute git push after quality gates pass | `-` |
| `*-` | `create-pr` | Create pull request from current branch | `-` |
| `*-` | `configure-ci` | Setup/update GitHub Actions workflows | `-` |
| `*-` | `release` | Create versioned release with changelog | `-` |
| `*-` | `cleanup` | Identify and remove stale branches/files | `-` |
| `*-` | `init-project-status` | Initialize dynamic project status tracking (Story 6.1.2.4) | `-` |
| `*-` | `environment-bootstrap` | Complete environment setup for new projects (CLIs, auth, Git/GitHub) | `-` |
| `*-` | `setup-github` | Configure DevOps infrastructure for user projects (workflows, CodeRabbit, branch protection, secrets) [Story 5.10] | `-` |
| `*-` | `search-mcp` | Search available MCPs in Docker MCP Toolkit catalog | `-` |
| `*-` | `add-mcp` | Add MCP server to Docker MCP Toolkit | `-` |
| `*-` | `list-mcps` | List currently enabled MCPs and their tools | `-` |
| `*-` | `remove-mcp` | Remove MCP server from Docker MCP Toolkit | `-` |
| `*-` | `setup-mcp-docker` | Initial Docker MCP Toolkit configuration [Story 5.11] | `-` |
| `*-` | `check-docs` | Verify documentation links integrity (broken, incorrect markings) | `-` |
| `*-` | `create-worktree` | Create isolated worktree for story development | `-` |
| `*-` | `list-worktrees` | List all active worktrees with status | `-` |
| `*-` | `remove-worktree` | Remove worktree (with safety checks) | `-` |
| `*-` | `cleanup-worktrees` | Remove all stale worktrees (> 30 days) | `-` |
| `*-` | `merge-worktree` | Merge worktree branch back to base | `-` |
| `*-` | `inventory-assets` | Generate migration inventory from V2 assets | `-` |
| `*-` | `analyze-paths` | Analyze path dependencies and migration impact | `-` |
| `*-` | `migrate-agent` | Migrate single agent from V2 to V3 format | `-` |
| `*-` | `migrate-batch` | Batch migrate all agents with validation | `-` |
| `*-` | `session-info` | Show current session details (agent history, commands) | `-` |
| `*-` | `guide` | Show comprehensive usage guide for this agent | `-` |
| `*-` | `exit` | Exit DevOps mode | `-` |

## Morgan (`pm`)
**Título:** Product Manager
**Arquivo:** `.aios-core/development/agents/pm.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*create-prd` | `-` | Create product requirements document | `[full, quick, key]` |
| `*create-brownfield-prd` | `-` | Create PRD for existing projects | `[full, quick]` |
| `*create-epic` | `-` | Create epic for brownfield | `[full, quick, key]` |
| `*create-story` | `-` | Create user story | `[full, quick]` |
| `*doc-out` | `-` | Output complete document | `[full]` |
| `*shard-prd` | `-` | Break PRD into smaller parts | `[full]` |
| `*research` | `{topic}` | Generate deep research prompt | `[full, quick]` |
| `*gather-requirements` | `-` | Elicit and document requirements from stakeholders | `[full, quick]` |
| `*write-spec` | `-` | Generate formal specification document from requirements | `[full, quick]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full, quick]` |
| `*yolo` | `-` | Toggle confirmation skipping | `[full]` |
| `*exit` | `-` | Exit PM mode | `[full]` |

## Pax (`po`)
**Título:** Product Owner
**Arquivo:** `.aios-core/development/agents/po.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*backlog-add` | `-` | Add item to story backlog (follow-up/tech-debt/enhancement) | `[full, quick]` |
| `*backlog-review` | `-` | Generate backlog review for sprint planning | `[full, quick]` |
| `*backlog-summary` | `-` | Quick backlog status summary | `[quick, key]` |
| `*backlog-prioritize` | `-` | Re-prioritize backlog item | `[full]` |
| `*backlog-schedule` | `-` | Assign item to sprint | `[full]` |
| `*stories-index` | `-` | Regenerate story index from docs/stories/ | `[full, quick]` |
| `*validate-story-draft` | `-` | Validate story quality and completeness | `[full, quick, key]` |
| `*sync-story` | `-` | Sync story to PM tool (ClickUp, GitHub, Jira, local) | `[full]` |
| `*pull-story` | `-` | Pull story updates from PM tool | `[full]` |
| `*execute-checklist-po` | `-` | Run PO master checklist | `[quick]` |
| `*shard-doc` | `{document} {destination}` | Break document into smaller parts | `[full]` |
| `*doc-out` | `-` | Output complete document to file | `[full]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full, quick]` |
| `*yolo` | `-` | Toggle confirmation skipping (on/off) | `[full]` |
| `*exit` | `-` | Exit PO mode | `[full]` |

## Quinn (`qa`)
**Título:** Test Architect & Quality Advisor
**Arquivo:** `.aios-core/development/agents/qa.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*-` | `help` | Show all available commands with descriptions | `-` |
| `*-` | `code-review {scope}` | Run automated review (scope: uncommitted or committed) | `-` |
| `*-` | `review {story}` | Comprehensive story review with gate decision | `-` |
| `*-` | `review-build {story}` | 10-phase structured QA review (Epic 6) - outputs qa_report.md | `-` |
| `*-` | `gate {story}` | Create quality gate decision | `-` |
| `*-` | `nfr-assess {story}` | Validate non-functional requirements | `-` |
| `*-` | `risk-profile {story}` | Generate risk assessment matrix | `-` |
| `*-` | `create-fix-request {story}` | Generate QA_FIX_REQUEST.md for @dev with issues to fix | `-` |
| `*-` | `validate-libraries {story}` | Validate third-party library usage via Context7 | `-` |
| `*-` | `security-check {story}` | Run 8-point security vulnerability scan | `-` |
| `*-` | `validate-migrations {story}` | Validate database migrations for schema changes | `-` |
| `*-` | `evidence-check {story}` | Verify evidence-based QA requirements | `-` |
| `*-` | `false-positive-check {story}` | Critical thinking verification for bug fixes | `-` |
| `*-` | `console-check {story}` | Browser console error detection | `-` |
| `*-` | `test-design {story}` | Create comprehensive test scenarios | `-` |
| `*-` | `trace {story}` | Map requirements to tests (Given-When-Then) | `-` |
| `*-` | `create-suite {story}` | Create test suite for story (Authority: QA owns test suites) | `-` |
| `*-` | `critique-spec {story}` | Review and critique specification for completeness and clarity | `-` |
| `*-` | `backlog-add {story} {type} {priority} {title}` | Add item to story backlog | `-` |
| `*-` | `backlog-update {item_id} {status}` | Update backlog item status | `-` |
| `*-` | `backlog-review` | Generate backlog review for sprint planning | `-` |
| `*-` | `session-info` | Show current session details (agent history, commands) | `-` |
| `*-` | `guide` | Show comprehensive usage guide for this agent | `-` |
| `*-` | `exit` | Exit QA mode | `-` |

## River (`sm`)
**Título:** Scrum Master
**Arquivo:** `.aios-core/development/agents/sm.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*draft` | `-` | Create next user story | `[full, quick, key]` |
| `*story-checklist` | `-` | Run story draft checklist | `[full, quick]` |
| `*session-info` | `-` | Show current session details (agent history, commands) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full, quick]` |
| `*exit` | `-` | Exit Scrum Master mode | `[full]` |

## Craft (`squad-creator`)
**Título:** Squad Creator
**Arquivo:** `.aios-core/development/agents/squad-creator.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*help` | `-` | Show all available commands with descriptions | `[full, quick, key]` |
| `*design-squad` | `-` | Design squad from documentation with intelligent recommendations | `[full, quick, key]` |
| `*create-squad` | `-` | Create new squad following task-first architecture | `[full, quick, key]` |
| `*validate-squad` | `-` | Validate squad against JSON Schema and AIOS standards | `[full, quick, key]` |
| `*list-squads` | `-` | List all local squads in the project | `[full, quick]` |
| `*migrate-squad` | `-` | Migrate legacy squad to AIOS 2.1 format | `[full, quick]` |
| `*analyze-squad` | `-` | Analyze squad structure, coverage, and get improvement suggestions | `[full, quick, key]` |
| `*extend-squad` | `-` | Add new components (agents, tasks, templates, etc.) to existing squad | `[full, quick, key]` |
| `*download-squad` | `-` | Download public squad from aios-squads repository (Sprint 8) | `[full]` |
| `*publish-squad` | `-` | Publish squad to aios-squads repository (Sprint 8) | `[full]` |
| `*sync-squad-synkra` | `-` | Sync squad to Synkra API marketplace (Sprint 8) | `[full]` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `[full]` |
| `*exit` | `-` | Exit squad-creator mode | `[full, quick, key]` |

## Uma (`ux-design-expert`)
**Título:** UX/UI Designer & Design System Architect
**Arquivo:** `.aios-core/development/agents/ux-design-expert.md`

| Comando | Args | Descrição | Visibilidade |
|---|---|---|---|
| `*research` | `-` | Conduct user research and needs analysis | `-` |
| `*wireframe` | `{fidelity}` | Create wireframes and interaction flows | `-` |
| `*generate-ui-prompt` | `-` | Generate prompts for AI UI tools (v0, Lovable) | `-` |
| `*create-front-end-spec` | `-` | Create detailed frontend specification | `-` |
| `*audit` | `{path}` | Scan codebase for UI pattern redundancies | `-` |
| `*consolidate` | `-` | Reduce redundancy using intelligent clustering | `-` |
| `*shock-report` | `-` | Generate visual HTML report showing chaos + ROI | `-` |
| `*tokenize` | `-` | Extract design tokens from consolidated patterns | `-` |
| `*setup` | `-` | Initialize design system structure | `-` |
| `*migrate` | `-` | Generate phased migration strategy (4 phases) | `-` |
| `*upgrade-tailwind` | `-` | Plan and execute Tailwind CSS v4 upgrades | `-` |
| `*audit-tailwind-config` | `-` | Validate Tailwind configuration health | `-` |
| `*export-dtcg` | `-` | Generate W3C Design Tokens bundles | `-` |
| `*bootstrap-shadcn` | `-` | Install Shadcn/Radix component library | `-` |
| `*build` | `{component}` | Build production-ready atomic component | `-` |
| `*compose` | `{molecule}` | Compose molecule from existing atoms | `-` |
| `*extend` | `{component}` | Add variant to existing component | `-` |
| `*document` | `-` | Generate pattern library documentation | `-` |
| `*a11y-check` | `-` | Run accessibility audit (WCAG AA/AAA) | `-` |
| `*calculate-roi` | `-` | Calculate ROI and cost savings | `-` |
| `*scan` | `{path\|url}` | Analyze HTML/React artifact for patterns | `-` |
| `*integrate` | `{pack}` | Connect with expansion pack | `-` |
| `*help` | `-` | Show all commands organized by phase | `-` |
| `*status` | `-` | Show current workflow phase | `-` |
| `*guide` | `-` | Show comprehensive usage guide for this agent | `-` |
| `*exit` | `-` | Exit UX-Design Expert mode | `-` |


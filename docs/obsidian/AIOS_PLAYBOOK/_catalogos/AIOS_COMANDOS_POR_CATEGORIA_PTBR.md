---
title: AIOS_COMANDOS_POR_CATEGORIA_PTBR
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

# AIOS - Comandos por Categoria (PT-BR)

Fonte: \.aios-core/development/agents
Gerado em: 2026-02-12 23:31:43 -03

## Índice
- [Orquestração e Framework](#orquestracao-e-framework)
- [Produto e Descoberta](#produto-e-descoberta)
- [Arquitetura e Desenvolvimento](#arquitetura-e-desenvolvimento)
- [Qualidade e Dados](#qualidade-e-dados)
- [DevOps e Infra](#devops-e-infra)
- [UX e Design System](#ux-e-design-system)
- [Squads e Extensões](#squads-e-extensoes)

## Orquestração e Framework

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Orion (`aios-master`) | `*help` | `-` | Show all available commands with descriptions |
| Orion (`aios-master`) | `*kb` | `-` | Toggle KB mode (loads AIOS Method knowledge) |
| Orion (`aios-master`) | `*status` | `-` | Show current context and progress |
| Orion (`aios-master`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Orion (`aios-master`) | `*yolo` | `-` | Toggle confirmation skipping |
| Orion (`aios-master`) | `*exit` | `-` | Exit agent mode |
| Orion (`aios-master`) | `*create` | `-` | Create new AIOS component (agent, task, workflow, template, checklist) |
| Orion (`aios-master`) | `*modify` | `-` | Modify existing AIOS component |
| Orion (`aios-master`) | `*update-manifest` | `-` | Update team manifest |
| Orion (`aios-master`) | `*validate-component` | `-` | Validate component security and standards |
| Orion (`aios-master`) | `*deprecate-component` | `-` | Deprecate component with migration path |
| Orion (`aios-master`) | `*propose-modification` | `-` | Propose framework modifications |
| Orion (`aios-master`) | `*undo-last` | `-` | Undo last framework modification |
| Orion (`aios-master`) | `*validate-workflow` | `{name\|path} [--strict] [--all]` | Validate workflow YAML structure, agents, artifacts, and logic |
| Orion (`aios-master`) | `*run-workflow` | `{name} [start\|continue\|status\|skip\|abort] [--mode=guided\|engine]` | Workflow execution: guided (persona-switch) or engine (real subagent spawning) |
| Orion (`aios-master`) | `*analyze-framework` | `-` | Analyze framework structure and patterns |
| Orion (`aios-master`) | `*list-components` | `-` | List all framework components |
| Orion (`aios-master`) | `*test-memory` | `-` | Test memory layer connection |
| Orion (`aios-master`) | `*task` | `-` | Execute specific task (or list available) |
| Orion (`aios-master`) | `*execute-checklist` | `{checklist}` | Run checklist (or list available) |
| Orion (`aios-master`) | `*workflow` | `{name} [--mode=guided\|engine]` | Start workflow (guided=manual, engine=real subagent spawning) |
| Orion (`aios-master`) | `*plan` | `[create\|status\|update] [id]` | Workflow planning (default: create) |
| Orion (`aios-master`) | `*create-doc` | `{template}` | Create document (or list templates) |
| Orion (`aios-master`) | `*doc-out` | `-` | Output complete document |
| Orion (`aios-master`) | `*shard-doc` | `{document} {destination}` | Break document into parts |
| Orion (`aios-master`) | `*document-project` | `-` | Generate project documentation |
| Orion (`aios-master`) | `*add-tech-doc` | `{file-path} [preset-name]` | Create tech-preset from documentation file |
| Orion (`aios-master`) | `*create-next-story` | `-` | Create next user story |
| Orion (`aios-master`) | `*advanced-elicitation` | `-` | Execute advanced elicitation |
| Orion (`aios-master`) | `*chat-mode` | `-` | Start conversational assistance |
| Orion (`aios-master`) | `*agent` | `{name}` | Get info about specialized agent (use @ to transform) |
| Orion (`aios-master`) | `*correct-course` | `-` | Analyze and correct process/quality deviations |
| Orion (`aios-master`) | `*index-docs` | `-` | Index documentation for search |

## Produto e Descoberta

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Atlas (`analyst`) | `*help` | `-` | Show all available commands with descriptions |
| Atlas (`analyst`) | `*create-project-brief` | `-` | Create project brief document |
| Atlas (`analyst`) | `*perform-market-research` | `-` | Create market research analysis |
| Atlas (`analyst`) | `*create-competitor-analysis` | `-` | Create competitive analysis |
| Atlas (`analyst`) | `*research-prompt` | `{topic}` | Generate deep research prompt |
| Atlas (`analyst`) | `*brainstorm` | `{topic}` | Facilitate structured brainstorming |
| Atlas (`analyst`) | `*elicit` | `-` | Run advanced elicitation session |
| Atlas (`analyst`) | `*research-deps` | `-` | Research dependencies and technical constraints for story |
| Atlas (`analyst`) | `*extract-patterns` | `-` | Extract and document code patterns from codebase |
| Atlas (`analyst`) | `*doc-out` | `-` | Output complete document |
| Atlas (`analyst`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Atlas (`analyst`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Atlas (`analyst`) | `*yolo` | `-` | Toggle confirmation skipping |
| Atlas (`analyst`) | `*exit` | `-` | Exit analyst mode |
| Morgan (`pm`) | `*help` | `-` | Show all available commands with descriptions |
| Morgan (`pm`) | `*create-prd` | `-` | Create product requirements document |
| Morgan (`pm`) | `*create-brownfield-prd` | `-` | Create PRD for existing projects |
| Morgan (`pm`) | `*create-epic` | `-` | Create epic for brownfield |
| Morgan (`pm`) | `*create-story` | `-` | Create user story |
| Morgan (`pm`) | `*doc-out` | `-` | Output complete document |
| Morgan (`pm`) | `*shard-prd` | `-` | Break PRD into smaller parts |
| Morgan (`pm`) | `*research` | `{topic}` | Generate deep research prompt |
| Morgan (`pm`) | `*gather-requirements` | `-` | Elicit and document requirements from stakeholders |
| Morgan (`pm`) | `*write-spec` | `-` | Generate formal specification document from requirements |
| Morgan (`pm`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Morgan (`pm`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Morgan (`pm`) | `*yolo` | `-` | Toggle confirmation skipping |
| Morgan (`pm`) | `*exit` | `-` | Exit PM mode |
| Pax (`po`) | `*help` | `-` | Show all available commands with descriptions |
| Pax (`po`) | `*backlog-add` | `-` | Add item to story backlog (follow-up/tech-debt/enhancement) |
| Pax (`po`) | `*backlog-review` | `-` | Generate backlog review for sprint planning |
| Pax (`po`) | `*backlog-summary` | `-` | Quick backlog status summary |
| Pax (`po`) | `*backlog-prioritize` | `-` | Re-prioritize backlog item |
| Pax (`po`) | `*backlog-schedule` | `-` | Assign item to sprint |
| Pax (`po`) | `*stories-index` | `-` | Regenerate story index from docs/stories/ |
| Pax (`po`) | `*validate-story-draft` | `-` | Validate story quality and completeness |
| Pax (`po`) | `*sync-story` | `-` | Sync story to PM tool (ClickUp, GitHub, Jira, local) |
| Pax (`po`) | `*pull-story` | `-` | Pull story updates from PM tool |
| Pax (`po`) | `*execute-checklist-po` | `-` | Run PO master checklist |
| Pax (`po`) | `*shard-doc` | `{document} {destination}` | Break document into smaller parts |
| Pax (`po`) | `*doc-out` | `-` | Output complete document to file |
| Pax (`po`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Pax (`po`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Pax (`po`) | `*yolo` | `-` | Toggle confirmation skipping (on/off) |
| Pax (`po`) | `*exit` | `-` | Exit PO mode |
| River (`sm`) | `*help` | `-` | Show all available commands with descriptions |
| River (`sm`) | `*draft` | `-` | Create next user story |
| River (`sm`) | `*story-checklist` | `-` | Run story draft checklist |
| River (`sm`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| River (`sm`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| River (`sm`) | `*exit` | `-` | Exit Scrum Master mode |

## Arquitetura e Desenvolvimento

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Aria (`architect`) | `*help` | `-` | Show all available commands with descriptions |
| Aria (`architect`) | `*create-full-stack-architecture` | `-` | Complete system architecture |
| Aria (`architect`) | `*create-backend-architecture` | `-` | Backend architecture design |
| Aria (`architect`) | `*create-front-end-architecture` | `-` | Frontend architecture design |
| Aria (`architect`) | `*create-brownfield-architecture` | `-` | Architecture for existing projects |
| Aria (`architect`) | `*document-project` | `-` | Generate project documentation |
| Aria (`architect`) | `*execute-checklist` | `{checklist}` | Run architecture checklist |
| Aria (`architect`) | `*research` | `{topic}` | Generate deep research prompt |
| Aria (`architect`) | `*analyze-project-structure` | `-` | Analyze project for new feature implementation (WIS-15) |
| Aria (`architect`) | `*validate-tech-preset` | `{name}` | Validate tech preset structure (--fix to create story) |
| Aria (`architect`) | `*validate-tech-preset-all` | `-` | Validate all tech presets |
| Aria (`architect`) | `*assess-complexity` | `-` | Assess story complexity and estimate effort |
| Aria (`architect`) | `*create-plan` | `-` | Create implementation plan with phases and subtasks |
| Aria (`architect`) | `*create-context` | `-` | Generate project and files context for story |
| Aria (`architect`) | `*map-codebase` | `-` | Generate codebase map (structure, services, patterns, conventions) |
| Aria (`architect`) | `*doc-out` | `-` | Output complete document |
| Aria (`architect`) | `*shard-prd` | `-` | Break architecture into smaller parts |
| Aria (`architect`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Aria (`architect`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Aria (`architect`) | `*yolo` | `-` | Toggle confirmation skipping |
| Aria (`architect`) | `*exit` | `-` | Exit architect mode |
| Dex (`dev`) | `*help` | `-` | Show all available commands with descriptions |
| Dex (`dev`) | `*develop` | `-` | Implement story tasks (modes: yolo, interactive, preflight) |
| Dex (`dev`) | `*develop-yolo` | `-` | Autonomous development mode |
| Dex (`dev`) | `*develop-interactive` | `-` | Interactive development mode (default) |
| Dex (`dev`) | `*develop-preflight` | `-` | Planning mode before implementation |
| Dex (`dev`) | `*execute-subtask` | `-` | Execute a single subtask from implementation.yaml (13-step Coder Agent workflow) |
| Dex (`dev`) | `*verify-subtask` | `-` | Verify subtask completion using configured verification (command, api, browser, e2e) |
| Dex (`dev`) | `*track-attempt` | `-` | Track implementation attempt for a subtask (registers in recovery/attempts.json) |
| Dex (`dev`) | `*rollback` | `-` | Rollback to last good state for a subtask (--hard to skip confirmation) |
| Dex (`dev`) | `*build-resume` | `-` | Resume autonomous build from last checkpoint |
| Dex (`dev`) | `*build-status` | `-` | Show build status (--all for all builds) |
| Dex (`dev`) | `*build-log` | `-` | View build attempt log for debugging |
| Dex (`dev`) | `*build-cleanup` | `-` | Cleanup abandoned build state files |
| Dex (`dev`) | `*build-autonomous` | `-` | Start autonomous build loop for a story (Coder Agent Loop with retries) |
| Dex (`dev`) | `*build` | `-` | Complete autonomous build: worktree → plan → execute → verify → merge (*build {story-id}) |
| Dex (`dev`) | `*capture-insights` | `-` | Capture session insights (discoveries, patterns, gotchas, decisions) |
| Dex (`dev`) | `*list-gotchas` | `-` | List known gotchas from .aios/gotchas.md |
| Dex (`dev`) | `*gotcha` | `-` | Add a gotcha manually (*gotcha {title} - {description}) |
| Dex (`dev`) | `*gotchas` | `-` | List and search gotchas (*gotchas [--category X] [--severity Y]) |
| Dex (`dev`) | `*gotcha-context` | `-` | Get relevant gotchas for current task context |
| Dex (`dev`) | `*worktree-create` | `-` | Create isolated worktree for story (*worktree-create {story-id}) |
| Dex (`dev`) | `*worktree-list` | `-` | List active worktrees with status |
| Dex (`dev`) | `*worktree-cleanup` | `-` | Remove completed/stale worktrees |
| Dex (`dev`) | `*worktree-merge` | `-` | Merge worktree branch back to base (*worktree-merge {story-id}) |
| Dex (`dev`) | `*create-service` | `-` | Create new service from Handlebars template (api-integration, utility, agent-tool) |
| Dex (`dev`) | `*waves` | `-` | Analyze workflow for parallel execution opportunities (--visual for ASCII art) |
| Dex (`dev`) | `*apply-qa-fixes` | `-` | Apply QA feedback and fixes |
| Dex (`dev`) | `*fix-qa-issues` | `-` | Fix QA issues from QA_FIX_REQUEST.md (8-phase workflow) |
| Dex (`dev`) | `*run-tests` | `-` | Execute linting and all tests |
| Dex (`dev`) | `*backlog-debt` | `-` | Register technical debt item (prompts for details) |
| Dex (`dev`) | `*load-full` | `-` | Load complete file from devLoadAlwaysFiles (bypasses cache/summary) |
| Dex (`dev`) | `*clear-cache` | `-` | Clear dev context cache to force fresh file load |
| Dex (`dev`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Dex (`dev`) | `*explain` | `-` | Explain what I just did in teaching detail |
| Dex (`dev`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Dex (`dev`) | `*exit` | `-` | Exit developer mode |

## Qualidade e Dados

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Quinn (`qa`) | `*help` | `-` | Show all available commands with descriptions |
| Quinn (`qa`) | `*code-review` | `{scope}` | Run automated review (scope: uncommitted or committed) |
| Quinn (`qa`) | `*review` | `{story}` | Comprehensive story review with gate decision |
| Quinn (`qa`) | `*review-build` | `{story}` | 10-phase structured QA review (Epic 6) - outputs qa_report.md |
| Quinn (`qa`) | `*gate` | `{story}` | Create quality gate decision |
| Quinn (`qa`) | `*nfr-assess` | `{story}` | Validate non-functional requirements |
| Quinn (`qa`) | `*risk-profile` | `{story}` | Generate risk assessment matrix |
| Quinn (`qa`) | `*create-fix-request` | `{story}` | Generate QA_FIX_REQUEST.md for @dev with issues to fix |
| Quinn (`qa`) | `*validate-libraries` | `{story}` | Validate third-party library usage via Context7 |
| Quinn (`qa`) | `*security-check` | `{story}` | Run 8-point security vulnerability scan |
| Quinn (`qa`) | `*validate-migrations` | `{story}` | Validate database migrations for schema changes |
| Quinn (`qa`) | `*evidence-check` | `{story}` | Verify evidence-based QA requirements |
| Quinn (`qa`) | `*false-positive-check` | `{story}` | Critical thinking verification for bug fixes |
| Quinn (`qa`) | `*console-check` | `{story}` | Browser console error detection |
| Quinn (`qa`) | `*test-design` | `{story}` | Create comprehensive test scenarios |
| Quinn (`qa`) | `*trace` | `{story}` | Map requirements to tests (Given-When-Then) |
| Quinn (`qa`) | `*create-suite` | `{story}` | Create test suite for story (Authority: QA owns test suites) |
| Quinn (`qa`) | `*critique-spec` | `{story}` | Review and critique specification for completeness and clarity |
| Quinn (`qa`) | `*backlog-add` | `{story} {type} {priority} {title}` | Add item to story backlog |
| Quinn (`qa`) | `*backlog-update` | `{item_id} {status}` | Update backlog item status |
| Quinn (`qa`) | `*backlog-review` | `-` | Generate backlog review for sprint planning |
| Quinn (`qa`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Quinn (`qa`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Quinn (`qa`) | `*exit` | `-` | Exit QA mode |
| Dara (`data-engineer`) | `*help` | `-` | Show all available commands with descriptions |
| Dara (`data-engineer`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Dara (`data-engineer`) | `*yolo` | `-` | Toggle confirmation skipping |
| Dara (`data-engineer`) | `*exit` | `-` | Exit data-engineer mode |
| Dara (`data-engineer`) | `*doc-out` | `-` | Output complete document |
| Dara (`data-engineer`) | `*execute-checklist` | `{checklist}` | Run DBA checklist |
| Dara (`data-engineer`) | `*create-schema` | `-` | Design database schema |
| Dara (`data-engineer`) | `*create-rls-policies` | `-` | Design RLS policies |
| Dara (`data-engineer`) | `*create-migration-plan` | `-` | Create migration strategy |
| Dara (`data-engineer`) | `*design-indexes` | `-` | Design indexing strategy |
| Dara (`data-engineer`) | `*model-domain` | `-` | Domain modeling session |
| Dara (`data-engineer`) | `*env-check` | `-` | Validate database environment variables |
| Dara (`data-engineer`) | `*bootstrap` | `-` | Scaffold database project structure |
| Dara (`data-engineer`) | `*apply-migration` | `{path}` | Run migration with safety snapshot |
| Dara (`data-engineer`) | `*dry-run` | `{path}` | Test migration without committing |
| Dara (`data-engineer`) | `*seed` | `{path}` | Apply seed data safely (idempotent) |
| Dara (`data-engineer`) | `*snapshot` | `{label}` | Create schema snapshot |
| Dara (`data-engineer`) | `*rollback` | `{snapshot_or_file}` | Restore snapshot or run rollback |
| Dara (`data-engineer`) | `*smoke-test` | `{version}` | Run comprehensive database tests |
| Dara (`data-engineer`) | `*security-audit` | `{scope}` | Database security and quality audit (rls, schema, full) |
| Dara (`data-engineer`) | `*analyze-performance` | `{type} [query]` | Query performance analysis (query, hotpaths, interactive) |
| Dara (`data-engineer`) | `*policy-apply` | `{table} {mode}` | Install RLS policy (KISS or granular) |
| Dara (`data-engineer`) | `*test-as-user` | `{user_id}` | Emulate user for RLS testing |
| Dara (`data-engineer`) | `*verify-order` | `{path}` | Lint DDL ordering for dependencies |
| Dara (`data-engineer`) | `*load-csv` | `{table} {file}` | Safe CSV loader (staging→merge) |
| Dara (`data-engineer`) | `*run-sql` | `{file_or_inline}` | Execute raw SQL with transaction |
| Dara (`data-engineer`) | `*setup-database` | `[type]` | Interactive database project setup (supabase, postgresql, mongodb, mysql, sqlite) |
| Dara (`data-engineer`) | `*research` | `{topic}` | Generate deep research prompt for technical DB topics |

## DevOps e Infra

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Gage (`devops`) | `*help` | `-` | Show all available commands with descriptions |
| Gage (`devops`) | `*detect-repo` | `-` | Detect repository context (framework-dev vs project-dev) |
| Gage (`devops`) | `*version-check` | `-` | Analyze version and recommend next |
| Gage (`devops`) | `*pre-push` | `-` | Run all quality checks before push |
| Gage (`devops`) | `*push` | `-` | Execute git push after quality gates pass |
| Gage (`devops`) | `*create-pr` | `-` | Create pull request from current branch |
| Gage (`devops`) | `*configure-ci` | `-` | Setup/update GitHub Actions workflows |
| Gage (`devops`) | `*release` | `-` | Create versioned release with changelog |
| Gage (`devops`) | `*cleanup` | `-` | Identify and remove stale branches/files |
| Gage (`devops`) | `*init-project-status` | `-` | Initialize dynamic project status tracking (Story 6.1.2.4) |
| Gage (`devops`) | `*environment-bootstrap` | `-` | Complete environment setup for new projects (CLIs, auth, Git/GitHub) |
| Gage (`devops`) | `*setup-github` | `-` | Configure DevOps infrastructure for user projects (workflows, CodeRabbit, branch protection, secrets) [Story 5.10] |
| Gage (`devops`) | `*search-mcp` | `-` | Search available MCPs in Docker MCP Toolkit catalog |
| Gage (`devops`) | `*add-mcp` | `-` | Add MCP server to Docker MCP Toolkit |
| Gage (`devops`) | `*list-mcps` | `-` | List currently enabled MCPs and their tools |
| Gage (`devops`) | `*remove-mcp` | `-` | Remove MCP server from Docker MCP Toolkit |
| Gage (`devops`) | `*setup-mcp-docker` | `-` | Initial Docker MCP Toolkit configuration [Story 5.11] |
| Gage (`devops`) | `*check-docs` | `-` | Verify documentation links integrity (broken, incorrect markings) |
| Gage (`devops`) | `*create-worktree` | `-` | Create isolated worktree for story development |
| Gage (`devops`) | `*list-worktrees` | `-` | List all active worktrees with status |
| Gage (`devops`) | `*remove-worktree` | `-` | Remove worktree (with safety checks) |
| Gage (`devops`) | `*cleanup-worktrees` | `-` | Remove all stale worktrees (> 30 days) |
| Gage (`devops`) | `*merge-worktree` | `-` | Merge worktree branch back to base |
| Gage (`devops`) | `*inventory-assets` | `-` | Generate migration inventory from V2 assets |
| Gage (`devops`) | `*analyze-paths` | `-` | Analyze path dependencies and migration impact |
| Gage (`devops`) | `*migrate-agent` | `-` | Migrate single agent from V2 to V3 format |
| Gage (`devops`) | `*migrate-batch` | `-` | Batch migrate all agents with validation |
| Gage (`devops`) | `*session-info` | `-` | Show current session details (agent history, commands) |
| Gage (`devops`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Gage (`devops`) | `*exit` | `-` | Exit DevOps mode |

## UX e Design System

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Uma (`ux-design-expert`) | `*research` | `-` | Conduct user research and needs analysis |
| Uma (`ux-design-expert`) | `*wireframe` | `{fidelity}` | Create wireframes and interaction flows |
| Uma (`ux-design-expert`) | `*generate-ui-prompt` | `-` | Generate prompts for AI UI tools (v0, Lovable) |
| Uma (`ux-design-expert`) | `*create-front-end-spec` | `-` | Create detailed frontend specification |
| Uma (`ux-design-expert`) | `*audit` | `{path}` | Scan codebase for UI pattern redundancies |
| Uma (`ux-design-expert`) | `*consolidate` | `-` | Reduce redundancy using intelligent clustering |
| Uma (`ux-design-expert`) | `*shock-report` | `-` | Generate visual HTML report showing chaos + ROI |
| Uma (`ux-design-expert`) | `*tokenize` | `-` | Extract design tokens from consolidated patterns |
| Uma (`ux-design-expert`) | `*setup` | `-` | Initialize design system structure |
| Uma (`ux-design-expert`) | `*migrate` | `-` | Generate phased migration strategy (4 phases) |
| Uma (`ux-design-expert`) | `*upgrade-tailwind` | `-` | Plan and execute Tailwind CSS v4 upgrades |
| Uma (`ux-design-expert`) | `*audit-tailwind-config` | `-` | Validate Tailwind configuration health |
| Uma (`ux-design-expert`) | `*export-dtcg` | `-` | Generate W3C Design Tokens bundles |
| Uma (`ux-design-expert`) | `*bootstrap-shadcn` | `-` | Install Shadcn/Radix component library |
| Uma (`ux-design-expert`) | `*build` | `{component}` | Build production-ready atomic component |
| Uma (`ux-design-expert`) | `*compose` | `{molecule}` | Compose molecule from existing atoms |
| Uma (`ux-design-expert`) | `*extend` | `{component}` | Add variant to existing component |
| Uma (`ux-design-expert`) | `*document` | `-` | Generate pattern library documentation |
| Uma (`ux-design-expert`) | `*a11y-check` | `-` | Run accessibility audit (WCAG AA/AAA) |
| Uma (`ux-design-expert`) | `*calculate-roi` | `-` | Calculate ROI and cost savings |
| Uma (`ux-design-expert`) | `*scan` | `{path\|url}` | Analyze HTML/React artifact for patterns |
| Uma (`ux-design-expert`) | `*integrate` | `{pack}` | Connect with expansion pack |
| Uma (`ux-design-expert`) | `*help` | `-` | Show all commands organized by phase |
| Uma (`ux-design-expert`) | `*status` | `-` | Show current workflow phase |
| Uma (`ux-design-expert`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Uma (`ux-design-expert`) | `*exit` | `-` | Exit UX-Design Expert mode |

## Squads e Extensões

| Agente | Comando | Args | Descrição |
|---|---|---|---|
| Craft (`squad-creator`) | `*help` | `-` | Show all available commands with descriptions |
| Craft (`squad-creator`) | `*design-squad` | `-` | Design squad from documentation with intelligent recommendations |
| Craft (`squad-creator`) | `*create-squad` | `-` | Create new squad following task-first architecture |
| Craft (`squad-creator`) | `*validate-squad` | `-` | Validate squad against JSON Schema and AIOS standards |
| Craft (`squad-creator`) | `*list-squads` | `-` | List all local squads in the project |
| Craft (`squad-creator`) | `*migrate-squad` | `-` | Migrate legacy squad to AIOS 2.1 format |
| Craft (`squad-creator`) | `*task` | `-` | squad-creator-migrate.md |
| Craft (`squad-creator`) | `*analyze-squad` | `-` | Analyze squad structure, coverage, and get improvement suggestions |
| Craft (`squad-creator`) | `*task` | `-` | squad-creator-analyze.md |
| Craft (`squad-creator`) | `*extend-squad` | `-` | Add new components (agents, tasks, templates, etc.) to existing squad |
| Craft (`squad-creator`) | `*task` | `-` | squad-creator-extend.md |
| Craft (`squad-creator`) | `*download-squad` | `-` | Download public squad from aios-squads repository (Sprint 8) |
| Craft (`squad-creator`) | `*status` | `-` | placeholder |
| Craft (`squad-creator`) | `*publish-squad` | `-` | Publish squad to aios-squads repository (Sprint 8) |
| Craft (`squad-creator`) | `*sync-squad-synkra` | `-` | Sync squad to Synkra API marketplace (Sprint 8) |
| Craft (`squad-creator`) | `*guide` | `-` | Show comprehensive usage guide for this agent |
| Craft (`squad-creator`) | `*exit` | `-` | Exit squad-creator mode |


# BRIEFING — 2026-09-08T08:15:03Z

## Mission
Develop custom Apache Superset plugin: Chart KPI Card con Confronto Temporale (Delta % integrato) with PowerShell installer and git repo.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison\.agents\orchestrator_1
- Original parent: Sentinel
- Original parent conversation ID: c9449fb8-ba57-4bbf-8842-025ac539389e

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison\PROJECT.md
1. **Decompose**: Survey full scope with 3 parallel Explorers/Spec Miners -> create PROJECT.md -> decompose into milestones (UI & Controls, Data & Query Modes, Installer & Git Repo, E2E Test Pass).
2. **Dispatch & Execute**:
   - Top-level orchestrator dispatches sub-orchestrators for milestones or executes iteration loop per milestone: Explorer -> Worker -> Reviewer -> Challenger -> Auditor.
   - Dual track: Implementation Track + E2E Testing Track.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: Self-succeed at 16 spawns or context exhaustion.
- **Work items**:
  1. Survey & Architecture Specification [in-progress]
  2. Test Infrastructure & E2E Track [pending]
  3. Milestone M1: Core Plugin Architecture, Types & Controls [pending]
  4. Milestone M2: KPI Card UI & Data Transform (Dual Metric + Time-Shift) [pending]
  5. Milestone M3: Installer Scripts & Superset Integration [pending]
  6. Final Milestone: E2E Verification & Adversarial Coverage Hardening [pending]
- **Current phase**: 0 (Survey)
- **Current focus**: Map scope and codebase via 3 Explorers / Spec Miners

## 🔒 Key Constraints
- yasidb is strictly READ-ONLY. No DDL/DML.
- Orchestrator is dispatch-only: never write source code or run builds/tests directly.
- Include ORIGINAL_REQUEST.md path in all dispatches.
- Auditor verdict CLEAN is non-negotiable (binary veto).
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: c9449fb8-ba57-4bbf-8842-025ac539389e
- Updated: 2026-09-08T08:15:03Z

## Key Decisions Made
- Initialized orchestrator state. Starting Phase 0 (Survey) with parallel exploration of reference plugins, Superset plugin registry, and data requirements.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|

## Succession Status
- Succession required: no
- Spawn count: 0 / 16
- Pending subagents: none
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: not started
- Safety timer: none

## Artifact Index
- D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison\.agents\ORIGINAL_REQUEST.md — Original User Request
- D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison\.agents\orchestrator_1\DISPATCH.md — Dispatch log
- D:\Sviluppo\superset-plugins\superset-plugin-chart-kpi-comparison\.agents\orchestrator_1\progress.md — Progress and heartbeat log

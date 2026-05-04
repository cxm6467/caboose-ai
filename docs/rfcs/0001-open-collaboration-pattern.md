# RFC 0001: Open Collaboration Pattern

## Status

Proposed

## Summary

Use this repository as a public, maintainer-led project where people can react to the idea, ask questions, suggest improvements, and contribute code without taking over project direction.

The project should be open enough for community feedback and pull requests, but explicit that maintainers decide the roadmap, architecture, and what gets merged.

## Problem

A public repo is useful for validating whether an idea is worth building, but it can get messy fast if the rules are vague.

Without a clear collaboration pattern:

- feedback gets mixed with actionable work
- large pull requests show up before the direction is agreed on
- contributors may assume the project is community-governed when it is maintainer-led
- maintainers can feel pressured to accept changes that do not fit the project
- the repo can drift away from the original idea

## Goals

- Make it easy for people to understand the idea and give feedback.
- Make it clear how to suggest a change before building it.
- Keep issues focused on actionable work.
- Keep pull requests small, reviewable, and aligned with the project direction.
- Preserve maintainer ownership of roadmap, architecture, and merge decisions.
- Create a low-friction path from idea -> discussion -> issue -> pull request.

## Non-goals

- This does not make the project a free-for-all.
- This does not promise that every good idea will be accepted.
- This does not give contributors write access by default.
- This does not replace maintainer judgment.
- This does not require a formal foundation, steering committee, or governance process.

## Proposed Workflow

### 1. Ideas start as RFCs or discussions

Large ideas should start as an RFC-style document or a GitHub Discussion before anyone writes a large implementation.

Use an RFC when the change affects:

- project direction
- architecture
- contributor workflow
- public API behavior
- repository structure
- automation behavior
- security posture
- long-term maintenance burden

Small bug fixes and typo fixes can go straight to a pull request.

### 2. Discussions are for feedback

Use discussions for questions like:

- Would this be useful?
- Is this the right direction?
- What would make this better?
- Is there a simpler version?
- Would you contribute to this?

Discussions are intentionally exploratory. They are not automatically commitments.

### 3. Issues are for committed work

Use issues only when the work is specific enough to act on.

A good issue should include:

- the problem
- the expected outcome
- any constraints
- a rough implementation direction, if known
- whether help is wanted

### 4. Pull requests are reviewed, not assumed

Pull requests are welcome, but maintainers decide what merges.

Maintainers may:

- request changes
- ask for the idea to move back to discussion first
- split a PR into smaller pieces
- reject a change that does not fit the project
- delay a change until the project direction is clearer

This is normal project maintenance, not personal rejection. Boring but necessary.

## Contribution Guardrails

Contributors should:

- open a discussion/RFC before large changes
- keep pull requests focused
- avoid surprise rewrites
- include tests or rationale when behavior changes
- explain tradeoffs, not just implementation details
- respect the maintainer's final decision

Maintainers should:

- be clear about why something is accepted or rejected
- label issues that are good for outside help
- avoid leaving contributors guessing
- close stale or misaligned proposals directly but politely
- document repeated decisions in RFCs or project docs

## Suggested Repository Setup

- Enable GitHub Discussions.
- Use discussion categories like `Ideas`, `RFCs`, `Questions`, `Show and Tell`, and `Help Wanted`.
- Keep issues for actionable work.
- Protect `main` so changes require pull requests.
- Use `CODEOWNERS` so maintainer review is required for key files.
- Use pull request templates to ask whether a change came from an RFC/discussion.
- Avoid granting write access until someone has contributed consistently and responsibly.

## Decision Rules

This project is maintainer-led.

That means:

- maintainers decide what gets merged
- maintainers decide roadmap and scope
- public feedback is valued, but not binding
- forks are allowed by the license, but this repository remains the canonical project unless maintainers say otherwise

## Open Questions

- Should RFCs live in `docs/rfcs/` permanently, or should accepted ones be promoted into normal docs?
- Should each major project idea have its own RFC file?
- Should the repo use GitHub Discussions as the primary public feedback channel?
- What labels should mark contribution-ready work?
- Should maintainers require an RFC for any feature that changes public behavior?

## Initial Recommendation

Adopt this RFC as the default collaboration pattern for the repo.

Start with lightweight rules:

1. Ideas and major changes start in discussions or RFCs.
2. Issues are for actionable work.
3. Pull requests require maintainer review.
4. Maintainers keep final say over roadmap and merges.
5. Contributors are welcome, but nobody gets to accidentally hijack the damn thing.

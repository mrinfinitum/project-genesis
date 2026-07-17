# Project Genesis Studio Experience Design Framework ED-01

Version: 1.0

Experience Design is a first-class Studio domain for canonical NOVERIS creative direction.

It is not gameplay, rendering, React implementation, CSS, or Three.js. Studio authors approved design definitions; game clients may consume them through a future explicit contract. ED-01 does not publish Experience Design content into runtime exports.

## Workspace Scope

Experience Design supports:

- Experience Bible
- Inspiration Boards
- Concept Library
- Screen Library
- Canonical Design Tokens
- Material Library
- Motion Library
- Component Library
- Theme Library
- Brand System
- Accessibility
- Experience Journey
- Reviews
- Version History

## Content Model Rules

Every Experience Design content type supports:

- id
- name
- description
- status
- created
- modified
- version
- author
- tags
- notes
- attachments
- relationships
- approvalStatus
- history

Review states are:

- Draft
- In Review
- Approved
- Deprecated
- Archived

## Ownership Boundary

Studio owns canonical creative intent, references, review workflow, and version history.

The Game owns layout implementation, rendering, camera, shaders, controls, CSS, React, Three.js, and platform-specific UI code.

## Runtime Boundary

ED-01 is authoring framework only.

It must not modify gameplay, engine exports, public runtime payloads, checksums, or contentVersion.

## DS-02 Canonical Design Tokens

DS-02 creates the canonical semantic Design Token system for NOVERIS.

Tokens are authoring records that describe meaning, purpose, relationships, review state, and version history. They are not CSS variables, Tailwind classes, renderer settings, shader values, or implementation code.

Canonical token libraries:

- Color Tokens
- Typography Tokens
- Spacing Tokens
- Radius Tokens
- Elevation Tokens
- Shadow Tokens
- Blur Tokens
- Opacity Tokens
- Motion Tokens
- Timing Tokens
- Breakpoint Tokens
- Z-Layer Tokens
- Icon Tokens
- Grid Tokens
- Stroke Tokens
- Glow Tokens
- Atmosphere Tokens
- Glass Tokens
- Background Tokens
- Transition Tokens

Good token names describe purpose, such as `accent.civilization.gold`, `surface.command.glass`, `text.primary`, and `motion.fade.standard`.

Bad token names describe raw appearance or implementation, such as `gold500`, `blue100`, `radius12`, or `blur24`.

DS-02 remains Draft at version 0.1. Token values are not published yet; future runtime publication belongs to a later Design Runtime milestone.

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
- Design Token Collections
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

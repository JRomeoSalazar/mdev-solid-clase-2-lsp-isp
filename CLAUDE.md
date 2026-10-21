# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A teaching exercise (README is in Spanish) on **LSP** and **ISP** using a fictional "OfiDocs" office system. The starting code is intentionally flawed: it works and all 19 tests pass, but the clients are written defensively to hide design problems. The task is to refactor the design, not to add features.

## Commands

- `npm test`: run all tests (vitest, one-shot)
- `npx vitest run test/archive-service.test.ts`: run a single test file
- `npx vitest run -t "<test name>"`: run tests matching a name
- `npm run typecheck`: `tsc --noEmit` (covers `src` and `test`)
- `npm run demo`: run `src/demo.ts` via tsx; its last line currently shows the LSP bug (archive says it purged a document that is still there)

Node >= 22, ESM (`"type": "module"`); imports use explicit `.ts` extensions.

## Architecture

Two independent halves, each with an abstraction plus a "client" that consumes it:

- **Devices (ISP):** `src/devices/office-device.ts` defines one fat `OfficeDevice` interface (`getStatus`, `print`, `scan`, `fax`, `staple`, `refillToner`) and `UnsupportedOperationError`. `MultifunctionPrinter`, `BasicInkjetPrinter` and `NetworkScanner` implement it, throwing `UnsupportedOperationError` for what they can't do. The client `src/office-workflow.ts` discovers capabilities with `try/catch`, and `capabilitiesReport()` uses `instanceof` per concrete class.
- **Storage (LSP):** `src/storage/document-storage.ts` is an abstract class whose header comment documents the contract (save accepts any valid document, remove returns true only if actually deleted, etc.). `LocalDiskStorage`, `ObjectBucketStorage` and `ReadOnlyArchiveStorage` subclass it; two violate the contract (a strengthened precondition and a weakened postcondition). The client `src/archive-service.ts` compensates with `instanceof`, name normalization, and manual post-checks in `purge()`.

Shared types are in `src/types.ts`.

## Constraints from the exercise (README "Criterios de aceptación")

- **Do not modify the tests** in `test/`; the refactor must keep them green.
- Target end state: no `UnsupportedOperationError` thrown anywhere (the class should be deletable), no `try/catch` capability probing in `OfficeWorkflow`, no `instanceof` in `ArchiveService`, and `ReadOnlyArchiveStorage` must not expose write operations, so the compiler rejects writes to it.
- Fix direction hinted by the README: split interfaces by capability (not by technology); the storage that has quirks (e.g. bucket name rules) should own its own input normalization rather than the client.
- Extra goal: `capabilitiesReport()` should work without `instanceof` or a `type: string` field on devices.

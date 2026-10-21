# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A teaching exercise (README is in Spanish) on **LSP** and **ISP** using a fictional "OfiDocs" office system. The starting code was intentionally flawed (clients written defensively to hide design problems); the refactor has since been applied. All 19 tests must stay green.

## Commands

- `npm test`: run all tests (vitest, one-shot)
- `npx vitest run test/archive-service.test.ts`: run a single test file
- `npx vitest run -t "<test name>"`: run tests matching a name
- `npm run typecheck`: `tsc --noEmit` (covers `src` and `test`)
- `npm run demo`: run `src/demo.ts` via tsx

Node >= 22, ESM (`"type": "module"`); imports use explicit `.ts` extensions.

## Architecture

The refactor is applied. Two independent halves, each with abstractions plus a "client" that consumes them:

- **Devices (ISP):** `src/devices/office-device.ts` defines a minimal `OfficeDevice` (`id`, `model`, `getStatus`) plus one interface per capability (`Printer`, `Scanner`, `FaxSender`, `Stapler`, `TonerRefillable`) with `is*` type guards. `MultifunctionPrinter` implements all of them, `BasicInkjetPrinter` only `Printer`, `NetworkScanner` only `Scanner`. `OfficeWorkflow` picks devices with the type guards; `capabilitiesReport()` derives labels from them.
- **Storage (LSP):** `src/storage/document-storage.ts` defines `ReadableStorage` (`load`, `listIds`) and `WritableStorage` (`save`, `remove`, with the documented contract), the `isWritableStorage` guard, and the `DocumentStorage` base class for writable stores. `ReadOnlyArchiveStorage` only implements `ReadableStorage`; `ObjectBucketStorage` normalizes its own keys. `ArchiveService` accepts `ReadableStorage[]` and writes only to writable ones.

Shared types are in `src/types.ts`.

## Constraints from the exercise (README "Criterios de aceptación")

- **Do not modify the tests** in `test/`; the refactor must keep them green.
- Target end state: no `UnsupportedOperationError` thrown anywhere (the class should be deletable), no `try/catch` capability probing in `OfficeWorkflow`, no `instanceof` in `ArchiveService`, and `ReadOnlyArchiveStorage` must not expose write operations, so the compiler rejects writes to it.
- Fix direction hinted by the README: split interfaces by capability (not by technology); the storage that has quirks (e.g. bucket name rules) should own its own input normalization rather than the client.
- Extra goal: `capabilitiesReport()` should work without `instanceof` or a `type: string` field on devices.

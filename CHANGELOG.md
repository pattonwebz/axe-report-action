# Changelog

Notable changes to this action. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [0.0.3] — 2026-07-24

### Added

- `show-personas` input (default `false`). When enabled, adds a "Personas: who these
  findings affect" section to the job summary: every violated rule in the current run
  mapped to the real people it affects from the GOV.UK / GDS accessibility persona set
  (Ashleigh, Claudia, Christopher, Pawel, Ron, Saleem, Simone) — identity, needs, and
  the specific rules/counts found this run — instead of leaving a finding as an
  abstract disability category. A persona with no matched rule in the current run is
  reported explicitly as an automation-coverage gap ("prioritize manual testing"), not
  silently omitted.

## [0.0.2] — 2026-07-11

### Added

- MIT `LICENSE` (the code was previously unlicensed; `package.json` claimed ISC).

### Changed

- README: the combined usage example uses the JSON `urls` format introduced in axe-scan-action v0.0.2.

## [0.0.1] — 2026-07-10

Initial release: render axe-core JSON results (from axe-scan-action or a raw array of axe result objects) as a job-summary report, failing the job at a configurable violation impact threshold.

# Changelog

Notable changes to this action. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [0.0.2] — 2026-07-11

### Added

- MIT `LICENSE` (the code was previously unlicensed; `package.json` claimed ISC).

### Changed

- README: the combined usage example uses the JSON `urls` format introduced in axe-scan-action v0.0.2.

## [0.0.1] — 2026-07-10

Initial release: render axe-core JSON results (from axe-scan-action or a raw array of axe result objects) as a job-summary report, failing the job at a configurable violation impact threshold.

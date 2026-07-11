# Changelog

Notable changes to this action. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- MIT `LICENSE` (the code was previously unlicensed; `package.json` claimed ISC).

### Changed

- README: the combined usage example uses the JSON `urls` format introduced in the upcoming axe-scan-action release.

## [0.0.1] — 2026-07-10

Initial release: render axe-core JSON results (from axe-scan-action or a raw array of axe result objects) as a job-summary report, failing the job at a configurable violation impact threshold.

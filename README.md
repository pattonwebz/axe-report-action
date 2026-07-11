# Axe Report

A GitHub Action that turns raw [axe-core](https://github.com/dequelabs/axe-core) JSON results into a readable accessibility report in the workflow job summary — a per-URL violation table plus per-rule detail with impact levels and documentation links — and fails the job when violations at or above a chosen impact level are found.

It doesn't run any scans itself, so it composes with however you already run axe:

- [axe-scan-action](https://github.com/pattonwebz/axe-scan-action) — its companion scanner (URLs in, JSON out).
- `@axe-core/cli` output (an array of axe result objects).
- Your own Playwright/Puppeteer scripts — anything that saves axe results as JSON.

## Usage

```yaml
- name: Scan
  id: scan
  uses: pattonwebz/axe-scan-action@v0.0.1
  with:
    urls: '["https://example.com/", "https://example.com/contact/"]'

- name: Report
  if: always()
  uses: pattonwebz/axe-report-action@v0.0.1
  with:
    results-file: ${{ steps.scan.outputs.results-file }}
    fail-on: serious
```

Or from `@axe-core/cli`:

```yaml
- run: npx @axe-core/cli https://example.com/ --save axe-results.json
- uses: pattonwebz/axe-report-action@v0.0.1
  with:
    results-file: axe-results.json
```

## Inputs

| Input | Default | Description |
|---|---|---|
| `results-file` | *(required)* | Path to a JSON file of axe-core results — axe-scan-action output or a raw array of axe result objects. |
| `fail-on` | `serious` | Minimum violation impact that fails the job: `critical`, `serious`, `moderate`, `minor`, or `none` to always pass. |

URLs recorded as unscannable in the results count as failed (a scan you didn't run is not a pass).

## Outputs

| Output | Description |
|---|---|
| `total-violations` | Total violations (counted per affected element) across all URLs. |
| `failed-urls` | URLs that were unscannable or exceeded the `fail-on` threshold. |

## Development

```bash
npm install
npm run typecheck
npm run build     # bundles src/ into dist/ with ncc — dist/ is committed
```

`dist/` is committed on purpose: GitHub runs JavaScript actions straight from the checked-out repo without installing dependencies.

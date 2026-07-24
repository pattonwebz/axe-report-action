import * as core from '@actions/core';
import { buildReport, normalizeResults, IMPACT_ORDER } from '@pattonwebz/axe-a11y-report';
import type { ReportOptions, UrlResult } from '@pattonwebz/axe-a11y-report';

export { normalizeResults, IMPACT_ORDER };
export type { UrlResult };

export interface Summary {
	totalViolations: number;
	failedUrls: number;
}

/**
 * This action is a thin GitHub Actions wrapper around @pattonwebz/axe-a11y-report:
 * it builds the Markdown report there, then writes it to the job summary here.
 * See that package if you want the same report somewhere other than a GitHub
 * Actions job summary (a local script, a PR comment, another CI system).
 */
export async function writeReport(
	results: UrlResult[],
	failOn: string,
	showPersonas = false
): Promise<Summary> {
	const options: ReportOptions = { failOn, showPersonas };
	const report = buildReport( results, options );

	core.summary.addRaw( report.markdown, true );
	await core.summary.write();

	return { totalViolations: report.totalViolations, failedUrls: report.failedUrls };
}

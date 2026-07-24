import * as core from '@actions/core';
import type { AxeResults } from 'axe-core';
import { personas, ruleToPersonaKeys } from './personas';

export const IMPACT_ORDER = [ 'minor', 'moderate', 'serious', 'critical' ] as const;
export type Impact = ( typeof IMPACT_ORDER )[ number ];

export interface UrlResult {
	url: string;
	results?: AxeResults;
	error?: string;
}

export interface Summary {
	totalViolations: number;
	failedUrls: number;
}

function impactRank( impact: string | null | undefined ): number {
	return IMPACT_ORDER.indexOf( ( impact ?? 'minor' ) as Impact );
}

/**
 * Accept either axe-scan-action output ({ url, results?, error? } entries)
 * or a raw array of axe result objects (e.g. from `@axe-core/cli --save`,
 * where each entry is the results object itself with a `url` property).
 */
export function normalizeResults( parsed: unknown ): UrlResult[] {
	if ( ! Array.isArray( parsed ) ) {
		throw new Error( 'Results file must contain a JSON array.' );
	}
	return parsed.map( ( entry, i ) => {
		if ( entry && typeof entry === 'object' && 'violations' in entry ) {
			const res = entry as AxeResults;
			return { url: res.url || `result ${ i + 1 }`, results: res };
		}
		if ( entry && typeof entry === 'object' && 'url' in entry ) {
			return entry as UrlResult;
		}
		throw new Error( `Unrecognized results entry at index ${ i }.` );
	} );
}

/**
 * Write a human-friendly markdown report to the GitHub job summary and
 * return the numbers main() needs for outputs and pass/fail.
 */
export async function writeReport(
	results: UrlResult[],
	failOn: string,
	showPersonas = false
): Promise<Summary> {
	const failThreshold = failOn === 'none' ? Infinity : impactRank( failOn );
	let totalViolations = 0;
	let failedUrls = 0;

	core.summary.addHeading( 'Accessibility scan (axe-core)', 2 );

	const tableRows: string[][] = [
		[ 'URL', 'Critical', 'Serious', 'Moderate', 'Minor', 'Status' ],
	];

	for ( const { url, results: res, error } of results ) {
		if ( error || ! res ) {
			tableRows.push( [ url, '—', '—', '—', '—', `⚠️ scan failed: ${ error }` ] );
			failedUrls++;
			continue;
		}

		const counts: Record<Impact, number> = { minor: 0, moderate: 0, serious: 0, critical: 0 };
		let urlFails = false;
		for ( const violation of res.violations ) {
			const nodes = violation.nodes.length;
			counts[ ( violation.impact ?? 'minor' ) as Impact ] += nodes;
			totalViolations += nodes;
			if ( impactRank( violation.impact ) >= failThreshold ) {
				urlFails = true;
			}
		}
		if ( urlFails ) {
			failedUrls++;
		}

		tableRows.push( [
			url,
			String( counts.critical ),
			String( counts.serious ),
			String( counts.moderate ),
			String( counts.minor ),
			urlFails ? '❌ fail' : '✅ pass',
		] );
	}

	core.summary.addTable( tableRows.map( ( row, i ) =>
		row.map( ( data ) => ( { data, header: i === 0 } ) )
	) );

	// Per-violation detail, grouped by URL, worst impact first.
	for ( const { url, results: res } of results ) {
		if ( ! res || res.violations.length === 0 ) {
			continue;
		}
		core.summary.addHeading( url, 3 );
		const sorted = [ ...res.violations ].sort(
			( a, b ) => impactRank( b.impact ) - impactRank( a.impact )
		);
		for ( const v of sorted ) {
			// Help text can contain literal markup like "<html> element" — escape it.
			const help = v.help.replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
			core.summary.addRaw(
				`- **${ v.impact ?? 'minor' }** \`${ v.id }\` — ${ help } ` +
				`(${ v.nodes.length } element${ v.nodes.length === 1 ? '' : 's' }) ` +
				`[docs](${ v.helpUrl })`,
				true
			);
		}
	}

	if ( showPersonas ) {
		writePersonaSection( results );
	}

	await core.summary.write();

	return { totalViolations, failedUrls };
}

/**
 * Aggregate violations by rule across every URL, then render one card per real
 * persona: who they are, what they need, and which of *this run's* violated
 * rules actually touch that need — or an honest note when none do, since a
 * persona with no matched rule is a coverage gap, not a clean bill of health.
 */
function writePersonaSection( results: UrlResult[] ): void {
	const nodesByRule = new Map<string, number>();
	for ( const { results: res } of results ) {
		for ( const violation of res?.violations ?? [] ) {
			nodesByRule.set( violation.id, ( nodesByRule.get( violation.id ) ?? 0 ) + violation.nodes.length );
		}
	}

	core.summary.addHeading( 'Personas: who these findings affect', 2 );
	core.summary.addRaw(
		'Real people from the GOV.UK / GDS accessibility persona set, not just disability labels.',
		true
	);

	for ( const persona of personas ) {
		const matchedRuleIds = Object.entries( ruleToPersonaKeys )
			.filter( ( [ , keys ] ) => keys.includes( persona.key ) )
			.map( ( [ ruleId ] ) => ruleId )
			.filter( ( ruleId ) => nodesByRule.has( ruleId ) );

		core.summary.addHeading( `${ persona.userType } — ${ persona.name }`, 3 );
		core.summary.addRaw( `- ${ persona.identity }`, true );
		core.summary.addRaw( `- Needs: ${ persona.needs }`, true );
		if ( matchedRuleIds.length > 0 ) {
			const ruleList = matchedRuleIds
				.map( ( ruleId ) => `\`${ ruleId }\` (${ nodesByRule.get( ruleId ) })` )
				.join( ', ' );
			core.summary.addRaw( `- Found in this scan: ${ ruleList }`, true );
		} else {
			core.summary.addRaw(
				"- Found in this scan: none of the rules that map to this persona's primary needs. " +
					'Automation coverage here is limited — prioritize manual testing.',
				true
			);
		}
	}
}

import * as core from '@actions/core';
import * as fs from 'node:fs';
import { normalizeResults, writeReport, IMPACT_ORDER } from './report';

async function run(): Promise<void> {
	try {
		const resultsFile = core.getInput( 'results-file', { required: true } );
		const failOn = core.getInput( 'fail-on' ) || 'serious';
		if ( failOn !== 'none' && ! IMPACT_ORDER.includes( failOn as never ) ) {
			core.setFailed( `Invalid fail-on value "${ failOn }". Use one of: ${ IMPACT_ORDER.join( ', ' ) }, none.` );
			return;
		}

		const showPersonas = core.getInput( 'show-personas' ) === 'true';

		const results = normalizeResults( JSON.parse( fs.readFileSync( resultsFile, 'utf8' ) ) );
		const summary = await writeReport( results, failOn, showPersonas );

		core.setOutput( 'total-violations', summary.totalViolations );
		core.setOutput( 'failed-urls', summary.failedUrls );

		if ( failOn !== 'none' && summary.failedUrls > 0 ) {
			core.setFailed(
				`${ summary.failedUrls } of ${ results.length } URL(s) failed the accessibility check ` +
				`(fail-on: ${ failOn }, total violations: ${ summary.totalViolations }).`
			);
		} else {
			core.info( `Done: ${ summary.totalViolations } violation(s) found, none at or above "${ failOn }".` );
		}
	} catch ( err ) {
		core.setFailed( err instanceof Error ? err.message : String( err ) );
	}
}

run();

/**
 * Real people, not just disability categories — the GOV.UK / GDS accessibility
 * persona set (https://alphagov.github.io/accessibility-personas/). Each rule maps
 * to the personas most likely affected, so a report can hand a violation off to a
 * named person instead of leaving it as an abstract "screen reader users" label.
 */
export interface Persona {
	key: string;
	name: string;
	userType: string;
	identity: string;
	needs: string;
}

export const personas: Persona[] = [
	{
		key: 'ashleigh',
		name: 'Ashleigh',
		userType: 'Blind & Screen Reader Users',
		identity: 'Partially sighted, uses JAWS and other screen reader features',
		needs: 'Clear semantic structure, labelled controls, and full keyboard access',
	},
	{
		key: 'claudia',
		name: 'Claudia',
		userType: 'Low-Vision & Magnification Users',
		identity: 'Partially sighted (glaucoma, diabetes), uses ZoomText and a large monitor',
		needs: 'Strong contrast, predictable layout, content that reflows under magnification',
	},
	{
		key: 'christopher',
		name: 'Christopher',
		userType: 'Motor & Dexterity Users',
		identity: 'Has rheumatoid arthritis, prefers keyboard access, exploring speech recognition',
		needs: 'Full keyboard operability, generous touch targets, no drag-and-drop-only controls',
	},
	{
		key: 'pawel',
		name: 'Pawel',
		userType: 'Autistic & Cognitive-Load-Sensitive Users',
		identity: 'Autistic, experiences anxiety, prefers simpler and less cluttered interfaces',
		needs: 'Predictable layouts, plain language, minimal motion and distraction',
	},
	{
		key: 'ron',
		name: 'Ron',
		userType: 'Older Users',
		identity: 'Older user with arthritis, cataracts, and hearing loss',
		needs: 'Large text, high contrast, and simple, uncluttered forms',
	},
	{
		key: 'saleem',
		name: 'Saleem',
		userType: 'Deaf & Hard-of-Hearing Users',
		identity: 'Profoundly deaf, BSL is his first language',
		needs: 'Accurate captions and transcripts, and non-audio contact routes',
	},
	{
		key: 'simone',
		name: 'Simone',
		userType: 'Dyslexic Users',
		identity: 'Dyslexic, benefits from plain language and strong structure',
		needs: 'Clear headings, readable typography, and uncomplicated forms',
	},
];

export const personaByKey = new Map( personas.map( ( persona ) => [ persona.key, persona ] ) );

/** axe-core rule ID -> persona keys most likely affected. */
export const ruleToPersonaKeys: Record<string, string[]> = {
	label: [ 'ashleigh', 'christopher', 'claudia', 'ron', 'simone' ],
	'button-name': [ 'ashleigh', 'christopher', 'claudia', 'ron', 'simone' ],
	'link-name': [ 'ashleigh', 'christopher', 'claudia', 'ron', 'simone' ],
	'image-alt': [ 'ashleigh', 'ron', 'simone' ],
	'color-contrast': [ 'claudia', 'ron', 'simone' ],
	'aria-hidden-focus': [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	bypass: [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	region: [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	list: [ 'ashleigh', 'ron', 'simone', 'saleem' ],
	listitem: [ 'ashleigh', 'ron', 'simone', 'saleem' ],
	'heading-order': [ 'ashleigh', 'claudia', 'ron', 'simone' ],
	'target-size': [ 'christopher', 'ron', 'claudia' ],
	'meta-viewport': [ 'claudia', 'ron' ],
	'document-title': [ 'ashleigh', 'claudia', 'ron', 'simone', 'saleem' ],
	'duplicate-id-active': [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	tabindex: [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	'nested-interactive': [ 'ashleigh', 'christopher', 'claudia', 'ron' ],
	'html-has-lang': [ 'ashleigh', 'saleem', 'simone', 'ron', 'pawel' ],
	'valid-lang': [ 'ashleigh', 'saleem', 'simone', 'ron', 'pawel' ],
	'video-caption': [ 'saleem', 'pawel', 'simone' ],
	'audio-caption': [ 'saleem' ],
	blink: [ 'pawel', 'simone' ],
	'meta-refresh-no-exceptions': [ 'ashleigh', 'christopher', 'ron', 'pawel', 'simone' ],
};

export function personasForRule( ruleId: string ): Persona[] {
	return ( ruleToPersonaKeys[ ruleId ] ?? [] )
		.map( ( key ) => personaByKey.get( key ) )
		.filter( ( persona ): persona is Persona => Boolean( persona ) );
}

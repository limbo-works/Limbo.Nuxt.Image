import { afterEach, describe, expect, it, vi } from 'vitest';
import { useImageSizes } from '../app/composables/useImageSizes';

/*
  Characterisation tests: these record what the composable does today, so the
  TypeScript conversion can be shown to change nothing. Cases under "known
  quirks" pin behaviour that is arguably wrong.
*/

const BREAKPOINTS = [300, 568, 605, 760, 990, 1080, 1440];

function stubScreens(breakpoints: number[] = BREAKPOINTS) {
	const screens: Record<string, number> = {};
	for (const breakpoint of breakpoints) {
		screens[`>=${breakpoint}`] = breakpoint;
	}
	vi.stubGlobal('useImage', () => {
		return { options: { screens } };
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('input that is passed straight back', () => {
	it.each([undefined, ''])('returns %s unchanged', (sizes) => {
		stubScreens();
		expect(useImageSizes(sizes)).toBe(sizes);
	});

	it('leaves px-only sizes alone', () => {
		stubScreens();
		expect(useImageSizes('800px')).toBe('800px');
		expect(useImageSizes('800px >=1080:400px')).toBe('800px >=1080:400px');
	});

	it('leaves sizes alone when no screens are configured', () => {
		stubScreens([]);
		expect(useImageSizes('100vw >=1080:800px')).toBe('100vw >=1080:800px');
	});
});

describe('spreading vw values across breakpoints', () => {
	it('repeats a bare vw value at every breakpoint', () => {
		stubScreens();
		expect(useImageSizes('100vw')).toBe(
			'100vw >=300:100vw >=568:100vw >=605:100vw >=760:100vw >=990:100vw >=1080:100vw >=1440:100vw'
		);
	});

	it('carries a vw value up from the breakpoint it is set at', () => {
		stubScreens();
		expect(useImageSizes('100vw >=605:50vw')).toBe(
			'100vw >=300:100vw >=568:100vw >=605:50vw >=760:50vw >=990:50vw >=1080:50vw >=1440:50vw'
		);
	});

	it('lets a later breakpoint override an earlier one', () => {
		stubScreens();
		expect(useImageSizes('100vw >=605:50vw >=1080:33vw')).toBe(
			'100vw >=300:100vw >=568:100vw >=605:50vw >=760:50vw >=990:50vw >=1080:33vw >=1440:33vw'
		);
	});

	it('spreads a px value set at a breakpoint to larger ones', () => {
		stubScreens();
		expect(useImageSizes('100vw >=1080:800px')).toBe(
			'100vw >=300:100vw >=568:100vw >=605:100vw >=760:100vw >=990:100vw >=1080:800px >=1440:800px'
		);
	});

	it('sorts smallest breakpoint first regardless of input order', () => {
		stubScreens();
		expect(useImageSizes('>=1440:25vw 100vw')).toBe(
			'100vw >=300:100vw >=568:100vw >=605:100vw >=760:100vw >=990:100vw >=1080:100vw >=1440:25vw'
		);
	});

	it('tolerates repeated whitespace between entries', () => {
		stubScreens();
		expect(useImageSizes('100vw  >=605:50vw')).toBe(
			useImageSizes('100vw >=605:50vw')
		);
	});

	it('omits breakpoints below the smallest one given', () => {
		stubScreens();
		expect(useImageSizes('>=605:50vw')).toBe(
			'>=605:50vw >=760:50vw >=990:50vw >=1080:50vw >=1440:50vw'
		);
	});
});

describe('known quirks', () => {
	/*
	  A breakpoint that is not in the project's screens resolves to NaN, and its
	  value is emitted as a bare entry in the middle of the list rather than
	  being dropped, producing a sizes string no browser will parse as intended.
	*/
	it('emits an unknown breakpoint as a bare value', () => {
		stubScreens();
		expect(useImageSizes('100vw >=999:50vw')).toBe(
			'100vw 50vw >=300:100vw >=568:100vw >=605:100vw >=760:100vw >=990:100vw >=1080:100vw >=1440:100vw'
		);
	});

	it('returns a whitespace-only string unchanged', () => {
		stubScreens();
		expect(useImageSizes('  ')).toBe('  ');
	});
});

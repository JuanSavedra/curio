import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// Skipped on purpose: the service worker itself, and the older KaTeX font formats (every browser that
// has service workers loads the .woff2 ones, so keeping .woff and .ttf would only triple the download).
const SKIPPED = /(^|\/)(sw\.js|_headers|_redirects)$|\.map$|\.ttf$|\.woff$/;

function listFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
	);
}

/**
 * After the build, lists every file in `dist/` and writes `dist/sw.js` from `sw.template.js`, so the whole
 * site is saved on the device on the first visit. The version is a hash of the files: it only changes when
 * something on the site changes, which is what makes browsers install the update.
 */
export default function offline(): AstroIntegration {
	let base = '/';
	return {
		name: 'curio-offline',
		hooks: {
			'astro:config:done': ({ config }) => {
				base = config.base.endsWith('/') ? config.base : `${config.base}/`;
			},
			'astro:build:done': ({ dir }) => {
				const outDir = fileURLToPath(dir);
				const files = listFiles(outDir)
					.map((file) => relative(outDir, file).split(sep).join('/'))
					.filter((file) => !SKIPPED.test(file))
					.sort();

				const template = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8');
				const hash = createHash('sha256').update(template);
				for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)));

				// Pages are saved by their folder address (`temas/index.html` becomes `/temas/`)
				const urls = files.map((file) => base + file.replace(/(^|\/)index\.html$/, '$1'));
				const worker = template
					.replace('__VERSION__', hash.digest('hex').slice(0, 12))
					.replace('__BASE__', base)
					.replace('__PRECACHE__', JSON.stringify(urls, null, '\t'));
				writeFileSync(join(outDir, 'sw.js'), worker);
			},
		},
	};
}

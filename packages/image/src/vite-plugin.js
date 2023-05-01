import { imagetools } from 'vite-imagetools';

/**
 * @param {import('types/vite').PluginOptions} options
 * @returns {import('vite').Plugin[]}
 */
export function vitePluginSvelteImage(options = {}) {
	return [image_plugin(options), image_tools()];
}

/**
 * Creates the Svelte image plugin which provides the `__svelte_image_options__` module used in `Image.svelte`.
 * @param {import('types/vite').PluginOptions} options
 * @returns {import('vite').Plugin}
 */
function image_plugin(options) {
	if (!options.providers) {
		console.warn(
			'vite-plugin-svelte-image: No provider found for @sveltejs/image, images not optimized at build time will not be optimized'
		);
	}
	const providers =
		!options.providers || !Object.keys(options.providers).length
			? { default: '@sveltejs/image/providers/none' }
			: options.providers;

	const providerImports = Object.keys(providers)
		.map(
			(provider) =>
				`import * as ${provider === 'default' ? '_default' : provider} from '${
					providers[provider]
				}';`
		)
		.join('\n');
	const providerObject =
		'{\n\t' +
		Object.keys(providers)
			.map((provider) => `${provider}: ${provider === 'default' ? '_default' : provider}`)
			.join(',\n\t') +
		'\n}';
	const file = `${providerImports}
export const providers = ${providerObject};
export const domains = ${options.domains ? JSON.stringify(options.domains) : '[]'};
export const device_sizes = ${JSON.stringify(device_sizes(options))};
export const image_sizes = ${JSON.stringify(image_sizes(options))};`;

	return {
		name: 'vite-plugin-svelte-image',
		async resolveId(id) {
			if (id === '__svelte-image-options__.js') {
				return id;
			}
		},
		async load(id) {
			if (id === '__svelte-image-options__.js') {
				return file;
			}
		}
	};
}

function image_tools() {
	return imagetools({
		defaultDirectives: () => {
				return new URLSearchParams({
					'as': 'img',
					'format': 'webp'
				});
			}
	});
}

// TODO make these configurable from the outside

/**
 * @param {import('types/vite').PluginOptions} _options
 */
function device_sizes(_options) {
	return [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
}

/**
 * @param {import('types/vite').PluginOptions} _options
 */
function image_sizes(_options) {
	return [64, 96, 128, 256, 384];
}

import json from 'rollup-plugin-json';
//import uglify from 'rollup-plugin-uglify';

export default {
	format: 'iife',
	external: ['global'],
	globals: {global:'this'},
	plugins: [ json(), /*uglify({
		compress: false,
		mangle: false,
		output: {
			beautify: true,
			indent_level: 2,
			comments: 'some',
		}
	})*/ ],
	banner: 'CREATE OR REPLACE FUNCTION public.plv8_startup() RETURNS void AS $BODY$',
	footer: '$BODY$ LANGUAGE plv8;'
};

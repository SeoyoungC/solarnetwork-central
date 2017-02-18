import json from 'rollup-plugin-json';
//import babel from 'rollup-plugin-babel';

export default {
	format: 'iife',
	external: ['global'],
	globals: {global:'this'},
	plugins: [ json()/*, babel()*/ ],
	banner: 'CREATE OR REPLACE FUNCTION public.plv8_startup() RETURNS void AS $BODY$',
	footer: '$BODY$ LANGUAGE plv8;'
};

import addTo from './util/addTo.js'
import calculateAverageOverHours from './math/calculateAverageOverHours.js'
import calculateAverages from './math/calculateAverages.js'
import fixPrecision from './math/fixPrecision.js'
import mergeObjects from './util/mergeObjects.js'
import intervalMs from './plv8/intervalMs.js'

import { version } from '../package.json';

import global from 'global';

global.sn = {
	addTo : addTo,
	calculateAverageOverHours : calculateAverageOverHours,
	calculateAverages : calculateAverages,
	fixPrecision : fixPrecision,
	intervalMs : intervalMs,
	mergeObjects : mergeObjects,

	version : version,

	// For backwards compat, expose functions in hierarchy
	math : {
		util : {
			addto : addTo,
			calculateAverageOverHours : calculateAverageOverHours,
			calculateAverages : calculateAverages,
			fixPrecision : fixPrecision
		}
	},
	util : {
		intervalMs : intervalMs,
		merge : mergeObjects
	}
};

'use strict';

import datumAggregate from './datumAggregate.js';
import mergeObjects from '../util/mergeObjects.js'

export default function aggregator(configuration) {
	var self = {
		version : '1'
	};

	/** The overall starting timestamp. */
	var startTs = (configuration && configuration.startTs > 0 ? configuration.startTs: new Date().getTime());
	var startDate = new Date(startTs);

	/** The overall ending timestamp. */
	var endTs = (configuration && configuration.endTs > 0 ? configuration.endTs : new Date().getTime());

	/** The number of milliseconds tolerance before/after time span to allow finding prev/next records */
	var toleranceMs = (configuration && configuration.toleranceMs > 0 ? configuration.toleranceMs : 3600000);

	/** A mapping of source ID -> array of objects. */
	var resultsBySource = {};

	var resultsByOrder = [];

	/**
	 * Add another datum record.
	 *
	 * @param {Object} record            The record to add.
	 * @param {Date}   record[ts]        The datum timestamp.
	 * @param {Date}   record[ts_start]  The datum time slot.
	 * @param {String} record[source_id] The datum source ID.
	 * @param {Object} record[jdata]     The datum JSON data object.
	 */
	function addDatumRecord(record) {
		if ( !(record || record.source_id || record.ts) ) {
			return;
		}
		var sourceId = record.source_id;
		var recTs = record.ts.getTime();
		var currResult = resultsBySource[sourceId];
		var recToAdd = record;

		if ( currResult === undefined ) {
			currResult = datumAggregate(sourceId, startTs, endTs, toleranceMs);

			// keep track of results by source ID for fast lookup
			resultsBySource[sourceId] = currResult;

			// also keep track of order we obtain sources, so results ordered in same way
			resultsByOrder.push(currResult);
		}

		if ( recTs > startTs && recTs < endTs ) {
			// when adding records within the time span, force the time slot to our start date so they all aggregate into one
			recToAdd = mergeObjects({ts_start:startDate}, record, undefined, true);
		}

		currResult.addDatumRecord(recToAdd);
	}

	/**
	 * Finish all aggregate processing and return an array of all aggregate records.
	 *
	 * @return {Array} An array of aggregate record objects for each source ID encountered by
	 *                 all previous calls to <code>addDatumRecord()</code>, or an empty array
	 *                 if there aren't any.
	 */
	function finish() {
		var aggregateResults = [],
			i, aggResult;
		for ( i = 0; i < resultsByOrder.length; i += 1 ) {
			aggResult = resultsByOrder[i].finish();
			if ( aggResult ) {
				aggregateResults.push(aggResult);
			}
		}
		return aggregateResults;
	}

	return Object.defineProperties(self, {
		startTs				: { value : startTs },
		endTs				: { value : endTs },
		toleranceMs			: { value : toleranceMs },

		addDatumRecord		: { value : addDatumRecord },
		finish				: { value : finish },
	});
}

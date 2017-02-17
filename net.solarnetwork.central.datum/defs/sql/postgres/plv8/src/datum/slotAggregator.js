'use strict';

import datumAggregate from './datumAggregate.js';

export default function slotAggregator(configuration) {
	var self = {
		version : '1'
	};

	/** The overall starting timestamp. */
	var startTs = (configuration && configuration.startTs > 0 ? configuration.startTs: new Date().getTime());

	/** The overall ending timestamp. */
	var endTs = (configuration && configuration.endTs > 0 ? configuration.endTs : new Date().getTime());

	/** The number of seconds per time slot. */
	var slotSecs = (configuration && configuration.slotSecs > 0 ? configuration.slotSecs : 600);

	/** The number of milliseconds tolerance before/after time span to allow finding prev/next records */
	var toleranceMs = (configuration && configuration.toleranceMs > 0 ? configuration.toleranceMs : 3600000);

	/** A mapping of source ID -> array of objects. */
	var resultsBySource = {};

	/**
	 * Add another datum record.
	 *
	 * @param {Object} record The record to add.
	 * @param {String} record[source_id] The source ID of the datum.
	 * @param {Object} record[jdata] The datum JSON data object.
	 */
	function addDatumRecord(record) {
		if ( !(record || record.source_id) ) {
			return;
		}
		var sourceId = record.source_id;
		var ts = record.ts_start.getTime();
		var currResult = resultsBySource[sourceId];
		var aggResult;

		if ( currResult === undefined ) {
			if ( ts < startTs ) {
				// allow leading data outside of overall time span (for accumulating calculations)
				ts = startTs;
			}
			currResult = datumAggregate(sourceId, ts, ts + (slotSecs * 1000), toleranceMs);
			currResult.addDatumRecord(record);
			resultsBySource[sourceId] = currResult;
		} else if ( ts !== currResult.ts ) {
			// record is in a new slot; finish up the current slot
			aggResult = currResult.finish(record);
			if ( ts < endTs ) {
				currResult = currResult.startNext(ts, ts + (slotSecs * 1000));
				resultsBySource[sourceId] = currResult;
			} else {
				delete resultsBySource[sourceId];
			}
		} else {
			currResult.addDatumRecord(record);
		}
		return aggResult;
	}

	return Object.defineProperties(self, {
		startTs				: { value : startTs },
		endTs				: { value : endTs },
		slotSecs			: { value : slotSecs },
		toleranceMs			: { value : toleranceMs },

		addDatumRecord		: { value : addDatumRecord },
	});
}

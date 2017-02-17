'use strict';

import calculateAverages from '../math/calculateAverages.js'

/**
 * Add a number value to an object at a specific key, limited to a percentage value.
 * Optionally increment a number "counter" value for the same key, if a counter
 * object is provided. This is designed to support aggregation of values, both simple
 * sum aggregates and average aggregates where the count will be later used to calculate
 * an effective average of the computed sum.
 *
 * @param {String} k The object key.
 * @param {Number} v The value to add.
 * @param {Object} o The object to manipulate.
 * @param {Number} p A percentage (0-1) to apply to the value before adding. If not defined
 *                   then 1 is assumed.
 * @param {Object} c An optional "counter" object, whose <code>k</code> property will be incremented
 *                   by 1 if defined, or set to 1 if not.
 * @param {Object} r An optional "stats" object, whose <code>k</code> property will be maintained
 *                   as a nested object with <code>min</code> and <code>max</code> properties.
 */
function addTo(k, v, o, p, c, r) {
	var newVal;
	if ( p === undefined ) {
		p = 1;
	}
	newVal = (v * p);
	if ( o[k] === undefined ) {
		o[k] = newVal;
	} else {
		o[k] += newVal;
	}
	if ( c ) {
		if ( c[k] === undefined ) {
			c[k] = 1;
		} else {
			c[k] += 1;
		}
	}
	if ( r ) {
		if ( r[k] === undefined ) {
			r[k] = { min: newVal, max: newVal };
		} else {
			if ( r[k].min === undefined ) {
				r[k].min = newVal;
			} else if ( newVal < r[k].min ) {
				r[k].min = newVal;
			}
			if ( r[k].max === undefined ) {
				r[k].max = newVal;
			} else if ( newVal > r[k].max ) {
				r[k].max = newVal;
			}
		}
	}
}

/**
 * An aggregate record object that helps keep track of the raw data needed to
 * calculate a single aggregate result from many input records.
 *
 * @param {String} sourceId The source ID.
 * @param {Number} ts       The timestamp associated with this aggregate result.
 * @param {Number} endTs    The timestamp (exclusive) of the end of this aggregate result.
 */
export default function datumAggregate(sourceId, ts, endTs) {
	var self = {
		version : '1'
	};
	var aobj = {};
	var iobj = {};
	var iobjCounts = {};
	var iobjStats = {};
	var sobj = {};
	var tarr = [];
	var accAvg = {};
	var prevRecord;

	function addInstantaneousValues(inst) {
		var prop;
		for ( prop in inst ) {
			addTo(prop, inst[prop], iobj, 1, iobjCounts, iobjStats);
		}
	}

	function addStaticValues(stat) {
		var prop;
		for ( prop in stat ) {
			sobj[prop] = stat[prop];
		}
	}

	function addTagValues(tags) {
		var i, t;
		for ( i = 0; i < tags.length; i += 1 ) {
			t = tags[i];
			if ( tarr.indexOf(t) === -1 ) {
				tarr.push(t);
			}
		}
	}

	/**
	 * Add another datum record.
	 *
	 * @param {Object} record The record to add.
	 * @param {String} record[source_id] The source ID of the datum.
	 * @param {Object} record[jdata] The datum JSON data object.
	 */
	function addDatumRecord(record) {
		if ( !(record && record.jdata) ) {
			return;
		}
		var recTs = record.tsms,
			inst = record.jdata.i,
			stat = record.jdata.s,
			tags = record.jdata.t;

		// as long as this record's time slot falls within the configured time slot,
		// handle instantaneous, static, and tag values
		if ( recTs === ts ) {
			if ( inst ) {
				// add instantaneous values
				addInstantaneousValues(inst);
			}

			// merge in static values
			if ( stat ) {
				addStaticValues(stat);
			}

			// add tag values
			if ( Array.isArray(tags) ) {
				addTagValues(tags);
			}
		}

		// TODO: handle accumulating values

		// save curr record as previous for future calculations
		prevRecord = record;
	}

	/**
	 * Finish the aggregate collection.
	 *
	 * @param {Object} nextRecord An optional "next" record that may contain partial
	 *                            data to associate with this aggregate result.
	 * @returns {Object} An aggregate datum record.
	 */
	function finish(nextRecord) {
		var aggRecord = {
				ts_start  : new Date(ts),
				source_id : sourceId,
				jdata     : {},
			},
			prop,
			aggInst;

		// handle any fractional portion of the next record
		if ( nextRecord ) {
			addDatumRecord(nextRecord);
		}

		// calculate our instantaneous average values
		aggInst = calculateAverages(iobj, iobjCounts);

		// inject min/max statistic values for instantaneous average values
		for ( prop in aggInst ) {
			if ( aggRecord.jdata.i === undefined ) {
				aggRecord.jdata.i = aggInst;
			}
			if ( iobjStats[prop] !== undefined ) {
				if ( iobjStats[prop].min !== undefined && iobjStats[prop].min !== aggInst[prop] ) {
					aggInst[prop+'_min'] = iobjStats[prop].min;
				}
				if ( iobjStats[prop].max !== undefined && iobjStats[prop].max !== aggInst[prop] ) {
					aggInst[prop+'_max'] = iobjStats[prop].max;
				}
			}
		}

		// TODO add accumulating results via merge() to pick fixPrecision() values
		//aggRecord.jdata.a = merge({}, aobj);

		return aggRecord
	}

	function startNext(nextTs, nextEndTs) {
		var result = datumAggregate(sourceId, nextTs, nextEndTs);

	}

	return Object.defineProperties(self, {
		sourceId			: { value : sourceId },
		ts					: { value : ts },
		endTs				: { value : endTs },

		addDatumRecord		: { value : addDatumRecord },
		finish				: { value : finish },
	});
}

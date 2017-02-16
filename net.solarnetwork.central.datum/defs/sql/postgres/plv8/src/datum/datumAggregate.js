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
	var accAvg = {};

	/**
	 * Add another datum record.
	 *
	 * @param {Object} record The record to add.
	 * @param {String} record[source_id] The source ID of the datum.
	 * @param {Object} record[jdata] The datum JSON data object.
	 */
	function addDatumRecord(record) {
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
			source_id : sourceId,
			tsms      : ts,
		};
		return aggRecord
	}

	return Object.defineProperties(self, {
		sourceId			: { value : sourceId },
		ts					: { value : ts },
		endTs				: { value : endTs },

		addDatumRecord		: { value : addDatumRecord },
		finish				: { value : finish },
	});
}

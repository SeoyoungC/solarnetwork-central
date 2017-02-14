/**
 * Calculate an average of two values projected over 1 hour.
 *
 * @param {Number} w     The first value.
 * @param {Number} prevW The previous value, which will be subtracted from <code>w</code>.
 * @param {Number} milli The difference in time between the two values, in milliseconds.
 * @returns {Number} the average of the values, projected over an hour
 */
export default function calculateAverageOverHours(w, prevW, milli) {
	if ( !Number.isFinite(milli) ) {
		return 0;
	}
	return (((w + prevW) / 2) * (milli / 3600000));
}

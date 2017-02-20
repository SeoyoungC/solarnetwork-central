'use strict';

import test from 'ava';
import moment from 'moment';

import parseDatumCSV from './_parseDatumCSV.js'

import aggregator from '../../src/datum/aggregator'

test('datum:aggregator:createWithoutConfig', t => {
	const now = new Date().getTime();
	const service = aggregator();
	t.true(service.startTs >= now);
	t.true(service.endTs >= now);
});

test('datum:aggregator:createWithEmptyConfig', t => {
	const now = new Date().getTime();
	const service = aggregator({});
	t.true(service.startTs >= now);
	t.true(service.endTs >= now);
});

test('datum:aggregator:createWithStartTs', t => {
	const service = aggregator({ startTs : 456 });
	t.is(service.startTs, 456);
});

test('datum:aggregator:createWithEndTs', t => {
	const service = aggregator({ endTs : 321 });
	t.is(service.endTs, 321);
});

test('datum:aggregator:processRecords:1h', t => {
	const start = moment('2016-10-10 10:00:00+13');
	const end = start.clone().add(1, 'hour');
	const service = aggregator({
		startTs : start.valueOf(),
		endTs : end.valueOf(),
	});

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-01.csv');

	data.forEach(rec => {
		service.addDatumRecord(rec);
	});

	var aggResults = service.finish();

	var expected = [
		{ i: {foo:5.333, foo_min:1, foo_max:11}, a: {bar:105}},
	];

	t.is(aggResults.length, expected.length, 'there is one aggregate result');

	aggResults.forEach((aggResult, i) => {
		t.is(aggResult.source_id, 'Foo');
		t.is(aggResult.ts_start.getTime(), start.valueOf(), 'start time');
		t.deepEqual(aggResult.jdata.i, expected[i].i, 'instantaneous');
		t.deepEqual(aggResult.jdata.a, expected[i].a, 'accumulating');
	});

});

test('datum:aggregator:processRecords:onlyAdjacentRows', t => {
	const start = moment('2016-10-10 12:00:00+13');
	const end = start.clone().add(1, 'hour');
	const service = aggregator({
		startTs : start.valueOf(),
		endTs : end.valueOf(),
	});

	const data = parseDatumCSV('find-datum-for-minute-time-slots-07.csv');

	var aggResults = [];
	data.forEach(rec => {
		var aggResult = service.addDatumRecord(rec);
		if ( aggResult ) {
			aggResults.push(aggResult);
		}
	});
	aggResults = aggResults.concat(service.finish());

	var expected = [
	];

	t.deepEqual(aggResults, expected);
});


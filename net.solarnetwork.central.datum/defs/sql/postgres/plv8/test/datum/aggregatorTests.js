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
	t.is(service.toleranceMs, 3600000);
});

test('datum:aggregator:createWithEmptyConfig', t => {
	const now = new Date().getTime();
	const service = aggregator({});
	t.true(service.startTs >= now);
	t.true(service.endTs >= now);
	t.is(service.toleranceMs, 3600000);
});

test('datum:aggregator:createWithStartTs', t => {
	const service = aggregator({ startTs : 456 });
	t.is(service.startTs, 456);
});

test('datum:aggregator:createWithEndTs', t => {
	const service = aggregator({ endTs : 321 });
	t.is(service.endTs, 321);
});

test('datum:aggregator:createWithToleranceMs', t => {
	const service = aggregator({ toleranceMs : 123 });
	t.is(service.toleranceMs, 123);
});

test('datum:aggregator:processRecords:15m', t => {
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


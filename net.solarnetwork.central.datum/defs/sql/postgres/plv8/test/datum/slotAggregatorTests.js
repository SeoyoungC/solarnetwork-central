'use strict';

import test from 'ava';
import moment from 'moment';

import parseDatumCSV from './_parseDatumCSV.js'

import slotAggregator from '../../src/datum/slotAggregator'

test('datum:slotAggregator:createWithoutConfig', t => {
	const now = new Date().getTime();
	const service = slotAggregator();
	t.true(service.startTs >= now);
	t.true(service.endTs >= now);
	t.is(service.slotSecs, 600);
	t.is(service.toleranceMs, 3600000);
});

test('datum:slotAggregator:createWithEmptyConfig', t => {
	const now = new Date().getTime();
	const service = slotAggregator({});
	t.true(service.startTs >= now);
	t.true(service.endTs >= now);
	t.is(service.slotSecs, 600);
	t.is(service.toleranceMs, 3600000);
});

test('datum:slotAggregator:createWithStartTs', t => {
	const service = slotAggregator({ startTs : 456 });
	t.is(service.startTs, 456);
});

test('datum:slotAggregator:createWithEndTs', t => {
	const service = slotAggregator({ endTs : 321 });
	t.is(service.endTs, 321);
});

test('datum:slotAggregator:createWithSlotSecs', t => {
	const service = slotAggregator({ slotSecs : 900 });
	t.is(service.slotSecs, 900);
});

test('datum:slotAggregator:createWithToleranceMs', t => {
	const service = slotAggregator({ toleranceMs : 123 });
	t.is(service.toleranceMs, 123);
});

test('datum:slotAggregator:processRecords:15m', t => {
	const start = moment('2016-10-10 10:00:00+13');
	const end = start.clone().add(1, 'hour');
	const service = slotAggregator({
		startTs : start.valueOf(),
		endTs : end.valueOf(),
		slotSecs : 900,
	});

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-01.csv');

	var aggResults = [];
	data.forEach(rec => {
		var aggResult = service.addDatumRecord(rec);
		if ( aggResult ) {
			aggResults.push(aggResult);
		}
	});

	var expected = [
		{ i: {foo:2, foo_min:1, foo_max:3}, a: {bar:25}},
		{ i: {foo:5, foo_min:4, foo_max:6}, a: {bar:30}},
		{ i: {foo:8, foo_min:7, foo_max:9}, a: {bar:30}},
		{ i: {foo:11}, a: {bar:20}},
	];

	t.is(aggResults.length, expected.length, 'there are 4 resulting time slots');

	aggResults.forEach((aggResult, i) => {
		t.is(aggResult.source_id, 'Foo');
		t.is(aggResult.ts_start.getTime(), start.clone().add(i * 15, 'minutes').valueOf(), 'slot ' +i +' start time');
		t.deepEqual(aggResult.jdata.i, expected[i].i, 'slot ' +i +' instantaneous');
		t.deepEqual(aggResult.jdata.a, expected[i].a, 'slot ' +i +' accumulating');
	});

});


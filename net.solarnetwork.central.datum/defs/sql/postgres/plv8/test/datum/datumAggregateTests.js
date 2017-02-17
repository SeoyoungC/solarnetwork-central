import test from 'ava';
import csvParse from 'csv-parse/lib/sync';
import fs from 'fs';
import moment from 'moment';

import datumAggregate from '../../src/datum/datumAggregate'

function parseDatumCSV(filename) {
	var data = fs.readFileSync(__dirname+'/'+filename, { encoding : 'utf8' });
	var records = csvParse(data, {
			auto_parse : true,
			columns : true,
		});
	var i, record;
	for ( i = 0; i < records.length; i+= 1 ) {
		record = records[i];
		// convert ts into actual Date object
		if ( record.ts ) {
			record.ts = moment(record.ts).toDate();
		}
		// convert ts_start into actual Date object
		if ( record.ts_start ) {
			record.ts_start = moment(record.ts_start).toDate();
		}
		// convert jdata into JSON object
		if ( record.jdata ) {
			record.jdata = JSON.parse(record.jdata);
		}
	}
	return records;
}

test('datum:datumAggregate:create', t => {
	const service = datumAggregate('Foo', 123, 234);
	t.is(service.sourceId, 'Foo');
	t.is(service.ts, 123);
	t.is(service.endTs, 234);
});

test('datum:datumAggregate:processRecords:15m:1', t => {
	const slotTs = 1476046800000;
	const endTs = slotTs + (15 * 60 * 1000);
	const sourceId = 'Foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-01.csv').slice(0, 5);

	var aggResult;
	data.forEach(rec => {
		if ( rec.ts_start.getTime() < endTs ) {
			service.addDatumRecord(rec);
		} else {
			aggResult = service.finish(rec);
		}
	});

	t.is(aggResult.source_id, sourceId);
	t.is(aggResult.ts_start.getTime(), slotTs);

	t.deepEqual(aggResult.jdata.i, {foo:2, foo_min:1, foo_max:3});
	t.deepEqual(aggResult.jdata.a, {bar:25});
});

test('datum:datumAggregate:processRecords:15m:trailingFraction', t => {
	const slotTs = 1476050400000;
	const endTs = slotTs + (15 * 60 * 1000);
	const sourceId = 'Foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-02.csv');

	var aggResult;
	data.forEach(rec => {
		if ( rec.ts_start.getTime() < endTs ) {
			service.addDatumRecord(rec);
		} else {
			aggResult = service.finish(rec);
		}
	});

	t.is(aggResult.source_id, sourceId);
	t.is(aggResult.ts_start.getTime(), slotTs);

	t.deepEqual(aggResult.jdata.i, {foo:15, foo_min:13, foo_max:17});
	t.deepEqual(aggResult.jdata.a, {bar:16.667}, '2/3 of last record\'s accumulation counts towards this result');
});

test('datum:datumAggregate:processRecords:15m:leadingFraction', t => {
	const slotTs = 1476050400000;
	const endTs = slotTs + (15 * 60 * 1000);
	const sourceId = 'Foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-03.csv');

	var aggResult;
	data.forEach(rec => {
		if ( rec.ts_start.getTime() < endTs ) {
			service.addDatumRecord(rec);
		} else {
			aggResult = service.finish(rec);
		}
	});

	t.is(aggResult.source_id, sourceId);
	t.is(aggResult.ts_start.getTime(), slotTs);

	t.deepEqual(aggResult.jdata.i, {foo:15, foo_min:13, foo_max:17});
	t.deepEqual(aggResult.jdata.a, {bar:21.667}, '1/6 of first record\'s accumulation counts towards this result');
});

test('datum:datumAggregate:processRecords:15m:leadingAndTrailingFractions', t => {
	const slotTs = 1476050400000;
	const endTs = slotTs + (15 * 60 * 1000);
	const sourceId = 'Foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-04.csv');

	var aggResult;
	data.forEach(rec => {
		if ( rec.ts_start.getTime() < endTs ) {
			service.addDatumRecord(rec);
		} else {
			aggResult = service.finish(rec);
		}
	});

	t.is(aggResult.source_id, sourceId);
	t.is(aggResult.ts_start.getTime(), slotTs);

	t.deepEqual(aggResult.jdata.i, {foo:15, foo_min:13, foo_max:17});
	t.deepEqual(aggResult.jdata.a, {bar:18.333}, '1/6 of first; 2/3 of last record\'s accumulation counts towards this result');
});

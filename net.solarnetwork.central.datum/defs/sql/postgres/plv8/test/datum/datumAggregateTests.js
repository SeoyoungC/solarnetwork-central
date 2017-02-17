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
		// convert jdata into JSON object
		if ( record.jdata ) {
			record.jdata = JSON.parse(record.jdata);
		}
		// convert ts into actual Date object
		if ( record.ts ) {
			record.ts = moment(record.ts).toDate();
		}
	}
	return records;
}

test('datum:datumAggregate:create', t => {
	const service = datumAggregate('foo', 123, 234);
	t.is(service.sourceId, 'foo');
	t.is(service.ts, 123);
	t.is(service.endTs, 234);
});

test('datum:datumAggregate:processRecords:15m:1', t => {
	const slotTs = 1476046800000;
	const endTs = slotTs + (15 * 60 * 1000);
	const sourceId = 'foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-01.csv').slice(0, 5);

/*
"ts_start","source_id","tsms","percent","jdata"
"2016-10-10 09:45:00+13","Foo",1476045900000,0,"{""i"":{""foo"":0},""a"":{""bar"":0}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,0,"{""i"":{""foo"":1},""a"":{""bar"":5}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,1,"{""i"":{""foo"":2},""a"":{""bar"":10}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,1,"{""i"":{""foo"":3},""a"":{""bar"":20}}"
"2016-10-10 10:15:00+13","Foo",1476047700000,0,"{""i"":{""foo"":4},""a"":{""bar"":30}}"
*/
	var aggResult;
	data.forEach(rec => {
		if ( rec.tsms < endTs ) {
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
	const sourceId = 'foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-02.csv');

/*
"ts","ts_start","source_id","tsms","percent","tdiffms","jdata"
"2016-10-10 10:50:00+13","2016-10-10 10:45:00+13","Foo",1476049500000,0,600000,"{""i"":{""foo"":11},""a"":{""bar"":100}}"
"2016-10-10 11:00:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,0,600000,"{""i"":{""foo"":13},""a"":{""bar"":110}}"
"2016-10-10 11:09:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,1,540000,"{""i"":{""foo"":15},""a"":{""bar"":115}}"
"2016-10-10 11:11:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,1,120000,"{""i"":{""foo"":17},""a"":{""bar"":120}}"
"2016-10-10 11:17:00+13","2016-10-10 11:15:00+13","Foo",1476051300000,0.5,480000,"{""i"":{""foo"":19},""a"":{""bar"":130}}"

The last two rows split their accumulation; 2/3 attributed to this time slot (1/3 to next).
*/
	var aggResult;
	data.forEach(rec => {
		if ( rec.tsms < endTs ) {
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
	const sourceId = 'foo';
	const service = datumAggregate(sourceId, slotTs, endTs);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, endTs);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-03.csv');

/*
"ts","ts_start","source_id","tsms","percent","tdiffms","jdata"
"2016-10-10 10:50:00+13","2016-10-10 10:45:00+13","Foo",1476049500000,0,600000,"{""i"":{""foo"":11},""a"":{""bar"":100}}"
"2016-10-10 11:02:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,0,600000,"{""i"":{""foo"":13},""a"":{""bar"":110}}"
"2016-10-10 11:09:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,1,540000,"{""i"":{""foo"":15},""a"":{""bar"":115}}"
"2016-10-10 11:11:00+13","2016-10-10 11:00:00+13","Foo",1476050400000,1,120000,"{""i"":{""foo"":17},""a"":{""bar"":120}}"
"2016-10-10 11:15:00+13","2016-10-10 11:15:00+13","Foo",1476051300000,0.5,480000,"{""i"":{""foo"":19},""a"":{""bar"":130}}"

The first two rows split their accumulation; 1/6 attributed to this time slot (5/6 to previous).
*/
	var aggResult;
	data.forEach(rec => {
		if ( rec.tsms < endTs ) {
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

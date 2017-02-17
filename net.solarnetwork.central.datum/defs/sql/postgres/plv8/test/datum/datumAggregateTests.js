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
		if ( record.jdata ) {
			record.jdata = JSON.parse(record.jdata);
		}
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
	const sourceId = 'foo';
	const service = datumAggregate(sourceId, slotTs, 1476047700000);
	t.is(service.sourceId, sourceId);
	t.is(service.ts, slotTs);
	t.is(service.endTs, 1476047700000);

	const data = parseDatumCSV('/find-datum-for-minute-time-slots-01.csv').slice(0, 5);

/*
"ts_start","source_id","tsms","percent","jdata"
"2016-10-10 09:45:00+13","Foo",1476045900000,0,"{""i"":{""foo"":0},""a"":{""bar"":0}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,0,"{""i"":{""foo"":1},""a"":{""bar"":0}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,1,"{""i"":{""foo"":2},""a"":{""bar"":10}}"
"2016-10-10 10:00:00+13","Foo",1476046800000,1,"{""i"":{""foo"":3},""a"":{""bar"":20}}"
"2016-10-10 10:15:00+13","Foo",1476047700000,0,"{""i"":{""foo"":4},""a"":{""bar"":30}}"
*/
	var aggResult;
	data.forEach(rec => {
		if ( rec.tsms < 1476047700000 ) {
			service.addDatumRecord(rec);
		} else {
			aggResult = service.finish(rec);
		}
	});

	t.is(aggResult.source_id, sourceId);
	t.is(aggResult.ts_start.getTime(), slotTs);

	t.deepEqual(aggResult.jdata.i, {foo:2, foo_min:1, foo_max:3});

});

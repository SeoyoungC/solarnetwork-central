import test from 'ava';
import csv from 'csv';
import fs from 'fs';
import datumAggregate from '../../src/datum/datumAggregate'

function parseDatumCSV(filename, callback) {
	var records = [];
	fs.createReadStream(__dirname+'/'+filename)
		.pipe(csv.parse({
			auto_parse : true,
			columns : true,
		}))
		.pipe(csv.transform(function(record) {
			if ( record.jdata ) {
				record.jdata = JSON.parse(record.jdata);
			}
			records.push(record);
		})).on('finish', function() {
			callback(null, records);
		});
}

test('datum:datumAggregate:create', t => {
	const service = datumAggregate('foo', 123, 234);
	t.is(service.sourceId, 'foo');
	t.is(service.ts, 123);
	t.is(service.endTs, 234);
});

test.cb('datum:datumAggregate:processRecords:15m:1', t => {
	const service = datumAggregate('foo', 1476046800000, 1476047700000);
	t.is(service.sourceId, 'foo');
	t.is(service.ts, 1476046800000);
	t.is(service.endTs, 1476047700000);

	parseDatumCSV('/find-datum-for-minute-time-slots-01.csv', function(error, records) {
		console.log('Got records: ', records);
		t.end();
	});
});

/* ==================================================================
 * MyBatisConsumptionDatumDaoTests.java - Nov 13, 2014 7:33:20 AM
 * 
 * Copyright 2007-2014 SolarNetwork.net Dev Team
 * 
 * This program is free software; you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as 
 * published by the Free Software Foundation; either version 2 of 
 * the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 
 * 02111-1307 USA
 * ==================================================================
 */

package net.solarnetwork.central.datum.dao.mybatis.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import net.solarnetwork.central.datum.dao.mybatis.MyBatisConsumptionDatumDao;
import net.solarnetwork.central.datum.domain.ConsumptionDatum;
import net.solarnetwork.central.datum.domain.DatumQueryCommand;
import net.solarnetwork.central.domain.Aggregation;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.joda.time.MutableDateTime;
import org.junit.Before;
import org.junit.Test;

/**
 * Test cases for the {@link MyBatisConsumptionDatumDao}.
 * 
 * @author matt
 * @version 1.0
 */
public class MyBatisConsumptionDatumDaoTests extends AbstractMyBatisDaoTestSupport {

	private static final String TEST_2ND_SOURCE = "2nd source";

	private MyBatisConsumptionDatumDao dao;

	private ConsumptionDatum lastDatum;

	@Before
	public void setUp() throws Exception {
		dao = new MyBatisConsumptionDatumDao();
		dao.setSqlSessionFactory(getSqlSessionFactory());
		lastDatum = null;
	}

	private ConsumptionDatum getTestInstance() {
		ConsumptionDatum datum = new ConsumptionDatum();
		datum.setCreated(new DateTime());
		datum.setLocationId(TEST_PRICE_LOC_ID);
		datum.setNodeId(TEST_NODE_ID);
		datum.setPosted(new DateTime());
		datum.setSourceId("test.source");

		// note we are setting legacy amps/volts values here, not watts
		datum.setAmps(1.0F);
		datum.setVolts(1.0F);

		datum.setWattHourReading(2L);
		return datum;
	}

	@Test
	public void storeNew() {
		ConsumptionDatum datum = getTestInstance();
		Long id = dao.store(datum);
		assertNotNull(id);
		datum.setId(id);
		lastDatum = datum;
	}

	private void validate(ConsumptionDatum src, ConsumptionDatum entity) {
		assertNotNull("ConsumptionDatum should exist", entity);
		assertNotNull("Created date should be set", entity.getCreated());
		assertEquals(src.getWatts(), entity.getWatts());
		assertEquals(src.getLocationId(), entity.getLocationId());
		assertEquals(src.getNodeId(), entity.getNodeId());
		assertEquals(src.getPosted(), entity.getPosted());
		assertEquals(src.getSourceId(), entity.getSourceId());
		assertEquals(src.getWattHourReading(), entity.getWattHourReading());
	}

	@Test
	public void getByPrimaryKey() {
		storeNew();
		ConsumptionDatum datum = dao.get(lastDatum.getId());
		validate(lastDatum, datum);
	}

	@Test
	public void getForDate() {
		storeNew();
		ConsumptionDatum datum = dao.getDatumForDate(lastDatum.getNodeId(), lastDatum.getCreated());
		validate(lastDatum, datum);
	}

	@Test
	public void getMostRecent() {
		storeNew();

		DatumQueryCommand criteria = new DatumQueryCommand();
		criteria.setNodeId(TEST_NODE_ID);

		List<ConsumptionDatum> results = dao.getMostRecentDatum(criteria);
		assertNotNull(results);
		assertEquals(1, results.size());
		assertEquals(lastDatum, results.get(0));

		ConsumptionDatum datum2 = new ConsumptionDatum();
		datum2.setCreated(new DateTime().plusHours(1));
		datum2.setNodeId(TEST_NODE_ID);
		datum2.setSourceId(lastDatum.getSourceId());
		datum2.setAmps(1.2F);
		Long id2 = dao.store(datum2);

		results = dao.getMostRecentDatum(criteria);
		assertNotNull(results);
		assertEquals(1, results.size());
		assertEquals(id2, results.get(0).getId());

		ConsumptionDatum datum3 = new ConsumptionDatum();
		datum3.setNodeId(TEST_NODE_ID);
		datum3.setSourceId("/test/source/2");
		datum3.setAmps(1.3F);
		Long id3 = dao.store(datum3);

		results = dao.getMostRecentDatum(criteria);
		assertNotNull(results);
		assertEquals(2, results.size());
		Set<Long> ids = new LinkedHashSet<Long>();
		for ( ConsumptionDatum d : results ) {
			ids.add(d.getId());
		}
		assertTrue(ids.contains(id2));
		assertTrue(ids.contains(id3));
	}

	@Test
	public void getAllAvailableSourcesNoneAvailable() {
		Set<String> sources = dao.getAvailableSources(1L, null, null);
		assertNotNull(sources);
	}

	@Test
	public void getAllAvailableSourcesForNode() {
		storeNew();
		Set<String> sources = dao.getAvailableSources(lastDatum.getNodeId(), null, null);
		assertEquals("Sources set size", 0, sources.size());

		// we are querying the reporting table, which requires two rows minimum	so add 2nd datum
		// of same source to trigger data population there
		ConsumptionDatum d2 = getTestInstance();
		d2.setCreated(d2.getCreated().plus(1000));
		d2.setWattHourReading(d2.getWattHourReading() + 1L);
		d2 = dao.get(dao.store(d2));

		// immediately process reporting data
		processReportingStaleData();

		sources = dao.getAvailableSources(lastDatum.getNodeId(), null, null);
		assertEquals("Sources set size", 1, sources.size());
		assertTrue("Source ID returned", sources.contains(d2.getSourceId()));

		// add a 2nd source (two more datum to get into reporting table).
		// we also make this on another day, to support getAllAvailableSourcesForNodeAndDateRange() test
		ConsumptionDatum d3 = getTestInstance();
		d3.setSourceId(TEST_2ND_SOURCE);
		d3.setCreated(d2.getCreated().plusDays(1));
		d3.setWattHourReading(d2.getWattHourReading() + 1L);
		d3 = dao.get(dao.store(d3));

		ConsumptionDatum d4 = getTestInstance();
		d4.setSourceId(d3.getSourceId());
		d4.setCreated(d3.getCreated().plus(1000));
		d4.setWattHourReading(d3.getWattHourReading() + 1L);
		d4 = dao.get(dao.store(d4));

		// immediately process reporting data
		processReportingStaleData();

		sources = dao.getAvailableSources(lastDatum.getNodeId(), null, null);
		assertEquals("Sources set size", 2, sources.size());
		assertTrue("Source ID returned", sources.contains(d2.getSourceId()));
		assertTrue("Source ID returned", sources.contains(d3.getSourceId()));
	}

	@Test
	public void getAllAvailableSourcesForNodeAndDateRange() {
		getAllAvailableSourcesForNode();
		final LocalDate start = lastDatum.getCreated().toLocalDate();
		final LocalDate end = start.plusDays(1);

		// search for range BEFORE data
		Set<String> sources = dao.getAvailableSources(lastDatum.getNodeId(), start.minusDays(1),
				start.minusDays(1));
		assertEquals("Sources set size", 0, sources.size());

		// search for range AFTER data
		sources = dao.getAvailableSources(lastDatum.getNodeId(), start.plusDays(2), start.plusDays(2));
		assertEquals("Sources set size", 0, sources.size());

		// search for range UP TO first data
		sources = dao.getAvailableSources(lastDatum.getNodeId(), start, start);
		assertEquals("Sources set size", 1, sources.size());
		assertTrue("Source ID returned", sources.contains(lastDatum.getSourceId()));

		// search for range STARTING FROM last data
		sources = dao.getAvailableSources(lastDatum.getNodeId(), end, end);
		assertEquals("Sources set size", 1, sources.size());
		assertTrue("Source ID returned", sources.contains(TEST_2ND_SOURCE));

		sources = dao.getAvailableSources(lastDatum.getNodeId(), null, null);
		assertEquals("Sources set size", 2, sources.size());
		assertTrue("Source ID returned", sources.contains(lastDatum.getSourceId()));
		assertTrue("Source ID returned", sources.contains(TEST_2ND_SOURCE));
	}

	@Test
	public void getAggregatedDatumTenMinute() {
		MutableDateTime mdt = new MutableDateTime();
		mdt.setRounding(mdt.getChronology().hourOfDay(), MutableDateTime.ROUND_FLOOR);

		ConsumptionDatum datum = getTestInstance();
		datum.setWatts(10);
		mdt.setDate(datum.getCreated());
		datum.setCreated(mdt.toDateTime());
		dao.store(datum);

		DateTime s = mdt.toDateTime();

		DatumQueryCommand criteria = new DatumQueryCommand();
		criteria.setNodeId(TEST_NODE_ID);
		criteria.setAggregate(Aggregation.Minute);
		criteria.setPrecision(10);
		criteria.setStartDate(s);
		criteria.setEndDate(s.plusHours(1));

		List<ConsumptionDatum> results = dao.getAggregatedDatum(criteria);
		assertNotNull(results);
		assertEquals(6, results.size());

		// first slot should contain our test datum
		for ( int i = 0; i < results.size(); i++ ) {
			ConsumptionDatum d = results.get(i);
			if ( i == 0 ) {
				assertEquals("First result", datum.getWatts(), d.getWatts());
			} else {
				assertEquals("Result " + i, Integer.valueOf(-1), d.getWatts());
			}
		}

		ConsumptionDatum datum2 = new ConsumptionDatum();
		datum2.setCreated(datum.getCreated().plusMinutes(10));
		datum2.setNodeId(TEST_NODE_ID);
		datum2.setSourceId(datum.getSourceId());
		datum2.setWatts(20);
		dao.store(datum2);

		results = dao.getAggregatedDatum(criteria);
		assertNotNull(results);
		assertEquals(6, results.size());

		for ( int i = 0; i < results.size(); i++ ) {
			ConsumptionDatum d = results.get(i);
			if ( i == 0 ) {
				assertEquals("First result", datum.getWatts(), d.getWatts());
			} else if ( i == 1 ) {
				assertEquals("Second result", datum2.getWatts(), d.getWatts());
			} else {
				assertEquals("Result " + i, Integer.valueOf(-1), d.getWatts());
			}
		}

		ConsumptionDatum datum3 = new ConsumptionDatum();
		datum3.setCreated(datum2.getCreated().plusMinutes(5));
		datum3.setNodeId(TEST_NODE_ID);
		datum3.setSourceId(datum.getSourceId());
		datum3.setWatts(30);
		dao.store(datum3);

		results = dao.getAggregatedDatum(criteria);
		assertNotNull(results);
		assertEquals(6, results.size());

		for ( int i = 0; i < results.size(); i++ ) {
			ConsumptionDatum d = results.get(i);
			if ( i == 0 ) {
				assertEquals("First result", datum.getWatts(), d.getWatts());
			} else if ( i == 1 ) {
				assertEquals("Second result", (datum2.getWatts() + datum3.getWatts()) / 2, d.getWatts()
						.intValue());
			} else {
				assertEquals("Result " + i, Integer.valueOf(-1), d.getWatts());
			}
		}
	}

}

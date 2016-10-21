/* ==================================================================
 * MyBatisUserNodeDaoTests.java - Nov 11, 2014 7:28:50 AM
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

package net.solarnetwork.central.user.dao.mybatis.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import java.util.List;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import net.solarnetwork.central.dao.mybatis.MyBatisSolarNodeDao;
import net.solarnetwork.central.domain.SolarNode;
import net.solarnetwork.central.user.dao.mybatis.MyBatisUserNodeCertificateDao;
import net.solarnetwork.central.user.dao.mybatis.MyBatisUserNodeDao;
import net.solarnetwork.central.user.domain.User;
import net.solarnetwork.central.user.domain.UserNode;
import net.solarnetwork.central.user.domain.UserNodeCertificate;
import net.solarnetwork.central.user.domain.UserNodeCertificateStatus;
import net.solarnetwork.central.user.domain.UserNodePK;
import net.solarnetwork.central.user.domain.UserNodeTransfer;

/**
 * Test cases for the {@link MyBatisUserNodeDao} class.
 * 
 * @author matt
 * @version 1.1
 */
public class MyBatisUserNodeDaoTests extends AbstractMyBatisUserDaoTestSupport {

	/**
	 * The tables to delete from at the start of the tests (within a
	 * transaction).
	 */
	private static final String[] DELETE_TABLES = new String[] { "solaruser.user_node",
			"solaruser.user_user" };

	private static final String TEST_EMAIL_2 = "foo2@localhost.localdomain";
	private static final String TEST_DESC = "Test description";
	private static final Long TEST_ID_2 = -2L;
	private static final byte[] TEST_CERT = "test cert".getBytes();
	private static final Long TEST_NODE_2 = -99999L;

	private MyBatisUserNodeDao userNodeDao;
	private MyBatisSolarNodeDao solarNodeDao;
	private MyBatisUserNodeCertificateDao userNodeCertificateDao;

	private User user = null;
	private SolarNode node = null;
	private Long userNodeId = null;

	@Before
	public void setUp() throws Exception {
		userNodeCertificateDao = new MyBatisUserNodeCertificateDao();
		userNodeCertificateDao.setSqlSessionFactory(getSqlSessionFactory());
		solarNodeDao = new MyBatisSolarNodeDao();
		solarNodeDao.setSqlSessionFactory(getSqlSessionFactory());
		userNodeDao = new MyBatisUserNodeDao();
		userNodeDao.setSqlSessionFactory(getSqlSessionFactory());
		setupTestNode();
		this.node = solarNodeDao.get(TEST_NODE_ID);
		assertNotNull(this.node);
		deleteFromTables(DELETE_TABLES);
		storeNewUser();
		assertNotNull(this.user);
		userNodeId = null;
	}

	/**
	 * Test able to store a new UserNode.
	 */
	@Test
	public void storeNewUserNode() {
		UserNode newUserNode = new UserNode();
		newUserNode.setNode(this.node);
		newUserNode.setCreated(new DateTime());
		newUserNode.setDescription(TEST_DESC);
		newUserNode.setName(TEST_NAME);
		newUserNode.setNode(this.node);
		newUserNode.setUser(this.user);
		Long id = userNodeDao.store(newUserNode);
		assertNotNull(id);
		this.userNodeId = id;
	}

	/**
	 * Test able to get a user node.
	 */
	@Test
	public void getByPrimaryKey() {
		storeNewUserNode();
		UserNode userNode = userNodeDao.get(this.userNodeId);
		assertNotNull(userNode);
		assertEquals(this.userNodeId, userNode.getId());
		assertEquals(TEST_NAME, userNode.getName());
		assertEquals(TEST_DESC, userNode.getDescription());
		assertNotNull(userNode.getNode());
		assertEquals(TEST_NODE_ID, userNode.getNode().getId());
		assertNotNull(userNode.getUser());
	}

	/**
	 * Test able to update an existing UserNode.
	 */
	@Test
	public void updateUserNode() {
		storeNewUserNode();
		Long user2Id = storeNewUser(TEST_EMAIL_2);
		UserNode userNode = userNodeDao.get(this.userNodeId);
		userNode.setDescription("New description");
		userNode.setName("New name");
		userNode.setUser(userDao.get(user2Id));
		Long id = userNodeDao.store(userNode);
		assertNotNull(id);
		assertEquals(this.userNodeId, id);
		UserNode updated = userNodeDao.get(this.userNodeId);
		assertEquals(userNode.getDescription(), updated.getDescription());
		assertEquals(userNode.getName(), updated.getName());
		assertEquals(TEST_NODE_ID, updated.getNode().getId());
	}

	/**
	 * Test able to find for a user with multiple results.
	 */
	@Test
	public void findForUserMultipleResults() {
		storeNewUserNode();

		// create 2nd node for user
		setupTestNode(TEST_ID_2);
		UserNode newUserNode = new UserNode();
		newUserNode.setCreated(new DateTime());
		newUserNode.setDescription(TEST_DESC);
		newUserNode.setName(TEST_NAME);
		newUserNode.setNode(solarNodeDao.get(TEST_ID_2));
		newUserNode.setUser(this.user);
		Long userNode2 = userNodeDao.store(newUserNode);
		assertNotNull(userNode2);

		List<UserNode> results = userNodeDao.findUserNodesForUser(this.user);
		assertNotNull(results);
		assertEquals(2, results.size());

		UserNode n1 = results.get(0);
		assertNotNull(n1);
		assertEquals(this.userNodeId, n1.getId());
		assertEquals(this.node, n1.getNode());
		assertEquals(this.user, n1.getUser());

		assertNull("Certificate", n1.getCertificate());
	}

	@Test
	public void archiveNode() {
		storeNewUserNode();
		userNodeDao.updateUserNodeArchivedStatus(user.getId(), new Long[] { node.getId() }, true);
	}

	@Test
	public void unArchiveNode() {
		archiveNode();
		userNodeDao.updateUserNodeArchivedStatus(user.getId(), new Long[] { node.getId() }, false);
	}

	@Test
	public void findArchivedForUser() {
		archiveNode();

		// create 2nd node for user
		setupTestNode(TEST_ID_2);
		UserNode newUserNode = new UserNode();
		newUserNode.setCreated(new DateTime());
		newUserNode.setDescription(TEST_DESC);
		newUserNode.setName(TEST_NAME);
		newUserNode.setNode(solarNodeDao.get(TEST_ID_2));
		newUserNode.setUser(this.user);
		Long userNode2 = userNodeDao.store(newUserNode);
		assertNotNull(userNode2);

		List<UserNode> results = userNodeDao.findArchivedUserNodesForUser(this.user.getId());
		assertNotNull(results);
		assertEquals(1, results.size());

		UserNode n1 = results.get(0);
		assertNotNull(n1);
		assertEquals(this.node.getId(), n1.getId());
		assertEquals(this.node, n1.getNode());
		assertEquals(this.user, n1.getUser());
		assertNull("Certificate", n1.getCertificate());
	}

	@Test
	public void findForUserNoArchived() {
		archiveNode();

		// create 2nd node for user
		setupTestNode(TEST_ID_2);
		UserNode newUserNode = new UserNode();
		newUserNode.setCreated(new DateTime());
		newUserNode.setDescription(TEST_DESC);
		newUserNode.setName(TEST_NAME);
		newUserNode.setNode(solarNodeDao.get(TEST_ID_2));
		newUserNode.setUser(this.user);
		Long userNode2 = userNodeDao.store(newUserNode);
		assertNotNull(userNode2);

		List<UserNode> results = userNodeDao.findUserNodesForUser(this.user);
		assertNotNull(results);
		assertEquals(1, results.size());

		UserNode n1 = results.get(0);
		assertNotNull(n1);
		assertEquals(TEST_ID_2, n1.getId());
		assertEquals(this.user, n1.getUser());
		assertNull("Certificate", n1.getCertificate());
	}

	@Test
	public void findForUserUnArchived() {
		archiveNode();

		List<UserNode> results = userNodeDao.findUserNodesForUser(this.user);
		assertNotNull(results);
		assertEquals(0, results.size());

		userNodeDao.updateUserNodeArchivedStatus(this.user.getId(), new Long[] { this.node.getId() },
				false);

		results = userNodeDao.findUserNodesForUser(this.user);
		assertNotNull(results);
		assertEquals(1, results.size());

		UserNode n1 = results.get(0);
		assertNotNull(n1);
		assertEquals(this.user, n1.getUser());
		assertEquals(this.node, n1.getNode());
		assertNull("Certificate", n1.getCertificate());
	}

	private void storeNewUser() {
		this.user = createNewUser(TEST_EMAIL);
	}

	private UserNodeCertificate storeNewCert(UserNodeCertificateStatus status) {
		UserNodeCertificate newUserNodeCert = new UserNodeCertificate();
		newUserNodeCert.setCreated(new DateTime());
		newUserNodeCert.setNodeId(this.node.getId());
		newUserNodeCert.setUserId(this.user.getId());
		newUserNodeCert.setKeystoreData(TEST_CERT);
		newUserNodeCert.setStatus(status);
		newUserNodeCert.setRequestId("test req ID");
		UserNodePK id = userNodeCertificateDao.store(newUserNodeCert);
		assertNotNull(id);
		return userNodeCertificateDao.get(id);
	}

	@Test
	public void findForUserWithNoCertificate() {
		storeNewUserNode();
		List<UserNode> results = userNodeDao.findUserNodesAndCertificatesForUser(user.getId());
		assertNotNull(results);
		assertEquals(1, results.size());
		assertNull("Certificate not present", results.get(0).getCertificate());
	}

	@Test
	public void findForUserWithCertificate() {
		storeNewUserNode();
		final UserNodeCertificate cert1 = storeNewCert(UserNodeCertificateStatus.v);

		List<UserNode> results = userNodeDao.findUserNodesAndCertificatesForUser(user.getId());
		assertNotNull(results);
		assertEquals(1, results.size());
		assertEquals(cert1, results.get(0).getCertificate());
	}

	private UserNodeTransfer storeNewTransfer(Long nodeId) {
		UserNodeTransfer newUserNodeTransfer = new UserNodeTransfer();
		newUserNodeTransfer.setCreated(new DateTime());
		newUserNodeTransfer.setNodeId(nodeId);
		newUserNodeTransfer.setUserId(this.user.getId());
		newUserNodeTransfer.setEmail(TEST_EMAIL_2);
		userNodeDao.storeUserNodeTransfer(newUserNodeTransfer);
		UserNodeTransfer stored = userNodeDao.getUserNodeTransfer(newUserNodeTransfer.getId());
		assertNotNull("Inserted UserNodeTransfer", stored);
		return stored;
	}

	@Test
	public void insertUserNodeTransfer() {
		storeNewUserNode();
		final UserNodeTransfer xfer1 = storeNewTransfer(this.node.getId());
		assertNotNull("Creation date", xfer1.getCreated());
		assertEquals(this.node.getId(), xfer1.getNodeId());
		assertEquals(this.user.getId(), xfer1.getUserId());
		assertEquals(TEST_EMAIL_2, xfer1.getEmail());
	}

	@Test
	public void updateUserNodeTransfer() {
		insertUserNodeTransfer();
		UserNodeTransfer xfer1 = userNodeDao
				.getUserNodeTransfer(new UserNodePK(this.user.getId(), this.node.getId()));
		xfer1.setEmail("test.email.3@localhost");
		userNodeDao.storeUserNodeTransfer(xfer1);

		UserNodeTransfer xfer2 = userNodeDao.getUserNodeTransfer(xfer1.getId());
		assertNotNull("Updated UserNodeTransfer", xfer2);
		assertEquals("Creation date unchanged", xfer1.getCreated(), xfer2.getCreated());
		assertEquals(xfer1.getId(), xfer2.getId());
		assertEquals(xfer1.getEmail(), xfer2.getEmail());
	}

	@Test
	public void deleteUserNodeTransfer() {
		insertUserNodeTransfer();
		UserNodeTransfer xfer1 = userNodeDao
				.getUserNodeTransfer(new UserNodePK(this.user.getId(), this.node.getId()));
		userNodeDao.deleteUserNodeTrasnfer(xfer1);
		xfer1 = userNodeDao.getUserNodeTransfer(xfer1.getId());
		assertNull("UserNodeTransfer deleted", xfer1);
	}

	@Test
	public void findUserNodeTransferForEmailNoMatch() {
		List<UserNodeTransfer> results = userNodeDao
				.findUserNodeTransferRequestsForEmail(this.user.getEmail());
		assertNotNull("UserNodeTransfers for email results", results);
		assertEquals(0, results.size());
	}

	@Test
	public void findUserNodeTransferForEmail() throws Exception {
		insertUserNodeTransfer();

		// set up a 2nd node
		setupTestNode(TEST_NODE_2);
		SolarNode node2 = solarNodeDao.get(TEST_NODE_2);
		UserNode userNode2 = new UserNode(user, node2);
		userNode2 = userNodeDao.get(userNodeDao.store(userNode2));

		// set up a 2nd node transfer request
		storeNewTransfer(node2.getId());

		List<UserNodeTransfer> results = userNodeDao.findUserNodeTransferRequestsForEmail(TEST_EMAIL_2);
		assertNotNull("UserNodeTransfers for email results", results);
		assertEquals(2, results.size());

		// results will have same creation time from unit test transaction, so sorted by node ID ascending

		UserNodeTransfer xfer1 = results.get(0);
		assertEquals(new UserNodePK(user.getId(), node2.getId()), xfer1.getId());
		assertEquals(TEST_EMAIL_2, xfer1.getEmail());

		UserNodeTransfer xfer2 = results.get(1);
		assertEquals(new UserNodePK(user.getId(), node.getId()), xfer2.getId());
		assertEquals(TEST_EMAIL_2, xfer2.getEmail());
	}

	@Test
	public void findForUserWithTransferRequest() {
		insertUserNodeTransfer();
		List<UserNode> results = userNodeDao.findUserNodesAndCertificatesForUser(user.getId());
		assertNotNull(results);
		assertEquals(1, results.size());

		UserNodeTransfer xfer1 = results.get(0).getTransfer();
		assertNotNull("Associated UserNodeTransfer", xfer1);
		assertEquals(user.getId(), xfer1.getUserId());
		assertEquals(node.getId(), xfer1.getNodeId());
		assertEquals(TEST_EMAIL_2, xfer1.getEmail());
	}
}

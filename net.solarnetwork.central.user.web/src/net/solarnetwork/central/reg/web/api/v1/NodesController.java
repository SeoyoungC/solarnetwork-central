/* ==================================================================
 * NodesController.java - Jan 23, 2015 3:42:36 PM
 * 
 * Copyright 2007-2015 SolarNetwork.net Dev Team
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

package net.solarnetwork.central.reg.web.api.v1;

import static net.solarnetwork.web.domain.Response.response;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import net.solarnetwork.central.domain.FilterResults;
import net.solarnetwork.central.security.SecurityUtils;
import net.solarnetwork.central.support.BasicFilterResults;
import net.solarnetwork.central.user.biz.UserBiz;
import net.solarnetwork.central.user.domain.UserNode;
import net.solarnetwork.central.user.domain.UserNodeConfirmation;
import net.solarnetwork.central.web.support.WebServiceControllerSupport;
import net.solarnetwork.support.CertificateService;
import net.solarnetwork.web.domain.Response;

/**
 * Controller for user nodes web service API.
 * 
 * @author matt
 * @version 1.1
 */
@Controller("v1nodesController")
@RequestMapping(value = "/v1/sec/nodes")
public class NodesController extends WebServiceControllerSupport {

	public final UserBiz userBiz;
	public final CertificateService certificateService;

	/**
	 * Constructor.
	 * 
	 * @param userBiz
	 *        The {@link UserBiz}.
	 * @param certificateService
	 *        The {@link CertificateService}.
	 */
	@Autowired
	public NodesController(UserBiz userBiz, CertificateService certificateService) {
		super();
		this.userBiz = userBiz;
		this.certificateService = certificateService;
	}

	/**
	 * Get a listing of nodes for the active user.
	 * 
	 * @return The list of nodes available to the active user.
	 */
	@RequestMapping(value = { "", "/" }, method = RequestMethod.GET)
	@ResponseBody
	public Response<FilterResults<UserNode>> getMyNodes() {
		List<UserNode> nodes = userBiz.getUserNodes(SecurityUtils.getCurrentActorUserId());
		FilterResults<UserNode> result = new BasicFilterResults<UserNode>(nodes, (long) nodes.size(), 0,
				nodes.size());
		return response(result);
	}

	/**
	 * Get a listing of pending node confirmations for the active user.
	 * 
	 * @return The list of pending node confirmations for the active user.
	 */
	@RequestMapping(value = "/pending", method = RequestMethod.GET)
	@ResponseBody
	public Response<FilterResults<UserNodeConfirmation>> getPendingNodes() {
		List<UserNodeConfirmation> pending = userBiz
				.getPendingUserNodeConfirmations(SecurityUtils.getCurrentActorUserId());
		FilterResults<UserNodeConfirmation> result = new BasicFilterResults<UserNodeConfirmation>(
				pending, (long) pending.size(), 0, pending.size());
		return response(result);
	}

	/**
	 * Get a list of all archived nodes.
	 * 
	 * @return All archived nodes.
	 * @since 1.1
	 */
	@RequestMapping(value = "/archived", method = RequestMethod.GET)
	@ResponseBody
	public Response<List<UserNode>> getArchivedNodes() {
		List<UserNode> nodes = userBiz.getArchivedUserNodes(SecurityUtils.getCurrentActorUserId());
		return Response.response(nodes);
	}

	/**
	 * Update the archived status of a set of nodes.
	 * 
	 * @param nodeIds
	 *        The node IDs to update the archived status of.
	 * @param archived
	 *        {@code true} to archive, {@code false} to un-archive
	 * @return A success response.
	 * @since 1.1
	 */
	@RequestMapping(value = "/archived", method = RequestMethod.POST)
	@ResponseBody
	public Response<Object> updateArchivedStatus(@RequestParam("nodeIds") Long[] nodeIds,
			@RequestParam("archived") boolean archived) {
		userBiz.updateUserNodeArchivedStatus(SecurityUtils.getCurrentActorUserId(), nodeIds, archived);
		return Response.response(null);
	}
}

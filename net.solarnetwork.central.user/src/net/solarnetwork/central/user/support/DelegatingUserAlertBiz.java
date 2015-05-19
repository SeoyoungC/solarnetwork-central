/* ==================================================================
 * DelegatingUserAlertBiz.java - 19/05/2015 8:04:20 pm
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

package net.solarnetwork.central.user.support;

import java.util.List;
import net.solarnetwork.central.user.biz.UserAlertBiz;
import net.solarnetwork.central.user.domain.UserAlert;

/**
 * Delegating implementation of {@link UserAlertBiz}, mostly to help with AOP.
 * 
 * @author matt
 * @version 1.0
 */
public class DelegatingUserAlertBiz implements UserAlertBiz {

	private final UserAlertBiz delegate;

	/**
	 * Construct with a delegate.
	 * 
	 * @param delegate
	 *        The delegate to use.
	 */
	public DelegatingUserAlertBiz(UserAlertBiz delegate) {
		super();
		this.delegate = delegate;
	}

	@Override
	public List<UserAlert> userAlertsForUser(Long userId) {
		return delegate.userAlertsForUser(userId);
	}

}

/* ==================================================================
 * UserInformation.java - Jun 13, 2011 11:01:30 AM
 * 
 * Copyright 2007-2011 SolarNetwork.net Dev Team
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
 * $Id$
 * ==================================================================
 */

package net.solarnetwork.central.dras.support;

import java.util.Set;

import net.solarnetwork.central.dras.domain.User;
import net.solarnetwork.central.dras.domain.UserRole;

/**
 * Helper object for a collection of User related entities.
 * 
 * @author matt
 * @version $Revision$
 */
public class UserInformation {

	private User user;
	private Set<UserRole> roles;
	private Set<Long> programs;
	
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public Set<UserRole> getRoles() {
		return roles;
	}
	public void setRoles(Set<UserRole> roles) {
		this.roles = roles;
	}
	public Set<Long> getPrograms() {
		return programs;
	}
	public void setPrograms(Set<Long> programs) {
		this.programs = programs;
	}
	
}

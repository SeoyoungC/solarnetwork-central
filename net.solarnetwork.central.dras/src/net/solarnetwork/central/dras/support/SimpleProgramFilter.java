/* ==================================================================
 * SimpleProgramFilter.java - Jun 10, 2011 3:59:32 PM
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

import java.util.LinkedHashMap;
import java.util.Map;

import net.solarnetwork.central.dras.dao.ProgramFilter;
import net.solarnetwork.util.SerializeIgnore;

/**
 * Implementation of {@link ProgramFilter}.
 * 
 * @author matt
 * @version $Revision$
 */
public class SimpleProgramFilter implements ProgramFilter {

	private Long userId;
	private String name;
	
	@Override
	@SerializeIgnore
	public Map<String, ?> getFilter() {
		Map<String, Object> f = new LinkedHashMap<String, Object>(1);
		if ( name != null ) {
			f.put("name", name);
		}
		if ( userId != null ) {
			f.put("userId", userId);
		}
		return f;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public Long getUserId() {
		return userId;
	}

	public void setName(String name) {
		this.name = name;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}

}

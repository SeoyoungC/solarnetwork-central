/* ==================================================================
 * RepeatableTaskException.java - Feb 17, 2011 3:49:29 PM
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

package net.solarnetwork.central;

/**
 * An exception when some task that can be repeated safely has failed
 * to signal to the caller to retry the task.
 * 
 * @author matt
 * @version $Revision$
 */
public class RepeatableTaskException extends RuntimeException {

	private static final long serialVersionUID = 948738004538481858L;

	public RepeatableTaskException() {
		super();
	}

	public RepeatableTaskException(String msg, Throwable t) {
		super(msg, t);
	}

	public RepeatableTaskException(String msg) {
		super(msg);
	}

	public RepeatableTaskException(Throwable t) {
		super(t);
	}

}

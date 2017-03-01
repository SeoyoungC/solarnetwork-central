/* ==================================================================
 * AuthenticationDataV2.java - 1/03/2017 8:41:00 PM
 * 
 * Copyright 2007-2017 SolarNetwork.net Dev Team
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

package net.solarnetwork.central.security.web;

import java.io.IOException;

/**
 * Version 2 authentication token scheme based on HMAC-SHA256.
 * 
 * @author matt
 * @version 1.0
 * @since 1.8
 */
public class AuthenticationDataV2 extends AuthenticationData {

	public AuthenticationDataV2(SecurityHttpServletRequestWrapper request, String headerValue)
			throws IOException {
		super(AuthenticationScheme.V1, request, headerValue);

		// the header must be in the form TOKEN-ID:HMAC-SHA1-SIGNATURE
		// TODO

		validateContentDigest(request);
	}

	@Override
	public String getAuthTokenId() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getSignatureDigest() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getSignatureData() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String computeSignatureDigest(String secretKey) {
		return computeMACDigest(secretKey, "HmacSHA256");
	}

}

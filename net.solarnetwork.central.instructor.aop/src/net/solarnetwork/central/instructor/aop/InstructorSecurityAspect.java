/* ==================================================================
 * InstructorSecurityAspect.java - Nov 27, 2012 8:57:43 AM
 * 
 * Copyright 2007-2012 SolarNetwork.net Dev Team
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

package net.solarnetwork.central.instructor.aop;

import net.solarnetwork.central.instructor.biz.InstructorBiz;
import net.solarnetwork.central.instructor.dao.NodeInstructionDao;
import net.solarnetwork.central.instructor.domain.NodeInstruction;
import net.solarnetwork.central.user.dao.UserNodeDao;
import net.solarnetwork.central.user.support.AuthorizationSupport;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

/**
 * Security aspect for {@link InstructorBiz}.
 * 
 * @author matt
 * @version 1.1
 */
@Aspect
public class InstructorSecurityAspect extends AuthorizationSupport {

	private final NodeInstructionDao nodeInstructionDao;

	/**
	 * Constructor.
	 * 
	 * @param userNodeDao
	 *        the UserNodeDao to use
	 */
	public InstructorSecurityAspect(UserNodeDao userNodeDao, NodeInstructionDao nodeInstructionDao) {
		super(userNodeDao);
		this.nodeInstructionDao = nodeInstructionDao;
	}

	// Hmm, can't use execution(* net.solarnetwork.central.instructor.biz.InstructorBiz.getActiveInstructionsForNode(..))
	// because end up with AspectJ exception "can't determine superclass of missing type 
	// net.solarnetwork.central.instructor.aop.InstructorSecurityAspect" which is being thrown because the OSGi
	// base ClassLoader is somehow being used after trying to inspect the osgi:service exporting the
	// advised bean. All very strange, and I've given up trying to figure it out, after finding tweaking
	// the execution() expression lets the whole thing work.
	@Pointcut("bean(aop*) && execution(* net.solarnetwork.central.instructor.biz.*.get*ForNode(..)) && args(nodeId)")
	public void instructionsForNode(Long nodeId) {
	}

	@Pointcut("bean(aop*) && execution(* net.solarnetwork.central.instructor.biz.*.queueInstruction(..)) && args(nodeId,..)")
	public void queueInstruction(Long nodeId) {
	}

	@Pointcut("bean(aop*) && execution(* net.solarnetwork.central.instructor.biz.*.getInstruction(..)) && args(instructionId,..)")
	public void viewInstruction(Long instructionId) {
	}

	@Pointcut("bean(aop*) && execution(* net.solarnetwork.central.instructor.biz.*.updateInstruction*(..)) && args(instructionId,..)")
	public void updateInstruction(Long instructionId) {
	}

	/**
	 * Allow the current user (or current node) access to node instructions.
	 * 
	 * @param nodeId
	 *        the ID of the node to verify
	 */
	@Before("instructionsForNode(nodeId) || queueInstruction(nodeId)")
	public void instructionsForNodeCheck(Long nodeId) {
		if ( nodeId == null ) {
			return;
		}
		requireNodeWriteAccess(nodeId);
	}

	/**
	 * Allow the current user (or current node) access to viewing instructions
	 * by ID.
	 * 
	 * @param instructionId
	 *        the instruction ID
	 * @param instruction
	 *        the instruction
	 */
	@AfterReturning(pointcut = "viewInstruction(instructionId)", returning = "instruction")
	public void viewInstructionAccessCheck(Long instructionId, NodeInstruction instruction) {
		if ( instructionId == null ) {
			return;
		}
		final Long nodeId = instruction.getNodeId();
		if ( nodeId == null ) {
			return;
		}
		requireNodeWriteAccess(nodeId);
	}

	/**
	 * Allow the current user (or current node) access to updating instructions
	 * by ID.
	 * 
	 * @param instructionId
	 *        the ID of the instruction being updated
	 */
	@Before("updateInstruction(instructionId)")
	public void updateInstructionAccessCheck(Long instructionId) {
		if ( instructionId == null ) {
			return;
		}
		final NodeInstruction instruction = nodeInstructionDao.get(instructionId);
		if ( instruction == null ) {
			return;
		}
		final Long nodeId = instruction.getNodeId();
		if ( nodeId == null ) {
			return;
		}
		requireNodeWriteAccess(nodeId);
	}
}

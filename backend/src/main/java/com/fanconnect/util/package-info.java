/**
 * Utility layer — small, reusable, stateless helper methods.
 *
 * <p><b>Role:</b> Holds cross-cutting helpers that do not belong in any single service.
 * No Spring bean lifecycle required unless injection is needed.
 *
 * <p><b>Contains:</b> SecurityUtils — reads the currently authenticated user's email
 * from the Spring SecurityContext.
 */
package com.fanconnect.util;
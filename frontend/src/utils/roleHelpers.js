import { ROLES, ROUTES } from './constants';

/**
 * Default landing route after login/register per role.
 */
export function getHomeRouteForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN;
    case ROLES.BUSINESS_OWNER:
      return ROUTES.OWNER_DASHBOARD;
    case ROLES.FAN_USER:
    default:
      return ROUTES.DASHBOARD;
  }
}
import { GroupAttributeMap } from "./types";


/**
 * Check if user can access a module (CRM_SALESPERSON)
 */
export const canAccessModule = (
  groupMap: GroupAttributeMap,
  module: string
): boolean => {
  return groupMap.hasOwnProperty(module.toUpperCase());
};

/**
 * Check if user can perform action inside module
 * Example: can(groupMap, "CRM_SALESPERSON", "BTN_EXPORT")
 */
export const can = (
  groupMap: GroupAttributeMap,
  module: string,
  action: string
): boolean => {
  const mod = module.toUpperCase();
  if (!groupMap[mod]) return false;

  const permissionString = groupMap[mod];
  const permissionList = permissionString
    .split(",")
    .map((x) => x.trim().toUpperCase());

  return permissionList.includes(action.toUpperCase());
};

/**
 * Helper to get all permissions of a module
 */
export const getPermissions = (
  groupMap: GroupAttributeMap,
  module: string
): string[] => {
  const mod = module.toUpperCase();
  if (!groupMap[mod]) return [];
  return groupMap[mod]
    .split(",")
    .map((x) => x.trim().toUpperCase());
};

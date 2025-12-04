import { useMemo } from "react";

export function useRBAC(groupMap: Record<string, string>) {
  return useMemo(() => {
    return {
      /**
       * Check permission inside module
       * Example: can("CRM_SALESPERSON", "BTN_EXPORT")
       */
      can: (module: string, action: string): boolean => {
        if (!groupMap) return false;

        const mod = module.toUpperCase();
        const actionUpper = action.toUpperCase();

        const permissions = groupMap[mod];
        if (!permissions) return false;

        const list = permissions.split(",").map(s => s.trim().toUpperCase());

        return list.includes(actionUpper);
      },

      /**
       * Check module access
       */
      canAccess: (module: string): boolean => {
        if (!groupMap) return false;
        return Object.keys(groupMap).includes(module.toUpperCase());
      },

      /**
       * Get all permissions of module
       */
      getPerms: (module: string): string[] => {
        const permissions = groupMap[module.toUpperCase()];
        if (!permissions) return [];
        return permissions.split(",").map(s => s.trim().toUpperCase());
      }
    };
  }, [groupMap]);
}

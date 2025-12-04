import React from "react";
import { useRBAC } from "./useRBAC";

interface PermissionProps {
  module: string;
  action: string;
  groupMap: Record<string, string>;
  children: React.ReactNode;
}

export const Permission: React.FC<PermissionProps> = ({
  module,
  action,
  groupMap,
  children,
}) => {
  const { can } = useRBAC(groupMap);

  if (!can(module, action)) return null;

  return <>{children}</>;
};

export function hasPermission(permissions: string[], permission: string) {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], requiredPermissions: string[]) {
  return requiredPermissions.some((permission) => permissions.includes(permission));
}

export function hasAllPermissions(permissions: string[], requiredPermissions: string[]) {
  return requiredPermissions.every((permission) => permissions.includes(permission));
}

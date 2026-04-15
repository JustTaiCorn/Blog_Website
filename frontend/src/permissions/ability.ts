import type { User, UserRoleEntry } from "@/types/entities";
import { UserRole } from "@/types/entities";
import { Permission } from "./permissions";
const USER_PERMISSIONS: Permission[] = [
  Permission.BLOG_CREATE,
  Permission.BLOG_UPDATE_OWN,
  Permission.BLOG_DELETE_OWN,
  Permission.BLOG_PUBLISH,
  Permission.COMMENT_CREATE,
  Permission.COMMENT_DELETE_OWN,
  Permission.PROFILE_UPDATE,
  Permission.LIKE_TOGGLE,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  Permission.ADMIN_DASHBOARD,
  Permission.BLOG_DELETE_ANY,
  Permission.BLOG_MANAGE,
  Permission.COMMENT_DELETE_ANY,
  Permission.USER_MANAGE,
  Permission.CATEGORY_MANAGE,
  Permission.TAG_MANAGE,
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.USER_PROMOTE,
];

const ROLE_PERMISSION_MAP: Record<string, Permission[]> = {
  [UserRole.USER]: USER_PERMISSIONS,
  [UserRole.ADMIN]: ADMIN_PERMISSIONS,
  [UserRole.OWNER]: OWNER_PERMISSIONS,
};
export function getUserPermissions(roles: UserRoleEntry[]): Permission[] {
  const permissionSet = new Set<Permission>();
  for (const entry of roles) {
    const perms = ROLE_PERMISSION_MAP[entry.role] ?? [];
    for (const p of perms) {
      permissionSet.add(p);
    }
  }
  return Array.from(permissionSet);
}

export function hasPermission(
  user: User | null,
  permission: Permission,
): boolean {
  if (!user || !user.roles || user.roles.length === 0) return false;
  const permissions = getUserPermissions(user.roles);
  return permissions.includes(permission);
}

export function hasRole(user: User | null, role: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((r) => r.role === role);
}

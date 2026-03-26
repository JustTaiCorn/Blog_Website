export const Permission = {
  BLOG_CREATE: "blog:create",
  BLOG_UPDATE_OWN: "blog:update:own",
  BLOG_DELETE_OWN: "blog:delete:own",
  BLOG_PUBLISH: "blog:publish",

  BLOG_DELETE_ANY: "blog:delete:any",
  BLOG_MANAGE: "blog:manage",

  COMMENT_CREATE: "comment:create",
  COMMENT_DELETE_OWN: "comment:delete:own",
  COMMENT_DELETE_ANY: "comment:delete:any",

  PROFILE_UPDATE: "profile:update",

  LIKE_TOGGLE: "like:toggle",

  ADMIN_DASHBOARD: "admin:dashboard",
  CATEGORY_MANAGE: "category:manage",
  TAG_MANAGE: "tag:manage",

  USER_MANAGE: "user:manage",

  USER_PROMOTE: "user:promote",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

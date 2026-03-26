-- ===================================================================
-- Migration: add_role_permission_tables
-- Mục tiêu: Chuyển từ UserRole ENUM + UserRoleEntry TABLE
--           sang hệ thống Role/Permission dạng relational
--           *** GIỮ NGUYÊN DATA role cũ của từng user ***
-- ===================================================================

-- Bước 1: Backup data role cũ vào TEMP table trước khi xóa bất cứ thứ gì
CREATE TEMP TABLE _temp_user_roles AS
SELECT ure.user_id, ure.role::text AS role_name
FROM "UserRoleEntry" ure;

-- Bước 2: Xóa FK và bảng UserRoleEntry cũ
ALTER TABLE "UserRoleEntry" DROP CONSTRAINT "UserRoleEntry_user_id_fkey";
DROP TABLE "UserRoleEntry";

-- Bước 3: Xóa enum UserRole cũ (phải xóa TRƯỚC khi tạo bảng cùng tên)
DROP TYPE "UserRole";

-- Bước 4: Tạo bảng Role và seed 3 role mặc định (tên khớp enum cũ)
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

INSERT INTO "Role" ("name") VALUES ('USER'), ('ADMIN'), ('OWNER');

-- Bước 5: Tạo bảng Permission và RolePermission
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

CREATE TABLE "RolePermission" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- Bước 6: Tạo bảng UserRole mới (giờ an toàn vì enum đã bị xóa)
CREATE TABLE "UserRole" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("user_id","role_id")
);

-- Bước 7: MIGRATE DATA — chuyển từ temp table vào UserRole mới
INSERT INTO "UserRole" ("user_id", "role_id")
SELECT t.user_id, r.id
FROM _temp_user_roles t
JOIN "Role" r ON r.name = t.role_name;

-- Bước 8: Thêm Foreign Key constraints cho các bảng mới
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey"
    FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

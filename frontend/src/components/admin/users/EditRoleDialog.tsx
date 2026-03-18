import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type AdminUser, useUpdateUserRole } from "@/hooks/admin/useUserManagement";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}

export default function EditRoleDialog({
  open,
  onOpenChange,
  user,
}: EditRoleDialogProps) {
  const updateRoleMutation = useUpdateUserRole();

  const handleUpdateRole = async () => {
    if (!user) return;

    const roles = user.roles?.map((r) => r.role) || [];
    const isAdmin = roles.includes("ADMIN");

    updateRoleMutation.mutate(
      {
        userId: user.id,
        role: "ADMIN",
        action: isAdmin ? "remove" : "add",
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isAdmin = user?.roles?.some((r) => r.role === "ADMIN");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận thay đổi quyền hạn</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn {isAdmin ? "xóa quyền Admin của" : "cấp quyền Admin cho"}{" "}
            người dùng "{user?.fullname}" (@{user?.username})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateRoleMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpdateRole}
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending
              ? "Đang lưu..."
              : isAdmin
              ? "Hủy quyền Admin"
              : "Cấp quyền Admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

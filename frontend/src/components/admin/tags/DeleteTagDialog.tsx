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
import { useDeleteTag, type Tag } from "@/services/admin-services/tagService";

interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

export default function DeleteTagDialog({
  open,
  onOpenChange,
  tag,
}: DeleteTagDialogProps) {
  const deleteTagMutation = useDeleteTag();

  const handleDelete = async () => {
    if (!tag) return;

    deleteTagMutation.mutate(tag.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa tag</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa tag "{tag?.name}"? Hành động này không thể
            hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTagMutation.isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTagMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteTagMutation.isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

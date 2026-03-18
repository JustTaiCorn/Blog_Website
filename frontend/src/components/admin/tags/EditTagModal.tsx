import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTag, type Tag } from "@/hooks/admin/useTag";

interface EditTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

export default function EditTagModal({
  open,
  onOpenChange,
  tag,
}: EditTagModalProps) {
  const [name, setName] = useState("");
  const updateTagMutation = useUpdateTag();

  useEffect(() => {
    if (tag) {
      setName(tag.name);
    }
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !tag) {
      return;
    }

    updateTagMutation.mutate(
      { id: tag.id, name: name.trim() },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Tag</DialogTitle>
          <DialogDescription>Cập nhật thông tin tag</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên Tag</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên tag..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateTagMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTagMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={updateTagMutation.isPending}>
              {updateTagMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

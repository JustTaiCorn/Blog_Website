import { useState } from "react";
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
import { useCreateTag } from "@/services/admin-services/tagService";

interface AddTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTagModal({ open, onOpenChange }: AddTagModalProps) {
  const [name, setName] = useState("");
  const createTagMutation = useCreateTag();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    createTagMutation.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Tag Mới</DialogTitle>
          <DialogDescription>Tạo tag mới cho hệ thống blog</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên Tag</Label>
              <Input
                id="name"
                placeholder="Nhập tên tag..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createTagMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTagMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createTagMutation.isPending}>
              {createTagMutation.isPending ? "Đang tạo..." : "Tạo Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Textarea } from "@/components/ui/textarea";
import { useCreateCategory } from "@/services/admin-services/categoryService";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddCategoryModal({
  open,
  onOpenChange,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const createCategoryMutation = useCreateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    createCategoryMutation.mutate(
      { name: name.trim(), details: details.trim() },
      {
        onSuccess: () => {
          setName("");
          setDetails("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
          <DialogDescription>
            Tạo danh mục mới cho hệ thống blog
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên Danh Mục</Label>
              <Input
                id="name"
                placeholder="Nhập tên danh mục..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createCategoryMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">Mô Tả</Label>
              <Textarea
                id="details"
                placeholder="Nhập mô tả danh mục..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={createCategoryMutation.isPending}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCategoryMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending
                ? "Đang tạo..."
                : "Tạo Danh Mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

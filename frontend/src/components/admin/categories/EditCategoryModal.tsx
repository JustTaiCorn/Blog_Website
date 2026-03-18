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
import { Textarea } from "@/components/ui/textarea";
import type {Category} from "@/services/admin-services/categoryService.ts";
import {useUpdateCategory} from "@/hooks/admin/useCategory.ts";
interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export default function EditCategoryModal({
  open,
  onOpenChange,
  category,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const updateCategoryMutation = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDetails(category.details || "");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category) {
      return;
    }

    updateCategoryMutation.mutate(
      { id: category.id, name: name.trim(), details: details.trim() },
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
          <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
          <DialogDescription>Cập nhật thông tin danh mục</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên Danh Mục</Label>
              <Input
                id="edit-name"
                placeholder="Nhập tên danh mục..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateCategoryMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-details">Mô Tả</Label>
              <Textarea
                id="edit-details"
                placeholder="Nhập mô tả danh mục..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={updateCategoryMutation.isPending}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateCategoryMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending
                ? "Đang cập nhật..."
                : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

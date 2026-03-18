import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, Trash2Icon, PlusIcon, SearchIcon } from "lucide-react";
import AddCategoryModal from "@/components/admin/categories/AddCategoryModal";
import EditCategoryModal from "@/components/admin/categories/EditCategoryModal";
import DeleteCategoryDialog from "@/components/admin/categories/DeleteCategoryDialog";
import { useAllCategories, type Category } from "@/hooks/admin/useCategory";

export default function CategoryManagement() {
  const { data: categories = [], isLoading } = useAllCategories();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-grey/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-dark-grey">
            Đang tải danh sách danh mục...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-dark-grey italic">
            {searchQuery
              ? "Không tìm thấy danh mục nào"
              : "Chưa có danh mục nào. Hãy tạo danh mục đầu tiên!"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">STT</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-32 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <span className="font-medium text-black">
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-dark-grey text-sm max-w-md">
                    <div className="flex flex-col gap-1">
                      <p className="line-clamp-2">
                        {category.details || "Không có mô tả"}
                      </p>
                      <span className="text-xs text-grey">
                        {category._count?.blogs
                          ? `${category._count.blogs} bài viết`
                          : "Chưa có bài viết"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
      <EditCategoryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        category={selectedCategory}
      />
      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}

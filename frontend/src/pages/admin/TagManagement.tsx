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
import AddTagModal from "@/components/admin/tags/AddTagModal";
import EditTagModal from "@/components/admin/tags/EditTagModal";
import DeleteTagDialog from "@/components/admin/tags/DeleteTagDialog";
import { useAllTags, type Tag } from "@/hooks/admin/useTag";

export default function TagManagement() {
  const { data: tags = [], isLoading } = useAllTags();
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTags(filtered);
    }
  }, [searchQuery, tags]);

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Tag</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Thêm Tag
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm tag..."
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
            Đang tải danh sách tag...
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-12 text-center text-dark-grey italic">
            {searchQuery
              ? "Không tìm thấy tag nào"
              : "Chưa có tag nào. Hãy tạo tag đầu tiên!"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">STT</TableHead>
                <TableHead>Tên Tag</TableHead>
                <TableHead className="w-32">Mô tả</TableHead>
                <TableHead className="w-32 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag, index) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-dark-grey text-sm">
                    {tag._count && typeof tag._count.blogs === "number"
                      ? tag._count.blogs > 0
                        ? `Có ${tag._count.blogs} bài viết`
                        : "Chưa có bài viết"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                        className="h-8 w-8 p-0"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tag)}
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
      <AddTagModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <EditTagModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        tag={selectedTag}
      />
      <DeleteTagDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        tag={selectedTag}
      />
    </div>
  );
}

import type { BlogFilterParams } from "@/hooks/useBlog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlogFilterBarProps {
  filters: BlogFilterParams;
  onFilterChange: (filters: BlogFilterParams) => void;
}

export default function BlogFilterBar({
  filters,
  onFilterChange,
}: BlogFilterBarProps) {
  const getSortKey = () => {
    if (filters.sortBy === "views") return "views";
    if (filters.sortBy === "likes") return "likes";
    return filters.sort === "asc" ? "oldest" : "newest";
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case "newest":
        onFilterChange({ ...filters, sort: "desc", sortBy: "date" });
        break;
      case "oldest":
        onFilterChange({ ...filters, sort: "asc", sortBy: "date" });
        break;
      case "views":
        onFilterChange({ ...filters, sort: "desc", sortBy: "views" });
        break;
      case "likes":
        onFilterChange({ ...filters, sort: "desc", sortBy: "likes" });
        break;
    }
  };

  return (
    <div className="flex justify-end">
      <Select value={getSortKey()} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[150px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mới nhất</SelectItem>
          <SelectItem value="oldest">Cũ nhất</SelectItem>
          <SelectItem value="views">Lượt xem</SelectItem>
          <SelectItem value="likes">Lượt thích</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

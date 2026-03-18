import type { BlogFilterParams } from "@/hooks/useBlog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface BlogFilterBarProps {
  filters: BlogFilterParams;
  onFilterChange: (filters: BlogFilterParams) => void;
}

export default function BlogFilterBar({
  filters,
  onFilterChange,
}: BlogFilterBarProps) {
  // Derive combined sortKey from sort + sortBy
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

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      dateFrom: e.target.value || undefined,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      dateTo: e.target.value || undefined,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.sortBy;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort */}
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

      {/* Date From */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm text-dark-grey whitespace-nowrap">Từ</label>
        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={handleDateFromChange}
          className="h-9 px-2.5 text-sm border border-grey rounded-md outline-none focus:ring-1 focus:ring-black/20"
        />
      </div>

      {/* Date To */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm text-dark-grey whitespace-nowrap">Đến</label>
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={handleDateToChange}
          className="h-9 px-2.5 text-sm border border-grey rounded-md outline-none focus:ring-1 focus:ring-black/20"
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-9 gap-1.5 text-sm text-dark-grey hover:text-black"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại
        </Button>
      )}
    </div>
  );
}

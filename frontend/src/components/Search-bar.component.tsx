"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useSearchPreview } from "@/hooks/useBlog";

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchBar({
  className,
  isMobile = false,
  onClose,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isFetching } = useSearchPreview(debouncedQuery);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowResults(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim().length === 0) return;
    setShowResults(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setShowResults(false);
  };

  const handleResultClick = (blogId: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/blog/${blogId}`);
    if (onClose) onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
  };

  const results = data?.blogs ?? [];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isFetching ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <Input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() =>
              debouncedQuery.trim().length >= 2 && setShowResults(true)
            }
            className={`${
              isMobile ? "w-full" : "w-80"
            } pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-transparent text-sm`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 left-0 w-full min-w-[360px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((blog) => (
                  <li key={blog.blog_id}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(blog.blog_id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="text-xs text-gray-400">
                        @{blog.author?.username}
                      </span>
                      <span className="text-sm font-medium text-gray-900 line-clamp-1">
                        {blog.title}
                      </span>
                      {blog.published_at && (
                        <span className="text-xs text-gray-400">
                          {formatDate(blog.published_at as unknown as string)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors text-center"
                >
                  Submit search for advanced filtering
                </button>
              </div>
            </>
          ) : (
            !isFetching && (
              <div className="px-4 py-5 text-center text-sm text-gray-400">
                Không tìm thấy kết quả cho &ldquo;{debouncedQuery}&rdquo;
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

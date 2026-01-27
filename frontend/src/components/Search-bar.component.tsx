"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
interface SearchBarProps {
    className?: string;
    isMobile?: boolean;
    onClose?: () => void;
}

export default function SearchBar({ className, isMobile = false, onClose }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
    //             setShowResults(false);
    //         }
    //     };
    //
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => document.removeEventListener("mousedown", handleClickOutside);
    // }, []);
    //
    // // Search products with debounce
    // // useEffect(() => {
    // //     const delayDebounceFn = setTimeout(() => {
    // //         if (searchQuery.trim().length >= 2) {
    // //             searchProducts(searchQuery);
    // //         } else {
    // //             setSearchResults([]);
    // //             setShowResults(false);
    // //         }
    // //     }, 300);
    // //
    // //     return () => clearTimeout(delayDebounceFn);
    // // }, [searchQuery]);
    const handleClearSearch = () => {
        setSearchQuery("");
        setShowResults(false);
    };
    //
    // const handleProductClick = () => {
    //     setShowResults(false);
    //     setSearchQuery("");
    //     if (onClose) onClose();
    // };
    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                    type="text"
                    placeholder="TÌM KIẾM SẢN PHẨM"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${
                        isMobile ? "w-full" : "w-80"
                    } pl-10 pr-10 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-transparent text-sm`}
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
        </div>
    );
}

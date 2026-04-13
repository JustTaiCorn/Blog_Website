import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications, useMarkAllAsRead } from "@/hooks/useNotification";
import NotificationItem from "@/components/notification-item.component";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const TABS = [
  { key: undefined as string | undefined, label: "Tất cả" },
  { key: "like", label: "Thích" },
  { key: "comment", label: "Bình luận" },
  { key: "reply", label: "Phản hồi" },
];

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotifications(activeTab);
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(activeTab);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={markAllAsRead.isPending}
          className="flex items-center gap-2 text-sm"
        >
          {markAllAsRead.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          Đọc tất cả
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key ?? "all"}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm">Chưa có thông báo nào</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem notification={notification} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-8"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;

import { useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications, useMarkAllAsRead } from "@/hooks/useNotification";
import NotificationItem from "@/components/notification-item.component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "like", label: "Thích" },
  { key: "comment", label: "Bình luận" },
  { key: "reply", label: "Phản hồi" },
  { key: "follow", label: "Theo dõi" },
];

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotifications(activeTab === "all" ? undefined : activeTab);
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(activeTab === "all" ? undefined : activeTab);
  };

  const renderNotificationList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mb-3 text-gray-300" />
          <p className="text-sm">Chưa có thông báo nào</p>
        </div>
      );
    }

    return (
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
    );
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex-1">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            {/* Notification List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {renderNotificationList()}
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NotificationPage;

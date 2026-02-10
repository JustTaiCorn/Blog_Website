const DashboardOverview = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tổng quan hệ thống</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-grey/10">
          <h3 className="text-dark-grey text-sm mb-1">Người dùng mới</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-grey/10">
          <h3 className="text-dark-grey text-sm mb-1">Bài viết mới</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-grey/10">
          <h3 className="text-dark-grey text-sm mb-1">Tổng số lượt đọc</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
      <div className="mt-8 p-12 bg-white rounded-lg border border-dashed border-grey/30 text-center">
        <p className="text-dark-grey italic">
          Sẽ sớm cập nhật biểu đồ thống kê...
        </p>
      </div>
    </div>
  );
};

export default DashboardOverview;

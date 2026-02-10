const UserManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
      <div className="bg-white rounded-lg shadow-sm border border-grey/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-grey/5 border-b border-grey/10">
            <tr>
              <th className="p-4 font-medium text-dark-grey">Người dùng</th>
              <th className="p-4 font-medium text-dark-grey">Email</th>
              <th className="p-4 font-medium text-dark-grey">Vai trò</th>
              <th className="p-4 font-medium text-dark-grey">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="p-12 text-center text-dark-grey italic"
                colSpan={4}
              >
                Đang tải danh sách người dùng...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

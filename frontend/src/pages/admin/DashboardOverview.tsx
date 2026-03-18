import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Users, FileText, MessageCircle, Heart } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Types ---

interface DashboardStats {
  totalUsers: number;
  totalBlogs: number;
  totalComments: number;
  totalLikes: number;
}

interface NewUserDay {
  day: string;
  count: number;
}

interface BlogCategoryData {
  category: string;
  count: number;
  fill: string;
}

// --- Hooks ---

const useDashboardStats = () =>
  useQuery<DashboardStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

const useNewUsers7Days = () =>
  useQuery<NewUserDay[]>({
    queryKey: ["admin-new-users-7days"],
    queryFn: async () => (await api.get("/admin/stats/new-users-7days")).data,
  });

const useBlogsByCategory = () =>
  useQuery<BlogCategoryData[]>({
    queryKey: ["admin-blogs-by-category"],
    queryFn: async () => (await api.get("/admin/stats/blogs-by-category")).data,
  });


const barChartConfig = {
  count: {
    label: "Người dùng",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// --- Components ---

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  color: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-grey/10 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-dark-grey text-sm mb-0.5">{label}</p>
      <p className="text-3xl font-bold tabular-nums">
        {value ?? <span className="text-dark-grey text-base">...</span>}
      </p>
    </div>
  </div>
);

const NewUsersBarChart = () => {
  const { data } = useNewUsers7Days();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Người dùng mới (7 ngày qua)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig} className="h-[280px] w-full">
          <BarChart
            data={data ?? []}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const BlogsByCategoryDonutChart = () => {
  const { data } = useBlogsByCategory();

  const totalBlogs = useMemo(
    () => data?.reduce((acc, curr) => acc + curr.count, 0) ?? 0,
    [data],
  );

  // Build dynamic chart config from API data
  const donutChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data?.forEach((item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill,
      };
    });
    return config;
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Tỷ lệ bài viết theo chủ đề
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={donutChartConfig} className="h-[280px] w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="category" />}
            />
            <Pie
              data={data ?? []}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={3}
              stroke="#fff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalBlogs}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Bài viết
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="flex-wrap gap-2 [&>*]:basis-auto [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const DashboardOverview = () => {
  const { data } = useDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Người dùng"
          value={data?.totalUsers}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={FileText}
          label="Bài viết"
          value={data?.totalBlogs}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={MessageCircle}
          label="Bình luận"
          value={data?.totalComments}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Heart}
          label="Lượt thích"
          value={data?.totalLikes}
          color="bg-red-50 text-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewUsersBarChart />
        <BlogsByCategoryDonutChart />
      </div>
    </div>
  );
};

export default DashboardOverview;

import { prisma } from "../../lib/prisma.js";
import { addDays, format, startOfDay, subDays } from "date-fns";

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const CHART_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const getDashboardStats = async () => {
  const [totalUsers, totalBlogs, totalComments, totalLikes] = await Promise.all(
    [
      prisma.user.count({ where: { deleted: false } }),
      prisma.blog.count({ where: { published: true } }),
      prisma.comment.count({ where: { active: true } }),
      prisma.blogLike.count(),
    ],
  );

  return { totalUsers, totalBlogs, totalComments, totalLikes };
};

export const getNewUsersLast7Days = async () => {
  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 6));

  const users = await prisma.user.findMany({
    where: {
      created_at: { gte: sevenDaysAgo },
      deleted: false,
    },
    select: { created_at: true },
  });
  const countMap = {};
  for (let i = 0; i < 7; i++) {
    const date = addDays(sevenDaysAgo, i);
    const key = format(date, "yyyy-MM-dd");
    countMap[key] = {
      day: DAY_LABELS[date.getDay()],
      count: 0,
    };
  }

  users.forEach((user) => {
    const key = format(user.created_at, "yyyy-MM-dd");
    if (countMap[key]) {
      countMap[key].count++;
    }
  });

  return Object.values(countMap);
};

export const getBlogsByCategory = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          blogs: { where: { published: true } },
        },
      },
    },
  });

  return categories
    .map((cat, i) => ({
      category: cat.name,
      count: cat._count.blogs,
      fill: CHART_FILLS[i % CHART_FILLS.length],
    }))
    .filter((item) => item.count > 0);
};

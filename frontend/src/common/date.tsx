import dayjs from "dayjs";

export const getDay = (timestamp: any) => {
  return dayjs(timestamp).format("D MMM YYYY");
};
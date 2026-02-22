import dayjs from "dayjs";

export const getDay = (timestamp: any) => {
  return dayjs(timestamp).format("D MMM YYYY");
};

export const getFullDay = (timestamp: any) => {
  return dayjs(timestamp).format("D MMM, YYYY");
};

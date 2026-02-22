const LoadMoreBtn = ({ hasNextPage, fetchDataFun, isFetching }: any) => {
  if (hasNextPage) {
    return (
      <button
        onClick={() => fetchDataFun()}
        disabled={isFetching}
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 mx-auto mt-4"
      >
        {isFetching ? "Loading..." : "Load More"}
      </button>
    );
  }
  return null;
};
export default LoadMoreBtn;

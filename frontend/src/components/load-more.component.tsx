import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const LoadMoreBtn = ({ hasNextPage, fetchDataFun, isFetching }: any) => {
  if (hasNextPage) {
    return (
      <Button
        variant="ghost"
        onClick={() => fetchDataFun()}
        disabled={isFetching}
        className="flex items-center gap-2 mx-auto mt-4 text-dark-grey"
      >
        {isFetching ? (
          <>
            <Spinner className="w-4 h-4" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    );
  }
  return null;
};
export default LoadMoreBtn;

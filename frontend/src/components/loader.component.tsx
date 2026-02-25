import { Spinner } from "@/components/ui/spinner";

const Loader = () => {
  return (
    <div className="flex justify-center my-8">
      <Spinner className="w-12 h-12 text-dark-grey" />
    </div>
  );
};

export default Loader;

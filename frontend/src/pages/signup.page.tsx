import { SignUpForm } from "@/components/auth/signup-form";
import AnimationWrapper from "@/common/page-animation.tsx";

const SignUpPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AnimationWrapper>
          <SignUpForm />
        </AnimationWrapper>
      </div>
    </div>
  );
};

export default SignUpPage;

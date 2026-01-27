import { SignInForm } from "@/components/auth/signin-form";
import AnimationWrapper from "@/common/page-animation.tsx";

const SignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AnimationWrapper>
          <SignInForm />
        </AnimationWrapper>
      </div>
    </div>
  );
};

export default SignInPage;

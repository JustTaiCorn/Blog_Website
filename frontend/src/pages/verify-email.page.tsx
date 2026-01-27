import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(
          response.data.message || "Email đã được xác thực thành công!"
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Xác thực email thất bại. Link có thể đã hết hạn."
        );
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Token không hợp lệ");
    }
  }, [token]);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/signin");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-purple-500/10">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-semibold mb-2">Đang xác thực...</h2>
              <p className="text-muted-foreground">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">
                Xác thực thành công! 🎉
              </h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Chuyển hướng đến trang đăng nhập sau {countdown} giây...
              </p>
              <Button onClick={() => navigate("/signin")} className="w-full">
                Đăng nhập ngay
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">
                Xác thực thất bại
              </h2>
              <p className="text-muted-foreground mb-4">{message}</p>
              <div className="space-y-2">
                <Button onClick={() => navigate("/signup")} className="w-full">
                  Đăng ký lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/signin")}
                  className="w-full"
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;

"use client"; export const dynamic = 'force-dynamic';
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token-stt");

    if (!token) {
      router.replace("/login/", {scroll: false}); // If no token is found, redirect to login page
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch("/api/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Token validation failed");
      } catch (error) {
        toast.error(error);
        router.replace("/login/", {scroll: false}); // Redirect to login if token validation fails
      }
    };

    validateToken();
  }, [router]);

  return <div>Protected Content</div>;
}

export default ProtectedPage;
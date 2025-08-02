"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePage from "../../components/Home";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) return null;

  return (
    <div>
      <HomePage />
    </div>
  );
}

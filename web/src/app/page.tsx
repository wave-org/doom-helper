"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/encrypt");
  }, []);

  return (
    <main>
      <h3>Home Page</h3>
    </main>
  );
}

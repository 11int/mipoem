"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PoemModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [router]);

  return (
    <div className="poem-modal-overlay" onClick={() => router.back()}>
      <div
        className="poem-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="poem-modal-close"
          onClick={() => router.back()}
          aria-label="Close"
          type="button"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

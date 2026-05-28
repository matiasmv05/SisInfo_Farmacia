// app/components/Header.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
}

export function Header({ title, subtitle, onBack }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/login"); // fallback to login or previous page
    }
  };

  return (
    <header className="flex items-center gap-sm">
      <button
        onClick={handleBack}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-all text-on-surface-variant cursor-pointer hover:scale-105 active:scale-95"
        title="Cancelar Despacho"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight leading-none">
          {title}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-[2px]">
          {subtitle}
        </p>
      </div>
    </header>
  );
}

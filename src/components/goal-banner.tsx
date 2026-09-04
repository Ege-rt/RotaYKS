"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, GraduationCap } from "lucide-react";
import { UNIVERSITIES } from "@/lib/universities";
import { GoalPickerModal } from "./goal-picker-modal";

export function GoalBanner({
  university,
  department,
  onChange,
}: {
  university: string;
  department: string;
  onChange: (university: string, department: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const uni = UNIVERSITIES.find((u) => u.slug === university);
  const displayName = uni?.name || university;

  return (
    <>
      <div className="glass-panel relative mb-6 h-32 overflow-hidden p-0 sm:h-36">
        {!imgError ? (
          <Image
            src={`/universities/${university}.jpg`}
            alt={displayName}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-ink-900 to-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/25 backdrop-blur">
              <GraduationCap className="h-5 w-5 text-violet-200" />
            </div>
            <div>
              <p className="label-eyebrow">Hedefim</p>
              <p className="font-display text-lg font-semibold text-white sm:text-xl">
                {displayName}
              </p>
              {department && <p className="text-sm text-mist-300">{department}</p>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-medium text-mist-200 backdrop-blur transition-colors hover:bg-black/50"
          >
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Değiştir</span>
          </button>
        </div>
      </div>

      <GoalPickerModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        allowSkip
        initialUniversity={university}
        initialDepartment={department}
        onSaved={onChange}
      />
    </>
  );
}

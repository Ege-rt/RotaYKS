"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

export function UniversityThumb({
  slug,
  name,
  selected,
}: {
  slug: string;
  name: string;
  selected?: boolean;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border transition-colors ${
        selected ? "border-violet-400" : "border-line"
      }`}
    >
      {!errored ? (
        <Image
          src={`/universities/${slug}.jpg`}
          alt={name}
          fill
          sizes="200px"
          className="object-cover"
          unoptimized
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-ink-900">
          <span className="font-display text-lg font-semibold text-violet-300/70">
            {name
              .replace(/Üniversitesi.*/, "")
              .trim()
              .slice(0, 2)
              .toUpperCase()}
          </span>
        </div>
      )}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-violet-500/30">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

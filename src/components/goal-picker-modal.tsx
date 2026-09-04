"use client";

import { useState } from "react";
import { X, Check, GraduationCap, Loader2 } from "lucide-react";
import { UNIVERSITIES } from "@/lib/universities";
import { DEPARTMENTS } from "@/lib/departments";
import { UniversityThumb } from "./university-thumb";
import { Portal } from "./portal";

export function GoalPickerModal({
  open,
  onClose,
  allowSkip,
  initialUniversity,
  initialDepartment,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  allowSkip: boolean;
  initialUniversity?: string;
  initialDepartment?: string;
  onSaved: (targetUniversity: string, targetDepartment: string) => void;
}) {
  const [university, setUniversity] = useState(initialUniversity || "");
  const [department, setDepartment] = useState(initialDepartment || "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUniversity: university, targetDepartment: department }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved(university, department);
      onClose();
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="glass-panel w-full max-w-2xl animate-fade-up p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-violet-300" />
              <h3 className="font-display text-lg font-semibold text-white">Hedefini Belirle</h3>
            </div>
            {allowSkip && (
              <button onClick={onClose} className="rounded-lg p-1.5 text-mist-500 hover:bg-[var(--hover-tint)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mb-5 text-[13px] text-mist-500">
            Hangi üniversite ve bölümü hedefliyorsun? Panelinin üstünde seni motive etsin diye
            gösterelim.
          </p>

          <div className="max-h-[46vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {UNIVERSITIES.map((u) => (
                <button
                  key={u.slug}
                  onClick={() => setUniversity(u.slug)}
                  className="flex flex-col gap-1.5 text-left"
                >
                  <UniversityThumb slug={u.slug} name={u.name} selected={university === u.slug} />
                  <span className="line-clamp-2 text-[11px] leading-snug text-mist-300">
                    {u.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-mist-500">Hedef Bölüm</label>
            <input
              list="department-list"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Örn: Bilgisayar Mühendisliği"
              className="glass-input"
            />
            <datalist id="department-list">
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {allowSkip && (
              <button onClick={onClose} className="btn-secondary">
                Şimdi Değil
              </button>
            )}
            <button
              onClick={save}
              disabled={!university || saving}
              className="btn-primary"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

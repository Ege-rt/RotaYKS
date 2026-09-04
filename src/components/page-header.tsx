import { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="label-eyebrow">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-white sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-xl text-sm text-mist-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

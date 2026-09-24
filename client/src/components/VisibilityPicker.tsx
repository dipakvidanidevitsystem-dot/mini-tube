import { useId } from "react";
import { Globe, Lock, type Icon } from "@phosphor-icons/react";
import type { Visibility } from "../types";

const OPTIONS: { value: Visibility; label: string; description: string; icon: Icon }[] = [
  { value: "public", label: "Public", description: "Anyone can find and watch this video.", icon: Globe },
  { value: "private", label: "Private", description: "Only you can watch this video.", icon: Lock },
];

/** Native radio group styled as selectable cards (keyboard arrows work out of the box). */
export default function VisibilityPicker({
  value,
  onChange,
  disabled,
}: {
  value: Visibility;
  onChange: (value: Visibility) => void;
  disabled?: boolean;
}) {
  const name = useId();

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-xs disabled:opacity-60">
      <legend className="mb-xs text-caption-strong text-foreground">Visibility</legend>
      <div className="grid gap-xs sm:grid-cols-2">
        {OPTIONS.map(({ value: optionValue, label, description, icon: OptionIcon }) => {
          const checked = value === optionValue;
          return (
            <label
              key={optionValue}
              className={`relative flex cursor-pointer items-start gap-sm rounded-md border p-sm transition-colors duration-fast has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                checked ? "border-accent bg-accent-soft" : "border-border bg-card hover:border-foreground/25"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  checked ? "bg-accent-strong text-on-accent" : "bg-muted text-muted-foreground"
                }`}
              >
                <OptionIcon size={18} weight={checked ? "fill" : "regular"} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-caption-strong text-foreground">{label}</span>
                <span className="block text-fine-print text-muted-foreground">{description}</span>
              </span>
              <span
                aria-hidden
                className={`ml-auto mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  checked ? "border-accent" : "border-muted-foreground/50"
                }`}
              >
                {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export default function SearchBar({
  className,
  autoFocus,
  onSubmitted,
}: {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync when the URL query changes (back/forward, chip clicks).
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  // "/" or Ctrl/⌘+K focuses search from anywhere, without hijacking keys typed into other fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (combo || (e.key === "/" && !isTypingTarget(e.target))) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
    inputRef.current?.blur();
    onSubmitted?.();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`group relative flex h-11 w-full max-w-[560px] items-center rounded-full border border-border bg-muted/60 pl-4 pr-1 transition-colors duration-fast focus-within:border-ring focus-within:bg-card focus-within:shadow-glow-ring hover:border-foreground/20 ${className ?? ""}`}
    >
      <MagnifyingGlass size={18} className="shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && inputRef.current?.blur()}
        placeholder="Search videos"
        autoFocus={autoFocus}
        aria-label="Search videos"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-body text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-foreground/10 hover:text-foreground"
        >
          <X size={16} weight="bold" />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="mr-2 hidden h-6 min-w-6 items-center justify-center rounded-sm border border-border px-1.5 font-sans text-fine-print text-muted-foreground md:flex"
        >
          /
        </kbd>
      )}
      <button
        type="submit"
        aria-label="Submit search"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-strong text-on-accent transition-colors duration-fast hover:bg-accent-hover"
      >
        <MagnifyingGlass size={16} weight="bold" />
      </button>
    </form>
  );
}

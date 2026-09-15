import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import { MagnifyingGlass } from "@phosphor-icons/react";

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
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
    onSubmitted?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex h-11 w-full max-w-lg items-center rounded-full border border-border bg-background px-5 dark:border-border-dark dark:bg-card-dark ${className ?? ""}`}
    >
      <InputBase
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos"
        className="flex-1"
        autoFocus={autoFocus}
        inputProps={{ "aria-label": "search videos" }}
      />
      <IconButton type="submit" size="small" aria-label="search">
        <MagnifyingGlass size={24} />
      </IconButton>
    </form>
  );
}

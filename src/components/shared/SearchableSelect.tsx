"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, X } from "lucide-react";

export type OptionGroup = { label: string; options: string[] };

type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  groups: OptionGroup[];
  placeholder?: string;
  /** Shown when nothing matches the search. */
  emptyText?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

/**
 * A dropdown you can type into to search (matches anywhere in the name), that
 * only accepts one of its options. Use with react-hook-form's Controller.
 */
export function SearchableSelect({
  value,
  onChange,
  onBlur,
  groups,
  placeholder = "Search or choose...",
  emptyText = "No matches",
  className = "",
  invalid = false,
  disabled = false,
  "aria-label": ariaLabel,
}: SearchableSelectProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    return groups
      .map((group) => ({ ...group, options: q ? group.options.filter((option) => option.toLowerCase().includes(q)) : group.options }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);
  const flat = useMemo(() => filtered.flatMap((group) => group.options), [filtered]);

  const open = () => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(Math.max(0, flat.indexOf(value)));
  };
  const close = () => {
    setIsOpen(false);
    setQuery(null);
  };
  const choose = (option: string) => {
    onChange(option);
    close();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) return open();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (flat.length === 0 ? 0 : (index + step + flat.length) % flat.length));
    } else if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      if (flat[activeIndex]) choose(flat[activeIndex]);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close();
    }
  };

  let optionIndex = -1;
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (isOpen) document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex, listId]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && flat[activeIndex] ? optionId(activeIndex) : undefined}
        aria-invalid={invalid}
        autoComplete="off"
        disabled={disabled}
        value={query ?? value}
        placeholder={placeholder}
        onFocus={open}
        onClick={open}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // Typed text that isn't an option is discarded: only list values are kept.
          close();
          onBlur?.();
        }}
        className={`${className} pr-14`}
      />
      {/* Centred on the input, below any top margin the input's class adds. */}
      <div
        className={`pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1 text-gray-400 ${
          /(^|\s)mt-1\.5(\s|$)/.test(className) ? "mt-1.5" : ""
        }`}
      >
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="pointer-events-auto rounded p-0.5 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={15} />
      </div>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {flat.length === 0 && <li className="px-3 py-2 text-gray-400">{emptyText}</li>}
          {filtered.map((group) => (
            <li key={group.label} role="presentation">
              <p className="sticky top-0 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {group.label}
              </p>
              <ul role="group" aria-label={group.label}>
                {group.options.map((option) => {
                  optionIndex += 1;
                  const index = optionIndex;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={option}
                      id={optionId(index)}
                      role="option"
                      aria-selected={option === value}
                      // mousedown, not click, so the input's blur doesn't close the list first.
                      onMouseDown={(event) => {
                        event.preventDefault();
                        choose(option);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`cursor-pointer px-3 py-1.5 ${isActive ? "bg-brand/10 text-gray-900" : "text-gray-700"} ${
                        option === value ? "font-semibold" : ""
                      }`}
                    >
                      {option}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

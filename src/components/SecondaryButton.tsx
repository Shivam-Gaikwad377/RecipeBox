import React from "react";

type FontSize = "small" | "medium" | "large";

type SecondaryButtonProps = {
  onClick?: () => void;
  label: string;
  icon?: string;
  fontSize?: FontSize;
};

// Full literal strings only — Tailwind needs "md:text-label-lg" etc.
// to appear as one contiguous token somewhere in the source.
const SIZE_CLASSES: Record<FontSize, string> = {
  small: "text-label-sm py-1 md:text-label-sm rounded-lg md:py-1",
  medium: "text-label-sm py-1 md:text-label-md md:py-3",
  large: "text-label-sm py-1 md:text-label-lg md:py-3",
};

const SecondaryButton = ({
  onClick,
  label,
  icon,
  fontSize = "medium",
}: SecondaryButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 py-0 border-primary text-primary text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest md:px-4 ${SIZE_CLASSES[fontSize]}`}
    >
      {icon && (
        <span className="hidden! md:inline-flex!  material-symbols-outlined text-[18px]">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};

export default SecondaryButton;
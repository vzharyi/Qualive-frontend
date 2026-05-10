export const COLUMN_COLORS = [
  { value: "#94a3b8", label: "Slate" },
  { value: "#34d399", label: "Emerald" },
  { value: "#fbbf24", label: "Amber" },
  { value: "#60a5fa", label: "Blue" },
  { value: "#f87171", label: "Red" },
  { value: "#c084fc", label: "Purple" },
  { value: "#f472b6", label: "Pink" },
  { value: "#22d3ee", label: "Cyan" },
  { value: "#fb923c", label: "Orange" },
  { value: "#a78bfa", label: "Violet" },
] as const;

export const PRESET_COLOR_VALUES = COLUMN_COLORS.map(c => c.value);

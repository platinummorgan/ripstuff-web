import React from "react";
import TombstoneIcon from "../components/cemetery/icons/TombstoneIcon";

export type TombstoneStyle = {
  id: string; // e.g., 'default', 'slate-etched'
  label: string;
  render: (opts: { size: number; mode: "day" | "night" }) => React.ReactElement;
  tier: "free" | "premium"; // future use; no gating now
};

export const TOMBSTONE_STYLES: TombstoneStyle[] = [
  {
    id: "default",
    label: "Default Tombstone",
    tier: "free",
    render: ({ size, mode }) => <TombstoneIcon size={size} mode={mode} />,
  },
  // Placeholder premium styles for future use; using same icon for now
  {
    id: "slate-etched",
    label: "Slate Etched (Premium)",
    tier: "premium",
    render: ({ size, mode }) => <TombstoneIcon size={size} mode={mode} />,
  },
  {
    id: "obsidian-gothic",
    label: "Obsidian Gothic (Premium)",
    tier: "premium",
    render: ({ size, mode }) => <TombstoneIcon size={size} mode={mode} />,
  },
];

export function getDefaultTombstoneStyle(): TombstoneStyle {
  return TOMBSTONE_STYLES[0];
}

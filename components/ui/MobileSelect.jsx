/**
 * MobileSelect — responsive select component.
 * On screens < 768px: renders a bottom sheet (vaul Drawer) for native-feel selection.
 * On screens ≥ 768px: renders the standard shadcn Select dropdown.
 *
 * Drop-in API:
 *   <MobileSelect
 *     value={val}
 *     onValueChange={(v) => ...}
 *     placeholder="Choose..."
 *     options={[{ value: "x", label: "X" }, ...]}
 *     label="Field label"          // optional — shown as sheet title
 *     triggerClassName="..."       // optional extra classes on trigger
 *   />
 */
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileSelect({
  value,
  onValueChange,
  placeholder = "Select…",
  options = [],
  label,
  triggerClassName,
  disabled = false,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  if (isMobile) {
    return (
      <>
        {/* Trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white min-h-[44px] transition-colors",
            "hover:bg-white/[0.06] active:bg-white/[0.08]",
            !value && "text-gray-500",
            disabled && "opacity-50 pointer-events-none",
            triggerClassName
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
        </button>

        {/* Bottom sheet */}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="bg-[#0D1424] border-t border-white/[0.08] max-h-[75vh]">
            {label && (
              <DrawerHeader className="pb-2 border-b border-white/[0.06]">
                <DrawerTitle className="text-white text-base">{label}</DrawerTitle>
              </DrawerHeader>
            )}
            <div className="overflow-y-auto py-2" role="listbox" aria-label={label || placeholder}>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onValueChange(opt.value); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors min-h-[52px]",
                      "hover:bg-white/[0.05] active:bg-white/[0.08]",
                      isSelected ? "text-emerald-400 font-medium" : "text-gray-300"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: standard shadcn Select
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("bg-white/[0.03] border-white/[0.08] text-white", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
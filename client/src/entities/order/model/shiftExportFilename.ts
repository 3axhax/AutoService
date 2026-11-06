import type { ShiftItem, ShiftsFilters } from "@entities/shifts/model/types";
import { parseDateFromFormat } from "@shared/utils/parseDateFromFormat";

const datePart = (date: Date) =>
  `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, "0")}_${String(date.getDate()).padStart(2, "0")}`;

export const shiftExportFilename = (
  name: string,
  filters: ShiftsFilters,
  shift?: ShiftItem,
): string => {
  const safeName = name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim().replace(/[. ]+$/g, "") || "user";
  const shiftDate = shift ? new Date(shift.closedAt ?? shift.createdAt) : null;
  const start = shiftDate ?? (filters.closedAtStart ? parseDateFromFormat(filters.closedAtStart) : null);
  const end = shiftDate ?? (filters.closedAtEnd ? parseDateFromFormat(filters.closedAtEnd) : null);
  const startText = start && !Number.isNaN(start.getTime()) ? datePart(start) : null;
  const endText = end && !Number.isNaN(end.getTime()) ? datePart(end) : null;
  const interval = startText && endText ? (startText === endText ? startText : `${startText}-${endText}`) : "все";
  return `Shifts_${safeName}_${interval}.xlsx`;
};

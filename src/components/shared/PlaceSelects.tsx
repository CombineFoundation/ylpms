"use client";

import { HEC_UNIVERSITIES } from "@/config/hec-universities";
import { PAKISTAN_CITIES } from "@/config/pakistan-cities";
import { SearchableSelect, type OptionGroup } from "./SearchableSelect";

const UNIVERSITY_GROUPS: OptionGroup[] = HEC_UNIVERSITIES.map((group) => ({ label: group.province, options: group.universities }));
const CITY_GROUPS: OptionGroup[] = PAKISTAN_CITIES.map((group) => ({ label: group.province, options: group.cities }));

type PlaceSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
};

/** HEC-recognised universities, searchable. Use with react-hook-form's Controller. */
export function UniversitySelect(props: PlaceSelectProps) {
  return (
    <SearchableSelect
      {...props}
      groups={UNIVERSITY_GROUPS}
      placeholder="Search HEC-recognised universities..."
      emptyText="No HEC-recognised university matches"
      aria-label="University"
    />
  );
}

/** Cities of Pakistan, searchable. Use with react-hook-form's Controller. */
export function CitySelect(props: PlaceSelectProps) {
  return (
    <SearchableSelect
      {...props}
      groups={CITY_GROUPS}
      placeholder="Search cities..."
      emptyText="No city matches. Try the nearest district city."
      aria-label="City"
    />
  );
}

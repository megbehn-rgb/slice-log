import type { ChangeEvent, CSSProperties } from 'react';
import { COLORS } from '../constants/colors';
import { FONT_BODY_SEMIBOLD } from '../constants/typography';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const inputStyle: CSSProperties = {
  fontFamily: FONT_BODY_SEMIBOLD,
  fontSize: 15,
  border: '1px solid #ccc',
  borderRadius: 8,
  padding: '10px 12px',
  color: COLORS.crust,
  backgroundColor: '#fff',
};

// @react-native-community/datetimepicker has no web implementation, so the
// web build gets a plain HTML date input here instead -- its value format
// (YYYY-MM-DD) already matches src/utils/date.ts's toDateString/
// parseDateString, so no conversion is needed. Metro picks this file
// automatically for web builds and the sibling DateField.tsx for native.
export function DateField({ value, onChange }: DateFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.value) {
      onChange(event.target.value);
    }
  }

  return <input type="date" value={value} max={today()} onChange={handleChange} style={inputStyle} />;
}

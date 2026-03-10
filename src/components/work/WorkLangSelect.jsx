import { Select } from "antd";

const options = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
];

export default function WorkLangSelect({ value, onChange, style }) {
  return (
    <Select
      value={value}
      style={{ width: 160, ...(style || {}) }}
      options={options}
      onChange={onChange}
    />
  );
}


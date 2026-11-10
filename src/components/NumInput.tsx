import { useEffect, useState } from "react";
import { fmtNumber, parseNumberInput } from "../lib/format";

type Props = {
  value: number;
  onChange: (n: number) => void;
  decimals?: number;
  className?: string;
  placeholder?: string;
};

export function NumInput({
  value,
  onChange,
  decimals = 2,
  className = "",
  placeholder,
}: Props) {
  const [text, setText] = useState(() =>
    value === 0 ? "" : fmtNumber(value, decimals)
  );
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value === 0 ? "" : fmtNumber(value, decimals));
  }, [value, focused, decimals]);

  return (
    <input
      type="text"
      inputMode="decimal"
      className={`num bg-transparent w-full px-2 py-1 border-0 focus:bg-white focus:ring-1 focus:ring-ink-300 rounded ${className}`}
      value={text}
      placeholder={placeholder}
      onFocus={(e) => {
        setFocused(true);
        setText(value === 0 ? "" : String(value).replace(".", ","));
        e.currentTarget.select();
      }}
      onBlur={() => {
        setFocused(false);
        const n = parseNumberInput(text);
        onChange(n);
        setText(n === 0 ? "" : fmtNumber(n, decimals));
      }}
      onChange={(e) => setText(e.target.value)}
    />
  );
}

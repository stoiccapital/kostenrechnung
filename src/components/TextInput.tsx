import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  className?: string;
};

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: Props) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  return (
    <input
      type="text"
      className={`bg-transparent w-full px-2 py-1 border-0 focus:bg-white focus:ring-1 focus:ring-ink-300 rounded ${className}`}
      value={text}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onChange(text);
      }}
      onChange={(e) => setText(e.target.value)}
    />
  );
}

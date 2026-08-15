"use client";


function displayDateTime(value: string) {
  if (!value) return "Select";
  const [date, time] = value.split("T");
  if (!date) return value;
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}${time ? ` · ${time.slice(0,5)}` : ""}`;
}

export function NativeDateTimeField({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className={""}>
    <span>{label}</span>
    <span className={"date-control"}>
      <span className={""} aria-hidden="true">{displayDateTime(value)}</span>
      <input className={""} type="datetime-local" value={value} onChange={event => onChange(event.target.value)} required={required} aria-label={label} />
    </span>
  </label>;
}

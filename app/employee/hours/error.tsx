"use client";

export default function EmployeeHoursError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="employee-page">
      <p className="eyebrow">Time &amp; attendance</p>
      <h1>Couldn’t load your hours</h1>
      <p className="employee-lead">Your clock record is safe. Reload this page to try displaying it again.</p>
      <button type="button" className="employee-retry" onClick={reset}>Try again</button>
    </div>
  );
}

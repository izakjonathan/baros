import { AvailabilityEditor } from "./availability-editor";

export default function Availability() {
  return <div className="employee-page"><p className="eyebrow">Planning</p><h1>Availability</h1><p className="employee-lead">Set availability for every date in a chosen month, or maintain a recurring weekly pattern.</p><AvailabilityEditor /></div>;
}

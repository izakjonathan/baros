export type NavKey = "dashboard" | "schedule" | "attendance" | "inventory" | "orders" | "operations" | "team" | "control";
export type ShiftRole = "Manager" | "Bartender" | "Floor" | "Kitchen";
export type ShiftStatus = "Published" | "Draft";

export type Shift = {
  id: string;
  day: number;
  weekOffset?: number;
  date?: string;
  employee: string;
  employeeId?: string;
  initials: string;
  start: string;
  end: string;
  role: ShiftRole;
  status: ShiftStatus;
  isOpen?: boolean;
  recurrenceLabel?: string;
  recurrenceGroupId?: string;
  locationId?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  stock: number;
  par: number;
  unit: string;
  price: number;
  sellingPrice?: number;
  sku?: string;
  packSize?: number;
  reorderLevel?: number;
  notes?: string;
  active?: boolean;
};

export const days = [
  { short: "Mon", date: "27" }, { short: "Tue", date: "28" }, { short: "Wed", date: "29" },
  { short: "Thu", date: "30" }, { short: "Fri", date: "31" }, { short: "Sat", date: "01" }, { short: "Sun", date: "02" },
];

export const initialShifts: Shift[] = [
  { id: "s1", day: 0, employee: "Alex Morgan", initials: "AM", start: "16:00", end: "00:00", role: "Manager", status: "Published" },
  { id: "s2", day: 0, employee: "Maya Chen", initials: "MC", start: "18:00", end: "02:00", role: "Bartender", status: "Published" },
  { id: "s3", day: 1, employee: "Jonas Berg", initials: "JB", start: "17:00", end: "01:00", role: "Bartender", status: "Published" },
  { id: "s4", day: 1, employee: "Sofia Lund", initials: "SL", start: "18:00", end: "00:00", role: "Floor", status: "Draft" },
  { id: "s5", day: 2, employee: "Maya Chen", initials: "MC", start: "16:00", end: "00:00", role: "Manager", status: "Published" },
  { id: "s6", day: 3, employee: "Alex Morgan", initials: "AM", start: "16:00", end: "01:00", role: "Manager", status: "Published" },
  { id: "s7", day: 3, employee: "Noah Singh", initials: "NS", start: "19:00", end: "02:00", role: "Bartender", status: "Published" },
  { id: "s8", day: 4, employee: "Maya Chen", initials: "MC", start: "15:00", end: "00:00", role: "Manager", status: "Published" },
  { id: "s9", day: 4, employee: "Jonas Berg", initials: "JB", start: "17:00", end: "03:00", role: "Bartender", status: "Published" },
  { id: "s10", day: 4, employee: "Sofia Lund", initials: "SL", start: "19:00", end: "02:00", role: "Floor", status: "Draft" },
  { id: "s11", day: 5, employee: "Alex Morgan", initials: "AM", start: "15:00", end: "01:00", role: "Manager", status: "Published" },
  { id: "s12", day: 5, employee: "Noah Singh", initials: "NS", start: "17:00", end: "03:00", role: "Bartender", status: "Published" },
  { id: "s13", day: 5, employee: "Ella Rose", initials: "ER", start: "20:00", end: "03:00", role: "Floor", status: "Published" },
  { id: "s14", day: 6, employee: "Jonas Berg", initials: "JB", start: "16:00", end: "23:00", role: "Manager", status: "Published" },
];

export const initialProducts: Product[] = [
  { id: "p1", name: "Pilsner 30L", category: "Draught beer", supplier: "Nordic Drinks", stock: 2, par: 6, unit: "kegs", price: 728 },
  { id: "p2", name: "House IPA 30L", category: "Draught beer", supplier: "Nordic Drinks", stock: 3, par: 4, unit: "kegs", price: 894 },
  { id: "p3", name: "House Red", category: "Wine", supplier: "Vin & Co.", stock: 8, par: 18, unit: "bottles", price: 74 },
  { id: "p4", name: "House White", category: "Wine", supplier: "Vin & Co.", stock: 14, par: 18, unit: "bottles", price: 71 },
  { id: "p5", name: "London Dry Gin", category: "Spirits", supplier: "Bar Supply DK", stock: 5, par: 8, unit: "bottles", price: 164 },
  { id: "p6", name: "Vodka", category: "Spirits", supplier: "Bar Supply DK", stock: 9, par: 8, unit: "bottles", price: 142 },
  { id: "p7", name: "Tonic Water", category: "Soft drinks", supplier: "Nordic Drinks", stock: 28, par: 48, unit: "bottles", price: 12 },
  { id: "p8", name: "Limes", category: "Fresh", supplier: "City Produce", stock: 22, par: 50, unit: "pieces", price: 3.5 },
];

export const team = [
  { name: "Alex Morgan", initials: "AM", role: "General manager", hours: 36, status: "Working today" },
  { name: "Maya Chen", initials: "MC", role: "Bar manager", hours: 32, status: "Working today" },
  { name: "Jonas Berg", initials: "JB", role: "Bartender", hours: 27, status: "Next: Tuesday" },
  { name: "Sofia Lund", initials: "SL", role: "Floor", hours: 13, status: "2 shifts pending" },
  { name: "Noah Singh", initials: "NS", role: "Bartender", hours: 24, status: "Next: Thursday" },
  { name: "Ella Rose", initials: "ER", role: "Floor", hours: 7, status: "Next: Saturday" },
];

export const orders = [
  { id: "PO-1048", supplier: "Nordic Drinks", items: 4, amount: 5264, delivery: "Tomorrow", status: "Submitted" },
  { id: "PO-1047", supplier: "Vin & Co.", items: 6, amount: 2988, delivery: "Friday", status: "Draft" },
  { id: "PO-1046", supplier: "Bar Supply DK", items: 8, amount: 6142, delivery: "28 Jul", status: "Delivered" },
  { id: "PO-1045", supplier: "City Produce", items: 5, amount: 817, delivery: "27 Jul", status: "Delivered" },
];

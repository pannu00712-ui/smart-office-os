import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceRule {
  lateInGrace: number;
  earlyOutGrace: number;
  breakDeduction: number;
  overtimeMin: number;
  overtimeRate: number;
  halfDayHours: number;
  absentAfterMins: number;
}

interface LeaveBalance {
  annual: number;
  sick: number;
  casual: number;
  maternity: number;
  hajj: number;
}

interface AccessControl {
  doors: string[];
  timeZone: string;
  privilegeLevel: number;
  canOverride: boolean;
}

interface WorkCode {
  payClass: string;
  workCode: string;
  overtimeClass: string;
  costCenter: string;
  employmentType: string;
}

interface SalaryStructure {
  basicSalary: number;
  houseRent: number;       // % of basic or fixed
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  // Deductions
  eobi: number;            // fixed PKR 370
  sessi: number;           // % of basic
  incomeTax: number;       // monthly
  loanDeduction: number;
  otherDeductions: number;
  // Settings
  houseRentType: "percent" | "fixed";
  sessiPercent: number;
  bankName: string;
  bankAccount: string;
  taxExempt: boolean;
}

interface PayslipRecord {
  month: string;          // "2025-06"
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: "paid" | "pending" | "processing";
  paidOn: string | null;
}

interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  shift: string;
  faceEnrolled: boolean;
  attendanceStatus: "present" | "absent" | "late" | "leave" | "-";
  lastCheckIn: string | null;
  status: "active" | "inactive";
  photo: string | null;
  attendanceRule: AttendanceRule;
  leaveBalance: LeaveBalance;
  accessControl: AccessControl;
  workCode: WorkCode;
  salaryStructure: SalaryStructure;
  payslipHistory: PayslipRecord[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Sales", "Admin"];
const SHIFTS = ["Morning (9–6)", "Evening (2–11)", "Night (10–7)", "Flexi", "Custom"];
const DESIGNATIONS = ["Junior Developer", "Senior Developer", "Backend Engineer", "Frontend Engineer", "HR Manager", "Finance Analyst", "Marketing Lead", "Ops Executive", "Team Lead", "Manager", "Director"];
const PAY_CLASSES = ["Monthly Salaried", "Hourly Wage", "Contract", "Daily Wage", "Commission Based"];
const WORK_CODES = ["WC-001 Standard", "WC-002 Field", "WC-003 Remote", "WC-004 Part-Time", "WC-005 Trainee"];
const OT_CLASSES = ["OT-1.5x", "OT-2x", "OT-Comp Off", "No Overtime"];
const COST_CENTERS = ["CC-ENG", "CC-HR", "CC-FIN", "CC-MKT", "CC-OPS", "CC-ADM"];
const EMP_TYPES = ["Permanent", "Contractual", "Probationary", "Intern", "Part-Time"];
const TIME_ZONES = ["TZ-01 Office Hours (9–18)", "TZ-02 All Day (00–24)", "TZ-03 Morning Only (6–14)", "TZ-04 Evening Only (14–22)", "TZ-05 Night Only (22–6)"];
const DOORS = ["Main Entrance", "Server Room", "Finance Office", "Executive Floor", "Warehouse", "Parking Gate", "Cafeteria", "HR Office"];

const DEFAULT_RULE: AttendanceRule = { lateInGrace: 15, earlyOutGrace: 10, breakDeduction: 60, overtimeMin: 30, overtimeRate: 1.5, halfDayHours: 4, absentAfterMins: 180 };
const DEFAULT_LEAVE: LeaveBalance = { annual: 14, sick: 10, casual: 8, maternity: 90, hajj: 30 };
const DEFAULT_ACCESS: AccessControl = { doors: ["Main Entrance"], timeZone: "TZ-01 Office Hours (9–18)", privilegeLevel: 1, canOverride: false };
const DEFAULT_WORK: WorkCode = { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "OT-1.5x", costCenter: "CC-ENG", employmentType: "Permanent" };
const DEFAULT_SALARY = (basicSalary = 0): SalaryStructure => ({
  basicSalary,
  houseRent: 45,
  medicalAllowance: 3000,
  transportAllowance: 2000,
  otherAllowances: 0,
  eobi: 370,
  sessi: 0,
  incomeTax: 0,
  loanDeduction: 0,
  otherDeductions: 0,
  houseRentType: "percent",
  sessiPercent: 0,
  bankName: "",
  bankAccount: "",
  taxExempt: false,
});

const MOCK_PAYSLIPS: PayslipRecord[] = [
  { month: "2025-05", workingDays: 26, presentDays: 25, absentDays: 1, lateDays: 2, overtimeHours: 3, grossSalary: 0, totalDeductions: 0, netSalary: 0, status: "paid", paidOn: "2025-05-31" },
  { month: "2025-04", workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 0, overtimeHours: 5, grossSalary: 0, totalDeductions: 0, netSalary: 0, status: "paid", paidOn: "2025-04-30" },
  { month: "2025-03", workingDays: 25, presentDays: 24, absentDays: 1, lateDays: 1, overtimeHours: 0, grossSalary: 0, totalDeductions: 0, netSalary: 0, status: "paid", paidOn: "2025-03-31" },
];

const BANKS = ["Meezan Bank", "HBL", "UBL", "MCB", "Allied Bank", "Bank Alfalah", "NBP", "Standard Chartered", "Faysal Bank", "Askari Bank"];

// ─── Payroll Calculations ─────────────────────────────────────────────────────
const calcPayroll = (emp: Employee) => {
  const s = emp.salaryStructure;
  const houseRent = s.houseRentType === "percent" ? Math.round(s.basicSalary * s.houseRent / 100) : s.houseRent;
  const gross = s.basicSalary + houseRent + s.medicalAllowance + s.transportAllowance + s.otherAllowances;
  const sessiAmt = Math.round(s.basicSalary * s.sessiPercent / 100);
  const totalDed = s.eobi + sessiAmt + s.incomeTax + s.loanDeduction + s.otherDeductions;
  const net = gross - totalDed;
  return { houseRent, gross, sessiAmt, totalDed, net };
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, code: "EMP-001", firstName: "Zara", lastName: "Ahmed", email: "zara@soos.io", phone: "0321-1234567", cnic: "42101-1234567-1", address: "Clifton, Karachi", department: "Engineering", designation: "Senior Developer", salary: 120000, joiningDate: "2022-03-15", shift: "Morning (9–6)", faceEnrolled: true, attendanceStatus: "present", lastCheckIn: "09:02 AM", status: "active", photo: null, attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE }, accessControl: { doors: ["Main Entrance", "Server Room"], timeZone: "TZ-01 Office Hours (9–18)", privilegeLevel: 3, canOverride: false }, workCode: { ...DEFAULT_WORK }, salaryStructure: { ...DEFAULT_SALARY(120000), houseRent: 45, medicalAllowance: 5000, transportAllowance: 3000, eobi: 370, incomeTax: 8500, bankName: "Meezan Bank", bankAccount: "01230123456789" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const sal = DEFAULT_SALARY(120000); const gross = 120000 + Math.round(120000*0.45) + 5000 + 3000; const ded = 370 + 8500; return { ...p, grossSalary: gross + Math.round(p.overtimeHours * 750), totalDeductions: ded, netSalary: gross + Math.round(p.overtimeHours * 750) - ded }; }) },
  { id: 2, code: "EMP-002", firstName: "Hassan", lastName: "Malik", email: "hassan@soos.io", phone: "0300-9876543", cnic: "42201-9876543-2", address: "DHA Phase 5, Karachi", department: "HR", designation: "HR Manager", salary: 95000, joiningDate: "2021-07-01", shift: "Morning (9–6)", faceEnrolled: true, attendanceStatus: "late", lastCheckIn: "09:47 AM", status: "active", photo: null, attendanceRule: { ...DEFAULT_RULE, lateInGrace: 20 }, leaveBalance: { ...DEFAULT_LEAVE, annual: 18 }, accessControl: { doors: ["Main Entrance", "HR Office", "Executive Floor"], timeZone: "TZ-01 Office Hours (9–18)", privilegeLevel: 4, canOverride: true }, workCode: { ...DEFAULT_WORK, payClass: "Monthly Salaried", costCenter: "CC-HR" }, salaryStructure: { ...DEFAULT_SALARY(95000), medicalAllowance: 4000, transportAllowance: 2500, eobi: 370, incomeTax: 5200, bankName: "HBL", bankAccount: "06060606060606" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const gross = 95000 + Math.round(95000*0.45) + 4000 + 2500; const ded = 370 + 5200; return { ...p, grossSalary: gross, totalDeductions: ded, netSalary: gross - ded }; }) },
  { id: 3, code: "EMP-003", firstName: "Ayesha", lastName: "Khan", email: "ayesha@soos.io", phone: "0333-4567890", cnic: "42301-4567890-3", address: "Gulshan-e-Iqbal, Karachi", department: "Finance", designation: "Finance Analyst", salary: 85000, joiningDate: "2023-01-10", shift: "Evening (2–11)", faceEnrolled: false, attendanceStatus: "absent", lastCheckIn: null, status: "active", photo: null, attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE }, accessControl: { ...DEFAULT_ACCESS, doors: ["Main Entrance", "Finance Office"] }, workCode: { ...DEFAULT_WORK, costCenter: "CC-FIN" }, salaryStructure: { ...DEFAULT_SALARY(85000), medicalAllowance: 3500, transportAllowance: 2000, eobi: 370, incomeTax: 3800, bankName: "UBL", bankAccount: "09870987098709" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const gross = 85000 + Math.round(85000*0.45) + 3500 + 2000; const ded = 370 + 3800; return { ...p, grossSalary: gross, totalDeductions: ded, netSalary: gross - ded }; }) },
  { id: 4, code: "EMP-004", firstName: "Omar", lastName: "Farooq", email: "omar@soos.io", phone: "0311-2233445", cnic: "42101-2233445-4", address: "North Nazimabad, Karachi", department: "Engineering", designation: "Backend Engineer", salary: 105000, joiningDate: "2022-09-20", shift: "Morning (9–6)", faceEnrolled: true, attendanceStatus: "present", lastCheckIn: "08:58 AM", status: "active", photo: null, attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE }, accessControl: { ...DEFAULT_ACCESS, doors: ["Main Entrance", "Server Room"] }, workCode: { ...DEFAULT_WORK }, salaryStructure: { ...DEFAULT_SALARY(105000), medicalAllowance: 4500, transportAllowance: 2500, eobi: 370, incomeTax: 7000, bankName: "MCB", bankAccount: "11110011111100" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const gross = 105000 + Math.round(105000*0.45) + 4500 + 2500 + Math.round(p.overtimeHours * 875); const ded = 370 + 7000; return { ...p, grossSalary: gross, totalDeductions: ded, netSalary: gross - ded }; }) },
  { id: 5, code: "EMP-005", firstName: "Sana", lastName: "Baig", email: "sana@soos.io", phone: "0345-6677889", cnic: "42501-6677889-5", address: "Bahria Town, Karachi", department: "Marketing", designation: "Marketing Lead", salary: 90000, joiningDate: "2020-11-15", shift: "Morning (9–6)", faceEnrolled: true, attendanceStatus: "present", lastCheckIn: "09:10 AM", status: "active", photo: null, attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE, annual: 21 }, accessControl: { ...DEFAULT_ACCESS }, workCode: { ...DEFAULT_WORK, costCenter: "CC-MKT" }, salaryStructure: { ...DEFAULT_SALARY(90000), medicalAllowance: 4000, transportAllowance: 2000, eobi: 370, incomeTax: 4500, bankName: "Allied Bank", bankAccount: "55005500550055" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const gross = 90000 + Math.round(90000*0.45) + 4000 + 2000; const ded = 370 + 4500; return { ...p, grossSalary: gross, totalDeductions: ded, netSalary: gross - ded }; }) },
  { id: 6, code: "EMP-006", firstName: "Bilal", lastName: "Siddiqui", email: "bilal@soos.io", phone: "0322-5544332", cnic: "42201-5544332-6", address: "Korangi, Karachi", department: "Operations", designation: "Ops Executive", salary: 65000, joiningDate: "2023-06-01", shift: "Evening (2–11)", faceEnrolled: false, attendanceStatus: "-", lastCheckIn: null, status: "inactive", photo: null, attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE }, accessControl: { ...DEFAULT_ACCESS }, workCode: { ...DEFAULT_WORK, employmentType: "Contractual", costCenter: "CC-OPS" }, salaryStructure: { ...DEFAULT_SALARY(65000), eobi: 370, bankName: "Bank Alfalah", bankAccount: "66006600660066" }, payslipHistory: MOCK_PAYSLIPS.map(p => { const gross = 65000 + Math.round(65000*0.45) + 3000 + 2000; const ded = 370; return { ...p, grossSalary: gross, totalDeductions: ded, netSalary: gross - ded }; }) },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = { background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" };

const Avatar = ({ emp, size = 36 }: { emp: Employee; size?: number }) => {
  const colors = ["#2dd4bf", "#f59e0b", "#818cf8", "#fb7185", "#34d399", "#60a5fa"];
  const bg = colors[emp.id % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
      {emp.photo ? <img src={emp.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : emp.firstName[0] + emp.lastName[0]}
    </div>
  );
};

const Badge = ({ type }: { type: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    present:  { bg: "rgba(52,211,153,0.15)", color: "#34d399", label: "Present" },
    absent:   { bg: "rgba(248,113,113,0.15)", color: "#f87171", label: "Absent" },
    late:     { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Late" },
    leave:    { bg: "rgba(129,140,248,0.15)", color: "#818cf8", label: "On Leave" },
    "-":      { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: "N/A" },
    active:   { bg: "rgba(52,211,153,0.15)", color: "#34d399", label: "Active" },
    inactive: { bg: "rgba(248,113,113,0.15)", color: "#f87171", label: "Inactive" },
    enrolled: { bg: "rgba(45,212,191,0.15)", color: "#2dd4bf", label: "Enrolled" },
    pending:  { bg: "rgba(251,191,36,0.15)", color: "#fbbf24", label: "Pending" },
  };
  const s = map[type] || map["-"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

const StatCard = ({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: string }) => (
  <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 0% 100%, ${accent}18 0%, transparent 60%)`, pointerEvents: "none" }} />
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, border: `1px solid ${accent}30` }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const Field = ({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: half ? "span 1" : undefined }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</label>
    {children}
  </div>
);

const Sel = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
    <option value="">Select…</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const NumInput = ({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) => (
  <div style={{ position: "relative" }}>
    <input type="number" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ ...inputStyle, paddingRight: suffix ? 52 : 14 }} />
    {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#64748b", fontWeight: 600 }}>{suffix}</span>}
  </div>
);

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 20, width: "100%", maxWidth: wide ? 860 : 680, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #1e2d45", flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>{children}</div>
    </div>
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "basic",      icon: "👤", label: "Basic Info" },
  { id: "shift",      icon: "🕐", label: "Shift & Schedule" },
  { id: "attendance", icon: "📋", label: "Attendance Rules" },
  { id: "leave",      icon: "🌴", label: "Leave Balance" },
  { id: "access",     icon: "🔐", label: "Access Control" },
  { id: "payroll",    icon: "💰", label: "Pay & Work Code" },
  { id: "salary",     icon: "🏦", label: "Salary Structure" },
];

const TabBar = ({ active, onChange }: { active: string; onChange: (t: string) => void }) => (
  <div style={{ display: "flex", gap: 2, padding: "12px 28px", borderBottom: "1px solid #1e2d45", overflowX: "auto", flexShrink: 0 }}>
    {TABS.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: active === t.id ? "rgba(45,212,191,0.12)" : "none", color: active === t.id ? "#2dd4bf" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: active === t.id ? 700 : 500, whiteSpace: "nowrap", transition: "all 0.15s", borderBottom: active === t.id ? "2px solid #2dd4bf" : "2px solid transparent" }}>
        <span>{t.icon}</span> {t.label}
      </button>
    ))}
  </div>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHead = ({ icon, title, sub }: { icon: string; title: string; sub: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid #1e2d45" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{sub}</div>
    </div>
  </div>
);

const g2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const g3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 };

// ─── Employee Form (Tabbed) ───────────────────────────────────────────────────
interface FormData {
  code: string; firstName: string; lastName: string; email: string; phone: string;
  cnic: string; address: string; department: string; designation: string;
  salary: string; joiningDate: string; shift: string; status: string; password: string;
  attendanceRule: AttendanceRule; leaveBalance: LeaveBalance;
  accessControl: AccessControl; workCode: WorkCode;
  salaryStructure: SalaryStructure;
}

const defaultFormData = (): FormData => ({
  code: "", firstName: "", lastName: "", email: "", phone: "",
  cnic: "", address: "", department: "", designation: "",
  salary: "", joiningDate: "", shift: "", status: "active", password: "",
  attendanceRule: { ...DEFAULT_RULE }, leaveBalance: { ...DEFAULT_LEAVE },
  accessControl: { ...DEFAULT_ACCESS }, workCode: { ...DEFAULT_WORK },
  salaryStructure: { ...DEFAULT_SALARY(0) },
});

const EmployeeForm = ({ initial, onSave, onClose }: { initial?: Partial<FormData>; onSave: (d: FormData) => void; onClose: () => void }) => {
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState<FormData>({ ...defaultFormData(), ...initial });
  const photoRef = useRef<HTMLInputElement>(null);

  const setF = (k: keyof FormData) => (v: any) => setForm(f => ({ ...f, [k]: v }));
  const setRule = (k: keyof AttendanceRule) => (v: number) => setForm(f => ({ ...f, attendanceRule: { ...f.attendanceRule, [k]: v } }));
  const setLeave = (k: keyof LeaveBalance) => (v: number) => setForm(f => ({ ...f, leaveBalance: { ...f.leaveBalance, [k]: v } }));
  const setAccess = (k: keyof AccessControl) => (v: any) => setForm(f => ({ ...f, accessControl: { ...f.accessControl, [k]: v } }));
  const setWork = (k: keyof WorkCode) => (v: string) => setForm(f => ({ ...f, workCode: { ...f.workCode, [k]: v } }));
  const setSal = (k: keyof SalaryStructure) => (v: any) => setForm(f => ({ ...f, salaryStructure: { ...f.salaryStructure, [k]: v } }));

  const toggleDoor = (door: string) => {
    const doors = form.accessControl.doors.includes(door)
      ? form.accessControl.doors.filter(d => d !== door)
      : [...form.accessControl.doors, door];
    setAccess("doors")(doors);
  };

  const tabContent = () => {
    switch (tab) {
      case "basic": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHead icon="👤" title="Personal Information" sub="Basic employee identification details" />
          <div style={g2}>
            <Field label="Employee ID / Code"><input style={inputStyle} value={form.code} onChange={e => setF("code")(e.target.value)} placeholder="EMP-007" /></Field>
            <Field label="Status"><Sel value={form.status} onChange={setF("status")} options={["active", "inactive"]} /></Field>
          </div>
          <div style={g2}>
            <Field label="First Name"><input style={inputStyle} value={form.firstName} onChange={e => setF("firstName")(e.target.value)} placeholder="Ali" /></Field>
            <Field label="Last Name"><input style={inputStyle} value={form.lastName} onChange={e => setF("lastName")(e.target.value)} placeholder="Raza" /></Field>
          </div>
          <div style={g2}>
            <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={e => setF("email")(e.target.value)} placeholder="ali@company.com" /></Field>
            <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={e => setF("phone")(e.target.value)} placeholder="0300-0000000" /></Field>
          </div>
          <div style={g2}>
            <Field label="CNIC"><input style={inputStyle} value={form.cnic} onChange={e => setF("cnic")(e.target.value)} placeholder="42101-0000000-0" /></Field>
            <Field label="Salary (PKR)"><input style={inputStyle} type="number" value={form.salary} onChange={e => setF("salary")(e.target.value)} placeholder="75000" /></Field>
          </div>
          <Field label="Address"><input style={inputStyle} value={form.address} onChange={e => setF("address")(e.target.value)} placeholder="Block 5, Clifton, Karachi" /></Field>
          <div style={g2}>
            <Field label="Department"><Sel value={form.department} onChange={setF("department")} options={DEPARTMENTS} /></Field>
            <Field label="Designation"><Sel value={form.designation} onChange={setF("designation")} options={DESIGNATIONS} /></Field>
          </div>
          <Field label="Portal Password"><input style={inputStyle} type="password" value={form.password} onChange={e => setF("password")(e.target.value)} placeholder="Min 8 characters" /></Field>
          <Field label="Profile Photo">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button onClick={() => photoRef.current?.click()} style={{ padding: "10px 18px", background: "rgba(45,212,191,0.1)", border: "1px dashed #2dd4bf", borderRadius: 10, color: "#2dd4bf", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>📷 Upload Photo</button>
              <span style={{ fontSize: 12, color: "#64748b" }}>JPG / PNG, max 2MB</span>
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} />
          </Field>
        </div>
      );

      case "shift": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHead icon="🕐" title="Shift & Schedule" sub="Assign shift timing and work schedule" />
          <Field label="Shift Assignment"><Sel value={form.shift} onChange={setF("shift")} options={SHIFTS} /></Field>
          <Field label="Joining Date"><input style={inputStyle} type="date" value={form.joiningDate} onChange={e => setF("joiningDate")(e.target.value)} /></Field>
          <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Shift Preview</div>
            {form.shift ? (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[["Shift", form.shift], ["Work Days", "Mon – Sat"], ["Weekly Off", "Sunday"], ["Total Hours", "9 hrs/day"]].map(([k, v]) => (
                  <div key={k} style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 14px", minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: "#475569", fontSize: 13 }}>Select a shift above to preview</div>}
          </div>
        </div>
      );

      case "attendance": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionHead icon="📋" title="Attendance Rules" sub="ZKTeco-style attendance policy for this employee" />
          <div style={{ background: "rgba(45,212,191,0.05)", border: "1px solid rgba(45,212,191,0.15)", borderRadius: 12, padding: 14, fontSize: 13, color: "#94a3b8" }}>
            ℹ️ These rules override global defaults for this employee only.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2dd4bf", textTransform: "uppercase", letterSpacing: "0.07em" }}>⏰ Late In / Early Out</div>
            <div style={g2}>
              <Field label="Late In Grace Period"><NumInput value={form.attendanceRule.lateInGrace} onChange={setRule("lateInGrace")} min={0} max={120} suffix="mins" /></Field>
              <Field label="Early Out Grace Period"><NumInput value={form.attendanceRule.earlyOutGrace} onChange={setRule("earlyOutGrace")} min={0} max={120} suffix="mins" /></Field>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[5, 10, 15, 30].map(v => (
                <button key={v} onClick={() => setRule("lateInGrace")(v)}
                  style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: form.attendanceRule.lateInGrace === v ? "rgba(45,212,191,0.15)" : "#131c2e", color: form.attendanceRule.lateInGrace === v ? "#2dd4bf" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  {v} min
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.07em" }}>☕ Break Time</div>
            <Field label="Daily Break Deduction"><NumInput value={form.attendanceRule.breakDeduction} onChange={setRule("breakDeduction")} min={0} max={240} suffix="mins" /></Field>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.07em" }}>📈 Overtime</div>
            <div style={g2}>
              <Field label="OT Eligible After"><NumInput value={form.attendanceRule.overtimeMin} onChange={setRule("overtimeMin")} min={0} max={120} suffix="mins" /></Field>
              <Field label="OT Rate Multiplier"><NumInput value={form.attendanceRule.overtimeRate} onChange={setRule("overtimeRate")} min={1} max={4} suffix="×" /></Field>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.07em" }}>🚨 Absence Thresholds</div>
            <div style={g2}>
              <Field label="Half Day if Less Than"><NumInput value={form.attendanceRule.halfDayHours} onChange={setRule("halfDayHours")} min={1} max={8} suffix="hrs" /></Field>
              <Field label="Mark Absent if No Check-in After"><NumInput value={form.attendanceRule.absentAfterMins} onChange={setRule("absentAfterMins")} min={60} max={480} suffix="mins" /></Field>
            </div>
          </div>
        </div>
      );

      case "leave": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionHead icon="🌴" title="Leave Balance" sub="Annual leave entitlements for this employee" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {([
              ["annual",   "Annual Leave",   "🗓️", "#2dd4bf"],
              ["sick",     "Sick Leave",     "🤒", "#f87171"],
              ["casual",   "Casual Leave",   "🎒", "#fbbf24"],
              ["maternity","Maternity Leave","🤱", "#818cf8"],
              ["hajj",     "Hajj Leave",     "🕌", "#34d399"],
            ] as [keyof LeaveBalance, string, string, string][]).map(([k, label, icon, color]) => (
              <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Days per year</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setLeave(k)(Math.max(0, form.leaveBalance[k] - 1))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid #1e2d45", color: "#94a3b8", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{form.leaveBalance[k]}</div>
                  <button onClick={() => setLeave(k)(form.leaveBalance[k] + 1)}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid #1e2d45", color: "#94a3b8", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div style={{ marginTop: 10, height: 4, background: "#1e2d45", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (form.leaveBalance[k] / 30) * 100)}%`, background: color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Total Entitlement</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
              {Object.values(form.leaveBalance).reduce((a, b) => a + b, 0)} days / year
            </div>
          </div>
        </div>
      );

      case "access": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionHead icon="🔐" title="Access Control" sub="Door permissions, time zones and privilege level" />

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#2dd4bf", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Door Permissions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DOORS.map(door => {
                const active = form.accessControl.doors.includes(door);
                return (
                  <button key={door} onClick={() => toggleDoor(door)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1px solid ${active ? "#2dd4bf" : "#1e2d45"}`, background: active ? "rgba(45,212,191,0.08)" : "#131c2e", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${active ? "#2dd4bf" : "#334155"}`, background: active ? "#2dd4bf" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {active && <span style={{ fontSize: 11, color: "#0f172a", fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: active ? "#e2e8f0" : "#64748b", fontWeight: active ? 600 : 400 }}>{door}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Time Zone (Access Hours)"><Sel value={form.accessControl.timeZone} onChange={setAccess("timeZone")} options={TIME_ZONES} /></Field>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Privilege Level</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map(lvl => (
                <button key={lvl} onClick={() => setAccess("privilegeLevel")(lvl)}
                  style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `1px solid ${form.accessControl.privilegeLevel === lvl ? "#818cf8" : "#1e2d45"}`, background: form.accessControl.privilegeLevel === lvl ? "rgba(129,140,248,0.12)" : "#131c2e", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{["👤", "🔑", "🔒", "⭐", "👑"][lvl - 1]}</span>
                  <span style={{ fontSize: 11, color: form.accessControl.privilegeLevel === lvl ? "#818cf8" : "#64748b", fontWeight: 700 }}>L{lvl}</span>
                  <span style={{ fontSize: 10, color: "#475569" }}>{["Basic", "Standard", "Elevated", "Manager", "Admin"][lvl - 1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "14px 18px" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Override Permission</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Can bypass time-zone restrictions</div>
            </div>
            <button onClick={() => setAccess("canOverride")(!form.accessControl.canOverride)}
              style={{ width: 48, height: 26, borderRadius: 13, background: form.accessControl.canOverride ? "#2dd4bf" : "#1e2d45", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: form.accessControl.canOverride ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </button>
          </div>
        </div>
      );

      case "payroll": return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionHead icon="💰" title="Pay Class & Work Code" sub="Payroll classification and cost center assignment" />
          <div style={g2}>
            <Field label="Pay Class"><Sel value={form.workCode.payClass} onChange={setWork("payClass")} options={PAY_CLASSES} /></Field>
            <Field label="Employment Type"><Sel value={form.workCode.employmentType} onChange={setWork("employmentType")} options={EMP_TYPES} /></Field>
          </div>
          <div style={g2}>
            <Field label="Work Code"><Sel value={form.workCode.workCode} onChange={setWork("workCode")} options={WORK_CODES} /></Field>
            <Field label="Overtime Class"><Sel value={form.workCode.overtimeClass} onChange={setWork("overtimeClass")} options={OT_CLASSES} /></Field>
          </div>
          <Field label="Cost Center"><Sel value={form.workCode.costCenter} onChange={setWork("costCenter")} options={COST_CENTERS} /></Field>

          {form.workCode.payClass && (
            <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Payroll Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  ["Pay Class", form.workCode.payClass || "—"],
                  ["Work Code", form.workCode.workCode || "—"],
                  ["OT Class", form.workCode.overtimeClass || "—"],
                  ["Cost Center", form.workCode.costCenter || "—"],
                  ["Emp. Type", form.workCode.employmentType || "—"],
                  ["OT Rate", form.attendanceRule.overtimeRate + "×"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

      case "salary": {
        const s = form.salaryStructure;
        const basic = s.basicSalary || Number(form.salary) || 0;
        const houseRentAmt = s.houseRentType === "percent" ? Math.round(basic * s.houseRent / 100) : s.houseRent;
        const gross = basic + houseRentAmt + s.medicalAllowance + s.transportAllowance + s.otherAllowances;
        const sessiAmt = Math.round(basic * s.sessiPercent / 100);
        const totalDed = s.eobi + sessiAmt + s.incomeTax + s.loanDeduction + s.otherDeductions;
        const net = gross - totalDed;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SectionHead icon="🏦" title="Salary Structure" sub="Allowances, deductions & bank details" />

            {/* Allowances */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.07em" }}>💵 Earnings / Allowances</div>
              <div style={g2}>
                <Field label="Basic Salary (PKR)">
                  <NumInput value={s.basicSalary || Number(form.salary) || 0} onChange={v => { setSal("basicSalary")(v); setF("salary")(String(v)); }} min={0} suffix="PKR" />
                </Field>
                <Field label="House Rent Type">
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["percent", "fixed"] as const).map(t => (
                      <button key={t} onClick={() => setSal("houseRentType")(t)}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1px solid ${s.houseRentType === t ? "#2dd4bf" : "#1e2d45"}`, background: s.houseRentType === t ? "rgba(45,212,191,0.1)" : "#131c2e", color: s.houseRentType === t ? "#2dd4bf" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                        {t === "percent" ? "% of Basic" : "Fixed PKR"}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <div style={g2}>
                <Field label={s.houseRentType === "percent" ? `House Rent (% → PKR ${houseRentAmt.toLocaleString()})` : "House Rent (PKR)"}>
                  <NumInput value={s.houseRent} onChange={setSal("houseRent")} min={0} suffix={s.houseRentType === "percent" ? "%" : "PKR"} />
                </Field>
                <Field label="Medical Allowance">
                  <NumInput value={s.medicalAllowance} onChange={setSal("medicalAllowance")} min={0} suffix="PKR" />
                </Field>
              </div>
              <div style={g2}>
                <Field label="Transport Allowance">
                  <NumInput value={s.transportAllowance} onChange={setSal("transportAllowance")} min={0} suffix="PKR" />
                </Field>
                <Field label="Other Allowances">
                  <NumInput value={s.otherAllowances} onChange={setSal("otherAllowances")} min={0} suffix="PKR" />
                </Field>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.07em" }}>📉 Deductions</div>
              <div style={g2}>
                <Field label="EOBI (Fixed)">
                  <NumInput value={s.eobi} onChange={setSal("eobi")} min={0} suffix="PKR" />
                </Field>
                <Field label={`SESSI (% → PKR ${sessiAmt.toLocaleString()})`}>
                  <NumInput value={s.sessiPercent} onChange={v => { setSal("sessiPercent")(v); setSal("sessi")(Math.round(basic * v / 100)); }} min={0} max={10} suffix="%" />
                </Field>
              </div>
              <div style={g2}>
                <Field label="Income Tax (Monthly)">
                  <NumInput value={s.incomeTax} onChange={setSal("incomeTax")} min={0} suffix="PKR" />
                </Field>
                <Field label="Loan Deduction">
                  <NumInput value={s.loanDeduction} onChange={setSal("loanDeduction")} min={0} suffix="PKR" />
                </Field>
              </div>
              <div style={g2}>
                <Field label="Other Deductions">
                  <NumInput value={s.otherDeductions} onChange={setSal("otherDeductions")} min={0} suffix="PKR" />
                </Field>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "10px 14px", marginTop: 22 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Tax Exempt</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>No income tax deduction</div>
                  </div>
                  <button onClick={() => setSal("taxExempt")(!s.taxExempt)}
                    style={{ width: 44, height: 24, borderRadius: 12, background: s.taxExempt ? "#2dd4bf" : "#1e2d45", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: s.taxExempt ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.07em" }}>🏦 Bank Details</div>
              <div style={g2}>
                <Field label="Bank Name"><Sel value={s.bankName} onChange={setSal("bankName")} options={BANKS} /></Field>
                <Field label="Account Number"><input style={inputStyle} value={s.bankAccount} onChange={e => setSal("bankAccount")(e.target.value)} placeholder="0000-0000000-000" /></Field>
              </div>
            </div>

            {/* Live Payslip Preview */}
            <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(14,165,233,0.08))", borderBottom: "1px solid #1e2d45", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>Live Salary Preview</div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    ["Basic", basic, "#2dd4bf"],
                    ["House Rent", houseRentAmt, "#34d399"],
                    ["Medical", s.medicalAllowance, "#60a5fa"],
                    ["Transport", s.transportAllowance, "#a78bfa"],
                    ["Other Allow.", s.otherAllowances, "#fbbf24"],
                  ].map(([label, val, color]: any) => (
                    <div key={label} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 14, color, fontWeight: 700, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                        {Number(val).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Gross</div>
                    <div style={{ fontSize: 14, color: "#34d399", fontWeight: 800, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>{gross.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: "#1e2d45", margin: "4px 0 14px" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    ["EOBI", s.eobi, "#f87171"],
                    ["SESSI", sessiAmt, "#fb923c"],
                    ["Income Tax", s.taxExempt ? 0 : s.incomeTax, "#fbbf24"],
                    ["Loan Ded.", s.loanDeduction, "#f87171"],
                    ["Other Ded.", s.otherDeductions, "#f87171"],
                  ].map(([label, val, color]: any) => (
                    <div key={label} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 14, color, fontWeight: 700, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                        -{Number(val).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Total Ded.</div>
                    <div style={{ fontSize: 14, color: "#f87171", fontWeight: 800, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>-{totalDed.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.1), rgba(14,165,233,0.1))", border: "1px solid rgba(45,212,191,0.25)", borderRadius: 10, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, color: "#94a3b8", fontSize: 14 }}>💰 Net Take-Home</div>
                  <div style={{ fontWeight: 800, color: "#2dd4bf", fontSize: 22, fontFamily: "'JetBrains Mono', monospace" }}>PKR {net.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default: return null;
    }
  };

  const tabIdx = TABS.findIndex(t => t.id === tab);
  const isLast = tabIdx === TABS.length - 1;
  const isFirst = tabIdx === 0;

  return (
    <>
      <TabBar active={tab} onChange={setTab} />
      <div style={{ padding: "24px 28px" }}>{tabContent()}</div>
      <div style={{ display: "flex", gap: 12, padding: "16px 28px", borderTop: "1px solid #1e2d45", flexShrink: 0 }}>
        {!isFirst && (
          <button onClick={() => setTab(TABS[tabIdx - 1].id)}
            style={{ padding: "11px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d45", borderRadius: 10, color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            ← Back
          </button>
        )}
        <button onClick={onClose} style={{ padding: "11px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d45", borderRadius: 10, color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
        {!isLast ? (
          <button onClick={() => setTab(TABS[tabIdx + 1].id)}
            style={{ flex: 1, padding: "11px", background: "rgba(45,212,191,0.1)", border: "1px solid #2dd4bf", borderRadius: 10, color: "#2dd4bf", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            Next: {TABS[tabIdx + 1].label} →
          </button>
        ) : (
          <button onClick={() => onSave(form)}
            style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #2dd4bf, #0ea5e9)", border: "none", borderRadius: 10, color: "#0f172a", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            ✓ Save Employee
          </button>
        )}
      </div>
    </>
  );
};

// ─── Face Enroll Modal ────────────────────────────────────────────────────────
const FaceEnrollModal = ({ emp, onClose }: { emp: Employee; onClose: () => void }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => {
      const r = new FileReader();
      r.onload = ev => setPhotos(p => [...p, ev.target?.result as string].slice(0, 10));
      r.readAsDataURL(f);
    });
  };
  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar emp={emp} size={48} />
        <div>
          <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 16 }}>{emp.firstName} {emp.lastName}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{emp.code} · {emp.designation}</div>
        </div>
        <Badge type={emp.faceEnrolled ? "enrolled" : "pending"} />
      </div>
      <div style={{ background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 12, padding: 14, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
        📸 Upload <strong style={{ color: "#2dd4bf" }}>3–10 clear face photos</strong>. Use good lighting, different angles, no sunglasses. AI will extract facial embeddings automatically.
      </div>
      <button onClick={() => fileRef.current?.click()} style={{ padding: "32px 20px", background: "#131c2e", border: "2px dashed #1e2d45", borderRadius: 16, color: "#64748b", cursor: "pointer", fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 36 }}>🤳</span>
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>Click to upload face photos</span>
        <span style={{ fontSize: 12 }}>JPG / PNG / WEBP supported</span>
      </button>
      <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFiles} />
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #1e2d45" }}>
              <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.7)", border: "none", color: "#f87171", borderRadius: 5, width: 18, height: 18, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(52,211,153,0.9)", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#0f172a", padding: "2px 0" }}>✓ {i + 1}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #1e2d45" }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{photos.length}/10 · Min 3 required</span>
        <button disabled={photos.length < 3} onClick={onClose}
          style={{ padding: "11px 28px", background: photos.length >= 3 ? "linear-gradient(135deg,#2dd4bf,#0ea5e9)" : "#1e2d45", border: "none", borderRadius: 10, color: photos.length >= 3 ? "#0f172a" : "#64748b", cursor: photos.length >= 3 ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14 }}>
          {photos.length >= 3 ? "🚀 Process Enrollment" : `Need ${3 - photos.length} more`}
        </button>
      </div>
    </div>
  );
};

// ─── Profile Modal ────────────────────────────────────────────────────────────
const ProfileModal = ({ emp, onClose }: { emp: Employee; onClose: () => void }) => {
  const [tab, setTab] = useState<"info" | "rules" | "leave" | "access" | "pay" | "payslips">("info");
  const infoRows: [string, string][] = [
    ["Code", emp.code], ["Email", emp.email], ["Phone", emp.phone],
    ["CNIC", emp.cnic], ["Address", emp.address], ["Department", emp.department],
    ["Designation", emp.designation], ["Salary", `PKR ${emp.salary.toLocaleString()}`],
    ["Joining Date", emp.joiningDate], ["Shift", emp.shift],
  ];
  const miniTabs = [
    { id: "info", label: "Info" }, { id: "rules", label: "Attendance" },
    { id: "leave", label: "Leave" }, { id: "access", label: "Access" },
    { id: "pay", label: "Pay" }, { id: "payslips", label: "💰 Payslips" },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 28px", background: "#131c2e", borderBottom: "1px solid #1e2d45" }}>
        <Avatar emp={emp} size={60} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{emp.firstName} {emp.lastName}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{emp.designation} · {emp.department}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Badge type={emp.status} /><Badge type={emp.faceEnrolled ? "enrolled" : "pending"} /><Badge type={emp.attendanceStatus} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 2, padding: "10px 20px", borderBottom: "1px solid #1e2d45", overflowX: "auto" }}>
        {miniTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: tab === t.id ? "rgba(45,212,191,0.12)" : "none", color: tab === t.id ? "#2dd4bf" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 28px" }}>
        {tab === "info" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {infoRows.map(([label, val]) => (
              <div key={label} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 500, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "rules" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Late In Grace", emp.attendanceRule.lateInGrace + " mins"],
              ["Early Out Grace", emp.attendanceRule.earlyOutGrace + " mins"],
              ["Break Deduction", emp.attendanceRule.breakDeduction + " mins"],
              ["OT Eligible After", emp.attendanceRule.overtimeMin + " mins"],
              ["OT Rate", emp.attendanceRule.overtimeRate + "×"],
              ["Half Day < ", emp.attendanceRule.halfDayHours + " hrs"],
              ["Absent if no check-in", emp.attendanceRule.absentAfterMins + " mins"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 16, color: "#2dd4bf", fontWeight: 700, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "leave" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(Object.entries(emp.leaveBalance) as [keyof LeaveBalance, number][]).map(([k, v]) => (
              <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k} Leave</div>
                <div style={{ fontSize: 22, color: "#f1f5f9", fontWeight: 800, marginTop: 4 }}>{v} <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>days</span></div>
              </div>
            ))}
          </div>
        )}
        {tab === "access" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>Doors</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {emp.accessControl.doors.map(d => <span key={d} style={{ padding: "5px 12px", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.25)", borderRadius: 8, fontSize: 13, color: "#2dd4bf", fontWeight: 600 }}>{d}</span>)}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Time Zone", emp.accessControl.timeZone], ["Privilege Level", "Level " + emp.accessControl.privilegeLevel], ["Override", emp.accessControl.canOverride ? "Yes" : "No"]].map(([k, v]) => (
                <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "pay" && (() => {
          const { houseRent, gross, sessiAmt, totalDed, net } = calcPayroll(emp);
          const s = emp.salaryStructure;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Pay Class", emp.workCode.payClass], ["Work Code", emp.workCode.workCode], ["OT Class", emp.workCode.overtimeClass], ["Cost Center", emp.workCode.costCenter], ["Employment Type", emp.workCode.employmentType], ["Bank", s.bankName || "—"]].map(([k, v]) => (
                  <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
              {s.bankAccount && (
                <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Account Number</div>
                  <div style={{ fontSize: 14, color: "#818cf8", fontWeight: 600, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{s.bankAccount}</div>
                </div>
              )}
              <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e2d45", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Monthly Salary Breakdown</div>
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Basic Salary", s.basicSalary, "#2dd4bf", "+"],
                    ["House Rent", houseRent, "#34d399", "+"],
                    ["Medical", s.medicalAllowance, "#60a5fa", "+"],
                    ["Transport", s.transportAllowance, "#a78bfa", "+"],
                    ...(s.otherAllowances > 0 ? [["Other Allow.", s.otherAllowances, "#fbbf24", "+"]] : []),
                  ].map(([label, val, color, sign]: any) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: 13, color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{sign} {Number(val).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "#1e2d45", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>Gross</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace" }}>{gross.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 1, background: "#1e2d45", margin: "4px 0" }} />
                  {[
                    ["EOBI", s.eobi],
                    ["SESSI", sessiAmt],
                    ["Income Tax", s.taxExempt ? 0 : s.incomeTax],
                    ...(s.loanDeduction > 0 ? [["Loan", s.loanDeduction]] : []),
                    ...(s.otherDeductions > 0 ? [["Other Ded.", s.otherDeductions]] : []),
                  ].filter(([, v]) => Number(v) > 0).map(([label, val]: any) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>- {Number(val).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "#1e2d45", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(14,165,233,0.08))", borderRadius: 8, padding: "10px 12px", margin: "0 -4px" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#2dd4bf" }}>💰 Net Pay</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#2dd4bf", fontFamily: "'JetBrains Mono', monospace" }}>PKR {net.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        {tab === "payslips" && (() => {
          const slips = emp.payslipHistory;
          const statusColors: Record<string, { bg: string; color: string }> = {
            paid: { bg: "rgba(52,211,153,0.12)", color: "#34d399" },
            pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
            processing: { bg: "rgba(129,140,248,0.12)", color: "#818cf8" },
          };
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {slips.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                  <div>No payslips generated yet</div>
                </div>
              ) : slips.map((slip, i) => {
                const sc = statusColors[slip.status];
                const monthLabel = new Date(slip.month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
                return (
                  <div key={i} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #1e2d45" }}>
                      <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{monthLabel}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700 }}>
                          ● {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
                        </span>
                        {slip.paidOn && <span style={{ fontSize: 11, color: "#64748b" }}>Paid {slip.paidOn}</span>}
                      </div>
                    </div>
                    <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {[
                        ["Working", slip.workingDays + " days", "#94a3b8"],
                        ["Present", slip.presentDays + " days", "#34d399"],
                        ["Absent", slip.absentDays + " days", slip.absentDays > 0 ? "#f87171" : "#64748b"],
                        ["OT Hours", slip.overtimeHours + " hrs", "#818cf8"],
                      ].map(([k, v, c]: any) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                          <div style={{ fontSize: 13, color: c, fontWeight: 700, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", padding: "10px 16px", borderTop: "1px solid #0f1c30", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Gross: </span>
                        <span style={{ fontSize: 13, color: "#34d399", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{slip.grossSalary.toLocaleString()}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Deductions: </span>
                        <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>-{slip.totalDeductions.toLocaleString()}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Net: </span>
                        <span style={{ fontSize: 14, color: "#2dd4bf", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>PKR {slip.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, accent, onConfirm, onClose }: { title: string; message: string; accent: string; onConfirm: () => void; onClose: () => void }) => (
  <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
    <p style={{ margin: 0, color: "#94a3b8", fontSize: 14, lineHeight: 1.7 }}>{message}</p>
    <div style={{ display: "flex", gap: 12 }}>
      <button onClick={onClose} style={{ flex: 1, padding: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e2d45", borderRadius: 10, color: "#94a3b8", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
      <button onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1, padding: 12, background: accent, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Confirm</button>
    </div>
  </div>
);

// ─── Action Menu ──────────────────────────────────────────────────────────────
const ActionMenu = ({ emp, onAction }: { emp: Employee; onAction: (a: string, e: Employee) => void }) => {
  const [open, setOpen] = useState(false);
  const actions = [
    { id: "view",      label: "👤 View Profile",         color: "#94a3b8" },
    { id: "edit",      label: "✏️ Edit",                  color: "#94a3b8" },
    { id: "enroll",    label: "🤳 Face Enroll",           color: "#2dd4bf" },
    { id: "history",   label: "📅 Attendance History",    color: "#94a3b8" },
    { id: "resetface", label: "🔄 Reset Face Data",       color: "#fbbf24" },
    { id: "toggle",    label: emp.status === "active" ? "⏸ Deactivate" : "▶️ Activate", color: emp.status === "active" ? "#f87171" : "#34d399" },
    { id: "delete",    label: "🗑 Delete",                color: "#f87171" },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid #1e2d45", borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>⋯</button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "110%", background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 12, minWidth: 210, zIndex: 50, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            {actions.map(a => (
              <button key={a.id} onClick={() => { onAction(a.id, emp); setOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", color: a.color, cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAttendance, setFilterAttendance] = useState("");
  const [modal, setModal] = useState<{ type: string; emp?: Employee } | null>(null);

  const total    = employees.length;
  const present  = employees.filter(e => e.attendanceStatus === "present").length;
  const absent   = employees.filter(e => e.attendanceStatus === "absent").length;
  const late     = employees.filter(e => e.attendanceStatus === "late").length;
  const enrolled = employees.filter(e => e.faceEnrolled).length;

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const ok = !q || [e.firstName, e.lastName, e.code, e.email, e.department, e.designation].some(s => s.toLowerCase().includes(q));
    return ok && (!filterDept || e.department === filterDept) && (!filterStatus || e.status === filterStatus) && (!filterAttendance || e.attendanceStatus === filterAttendance);
  });

  const handleAction = (action: string, emp: Employee) => {
    if (action === "toggle") setEmployees(es => es.map(e => e.id === emp.id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e));
    else setModal({ type: action === "delete" ? "confirm-delete" : action === "resetface" ? "confirm-reset" : action, emp });
  };

  const handleSave = (data: FormData) => {
    if (modal?.type === "edit" && modal.emp) {
      setEmployees(es => es.map(e => e.id === modal.emp!.id ? { ...e, ...data, salary: Number(data.salary), status: (data.status as "active" | "inactive") } : e as Employee));
    } else {
      const newEmp: Employee = { id: Date.now(), ...data, salary: Number(data.salary), faceEnrolled: false, attendanceStatus: "-", lastCheckIn: null, photo: null, payslipHistory: [] };
      setEmployees(es => [...es, newEmp]);
    }
    setModal(null);
  };

  const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", borderBottom: "1px solid #1e2d45" };
  const tdStyle: React.CSSProperties = { padding: "14px 16px", verticalAlign: "middle", borderBottom: "1px solid #0f1c30", fontSize: 13, color: "#cbd5e1", whiteSpace: "nowrap" };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#0d1526}::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:3px}`}</style>

      <div style={{ minHeight: "100vh", background: "#080f1e", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9", padding: "28px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Employees</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Workforce management · Attendance rules · Access control · Payroll</p>
          </div>
          <button onClick={() => setModal({ type: "add" })}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "linear-gradient(135deg, #2dd4bf, #0ea5e9)", border: "none", borderRadius: 12, color: "#0f172a", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ fontSize: 18 }}>+</span> Add Employee
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard label="Total Employees" value={total}    accent="#2dd4bf" icon="👥" />
          <StatCard label="Present Today"   value={present}  accent="#34d399" icon="✅" />
          <StatCard label="Absent Today"    value={absent}   accent="#f87171" icon="❌" />
          <StatCard label="Late Today"      value={late}     accent="#fbbf24" icon="⏰" />
          <StatCard label="Face Enrolled"   value={enrolled} accent="#818cf8" icon="🤳" />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#64748b" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, code, email, department…"
              style={{ ...inputStyle, paddingLeft: 38 }} />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filterAttendance} onChange={e => setFilterAttendance(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
            <option value="">All Attendance</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
          {(search || filterDept || filterStatus || filterAttendance) && (
            <button onClick={() => { setSearch(""); setFilterDept(""); setFilterStatus(""); setFilterAttendance(""); }}
              style={{ padding: "10px 16px", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length}/{total}</span>
        </div>

        {/* Table */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1300 }}>
              <thead style={{ background: "#0a1020" }}>
                <tr>
                  {["Code", "Employee", "Email", "Phone", "Department", "Designation", "Joining", "Shift", "Pay Class", "Access Lvl", "Face", "Attendance", "Last In", "Status", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={15} style={{ ...tdStyle, textAlign: "center", padding: "60px 20px", color: "#475569" }}>No employees found</td></tr>
                  : filtered.map(emp => (
                    <tr key={emp.id}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <td style={tdStyle}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#2dd4bf", background: "rgba(45,212,191,0.08)", padding: "3px 8px", borderRadius: 6 }}>{emp.code}</span></td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar emp={emp} />
                          <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{emp.firstName} {emp.lastName}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{emp.email}</td>
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{emp.phone}</td>
                      <td style={tdStyle}>{emp.department}</td>
                      <td style={{ ...tdStyle, color: "#94a3b8" }}>{emp.designation}</td>
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{emp.joiningDate}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "#94a3b8" }}>{emp.shift}</td>
                      <td style={{ ...tdStyle, fontSize: 12 }}><span style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{emp.workCode.payClass.split(" ")[0]}</span></td>
                      <td style={{ ...tdStyle, textAlign: "center" }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#60a5fa", fontWeight: 700 }}>L{emp.accessControl.privilegeLevel}</span></td>
                      <td style={tdStyle}><Badge type={emp.faceEnrolled ? "enrolled" : "pending"} /></td>
                      <td style={tdStyle}><Badge type={emp.attendanceStatus} /></td>
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: emp.lastCheckIn ? "#34d399" : "#475569" }}>{emp.lastCheckIn || "—"}</td>
                      <td style={tdStyle}><Badge type={emp.status} /></td>
                      <td style={tdStyle}><ActionMenu emp={emp} onAction={handleAction} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal?.type === "add" && (
        <Modal title="Add New Employee" onClose={() => setModal(null)} wide>
          <EmployeeForm onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "edit" && modal.emp && (
        <Modal title="Edit Employee" onClose={() => setModal(null)} wide>
          <EmployeeForm initial={{ ...modal.emp, salary: String(modal.emp.salary) }} onSave={handleSave} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "view" && modal.emp && (
        <Modal title="Employee Profile" onClose={() => setModal(null)} wide>
          <ProfileModal emp={modal.emp} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "enroll" && modal.emp && (
        <Modal title={`Face Enrollment — ${modal.emp.firstName} ${modal.emp.lastName}`} onClose={() => setModal(null)}>
          <FaceEnrollModal emp={modal.emp} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "history" && modal.emp && (
        <Modal title={`Attendance History — ${modal.emp.firstName} ${modal.emp.lastName}`} onClose={() => setModal(null)}>
          <div style={{ padding: "40px 28px", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 14 }}>History loaded from API for <strong style={{ color: "#2dd4bf" }}>{modal.emp.code}</strong></div>
          </div>
        </Modal>
      )}
      {modal?.type === "confirm-delete" && modal.emp && (
        <Modal title="Delete Employee" onClose={() => setModal(null)}>
          <ConfirmModal title="" message={`Permanently delete ${modal.emp.firstName} ${modal.emp.lastName}? This cannot be undone.`} accent="#ef4444"
            onConfirm={() => setEmployees(es => es.filter(e => e.id !== modal.emp!.id))} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "confirm-reset" && modal.emp && (
        <Modal title="Reset Face Data" onClose={() => setModal(null)}>
          <ConfirmModal title="" message={`Delete all facial embeddings for ${modal.emp.firstName} ${modal.emp.lastName}? They'll need re-enrollment.`} accent="#f59e0b"
            onConfirm={() => setEmployees(es => es.map(e => e.id === modal.emp!.id ? { ...e, faceEnrolled: false } : e))} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}

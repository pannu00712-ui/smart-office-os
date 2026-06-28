import { useState, useRef } from "react";

// ─── Types (mirrors EmployeesPage) ────────────────────────────────────────────
interface SalaryStructure {
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  eobi: number;
  sessi: number;
  incomeTax: number;
  loanDeduction: number;
  otherDeductions: number;
  houseRentType: "percent" | "fixed";
  sessiPercent: number;
  bankName: string;
  bankAccount: string;
  taxExempt: boolean;
}

interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  salary: number;
  status: "active" | "inactive";
  photo: string | null;
  workCode: {
    payClass: string;
    workCode: string;
    overtimeClass: string;
    costCenter: string;
    employmentType: string;
  };
  salaryStructure: SalaryStructure;
}

interface PayrollEntry {
  emp: Employee;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: number;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  eobi: number;
  sessi: number;
  incomeTax: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  overtimePay: number;
  absentDeduction: number;
  lateDeduction: number;
  netSalary: number;
  status: "pending" | "processing" | "paid";
  selected: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
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

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, code: "EMP-001", firstName: "Zara", lastName: "Ahmed", department: "Engineering", designation: "Senior Developer", salary: 120000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "OT-1.5x", costCenter: "CC-ENG", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(120000), houseRent: 45, medicalAllowance: 5000, transportAllowance: 3000, eobi: 370, incomeTax: 8500, bankName: "Meezan Bank", bankAccount: "01230123456789" } },
  { id: 2, code: "EMP-002", firstName: "Hassan", lastName: "Malik", department: "HR", designation: "HR Manager", salary: 95000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "OT-1.5x", costCenter: "CC-HR", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(95000), medicalAllowance: 4000, transportAllowance: 2500, eobi: 370, incomeTax: 5200, bankName: "HBL", bankAccount: "06060606060606" } },
  { id: 3, code: "EMP-003", firstName: "Ayesha", lastName: "Khan", department: "Finance", designation: "Finance Analyst", salary: 85000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "No Overtime", costCenter: "CC-FIN", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(85000), medicalAllowance: 3500, transportAllowance: 2000, eobi: 370, incomeTax: 3800, bankName: "UBL", bankAccount: "09870987098709" } },
  { id: 4, code: "EMP-004", firstName: "Omar", lastName: "Farooq", department: "Engineering", designation: "Backend Engineer", salary: 105000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "OT-1.5x", costCenter: "CC-ENG", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(105000), medicalAllowance: 4500, transportAllowance: 2500, eobi: 370, incomeTax: 7000, bankName: "MCB", bankAccount: "11110011111100" } },
  { id: 5, code: "EMP-005", firstName: "Sana", lastName: "Baig", department: "Marketing", designation: "Marketing Lead", salary: 90000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "OT-1.5x", costCenter: "CC-MKT", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(90000), medicalAllowance: 4000, transportAllowance: 2000, eobi: 370, incomeTax: 4500, bankName: "Allied Bank", bankAccount: "55005500550055" } },
  { id: 6, code: "EMP-006", firstName: "Bilal", lastName: "Siddiqui", department: "Operations", designation: "Ops Executive", salary: 65000, status: "inactive", photo: null, workCode: { payClass: "Monthly Salaried", workCode: "WC-001 Standard", overtimeClass: "No Overtime", costCenter: "CC-OPS", employmentType: "Contractual" }, salaryStructure: { ...DEFAULT_SALARY(65000), eobi: 370, bankName: "Bank Alfalah", bankAccount: "66006600660066" } },
];

// Mock attendance data per month (in real app, this comes from attendance API)
const MOCK_ATTENDANCE: Record<string, Record<number, { presentDays: number; absentDays: number; lateDays: number; overtimeHours: number; workingDays: number }>> = {
  "2025-06": { 1: { workingDays: 26, presentDays: 25, absentDays: 1, lateDays: 2, overtimeHours: 4 }, 2: { workingDays: 26, presentDays: 24, absentDays: 2, lateDays: 1, overtimeHours: 0 }, 3: { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 0, overtimeHours: 2 }, 4: { workingDays: 26, presentDays: 25, absentDays: 1, lateDays: 3, overtimeHours: 6 }, 5: { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 1, overtimeHours: 3 }, 6: { workingDays: 26, presentDays: 20, absentDays: 6, lateDays: 0, overtimeHours: 0 } },
  "2025-05": { 1: { workingDays: 26, presentDays: 25, absentDays: 1, lateDays: 2, overtimeHours: 3 }, 2: { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 0, overtimeHours: 5 }, 3: { workingDays: 26, presentDays: 24, absentDays: 2, lateDays: 1, overtimeHours: 0 }, 4: { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 4, overtimeHours: 8 }, 5: { workingDays: 26, presentDays: 25, absentDays: 1, lateDays: 0, overtimeHours: 2 }, 6: { workingDays: 26, presentDays: 18, absentDays: 8, lateDays: 0, overtimeHours: 0 } },
  "2025-04": { 1: { workingDays: 25, presentDays: 25, absentDays: 0, lateDays: 1, overtimeHours: 5 }, 2: { workingDays: 25, presentDays: 23, absentDays: 2, lateDays: 2, overtimeHours: 0 }, 3: { workingDays: 25, presentDays: 25, absentDays: 0, lateDays: 0, overtimeHours: 1 }, 4: { workingDays: 25, presentDays: 24, absentDays: 1, lateDays: 2, overtimeHours: 4 }, 5: { workingDays: 25, presentDays: 25, absentDays: 0, lateDays: 0, overtimeHours: 0 }, 6: { workingDays: 25, presentDays: 22, absentDays: 3, lateDays: 0, overtimeHours: 0 } },
};

// ─── Calculation Engine ───────────────────────────────────────────────────────
const calcEntry = (emp: Employee, month: string): PayrollEntry => {
  const s = emp.salaryStructure;
  const att = MOCK_ATTENDANCE[month]?.[emp.id] ?? { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 0, overtimeHours: 0 };

  const basic = s.basicSalary || emp.salary;
  const houseRent = s.houseRentType === "percent" ? Math.round(basic * s.houseRent / 100) : s.houseRent;
  const medical = s.medicalAllowance;
  const transport = s.transportAllowance;
  const other = s.otherAllowances;

  const dailyRate = Math.round(basic / att.workingDays);
  const hourlyRate = Math.round(basic / (att.workingDays * 8));

  const absentDeduction = att.absentDays * dailyRate;
  const lateDeduction = att.lateDays * Math.round(dailyRate * 0.1);
  const overtimePay = Math.round(att.overtimeHours * hourlyRate * 1.5);

  const grossSalary = basic + houseRent + medical + transport + other + overtimePay - absentDeduction - lateDeduction;

  const sessiAmt = Math.round(basic * s.sessiPercent / 100);
  const incomeTax = s.taxExempt ? 0 : s.incomeTax;
  const totalDeductions = s.eobi + sessiAmt + incomeTax + s.loanDeduction + s.otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  return {
    emp,
    workingDays: att.workingDays,
    presentDays: att.presentDays,
    absentDays: att.absentDays,
    lateDays: att.lateDays,
    overtimeHours: att.overtimeHours,
    basicSalary: basic,
    houseRent,
    medicalAllowance: medical,
    transportAllowance: transport,
    otherAllowances: other,
    grossSalary,
    eobi: s.eobi,
    sessi: sessiAmt,
    incomeTax,
    loanDeduction: s.loanDeduction,
    otherDeductions: s.otherDeductions,
    totalDeductions,
    overtimePay,
    absentDeduction,
    lateDeduction,
    netSalary,
    status: "pending",
    selected: emp.status === "active",
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PKR = (n: number) => `PKR ${n.toLocaleString()}`;
const fmt = (n: number) => n.toLocaleString();

const Avatar = ({ emp, size = 36 }: { emp: Employee; size?: number }) => {
  const colors = ["#2dd4bf", "#f59e0b", "#818cf8", "#fb7185", "#34d399", "#60a5fa"];
  const bg = colors[emp.id % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
      {emp.firstName[0]}{emp.lastName[0]}
    </div>
  );
};

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2025, i, 1);
  return { value: `2025-${String(i + 1).padStart(2, "0")}`, label: d.toLocaleString("en-PK", { month: "long", year: "numeric" }) };
}).reverse();

// ─── PDF Generator ────────────────────────────────────────────────────────────
const generatePayslipHTML = (entry: PayrollEntry, month: string) => {
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
  const today = new Date().toLocaleDateString("en-PK");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Payslip — ${entry.emp.firstName} ${entry.emp.lastName} — ${monthLabel}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 13px; }
  .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 40px 48px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #0f172a; margin-bottom: 28px; }
  .company { display: flex; align-items: center; gap: 14px; }
  .logo-box { width: 48px; height: 48px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .logo-box span { color: #2dd4bf; font-size: 20px; font-weight: 900; }
  .company-name { font-size: 20px; font-weight: 800; color: #0f172a; }
  .company-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
  .slip-title { text-align: right; }
  .slip-title h1 { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
  .slip-title .month { font-size: 13px; color: #2dd4bf; font-weight: 700; margin-top: 3px; }
  .slip-title .issued { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .emp-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 22px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .emp-field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; }
  .emp-field .val { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 3px; }
  .attendance-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px; }
  .att-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; text-align: center; }
  .att-box .num { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1; }
  .att-box .lbl { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px; }
  .att-box.green .num { color: #16a34a; }
  .att-box.red .num { color: #dc2626; }
  .att-box.amber .num { color: #d97706; }
  .att-box.purple .num { color: #7c3aed; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .salary-table { width: 100%; border-collapse: collapse; }
  .salary-table tr td { padding: 7px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .salary-table tr:last-child td { border-bottom: none; }
  .salary-table td:last-child { text-align: right; font-weight: 600; font-family: 'Courier New', monospace; }
  .green-text { color: #16a34a; }
  .red-text { color: #dc2626; }
  .sub-total { background: #f8fafc; }
  .sub-total td { font-weight: 700 !important; padding: 9px 0 !important; }
  .net-box { background: #0f172a; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .net-label { color: #94a3b8; font-size: 13px; font-weight: 600; }
  .net-amount { color: #2dd4bf; font-size: 26px; font-weight: 900; font-family: 'Courier New', monospace; letter-spacing: -1px; }
  .net-words { color: #64748b; font-size: 11px; margin-top: 4px; }
  .bank-row { display: flex; gap: 20px; margin-top: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; }
  .bank-field { flex: 1; }
  .bank-field label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
  .bank-field .val { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 3px; font-family: 'Courier New', monospace; }
  .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
  .sig-line { text-align: center; }
  .sig-line .line { width: 160px; border-bottom: 1px solid #0f172a; margin-bottom: 6px; }
  .sig-line .lbl { font-size: 11px; color: #64748b; font-weight: 600; }
  .watermark { color: #e2e8f0; font-size: 11px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="company">
      <div class="logo-box"><span>S</span></div>
      <div>
        <div class="company-name">Smart Office OS</div>
        <div class="company-sub">SOOS Pvt. Ltd. · Karachi, Pakistan</div>
      </div>
    </div>
    <div class="slip-title">
      <h1>SALARY SLIP</h1>
      <div class="month">${monthLabel}</div>
      <div class="issued">Issued: ${today}</div>
    </div>
  </div>

  <div class="emp-card">
    <div class="emp-field"><label>Employee Name</label><div class="val">${entry.emp.firstName} ${entry.emp.lastName}</div></div>
    <div class="emp-field"><label>Employee Code</label><div class="val">${entry.emp.code}</div></div>
    <div class="emp-field"><label>Designation</label><div class="val">${entry.emp.designation}</div></div>
    <div class="emp-field"><label>Department</label><div class="val">${entry.emp.department}</div></div>
    <div class="emp-field"><label>Pay Class</label><div class="val">${entry.emp.workCode.payClass}</div></div>
    <div class="emp-field"><label>Employment Type</label><div class="val">${entry.emp.workCode.employmentType}</div></div>
  </div>

  <div class="attendance-row">
    <div class="att-box"><div class="num">${entry.workingDays}</div><div class="lbl">Working Days</div></div>
    <div class="att-box green"><div class="num">${entry.presentDays}</div><div class="lbl">Present</div></div>
    <div class="att-box red"><div class="num">${entry.absentDays}</div><div class="lbl">Absent</div></div>
    <div class="att-box amber"><div class="num">${entry.lateDays}</div><div class="lbl">Late Days</div></div>
    <div class="att-box purple"><div class="num">${entry.overtimeHours}</div><div class="lbl">OT Hours</div></div>
  </div>

  <div class="two-col">
    <div>
      <div class="section-title">💵 Earnings</div>
      <table class="salary-table">
        <tr><td>Basic Salary</td><td class="green-text">${fmt(entry.basicSalary)}</td></tr>
        <tr><td>House Rent Allowance</td><td class="green-text">${fmt(entry.houseRent)}</td></tr>
        <tr><td>Medical Allowance</td><td class="green-text">${fmt(entry.medicalAllowance)}</td></tr>
        <tr><td>Transport Allowance</td><td class="green-text">${fmt(entry.transportAllowance)}</td></tr>
        ${entry.otherAllowances > 0 ? `<tr><td>Other Allowances</td><td class="green-text">${fmt(entry.otherAllowances)}</td></tr>` : ""}
        ${entry.overtimePay > 0 ? `<tr><td>Overtime Pay (${entry.overtimeHours} hrs)</td><td class="green-text">${fmt(entry.overtimePay)}</td></tr>` : ""}
        ${entry.absentDeduction > 0 ? `<tr><td>Absent Deduction (${entry.absentDays} days)</td><td class="red-text">- ${fmt(entry.absentDeduction)}</td></tr>` : ""}
        ${entry.lateDeduction > 0 ? `<tr><td>Late Deduction (${entry.lateDays} days)</td><td class="red-text">- ${fmt(entry.lateDeduction)}</td></tr>` : ""}
        <tr class="sub-total"><td>Gross Salary</td><td class="green-text">${fmt(entry.grossSalary)}</td></tr>
      </table>
    </div>
    <div>
      <div class="section-title">📉 Deductions</div>
      <table class="salary-table">
        ${entry.eobi > 0 ? `<tr><td>EOBI</td><td class="red-text">- ${fmt(entry.eobi)}</td></tr>` : ""}
        ${entry.sessi > 0 ? `<tr><td>SESSI</td><td class="red-text">- ${fmt(entry.sessi)}</td></tr>` : ""}
        ${entry.incomeTax > 0 ? `<tr><td>Income Tax</td><td class="red-text">- ${fmt(entry.incomeTax)}</td></tr>` : ""}
        ${entry.loanDeduction > 0 ? `<tr><td>Loan Deduction</td><td class="red-text">- ${fmt(entry.loanDeduction)}</td></tr>` : ""}
        ${entry.otherDeductions > 0 ? `<tr><td>Other Deductions</td><td class="red-text">- ${fmt(entry.otherDeductions)}</td></tr>` : ""}
        ${entry.totalDeductions === 0 ? `<tr><td style="color:#94a3b8">No deductions</td><td>—</td></tr>` : ""}
        <tr class="sub-total"><td>Total Deductions</td><td class="red-text">- ${fmt(entry.totalDeductions)}</td></tr>
      </table>
    </div>
  </div>

  <div class="net-box">
    <div>
      <div class="net-label">💰 Net Take-Home Pay</div>
      <div class="net-words">${monthLabel} · ${entry.presentDays}/${entry.workingDays} days</div>
    </div>
    <div class="net-amount">PKR ${fmt(entry.netSalary)}</div>
  </div>

  ${entry.emp.salaryStructure.bankName ? `
  <div class="bank-row">
    <div class="bank-field"><label>Bank Name</label><div class="val">${entry.emp.salaryStructure.bankName}</div></div>
    <div class="bank-field"><label>Account Number</label><div class="val">${entry.emp.salaryStructure.bankAccount}</div></div>
    <div class="bank-field"><label>Transfer Mode</label><div class="val">Online Bank Transfer</div></div>
  </div>` : ""}

  <div class="footer">
    <div class="sig-line"><div class="line"></div><div class="lbl">Employee Signature</div></div>
    <div class="watermark">Generated by Smart Office OS · ${today}</div>
    <div class="sig-line"><div class="line"></div><div class="lbl">HR / Accounts</div></div>
  </div>
</div>
</body>
</html>`;
};

const printPayslip = (entry: PayrollEntry, month: string) => {
  const html = generatePayslipHTML(entry, month);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};

const exportBulkPDF = (entries: PayrollEntry[], month: string) => {
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
  const today = new Date().toLocaleDateString("en-PK");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payroll — ${monthLabel}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; font-size:12px; color:#1e293b; }
  .page { width:794px; margin:0 auto; padding:32px 40px; }
  h1 { font-size:20px; font-weight:800; margin-bottom:4px; }
  .sub { color:#64748b; font-size:12px; margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#0f172a; color:#fff; }
  th { padding:10px 12px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
  td { padding:9px 12px; border-bottom:1px solid #f1f5f9; font-size:12px; }
  tr:nth-child(even) td { background:#f8fafc; }
  .num { font-family:'Courier New',monospace; font-weight:600; }
  .green { color:#16a34a; } .red { color:#dc2626; } .teal { color:#0d9488; }
  .total-row td { background:#0f172a !important; color:#fff; font-weight:700; border:none; }
  .total-row .num { color:#2dd4bf; font-size:13px; }
  .footer { margin-top:20px; font-size:11px; color:#94a3b8; text-align:center; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<div class="page">
  <h1>Payroll Summary — ${monthLabel}</h1>
  <div class="sub">Smart Office OS · Exported on ${today} · ${entries.length} employees</div>
  <table>
    <thead><tr>
      <th>#</th><th>Employee</th><th>Dept</th>
      <th>Working</th><th>Present</th><th>Absent</th><th>OT Hrs</th>
      <th>Gross</th><th>Deductions</th><th>Net Pay</th>
    </tr></thead>
    <tbody>
      ${entries.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${e.emp.firstName} ${e.emp.lastName}</strong><br><span style="color:#94a3b8;font-size:11px">${e.emp.code}</span></td>
        <td>${e.emp.department}</td>
        <td class="num">${e.workingDays}</td>
        <td class="num green">${e.presentDays}</td>
        <td class="num red">${e.absentDays}</td>
        <td class="num" style="color:#7c3aed">${e.overtimeHours}</td>
        <td class="num green">${fmt(e.grossSalary)}</td>
        <td class="num red">- ${fmt(e.totalDeductions)}</td>
        <td class="num teal"><strong>${fmt(e.netSalary)}</strong></td>
      </tr>`).join("")}
      <tr class="total-row">
        <td colspan="7"><strong>TOTAL (${entries.length} employees)</strong></td>
        <td class="num">${fmt(entries.reduce((s, e) => s + e.grossSalary, 0))}</td>
        <td class="num" style="color:#f87171">- ${fmt(entries.reduce((s, e) => s + e.totalDeductions, 0))}</td>
        <td class="num">${fmt(entries.reduce((s, e) => s + e.netSalary, 0))}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">This is a system-generated payroll summary. Smart Office OS — ${today}</div>
</div>
</body></html>`;
  const win = window.open("", "_blank", "width=1000,height=750");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: "pending" | "processing" | "paid" }) => {
  const map = {
    pending:    { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending" },
    processing: { bg: "rgba(129,140,248,0.12)", color: "#818cf8", label: "Processing" },
    paid:       { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Paid" },
  };
  const s = map[status];
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>
      ● {s.label}
    </span>
  );
};

// ─── Payslip Detail Modal ─────────────────────────────────────────────────────
const PayslipModal = ({ entry, month, onClose }: { entry: PayrollEntry; month: string; onClose: () => void }) => {
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
  const row = (label: string, val: string, color = "#e2e8f0", sign = "") => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #0f1c30" }}>
      <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 13, color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{sign}{val}</span>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #1e2d45", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar emp={entry.emp} size={44} />
            <div>
              <div style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 15 }}>{entry.emp.firstName} {entry.emp.lastName}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{entry.emp.code} · {monthLabel}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => printPayslip(entry, month)}
              style={{ padding: "8px 16px", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)", borderRadius: 8, color: "#2dd4bf", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              🖨 Print
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Attendance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {[
              ["Working", entry.workingDays, "#94a3b8"],
              ["Present", entry.presentDays, "#34d399"],
              ["Absent", entry.absentDays, entry.absentDays > 0 ? "#f87171" : "#64748b"],
              ["Late", entry.lateDays, entry.lateDays > 0 ? "#fbbf24" : "#64748b"],
              ["OT Hrs", entry.overtimeHours, "#818cf8"],
            ].map(([k, v, c]: any) => (
              <div key={k} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginTop: 3 }}>{k}</div>
              </div>
            ))}
          </div>

          {/* Earnings */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>💵 Earnings</div>
            <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "4px 16px" }}>
              {row("Basic Salary", fmt(entry.basicSalary), "#2dd4bf", "+")}
              {row("House Rent Allowance", fmt(entry.houseRent), "#34d399", "+")}
              {row("Medical Allowance", fmt(entry.medicalAllowance), "#60a5fa", "+")}
              {row("Transport Allowance", fmt(entry.transportAllowance), "#a78bfa", "+")}
              {entry.otherAllowances > 0 && row("Other Allowances", fmt(entry.otherAllowances), "#fbbf24", "+")}
              {entry.overtimePay > 0 && row(`Overtime (${entry.overtimeHours} hrs)`, fmt(entry.overtimePay), "#34d399", "+")}
              {entry.absentDeduction > 0 && row(`Absent Deduction (${entry.absentDays}d)`, fmt(entry.absentDeduction), "#f87171", "−")}
              {entry.lateDeduction > 0 && row(`Late Deduction (${entry.lateDays}d)`, fmt(entry.lateDeduction), "#f87171", "−")}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: "1px solid #1e2d45", marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: "#34d399", fontSize: 14 }}>Gross Salary</span>
                <span style={{ fontWeight: 800, color: "#34d399", fontSize: 15, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(entry.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>📉 Deductions</div>
            <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "4px 16px" }}>
              {entry.eobi > 0 && row("EOBI", fmt(entry.eobi), "#f87171", "−")}
              {entry.sessi > 0 && row("SESSI", fmt(entry.sessi), "#fb923c", "−")}
              {entry.incomeTax > 0 && row("Income Tax", fmt(entry.incomeTax), "#fbbf24", "−")}
              {entry.loanDeduction > 0 && row("Loan Deduction", fmt(entry.loanDeduction), "#f87171", "−")}
              {entry.otherDeductions > 0 && row("Other Deductions", fmt(entry.otherDeductions), "#f87171", "−")}
              {entry.totalDeductions === 0 && (
                <div style={{ padding: "12px 0", color: "#475569", fontSize: 13 }}>No deductions this month</div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: "1px solid #1e2d45", marginTop: 4 }}>
                <span style={{ fontWeight: 700, color: "#f87171", fontSize: 14 }}>Total Deductions</span>
                <span style={{ fontWeight: 800, color: "#f87171", fontSize: 15, fontFamily: "'JetBrains Mono', monospace" }}>− {fmt(entry.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.1), rgba(14,165,233,0.1))", border: "1px solid rgba(45,212,191,0.25)", borderRadius: 14, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>💰 Net Take-Home Pay</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{entry.presentDays}/{entry.workingDays} days · {monthLabel}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#2dd4bf", fontFamily: "'JetBrains Mono', monospace" }}>
              PKR {fmt(entry.netSalary)}
            </div>
          </div>

          {/* Bank */}
          {entry.emp.salaryStructure.bankName && (
            <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Bank</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginTop: 3 }}>{entry.emp.salaryStructure.bankName}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Account</div>
                <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 600, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>{entry.emp.salaryStructure.bankAccount}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main PayrollPage ─────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [month, setMonth] = useState(MONTHS[0].value);
  const [entries, setEntries] = useState<PayrollEntry[]>(() =>
    MOCK_EMPLOYEES.map(e => calcEntry(e, MONTHS[0].value))
  );
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "done">("idle");
  const [viewEntry, setViewEntry] = useState<PayrollEntry | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [deptFilter, setDeptFilter] = useState("All");

  const departments = ["All", ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)))];

  const handleMonthChange = (m: string) => {
    setMonth(m);
    setEntries(MOCK_EMPLOYEES.map(e => calcEntry(e, m)));
    setRunStatus("idle");
  };

  const toggleSelect = (id: number) =>
    setEntries(es => es.map(e => e.emp.id === id ? { ...e, selected: !e.selected } : e));

  const toggleAll = () => {
    const allSelected = visibleEntries.every(e => e.selected);
    const ids = new Set(visibleEntries.map(e => e.emp.id));
    setEntries(es => es.map(e => ids.has(e.emp.id) ? { ...e, selected: !allSelected } : e));
  };

  const runPayroll = () => {
    const selectedIds = new Set(entries.filter(e => e.selected).map(e => e.emp.id));
    if (selectedIds.size === 0) return;
    setRunStatus("running");
    setEntries(es => es.map(e => selectedIds.has(e.emp.id) ? { ...e, status: "processing" } : e));
    setTimeout(() => {
      setEntries(es => es.map(e => selectedIds.has(e.emp.id) ? { ...e, status: "paid" } : e));
      setRunStatus("done");
    }, 1800);
  };

  const visibleEntries = entries.filter(e => {
    if (filter === "active" && e.emp.status !== "active") return false;
    if (filter === "inactive" && e.emp.status !== "inactive") return false;
    if (deptFilter !== "All" && e.emp.department !== deptFilter) return false;
    return true;
  });

  const selected = entries.filter(e => e.selected);
  const totalGross = selected.reduce((s, e) => s + e.grossSalary, 0);
  const totalDed   = selected.reduce((s, e) => s + e.totalDeductions, 0);
  const totalNet   = selected.reduce((s, e) => s + e.netSalary, 0);
  const allPaid    = visibleEntries.length > 0 && visibleEntries.every(e => e.status === "paid");
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });

  const inp: React.CSSProperties = { background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "9px 14px", color: "#f1f5f9", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ background: "#0a1628", minHeight: "100vh", padding: "28px 32px", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#f1f5f9" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Payroll</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>Process salaries, generate payslips & export reports</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={month} onChange={e => handleMonthChange(e.target.value)} style={{ ...inp, paddingRight: 32, minWidth: 200 }}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={() => exportBulkPDF(selected.length > 0 ? selected : visibleEntries, month)}
            style={{ padding: "9px 18px", background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 10, color: "#818cf8", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
            📄 Export PDF
          </button>
          <button onClick={runPayroll} disabled={runStatus === "running" || selected.length === 0}
            style={{ padding: "9px 22px", background: runStatus === "running" ? "rgba(45,212,191,0.08)" : allPaid ? "rgba(52,211,153,0.12)" : "linear-gradient(135deg,#2dd4bf,#0ea5e9)", border: runStatus === "running" || allPaid ? "1px solid rgba(45,212,191,0.3)" : "none", borderRadius: 10, color: allPaid ? "#34d399" : "#0f172a", cursor: selected.length === 0 ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap", opacity: selected.length === 0 ? 0.5 : 1 }}>
            {runStatus === "running" ? "⏳ Processing…" : allPaid ? "✓ All Paid" : `▶ Run Payroll (${selected.length})`}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Selected Employees", value: selected.length + " / " + entries.length, accent: "#2dd4bf", icon: "👥" },
          { label: "Total Gross", value: "PKR " + fmt(totalGross), accent: "#34d399", icon: "💵" },
          { label: "Total Deductions", value: "PKR " + fmt(totalDed), accent: "#f87171", icon: "📉" },
          { label: "Total Net Payable", value: "PKR " + fmt(totalNet), accent: "#818cf8", icon: "💰" },
        ].map(c => (
          <div key={c.label} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 0% 100%, ${c.accent}18 0%, transparent 60%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 5, fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: 3, gap: 2 }}>
          {(["all", "active", "inactive"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === f ? "rgba(45,212,191,0.12)" : "none", color: filter === f ? "#2dd4bf" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: filter === f ? 700 : 500, textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...inp, fontSize: 12 }}>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>
          Showing {visibleEntries.length} employees · {monthLabel}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 220px 110px 60px 60px 60px 60px 120px 120px 130px 100px 80px", gap: 0, padding: "10px 16px", borderBottom: "1px solid #1e2d45", background: "#0d1526" }}>
          {[
            <input key="chk" type="checkbox" checked={visibleEntries.length > 0 && visibleEntries.every(e => e.selected)} onChange={toggleAll} style={{ cursor: "pointer", accentColor: "#2dd4bf" }} />,
            "Employee", "Department", "Work Days", "Present", "Absent", "OT Hrs", "Gross", "Deductions", "Net Pay", "Status", "Action"
          ].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {visibleEntries.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#475569" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
            <div>No employees match this filter</div>
          </div>
        ) : visibleEntries.map((entry, idx) => (
          <div key={entry.emp.id} style={{
            display: "grid", gridTemplateColumns: "40px 220px 110px 60px 60px 60px 60px 120px 120px 130px 100px 80px",
            gap: 0, padding: "11px 16px",
            borderBottom: idx < visibleEntries.length - 1 ? "1px solid #0f1c30" : "none",
            background: entry.selected ? "rgba(45,212,191,0.03)" : "transparent",
            transition: "background 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input type="checkbox" checked={entry.selected} onChange={() => toggleSelect(entry.emp.id)} style={{ cursor: "pointer", accentColor: "#2dd4bf" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar emp={entry.emp} size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.2 }}>{entry.emp.firstName} {entry.emp.lastName}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{entry.emp.code}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center" }}>{entry.emp.department}</div>
            {[
              [entry.workingDays, "#94a3b8"],
              [entry.presentDays, "#34d399"],
              [entry.absentDays, entry.absentDays > 0 ? "#f87171" : "#64748b"],
              [entry.overtimeHours, "#818cf8"],
            ].map(([v, c]: any, i) => (
              <div key={i} style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{v}</div>
            ))}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{fmt(entry.grossSalary)}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>−{fmt(entry.totalDeductions)}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#2dd4bf", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{fmt(entry.netSalary)}</div>
            <div style={{ display: "flex", alignItems: "center" }}><StatusBadge status={entry.status} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setViewEntry(entry)}
                style={{ padding: "5px 10px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 7, color: "#818cf8", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                View
              </button>
              <button onClick={() => printPayslip(entry, month)}
                style={{ padding: "5px 10px", background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 7, color: "#2dd4bf", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                PDF
              </button>
            </div>
          </div>
        ))}

        {/* Footer totals */}
        {visibleEntries.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "40px 220px 110px 60px 60px 60px 60px 120px 120px 130px 100px 80px", gap: 0, padding: "12px 16px", borderTop: "2px solid #1e2d45", background: "#0d1526" }}>
            <div /><div /><div />
            <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>—</div>
            <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>—</div>
            <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>—</div>
            <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>—</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#34d399", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{fmt(visibleEntries.reduce((s, e) => s + e.grossSalary, 0))}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f87171", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>−{fmt(visibleEntries.reduce((s, e) => s + e.totalDeductions, 0))}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#2dd4bf", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center" }}>{fmt(visibleEntries.reduce((s, e) => s + e.netSalary, 0))}</div>
            <div style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>Total</div>
            <div />
          </div>
        )}
      </div>

      {/* ── Payslip Modal ── */}
      {viewEntry && <PayslipModal entry={viewEntry} month={month} onClose={() => setViewEntry(null)} />}
    </div>
  );
}

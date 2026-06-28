// @ts-nocheck
import { useState } from "react";

// ─── Pakistan Income Tax Slabs 2024-25 ───────────────────────────────────────
const TAX_SLABS = [
  { min: 0,       max: 600000,   rate: 0,    fixed: 0 },
  { min: 600001,  max: 1200000,  rate: 0.05, fixed: 0 },
  { min: 1200001, max: 2200000,  rate: 0.15, fixed: 30000 },
  { min: 2200001, max: 3200000,  rate: 0.25, fixed: 180000 },
  { min: 3200001, max: 4100000,  rate: 0.30, fixed: 430000 },
  { min: 4100001, max: Infinity, rate: 0.35, fixed: 700000 },
];

const calcPakistanTax = (annualIncome) => {
  for (const slab of TAX_SLABS) {
    if (annualIncome >= slab.min && annualIncome <= slab.max) {
      const taxable = annualIncome - slab.min;
      return Math.round((slab.fixed + taxable * slab.rate) / 12);
    }
  }
  return 0;
};

// ─── Types ────────────────────────────────────────────────────────────────────
const DEFAULT_SALARY = (basic = 0) => ({
  basicSalary: basic, houseRent: 45, medicalAllowance: 3000,
  transportAllowance: 2000, otherAllowances: 0,
  eobi: 370, sessi: 0, incomeTax: 0, loanDeduction: 0, otherDeductions: 0,
  houseRentType: "percent", sessiPercent: 0,
  bankName: "", bankAccount: "", taxExempt: false,
});

// ─── Mock Employees ───────────────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
  { id: 1, code: "EMP-001", firstName: "Zara", lastName: "Ahmed", department: "Engineering", designation: "Senior Developer", salary: 120000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "OT-1.5x", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(120000), houseRent: 45, medicalAllowance: 5000, transportAllowance: 3000, eobi: 370, incomeTax: 8500, bankName: "Meezan Bank", bankAccount: "01230123456789" } },
  { id: 2, code: "EMP-002", firstName: "Hassan", lastName: "Malik", department: "HR", designation: "HR Manager", salary: 95000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "OT-1.5x", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(95000), medicalAllowance: 4000, transportAllowance: 2500, eobi: 370, incomeTax: 5200, bankName: "HBL", bankAccount: "06060606060606" } },
  { id: 3, code: "EMP-003", firstName: "Ayesha", lastName: "Khan", department: "Finance", designation: "Finance Analyst", salary: 85000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "No Overtime", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(85000), medicalAllowance: 3500, transportAllowance: 2000, eobi: 370, incomeTax: 3800, bankName: "UBL", bankAccount: "09870987098709" } },
  { id: 4, code: "EMP-004", firstName: "Omar", lastName: "Farooq", department: "Engineering", designation: "Backend Engineer", salary: 105000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "OT-1.5x", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(105000), medicalAllowance: 4500, transportAllowance: 2500, eobi: 370, incomeTax: 7000, bankName: "MCB", bankAccount: "11110011111100" } },
  { id: 5, code: "EMP-005", firstName: "Sana", lastName: "Baig", department: "Marketing", designation: "Marketing Lead", salary: 90000, status: "active", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "OT-1.5x", employmentType: "Permanent" }, salaryStructure: { ...DEFAULT_SALARY(90000), medicalAllowance: 4000, transportAllowance: 2000, eobi: 370, incomeTax: 4500, bankName: "Allied Bank", bankAccount: "55005500550055" } },
  { id: 6, code: "EMP-006", firstName: "Bilal", lastName: "Siddiqui", department: "Operations", designation: "Ops Executive", salary: 65000, status: "inactive", photo: null, workCode: { payClass: "Monthly Salaried", overtimeClass: "No Overtime", employmentType: "Contractual" }, salaryStructure: { ...DEFAULT_SALARY(65000), eobi: 370, bankName: "Bank Alfalah", bankAccount: "66006600660066" } },
];

// ─── Mock Loans ───────────────────────────────────────────────────────────────
const INIT_LOANS = [
  { id: 1, empId: 1, empName: "Zara Ahmed", empCode: "EMP-001", type: "Personal Loan", principal: 200000, remaining: 120000, monthlyInstallment: 10000, startDate: "2024-06-01", endDate: "2025-11-01", status: "active", purpose: "Home renovation" },
  { id: 2, empId: 4, empName: "Omar Farooq", empCode: "EMP-004", type: "Emergency Loan", principal: 50000, remaining: 25000, monthlyInstallment: 5000, startDate: "2025-01-01", endDate: "2025-10-01", status: "active", purpose: "Medical emergency" },
  { id: 3, empId: 2, empName: "Hassan Malik", empCode: "EMP-002", type: "Personal Loan", principal: 100000, remaining: 0, monthlyInstallment: 10000, startDate: "2024-01-01", endDate: "2024-10-01", status: "completed", purpose: "Education" },
];

// ─── Mock Bonuses ─────────────────────────────────────────────────────────────
const INIT_BONUSES = [
  { id: 1, empId: 1, empName: "Zara Ahmed", empCode: "EMP-001", type: "Performance", amount: 25000, month: "2025-06", reason: "Excellent Q2 performance", status: "approved" },
  { id: 2, empId: 2, empName: "Hassan Malik", empCode: "EMP-002", type: "Eid Bonus", amount: 15000, month: "2025-06", reason: "Eid ul Adha bonus", status: "approved" },
  { id: 3, empId: 3, empName: "Ayesha Khan", empCode: "EMP-003", type: "Incentive", amount: 10000, month: "2025-06", reason: "Project completion incentive", status: "pending" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PKR = (n) => "PKR " + Number(n).toLocaleString();
const fmt = (n) => Number(n).toLocaleString();

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2025, i, 1);
  return { value: `2025-${String(i + 1).padStart(2, "0")}`, label: d.toLocaleString("en-PK", { month: "long", year: "numeric" }) };
}).reverse();

const Avatar = ({ emp, size = 36 }) => {
  const colors = ["#2dd4bf", "#f59e0b", "#818cf8", "#fb7185", "#34d399", "#60a5fa"];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[emp.id % colors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
      {emp.firstName[0]}{emp.lastName[0]}
    </div>
  );
};

// ─── Payroll Calculation ──────────────────────────────────────────────────────
const calcEntry = (emp, month, bonuses, loans) => {
  const s = emp.salaryStructure;
  const att = { workingDays: 26, presentDays: 26, absentDays: 0, lateDays: 0, overtimeHours: 0 };
  const basic = s.basicSalary || emp.salary;
  const houseRent = s.houseRentType === "percent" ? Math.round(basic * s.houseRent / 100) : s.houseRent;
  const annualIncome = (basic + houseRent + s.medicalAllowance + s.transportAllowance + s.otherAllowances) * 12;
  const autoTax = s.taxExempt ? 0 : calcPakistanTax(annualIncome);
  const empBonus = bonuses.filter(b => b.empId === emp.id && b.month === month && b.status === "approved").reduce((s, b) => s + b.amount, 0);
  const empLoan = loans.filter(l => l.empId === emp.id && l.status === "active").reduce((s, l) => s + l.monthlyInstallment, 0);
  const grossSalary = basic + houseRent + s.medicalAllowance + s.transportAllowance + s.otherAllowances + empBonus;
  const totalDeductions = s.eobi + autoTax + empLoan + s.otherDeductions;
  return {
    emp, ...att, basicSalary: basic, houseRent,
    medicalAllowance: s.medicalAllowance, transportAllowance: s.transportAllowance,
    otherAllowances: s.otherAllowances, bonus: empBonus, loanDeduction: empLoan,
    grossSalary, eobi: s.eobi, incomeTax: autoTax,
    totalDeductions, netSalary: grossSalary - totalDeductions,
    annualIncome, status: "pending", selected: emp.status === "active",
  };
};

// ─── PDF Payslip Generator ────────────────────────────────────────────────────
const printPayslip = (entry, month) => {
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
  const today = new Date().toLocaleDateString("en-PK");
  const annualTax = entry.incomeTax * 12;
  let taxSlab = "Exempt";
  for (const s of TAX_SLABS) {
    if (entry.annualIncome >= s.min && entry.annualIncome <= s.max) {
      taxSlab = s.rate === 0 ? "0% (Below threshold)" : `${s.rate * 100}% slab`;
      break;
    }
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip - ${entry.emp.firstName} ${entry.emp.lastName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;font-size:13px}
.page{width:794px;min-height:1123px;margin:0 auto;padding:40px 48px}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #0f172a;margin-bottom:24px}
.logo{display:flex;align-items:center;gap:12px}
.logo-box{width:46px;height:46px;background:#0f172a;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#2dd4bf;font-size:22px;font-weight:900}
.company-name{font-size:18px;font-weight:800;color:#0f172a}
.company-sub{font-size:11px;color:#64748b;margin-top:2px}
.slip-right{text-align:right}
.slip-right h1{font-size:20px;font-weight:800;color:#0f172a}
.slip-right .month{font-size:13px;color:#2dd4bf;font-weight:700;margin-top:3px}
.emp-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:20px}
.field label{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8}
.field .val{font-size:13px;font-weight:600;color:#1e293b;margin-top:2px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.section h3{font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
table{width:100%;border-collapse:collapse}
table tr td{padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
table tr:last-child td{border-bottom:none}
table td:last-child{text-align:right;font-weight:600;font-family:'Courier New',monospace}
.green{color:#16a34a}.red{color:#dc2626}.blue{color:#2563eb}
.subtotal td{background:#f8fafc;font-weight:700!important;padding:8px 0!important}
.tax-box{background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px}
.tax-box .tax-title{font-weight:700;color:#92400e;margin-bottom:6px}
.tax-row{display:flex;justify-content:space-between;color:#78350f;margin-top:3px}
.net-box{background:#0f172a;border-radius:12px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;margin-top:4px}
.net-label{color:#94a3b8;font-size:13px;font-weight:600}
.net-amt{color:#2dd4bf;font-size:24px;font-weight:900;font-family:'Courier New',monospace}
.footer{margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between}
.sig .line{width:150px;border-bottom:1px solid #0f172a;margin-bottom:5px}
.sig .lbl{font-size:11px;color:#64748b;font-weight:600}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
<div class="header">
  <div class="logo"><div class="logo-box">S</div><div><div class="company-name">Smart Office OS</div><div class="company-sub">SOOS Pvt. Ltd. · Karachi, Pakistan</div></div></div>
  <div class="slip-right"><h1>SALARY SLIP</h1><div class="month">${monthLabel}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px">Issued: ${today}</div></div>
</div>
<div class="emp-grid">
  <div class="field"><label>Employee Name</label><div class="val">${entry.emp.firstName} ${entry.emp.lastName}</div></div>
  <div class="field"><label>Employee Code</label><div class="val">${entry.emp.code}</div></div>
  <div class="field"><label>Designation</label><div class="val">${entry.emp.designation}</div></div>
  <div class="field"><label>Department</label><div class="val">${entry.emp.department}</div></div>
  <div class="field"><label>Pay Class</label><div class="val">${entry.emp.workCode.payClass}</div></div>
  <div class="field"><label>Employment Type</label><div class="val">${entry.emp.workCode.employmentType}</div></div>
</div>
<div class="two-col">
  <div class="section"><h3>💵 Earnings</h3><table>
    <tr><td>Basic Salary</td><td class="green">+${fmt(entry.basicSalary)}</td></tr>
    <tr><td>House Rent Allowance</td><td class="green">+${fmt(entry.houseRent)}</td></tr>
    <tr><td>Medical Allowance</td><td class="green">+${fmt(entry.medicalAllowance)}</td></tr>
    <tr><td>Transport Allowance</td><td class="green">+${fmt(entry.transportAllowance)}</td></tr>
    ${entry.otherAllowances > 0 ? `<tr><td>Other Allowances</td><td class="green">+${fmt(entry.otherAllowances)}</td></tr>` : ""}
    ${entry.bonus > 0 ? `<tr><td>Bonus / Incentive</td><td class="green">+${fmt(entry.bonus)}</td></tr>` : ""}
    <tr class="subtotal"><td>Gross Salary</td><td class="green">${fmt(entry.grossSalary)}</td></tr>
  </table></div>
  <div class="section"><h3>📉 Deductions</h3><table>
    ${entry.eobi > 0 ? `<tr><td>EOBI</td><td class="red">-${fmt(entry.eobi)}</td></tr>` : ""}
    ${entry.incomeTax > 0 ? `<tr><td>Income Tax (${taxSlab})</td><td class="red">-${fmt(entry.incomeTax)}</td></tr>` : ""}
    ${entry.loanDeduction > 0 ? `<tr><td>Loan Installment</td><td class="red">-${fmt(entry.loanDeduction)}</td></tr>` : ""}
    ${entry.totalDeductions === 0 ? `<tr><td style="color:#94a3b8">No deductions</td><td>—</td></tr>` : ""}
    <tr class="subtotal"><td>Total Deductions</td><td class="red">-${fmt(entry.totalDeductions)}</td></tr>
  </table></div>
</div>
<div class="tax-box">
  <div class="tax-title">🧾 Pakistan Income Tax Calculation (FBR 2024-25)</div>
  <div class="tax-row"><span>Annual Taxable Income</span><span>PKR ${fmt(entry.annualIncome)}</span></div>
  <div class="tax-row"><span>Tax Slab</span><span>${taxSlab}</span></div>
  <div class="tax-row"><span>Annual Tax</span><span>PKR ${fmt(annualTax)}</span></div>
  <div class="tax-row" style="font-weight:700;margin-top:4px"><span>Monthly Tax Deduction</span><span>PKR ${fmt(entry.incomeTax)}</span></div>
</div>
${entry.loanDeduction > 0 ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px"><div style="font-weight:700;color:#1e40af;margin-bottom:4px">🏦 Loan Deduction Detail</div><div style="color:#1d4ed8">Monthly Installment: PKR ${fmt(entry.loanDeduction)}</div></div>` : ""}
<div class="net-box">
  <div><div class="net-label">💰 Net Take-Home Pay</div><div style="color:#64748b;font-size:11px;margin-top:3px">${monthLabel}</div></div>
  <div class="net-amt">PKR ${fmt(entry.netSalary)}</div>
</div>
${entry.emp.salaryStructure.bankName ? `<div style="display:flex;gap:20px;margin-top:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px"><div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase">Bank</div><div style="font-size:13px;font-weight:600;margin-top:2px">${entry.emp.salaryStructure.bankName}</div></div><div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase">Account</div><div style="font-size:13px;font-weight:600;margin-top:2px;font-family:'Courier New',monospace">${entry.emp.salaryStructure.bankAccount}</div></div></div>` : ""}
<div class="footer">
  <div class="sig"><div class="line"></div><div class="lbl">Employee Signature</div></div>
  <div style="font-size:11px;color:#94a3b8;text-align:center">Generated by Smart Office OS · ${today}</div>
  <div class="sig"><div class="line"></div><div class="lbl">HR / Accounts</div></div>
</div>
</div></body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};

// ─── Tax Calculator Component ─────────────────────────────────────────────────
const TaxCalculator = ({ onClose }) => {
  const [income, setIncome] = useState("");
  const annual = Number(income) * 12;
  const monthlyTax = calcPakistanTax(annual);
  const annualTax = monthlyTax * 12;
  const effective = annual > 0 ? ((annualTax / annual) * 100).toFixed(2) : 0;
  let slab = TAX_SLABS[0];
  for (const s of TAX_SLABS) { if (annual >= s.min && annual <= s.max) { slab = s; break; } }

  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', fontFamily: 'monospace' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 520, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>🧾 Pakistan Tax Calculator</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>Monthly Basic Salary (PKR)</div>
        <input type="number" value={income} onChange={e => setIncome(e.target.value)} style={inp} placeholder="e.g. 120000" />
        {annual > 0 && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#131c2e', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>FBR 2024-25 Calculation</div>
              {[
                ['Annual Income', `PKR ${fmt(annual)}`, '#f1f5f9'],
                ['Tax Slab', slab.rate === 0 ? '0% — Below threshold' : `${slab.rate * 100}% slab`, '#fbbf24'],
                ['Annual Tax', `PKR ${fmt(annualTax)}`, '#f87171'],
                ['Monthly Deduction', `PKR ${fmt(monthlyTax)}`, '#f87171'],
                ['Effective Rate', `${effective}%`, '#818cf8'],
                ['Net Monthly (approx)', `PKR ${fmt(Number(income) - monthlyTax)}`, '#34d399'],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #0f1c30' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: 'monospace' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#131c2e', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>ALL TAX SLABS (FBR 2024-25)</div>
              {TAX_SLABS.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: annual >= s.min && annual <= s.max ? '#2dd4bf' : '#475569', fontWeight: annual >= s.min && annual <= s.max ? 700 : 400 }}>
                  <span>PKR {fmt(s.min)} – {s.max === Infinity ? 'Above' : fmt(s.max)}</span>
                  <span>{s.rate * 100}%{s.fixed > 0 ? ` + ${fmt(s.fixed)} fixed` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Loan Management Component ────────────────────────────────────────────────
const LoanModal = ({ loans, setLoans, onClose }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ empId: 1, type: 'Personal Loan', principal: '', monthlyInstallment: '', startDate: '', endDate: '', purpose: '' });

  const empOptions = MOCK_EMPLOYEES.filter(e => e.status === 'active');
  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' };
  const lbl = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

  const addLoan = () => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === Number(form.empId));
    setLoans(p => [...p, { ...form, id: Date.now(), empId: Number(form.empId), empName: `${emp.firstName} ${emp.lastName}`, empCode: emp.code, principal: Number(form.principal), remaining: Number(form.principal), monthlyInstallment: Number(form.monthlyInstallment), status: 'active' }]);
    setShowAdd(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>🏦 Loan Management</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>+ New Loan</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
        </div>

        {showAdd && (
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2dd4bf', marginBottom: 12 }}>New Loan Application</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Employee</label>
                <select value={form.empId} onChange={e => setForm(p => ({ ...p, empId: e.target.value }))} style={inp}>
                  {empOptions.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.code})</option>)}
                </select>
              </div>
              <div><label style={lbl}>Loan Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  {['Personal Loan', 'Emergency Loan', 'Home Loan', 'Vehicle Loan', 'Education Loan'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Principal Amount (PKR)</label><input type="number" value={form.principal} onChange={e => setForm(p => ({ ...p, principal: e.target.value }))} style={inp} placeholder="100000" /></div>
              <div><label style={lbl}>Monthly Installment (PKR)</label><input type="number" value={form.monthlyInstallment} onChange={e => setForm(p => ({ ...p, monthlyInstallment: e.target.value }))} style={inp} placeholder="10000" /></div>
              <div><label style={lbl}>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} style={inp} /></div>
              <div><label style={lbl}>End Date</label><input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} style={inp} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Purpose</label><input value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} style={inp} placeholder="Loan purpose..." /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 8, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={addLoan} style={{ flex: 2, padding: 8, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Save Loan</button>
            </div>
          </div>
        )}

        {loans.map(l => (
          <div key={l.id} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{l.empName} <span style={{ fontSize: 12, color: '#64748b' }}>({l.empCode})</span></div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{l.type} · {l.purpose}</div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: l.status === 'active' ? 'rgba(45,212,191,0.12)' : 'rgba(52,211,153,0.12)', color: l.status === 'active' ? '#2dd4bf' : '#34d399', fontSize: 11, fontWeight: 700 }}>
                {l.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
              {[['Principal', PKR(l.principal), '#f1f5f9'], ['Remaining', PKR(l.remaining), '#f87171'], ['Monthly', PKR(l.monthlyInstallment), '#fbbf24'], ['Status', `${l.startDate} → ${l.endDate}`, '#64748b']].map(([k, v, c]) => (
                <div key={k} style={{ background: '#0d1526', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 12, color: c, fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            {l.status === 'active' && (
              <div style={{ marginTop: 10 }}>
                <div style={{ height: 4, background: '#0d1526', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${((l.principal - l.remaining) / l.principal) * 100}%`, background: '#2dd4bf', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{Math.round(((l.principal - l.remaining) / l.principal) * 100)}% repaid</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Bonus Management Component ───────────────────────────────────────────────
const BonusModal = ({ bonuses, setBonuses, month, onClose }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ empId: 1, type: 'Performance', amount: '', reason: '', status: 'pending' });
  const inp = { background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', fontFamily: 'inherit' };
  const lbl = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 4 };

  const addBonus = () => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === Number(form.empId));
    setBonuses(p => [...p, { ...form, id: Date.now(), empId: Number(form.empId), empName: `${emp.firstName} ${emp.lastName}`, empCode: emp.code, amount: Number(form.amount), month }]);
    setShowAdd(false);
  };

  const STATUS_COL = { approved: '#34d399', pending: '#fbbf24', rejected: '#f87171' };
  const monthBonuses = bonuses.filter(b => b.month === month);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#0d1526', border: '1px solid #1e2d45', borderRadius: 20, width: 640, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>🎁 Bonus & Incentives</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>+ Add Bonus</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>
        </div>

        {showAdd && (
          <div style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={lbl}>Employee</label>
                <select value={form.empId} onChange={e => setForm(p => ({ ...p, empId: e.target.value }))} style={inp}>
                  {MOCK_EMPLOYEES.filter(e => e.status === 'active').map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Bonus Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                  {['Performance', 'Eid Bonus', 'Incentive', 'Annual Bonus', 'Project Bonus', 'Referral'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Amount (PKR)</label><input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={inp} placeholder="25000" /></div>
              <div><label style={lbl}>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inp}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Reason</label><input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={inp} placeholder="Reason for bonus..." /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d45', borderRadius: 8, color: '#64748b', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={addBonus} style={{ flex: 2, padding: 8, background: 'linear-gradient(135deg,#2dd4bf,#0ea5e9)', border: 'none', borderRadius: 8, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        )}

        {monthBonuses.length === 0 && <div style={{ textAlign: 'center', color: '#475569', padding: '32px 0' }}>No bonuses for this month</div>}
        {monthBonuses.map(b => (
          <div key={b.id} style={{ background: '#131c2e', border: '1px solid #1e2d45', borderRadius: 12, padding: '14px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{b.empName}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{b.type} · {b.reason}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>PKR {fmt(b.amount)}</div>
              <select value={b.status} onChange={e => setBonuses(p => p.map(x => x.id === b.id ? { ...x, status: e.target.value } : x))}
                style={{ background: STATUS_COL[b.status] + '20', border: `1px solid ${STATUS_COL[b.status]}50`, borderRadius: 8, padding: '4px 8px', color: STATUS_COL[b.status], fontWeight: 700, fontSize: 11, cursor: 'pointer', outline: 'none' }}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button onClick={() => setBonuses(p => p.filter(x => x.id !== b.id))} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, color: '#f87171', cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = { pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Pending" }, processing: { bg: "rgba(129,140,248,0.12)", color: "#818cf8", label: "Processing" }, paid: { bg: "rgba(52,211,153,0.12)", color: "#34d399", label: "Paid" } };
  const s = map[status] || map.pending;
  return <span style={{ padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700 }}>● {s.label}</span>;
};

// ─── Main PayrollPage ─────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [month, setMonth] = useState(MONTHS[0].value);
  const [loans, setLoans] = useState(INIT_LOANS);
  const [bonuses, setBonuses] = useState(INIT_BONUSES);
  const [entries, setEntries] = useState(() => MOCK_EMPLOYEES.map(e => calcEntry(e, MONTHS[0].value, INIT_BONUSES, INIT_LOANS)));
  const [runStatus, setRunStatus] = useState("idle");
  const [showTax, setShowTax] = useState(false);
  const [showLoans, setShowLoans] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [deptFilter, setDeptFilter] = useState("All");

  const handleMonthChange = (m) => {
    setMonth(m);
    setEntries(MOCK_EMPLOYEES.map(e => calcEntry(e, m, bonuses, loans)));
    setRunStatus("idle");
  };

  const toggleSelect = (id) => setEntries(es => es.map(e => e.emp.id === id ? { ...e, selected: !e.selected } : e));
  const toggleAll = () => { const all = visibleEntries.every(e => e.selected); const ids = new Set(visibleEntries.map(e => e.emp.id)); setEntries(es => es.map(e => ids.has(e.emp.id) ? { ...e, selected: !all } : e)); };

  const runPayroll = () => {
    const ids = new Set(entries.filter(e => e.selected).map(e => e.emp.id));
    if (!ids.size) return;
    setRunStatus("running");
    setEntries(es => es.map(e => ids.has(e.emp.id) ? { ...e, status: "processing" } : e));
    setTimeout(() => { setEntries(es => es.map(e => ids.has(e.emp.id) ? { ...e, status: "paid" } : e)); setRunStatus("done"); }, 1800);
  };

  const departments = ["All", ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)))];
  const visibleEntries = entries.filter(e => deptFilter === "All" || e.emp.department === deptFilter);
  const selected = entries.filter(e => e.selected);
  const totalGross = selected.reduce((s, e) => s + e.grossSalary, 0);
  const totalDed = selected.reduce((s, e) => s + e.totalDeductions, 0);
  const totalNet = selected.reduce((s, e) => s + e.netSalary, 0);
  const totalBonus = selected.reduce((s, e) => s + e.bonus, 0);
  const monthLabel = new Date(month + "-01").toLocaleString("en-PK", { month: "long", year: "numeric" });
  const inp = { background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 10, padding: "9px 14px", color: "#f1f5f9", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ background: "#0a1628", minHeight: "100vh", padding: "28px 32px", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>Payroll</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>Salaries · Tax · Bonuses · Loans · Payslips</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <select value={month} onChange={e => handleMonthChange(e.target.value)} style={{ ...inp, minWidth: 180 }}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={() => setShowTax(true)} style={{ padding: "9px 14px", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, color: "#fbbf24", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🧾 Tax Calc</button>
          <button onClick={() => setShowLoans(true)} style={{ padding: "9px 14px", background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 10, color: "#60a5fa", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🏦 Loans</button>
          <button onClick={() => setShowBonuses(true)} style={{ padding: "9px 14px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, color: "#34d399", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🎁 Bonuses</button>
          <button onClick={runPayroll} disabled={runStatus === "running" || selected.length === 0}
            style={{ padding: "9px 20px", background: runStatus === "done" ? "rgba(52,211,153,0.12)" : "linear-gradient(135deg,#2dd4bf,#0ea5e9)", border: runStatus === "done" ? "1px solid rgba(52,211,153,0.3)" : "none", borderRadius: 10, color: runStatus === "done" ? "#34d399" : "#0f172a", cursor: selected.length === 0 ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 13, opacity: selected.length === 0 ? 0.5 : 1 }}>
            {runStatus === "running" ? "⏳ Processing…" : runStatus === "done" ? "✓ All Paid" : `▶ Run Payroll (${selected.length})`}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Employees", value: `${selected.length}/${entries.length}`, color: "#2dd4bf", icon: "👥" },
          { label: "Total Gross", value: PKR(totalGross), color: "#34d399", icon: "💵" },
          { label: "Tax Deducted", value: PKR(selected.reduce((s, e) => s + e.incomeTax, 0)), color: "#fbbf24", icon: "🧾" },
          { label: "Total Bonus", value: PKR(totalBonus), color: "#818cf8", icon: "🎁" },
          { label: "Net Payable", value: PKR(totalNet), color: "#2dd4bf", icon: "💰" },
        ].map(c => (
          <div key={c.label} style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 14, padding: "16px 18px", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 0% 100%, ${c.color}15 0%, transparent 60%)` }} />
            <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c.color, fontFamily: "monospace", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ ...inp, fontSize: 12 }}>
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <div style={{ fontSize: 12, color: "#475569", marginLeft: "auto" }}>{visibleEntries.length} employees · {monthLabel}</div>
      </div>

      {/* Table */}
      <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 200px 100px 80px 80px 100px 100px 120px 90px 100px", padding: "10px 16px", borderBottom: "1px solid #1e2d45", background: "#0d1526" }}>
          {["", "Employee", "Dept", "Basic", "Bonus", "Gross", "Tax", "Net Pay", "Status", "Action"].map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>

        {visibleEntries.map((entry, idx) => (
          <div key={entry.emp.id} style={{ display: "grid", gridTemplateColumns: "36px 200px 100px 80px 80px 100px 100px 120px 90px 100px", padding: "10px 16px", borderBottom: idx < visibleEntries.length - 1 ? "1px solid #0f1c30" : "none", background: entry.selected ? "rgba(45,212,191,0.03)" : "transparent", alignItems: "center" }}>
            <input type="checkbox" checked={entry.selected} onChange={() => toggleSelect(entry.emp.id)} style={{ cursor: "pointer", accentColor: "#2dd4bf" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar emp={entry.emp} size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{entry.emp.firstName} {entry.emp.lastName}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{entry.emp.code}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{entry.emp.department}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "monospace" }}>{fmt(entry.basicSalary)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: entry.bonus > 0 ? "#818cf8" : "#475569", fontFamily: "monospace" }}>{entry.bonus > 0 ? `+${fmt(entry.bonus)}` : "—"}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#34d399", fontFamily: "monospace" }}>{fmt(entry.grossSalary)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: entry.incomeTax > 0 ? "#fbbf24" : "#475569", fontFamily: "monospace" }}>{entry.incomeTax > 0 ? `-${fmt(entry.incomeTax)}` : "—"}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2dd4bf", fontFamily: "monospace" }}>{fmt(entry.netSalary)}</div>
            <StatusBadge status={entry.status} />
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setViewEntry(entry)} style={{ padding: "4px 8px", background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 6, color: "#818cf8", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>View</button>
              <button onClick={() => printPayslip(entry, month)} style={{ padding: "4px 8px", background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 6, color: "#2dd4bf", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>PDF</button>
            </div>
          </div>
        ))}

        {/* Footer totals */}
        <div style={{ display: "grid", gridTemplateColumns: "36px 200px 100px 80px 80px 100px 100px 120px 90px 100px", padding: "10px 16px", borderTop: "2px solid #1e2d45", background: "#0d1526" }}>
          <div /><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>TOTAL ({visibleEntries.length})</div>
          <div /><div />
          <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", fontFamily: "monospace" }}>+{fmt(visibleEntries.reduce((s, e) => s + e.bonus, 0))}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#34d399", fontFamily: "monospace" }}>{fmt(visibleEntries.reduce((s, e) => s + e.grossSalary, 0))}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", fontFamily: "monospace" }}>-{fmt(visibleEntries.reduce((s, e) => s + e.incomeTax, 0))}</div>
          <div style={{ fontSize: 13, fontWeight: 900, color: "#2dd4bf", fontFamily: "monospace" }}>{fmt(visibleEntries.reduce((s, e) => s + e.netSalary, 0))}</div>
          <div /><div />
        </div>
      </div>

      {/* Payslip View Modal */}
      {viewEntry && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setViewEntry(null)}>
          <div style={{ background: "#0d1526", border: "1px solid #1e2d45", borderRadius: 20, width: 520, maxHeight: "92vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #1e2d45" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar emp={viewEntry.emp} size={42} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{viewEntry.emp.firstName} {viewEntry.emp.lastName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{viewEntry.emp.code} · {monthLabel}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => printPayslip(viewEntry, month)} style={{ padding: "7px 14px", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)", borderRadius: 8, color: "#2dd4bf", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>🖨 Print PDF</button>
                <button onClick={() => setViewEntry(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Earnings */}
              <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginBottom: 10 }}>💵 Earnings</div>
                {[["Basic Salary", viewEntry.basicSalary, "#2dd4bf"], ["House Rent", viewEntry.houseRent, "#34d399"], ["Medical", viewEntry.medicalAllowance, "#60a5fa"], ["Transport", viewEntry.transportAllowance, "#a78bfa"], ...(viewEntry.bonus > 0 ? [["Bonus", viewEntry.bonus, "#818cf8"]] : [])].map(([k, v, c]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0f1c30" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{k}</span>
                    <span style={{ fontSize: 13, color: c, fontWeight: 700, fontFamily: "monospace" }}>+{fmt(v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 2px" }}>
                  <span style={{ fontWeight: 700, color: "#34d399" }}>Gross</span>
                  <span style={{ fontWeight: 800, color: "#34d399", fontFamily: "monospace" }}>{fmt(viewEntry.grossSalary)}</span>
                </div>
              </div>
              {/* Tax */}
              <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", marginBottom: 8 }}>🧾 Pakistan Income Tax (FBR 2024-25)</div>
                <div style={{ fontSize: 12, color: "#d97706" }}>Annual Income: PKR {fmt(viewEntry.annualIncome)}</div>
                <div style={{ fontSize: 12, color: "#d97706", marginTop: 2 }}>Monthly Tax: PKR {fmt(viewEntry.incomeTax)}</div>
              </div>
              {/* Deductions */}
              <div style={{ background: "#131c2e", border: "1px solid #1e2d45", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase", marginBottom: 10 }}>📉 Deductions</div>
                {[...(viewEntry.eobi > 0 ? [["EOBI", viewEntry.eobi]] : []), ...(viewEntry.incomeTax > 0 ? [["Income Tax", viewEntry.incomeTax]] : []), ...(viewEntry.loanDeduction > 0 ? [["Loan Installment", viewEntry.loanDeduction]] : [])].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0f1c30" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{k}</span>
                    <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700, fontFamily: "monospace" }}>−{fmt(v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 2px" }}>
                  <span style={{ fontWeight: 700, color: "#f87171" }}>Total</span>
                  <span style={{ fontWeight: 800, color: "#f87171", fontFamily: "monospace" }}>−{fmt(viewEntry.totalDeductions)}</span>
                </div>
              </div>
              {/* Net */}
              <div style={{ background: "linear-gradient(135deg,rgba(45,212,191,0.1),rgba(14,165,233,0.1))", border: "1px solid rgba(45,212,191,0.25)", borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>💰 Net Take-Home</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#2dd4bf", fontFamily: "monospace" }}>PKR {fmt(viewEntry.netSalary)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTax && <TaxCalculator onClose={() => setShowTax(false)} />}
      {showLoans && <LoanModal loans={loans} setLoans={setLoans} onClose={() => setShowLoans(false)} />}
      {showBonuses && <BonusModal bonuses={bonuses} setBonuses={setBonuses} month={month} onClose={() => setShowBonuses(false)} />}
    </div>
  );
}

import React from 'react';
import { Award, UserCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HrmStaffPage: React.FC = () => {
  const { metrics } = useStore();

  const staffMembers = [
    { name: "MD Nazmul Hasan", role: "Managing Director", dept: "Executive Management", baseSalary: 120000, commission: 0, status: "Active" },
    { name: "Tanvir Ahmed", role: "Senior Sales & Inventory Lead", dept: "Showroom & Wholesale Sales", baseSalary: 45000, commission: metrics.salesmanCommission, status: "Active" },
    { name: "Sabbir Hossain", role: "Hardware Engineer & RMA Lead", dept: "Technical Support", baseSalary: 38000, commission: 8500, status: "Active" },
    { name: "Fahim Chowdhury", role: "Vault Keeper & Logistics Lead", dept: "Warehouse & Courier", baseSalary: 35000, commission: 6200, status: "Active" },
    { name: "Rifat Jahan", role: "Head of Accounts & NBR VAT", dept: "Finance & Accounts", baseSalary: 42000, commission: 0, status: "Active" }
  ];

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-500" />
          HRM & Sales Commission Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Staff payroll, technical team assignments, and 2% monthly sales performance commission
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Role & Title</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3 text-right">Base Salary (৳)</th>
                <th className="py-3 px-3 text-right">Sales Commission (৳)</th>
                <th className="py-3 px-4 text-right">Total Payout (৳)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {staffMembers.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white text-xs">{s.name}</td>
                  <td className="py-3 px-3 text-slate-300">{s.role}</td>
                  <td className="py-3 px-3 text-slate-400">{s.dept}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">৳ {s.baseSalary.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                    {s.commission > 0 ? `+ ৳ ${s.commission.toLocaleString()}` : '―'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-400 text-sm">
                    ৳ {(s.baseSalary + s.commission).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      ● {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

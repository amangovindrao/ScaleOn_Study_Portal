import { Zap, Award, TrendingUp, GraduationCap } from "lucide-react";

interface Props {
  totalXp: number;
  totalCertificates: number;
  completedLessonsCount: number;
  overallProgressPercent: number;
}

export function LearningStats({ totalXp, totalCertificates, completedLessonsCount, overallProgressPercent }: Props) {
  const items = [
    { icon: <TrendingUp size={18} />, label: "Overall Progress", value: `${overallProgressPercent}%`, color: "border-t-blue-500 bg-blue-50/50" },
    { icon: <Zap size={18} />, label: "Total XP", value: String(totalXp), color: "border-t-amber-500 bg-amber-50/50" },
    { icon: <GraduationCap size={18} />, label: "Completed Lessons", value: String(completedLessonsCount), color: "border-t-emerald-500 bg-emerald-50/50" },
    { icon: <Award size={18} />, label: "Certificates", value: String(totalCertificates), color: "border-t-purple-500 bg-purple-50/50" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className={`bg-white border border-slate-200/60 border-t-2 ${item.color} rounded-xl p-3 shadow-sm`}>
          <div className="text-slate-400 mb-1">{item.icon}</div>
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{item.label}</p>
          <p className="text-slate-900 text-lg font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

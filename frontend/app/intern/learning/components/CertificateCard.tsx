import { Award } from "lucide-react";
import { Certificate } from "../types";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <a
      href={certificate.certificateUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl p-5 hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
        <Award size={22} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{certificate.courseTitle}</p>
        <p className="text-slate-500 text-xs mt-0.5">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
      </div>
    </a>
  );
}

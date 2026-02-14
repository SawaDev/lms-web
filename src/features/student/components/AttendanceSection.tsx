import React from "react";
import { Calendar, Check, X } from "lucide-react";
import { AttendanceItem } from "../api/student";
import { cn } from "@/lib/utils";

interface AttendanceSectionProps {
  attendance: AttendanceItem[] | undefined;
  attendanceRate: number;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendance,
  attendanceRate,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Calendar size={20} className="text-indigo-600 mr-2" />
          <h2 className="text-slate-900 text-xl font-bold">Attendance</h2>
        </div>
        <div className="flex items-baseline">
          <span className="text-indigo-600 text-xl font-black mr-1">
            {attendanceRate}
          </span>
          <span className="text-slate-400 text-xs font-bold uppercase">%</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {attendance?.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100"
          >
            <span className="text-slate-900 font-bold">
              {new Date(item.class_date).toLocaleDateString()}
            </span>
            <div
              className={cn(
                "flex items-center px-3 py-1 rounded-full",
                item.is_present ? "bg-green-50" : "bg-red-50"
              )}
            >
              {item.is_present ? (
                <>
                  <Check size={14} className="text-green-500" />
                  <span className="text-green-600 text-xs font-bold ml-1">
                    Present
                  </span>
                </>
              ) : (
                <>
                  <X size={14} className="text-red-500" />
                  <span className="text-red-600 text-xs font-bold ml-1">
                    Absent
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
        {(!attendance || attendance.length === 0) && (
          <p className="text-slate-400 italic text-center py-4">
            No attendance records yet.
          </p>
        )}
      </div>
    </div>
  );
};

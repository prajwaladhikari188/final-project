import React from "react";

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = "blue",
  trend = null,
  trendPositive = true,
  onClick = null
}) => {
  const colorThemes = {
    blue: {
      bg: "bg-blue-50/60",
      border: "border-blue-100 hover:border-blue-300",
      iconBg: "bg-blue-600 text-white shadow-blue-500/30",
      accent: "text-blue-600"
    },
    emerald: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-emerald-600 text-white shadow-emerald-500/30",
      accent: "text-emerald-600"
    },
    amber: {
      bg: "bg-amber-50/60",
      border: "border-amber-100 hover:border-amber-300",
      iconBg: "bg-amber-500 text-white shadow-amber-500/30",
      accent: "text-amber-600"
    },
    red: {
      bg: "bg-red-50/60",
      border: "border-red-100 hover:border-red-300",
      iconBg: "bg-red-600 text-white shadow-red-500/30",
      accent: "text-red-600"
    },
    navy: {
      bg: "bg-slate-900 text-white",
      border: "border-slate-800 hover:border-slate-700",
      iconBg: "bg-blue-500 text-white shadow-blue-500/40",
      accent: "text-blue-400"
    },
    purple: {
      bg: "bg-purple-50/60",
      border: "border-purple-100 hover:border-purple-300",
      iconBg: "bg-purple-600 text-white shadow-purple-500/30",
      accent: "text-purple-600"
    }
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border transition-all duration-200 bg-white shadow-xs hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${theme.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              {subtext}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${theme.iconBg}`}
          >
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {trend}
          </span>
          <span className="text-[11px] text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

// src/components/layout/Sidebar.jsx
import React from "react";

/**
 * Sidebar عام (قابل لإعادة الاستخدام)
 * props:
 * - open: boolean  (true = مفتوح، false = مصغّر)
 * - items: [{ label, icon?, active? }]
 */
export default function Sidebar({ open = true, items = [] }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-barnz-200 shadow-sm
                  transition-all duration-300 ${open ? "w-64" : "w-16"}`}
    >
      {/* شعار/هيدر صغير للسايدبار */}
      <div className="h-16 flex items-center justify-center border-b border-barnz-200">
        <span className="text-[#004D47] font-semibold">
          {open ? "Barns" : "B"}
        </span>
      </div>

      {/* روابط */}
      <nav className="p-2">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-barnz-900 hover:bg-barnz-50 ${
              it.active ? "bg-barnz-50" : ""
            }`}
          >
            {/* أيقونة اختيارية (ممكن لاحقاً تحطي SVGs) */}
            <span className="w-5 h-5 grid place-items-center">
              {it.icon || "•"}
            </span>
            <span className={`${open ? "block" : "hidden"} text-sm`}>
              {it.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
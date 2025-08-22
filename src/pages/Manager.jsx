import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

const GREEN = "#00B476";
const GREEN_FILL = "rgba(0,180,118,0.15)";
const TEXT = "#004D47";

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <div className="text-barnz-900 text-xl font-semibold">{label}</div>
      <div className="mt-3 text-4xl font-bold" style={{color: TEXT}}>{value}</div>
    </Card>
  );
}

export default function Manager() {
  // بيانات تجريبية — استبدلها لاحقاً ببيانات حقيقية من API
  
  const sales = [120, 200, 150, 220, 300, 250, 180];

  const [supers, setSupers] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

useEffect(() => {
  (async () => {
    try {
      const r = await fetch("/supervisors.json", { cache: "no-store" });
      const j = await r.json();
      setSupers(Array.isArray(j.items) ? j.items.slice(0, 4) : []);
    } catch (e) {
      setErr("Failed to load supervisors.");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const salesData = {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    datasets: [{
      label: "Sales",
      data: sales,
      borderColor: GREEN,
      backgroundColor: GREEN_FILL,
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  };

  const branchesData = {
    labels: ["Jeddah#17","Jeddah#09","Makkah#07","Jeddah#18","Makkah#10"],
    datasets: [{
      label: "Top Branches",
      data: [320, 280, 230, 190, 160],
      backgroundColor: GREEN,
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الهيدر (نفس الإدمن) */}
      <header className="px-6 py-4 bg-barnz-200 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700/20 grid place-items-center text-emerald-800 font-semibold">
              U
            </div>
            <div>
              <div className="font-semibold text-barnz-900">Mirajul Hussain</div>
              <div className="text-sm text-barnz-700">MirajulHussain@gmail.com</div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search"
            className="w-72 max-w-[280px] rounded-lg border border-barnz-200 px-3 py-2"
          />
        </div>
      </header>

      {/* المحتوى */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* صف الإحصائيات */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4"><Stat label="Total Sales" value="$120,450" /></div>
          <div className="col-span-12 md:col-span-4"><Stat label="Average Rating" value="4.3 / 5" /></div>
          <div className="col-span-12 md:col-span-4"><Stat label="Num of Weak Branches" value="7" /></div>
        </div>

        {/* Sales/Trend + Supervisors */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card title="Sales">
              <div className="h-72">
                <Line data={salesData} options={{ responsive: true, maintainAspectRatio: false,
                  plugins:{ legend:{ labels:{ color: TEXT } } },
                  scales:{ x:{ ticks:{ color: TEXT } }, y:{ ticks:{ color: TEXT } } }
                }}/>
              </div>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <Card title="Supervisors">
              <div className="overflow-hidden rounded-xl border border-barnz-200">
                <table className="w-full text-sm">
                  <thead className="bg-barnz-50 text-barnz-900">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">#Sales</th>
                      <th className="px-3 py-2 text-left">Rate</th>
                      <th className="px-3 py-2 text-left">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-barnz-200 text-barnz-900/90">
  {loading ? (
    <tr><td className="px-3 py-4 text-barnz-700" colSpan={4}>Loading…</td></tr>
  ) : err ? (
    <tr><td className="px-3 py-4 text-red-700" colSpan={4}>{err}</td></tr>
  ) : supers.length === 0 ? (
    <tr><td className="px-3 py-4 text-barnz-700" colSpan={4}>No data</td></tr>
  ) : (
    supers.map((s, i) => (
      <tr key={i} className="hover:bg-barnz-50/60">
        <td className="px-3 py-2">{s.name}</td>
        <td className="px-3 py-2">{s.sales}</td>
        <td className="px-3 py-2">{s.rate}</td>
        <td className="px-3 py-2">{s.branch}</td>
      </tr>
    ))
  )}
</tbody>

                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Top Branches + Alerts + Chatbot */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card title="Top Branches">
              <div className="h-72">
                <Bar data={branchesData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins:{ legend:{ labels:{ color: TEXT } } },
                  indexAxis: "y",
                  scales:{ x:{ ticks:{ color: TEXT } }, y:{ ticks:{ color: TEXT } } }
                }}/>
              </div>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card title="Alert">
              <ul className="space-y-2 text-sm">
                <li className="p-2 rounded bg-yellow-100 text-yellow-800">Low rating at Branch #7</li>
                <li className="p-2 rounded bg-red-100 text-red-700">High waste at Branch #3</li>
              </ul>
            </Card>

            <Card title="Chatbot">
              <div className="h-36 bg-barnz-50 rounded-lg grid place-items-center text-barnz-700">
                ( bot here)
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

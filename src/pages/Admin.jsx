import React, { useState, useRef, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);



export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
<header className="px-6 py-4 bg-barnz-200 text-white">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-emerald-700/20 grid place-items-center text-emerald-800 font-semibold">
        U
      </div>
      <div>
        <div className="font-semibold text-barnz-900">Saleh</div>
        <div className="text-sm text-barnz-700">email@gmail.com</div>
      </div>
    </div>

    <input
      type="text"
      placeholder="Search"
      className="w-72 max-w-[280px] rounded-lg border border-barnz-200 px-3 py-2"
    />
  </div>
</header>


      {/* ===== Page Content ===== */}
      <main className="max-w-7xl mx-auto p-6">
  {/* Grid رئيسي: 12 عمود + 2 صفوف علويّة */}
  <div className="grid grid-cols-12 gap-6">
    {/* يسار فوق: Total Sales (يمتد 8 أعمدة ويأخذ صف واحد) */}
    <div className="col-span-12 md:col-span-8">
      <Card title="Total Sales" className="bg-white">
        <div className="flex justify-end mb-2">
          <select className="border rounded px-2 py-1 text-sm">
            <option>Daily</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
        <div className="h-48">
          <Line data={salesData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </Card>
    </div>

    {/* يمين فوق + يمتد لطول عمودين (row-span-2) = Top Products */}
    <div className="col-span-12 md:col-span-4 md:row-span-2">
      <Card title="Top Products" className="h-full bg-white">
        <div className="h-[28rem]">
          <Bar
            data={productsData}
            options={{ indexAxis: "y", responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </Card>
    </div>

    {/* يسار في النص: Forecast (أسفل Total Sales مباشرة) */}
    <div className="col-span-12 md:col-span-8">
      <Card title="Forecast (Next 6 Months)" className="bg-white">
        <div className="h-64">
          <Line data={forecastData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </Card>
    </div>

    {/* الصف الأخير: Alerts يسار + Chatbot يمين */}
    <div className="col-span-12 md:col-span-6">
      <Card title="Alerts" className="bg-white">
        <ul className="space-y-3">
          <Alert text="Branch #12 stock-out detected" type="error" />
          <Alert text="Low rating at Branch #7" type="warning" />
          <Alert text="High waste at Branch #3" type="error" />
          <Alert text="Sales fluctuation at Branch #9" type="info" />
        </ul>
      </Card>
    </div>

 <div className="col-span-12 md:col-span-6">
  <Card title="Chatbot" className="bg-white">
    <ChatPanel />
  </Card>
</div>

  </div>
</main>

    </div>
  );
}

/* ---- Helper Components ---- */
function Card({ title, className = "", children }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`}>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Alert({ text, type }) {
  const colors = {
    error: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
  };
  return <li className={`p-3 rounded-lg ${colors[type]}`}>{text}</li>;
}
/* ------------ هنا دا كلو عشان ربط الشات بوت ------------- */
/* ------------ هنا دا كلو عشان ربط الشات بوت ------------- */
/* ------------ هنا دا كلو عشان ربط الشات بوت ------------- */
/* ------------ هنا دا كلو عشان ربط الشات بوت ------------- */

function ChatPanel() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me about employees or branches." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const apiUrl = process.env.REACT_APP_CHAT_API;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    if (!apiUrl) { alert("REACT_APP_CHAT_API مو مضبوط"); return; }

    setInput("");
    setLoading(true);
    setMessages(m => [...m, { role: "user", content: text }]);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        mode: "cors",
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply || "…" }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Request failed." }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="h-40 overflow-auto rounded-lg bg-barnz-100 p-3 text-barnz-900/80">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] mb-2 px-3 py-2 rounded-xl ${
              m.role === "user"
                ? "ml-auto bg-barnz-500 text-white"
                : "mr-auto bg-white text-barnz-900 border border-barnz-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about employees or branches…"
          className="flex-1 px-3 py-2 rounded-lg border border-barnz-200 focus:outline-none focus:ring-2 focus:ring-barnz-500"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-barnz-700 text-white disabled:opacity-50"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}


/* ------------ Sample Data ------------- */
const salesData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Sales",
      data: [120, 200, 150, 220, 300, 250, 180],
      borderColor: "rgb(34,197,94)",
      backgroundColor: "rgba(34,197,94,0.2)",
      fill: true,
      tension: 0.3,
    },
  ],
};

const forecastData = {
  labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
  datasets: [
    {
      label: "Forecast",
      data: [200, 230, 250, 270, 300, 320],
      borderColor: "rgb(59,130,246)",
      backgroundColor: "rgba(59,130,246,0.2)",
      fill: true,
      tension: 0.3,
    },
  ],
};

const productsData = {
  labels: ["Croissant", "Cookies", "Muffin", "Bread", "Cake"],
  datasets: [
    {
      label: "Top Products",
      data: [320, 280, 230, 190, 160],
      backgroundColor: "rgb(34,197,94)",
    },
  ],
};

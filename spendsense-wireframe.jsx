import { useState } from "react";

const transactions = [
  { id: 1, raw: "Rs.1,250 debited from A/c XX4521 at SWIGGY UPI", merchant: "Swiggy", amount: 1250, type: "debit", category: "Food", icon: "🍔", time: "2:30 PM", date: "Today", bank: "SBI", anomaly: false },
  { id: 2, raw: "INR 499 spent on NETFLIX via card XX9812", merchant: "Netflix", amount: 499, type: "debit", category: "Entertainment", icon: "🎬", time: "11:00 AM", date: "Today", bank: "HDFC", anomaly: false },
  { id: 3, raw: "Rs.8,500 debited at UNKNOWN MERCHANT UPI", merchant: "Unknown Merchant", amount: 8500, type: "debit", category: "Other", icon: "⚠️", time: "9:15 AM", date: "Today", bank: "ICICI", anomaly: true },
  { id: 4, raw: "Rs.2,100 credited to A/c XX4521 from RAHUL SHARMA", merchant: "Rahul Sharma", amount: 2100, type: "credit", category: "Transfer", icon: "💸", time: "Yesterday", date: "Yesterday", bank: "SBI", anomaly: false },
  { id: 5, raw: "INR 340 spent at APOLLO PHARMACY via UPI", merchant: "Apollo Pharmacy", amount: 340, type: "debit", category: "Health", icon: "💊", time: "3:45 PM", date: "Yesterday", bank: "HDFC", anomaly: false },
  { id: 6, raw: "Rs.1,800 debited at IRCTC via netbanking", merchant: "IRCTC", amount: 1800, type: "debit", category: "Travel", icon: "🚂", time: "10:00 AM", date: "25 Feb", bank: "SBI", anomaly: false },
  { id: 7, raw: "Rs.650 debited at ZEPTO QUICK COMMERCE UPI", merchant: "Zepto", amount: 650, type: "debit", category: "Groceries", icon: "🛒", time: "8:30 PM", date: "25 Feb", bank: "ICICI", anomaly: false },
];

const categories = [
  { name: "Food", spent: 4200, budget: 5000, color: "#FF6B6B", icon: "🍔" },
  { name: "Groceries", spent: 3100, budget: 4000, color: "#4ECDC4", icon: "🛒" },
  { name: "Entertainment", spent: 999, budget: 1000, color: "#A78BFA", icon: "🎬" },
  { name: "Travel", spent: 2400, budget: 3000, color: "#FCD34D", icon: "🚂" },
  { name: "Health", spent: 680, budget: 2000, color: "#6EE7B7", icon: "💊" },
  { name: "Bills", spent: 1800, budget: 2000, color: "#FB923C", icon: "⚡" },
];

const insights = [
  { icon: "📈", text: "You spent ₹2,400 MORE on food this month vs last month", type: "warning" },
  { icon: "🎯", text: "You're on track to save ₹3,200 this month — great job!", type: "success" },
  { icon: "💡", text: "Cut 2 Swiggy orders/week → save ₹1,400/month = ₹16,800/year", type: "tip" },
  { icon: "⚠️", text: "Unusual ₹8,500 transaction detected — was this you?", type: "alert" },
];

const weeklyData = [
  { day: "Mon", amount: 420 },
  { day: "Tue", amount: 1250 },
  { day: "Wed", amount: 340 },
  { day: "Thu", amount: 2100 },
  { day: "Fri", amount: 890 },
  { day: "Sat", amount: 3200 },
  { day: "Sun", amount: 1800 },
];

const maxWeekly = Math.max(...weeklyData.map(d => d.amount));

export default function SpendSense() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeTab, setScreen2] = useState("week");

  const totalSpent = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#0A0E1A",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1A1F35; }
        ::-webkit-scrollbar-thumb { background: #2D3555; border-radius: 4px; }
        .nav-btn { transition: all 0.2s ease; cursor: pointer; }
        .nav-btn:hover { opacity: 0.8; transform: translateY(-1px); }
        .tx-row { transition: all 0.15s ease; cursor: pointer; }
        .tx-row:hover { background: rgba(255,255,255,0.05) !important; }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .slide-in { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from{transform:translateX(20px);opacity:0} to{transform:translateX(0);opacity:1} }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .bar-fill { transition: height 0.6s cubic-bezier(0.4,0,0.2,1); }
        .progress-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
        .glow { box-shadow: 0 0 20px rgba(99, 179, 237, 0.15); }
      `}</style>

      {/* Phone Frame */}
      <div style={{
        width: 390,
        height: 780,
        background: "#111827",
        borderRadius: 44,
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Status Bar */}
        <div style={{ background: "#0D1117", padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 3, height: 4 + i * 2, background: i <= 3 ? "#fff" : "#444", borderRadius: 1 }} />)}
            </div>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5.1L14.5 3.7C12.7 1.8 10.2 0.5 7.5 0.5C4.8 0.5 2.3 1.8 0.5 3.7L1.8 5.1C3.2 3.5 5.2 2.5 7.5 2.5Z" fill="white" /><path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.6 5.7C11.2 4.4 9.4 3.5 7.5 3.5C5.6 3.5 3.8 4.4 2.4 5.7L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" fill="white" /><circle cx="7.5" cy="9.5" r="1.5" fill="white" /></svg>
            <div style={{ width: 22, height: 11, border: "1px solid rgba(255,255,255,0.4)", borderRadius: 3, padding: "1px 1px", display: "flex", alignItems: "center" }}>
              <div style={{ width: "85%", height: "100%", background: "#4ADE80", borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {screen === "dashboard" && <DashboardScreen setScreen={setScreen} totalSpent={totalSpent} totalIncome={totalIncome} />}
          {screen === "transactions" && <TransactionsScreen setScreen={setScreen} setSelectedTx={setSelectedTx} />}
          {screen === "analytics" && <AnalyticsScreen setScreen={setScreen} />}
          {screen === "insights" && <InsightsScreen setScreen={setScreen} />}
          {screen === "txdetail" && <TxDetailScreen setScreen={setScreen} tx={selectedTx} />}
        </div>

        {/* Bottom Nav */}
        <div style={{
          background: "#0D1117",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "10px 0 16px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
          {[
            { id: "dashboard", icon: "⊞", label: "Home" },
            { id: "transactions", icon: "↕", label: "Transactions" },
            { id: "analytics", icon: "◎", label: "Analytics" },
            { id: "insights", icon: "✦", label: "Insights" },
          ].map(tab => (
            <button key={tab.id} className="nav-btn" onClick={() => setScreen(tab.id)} style={{
              background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer",
              opacity: screen === tab.id || (screen === "txdetail" && tab.id === "transactions") ? 1 : 0.4,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: screen === tab.id ? "rgba(99, 179, 237, 0.15)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: screen === tab.id ? "#63B3ED" : "#fff",
                transition: "all 0.2s",
              }}>{tab.icon}</div>
              <span style={{ color: screen === tab.id ? "#63B3ED" : "#666", fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side Labels */}
      <div style={{ marginLeft: 32, display: "flex", flexDirection: "column", gap: 12, maxWidth: 220 }}>
        <div style={{ color: "#63B3ED", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
          SpendSense
        </div>
        <div style={{ color: "#4A5568", fontSize: 13, lineHeight: 1.6 }}>
          Interactive wireframe prototype. Tap the screens to explore.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {[
            { id: "dashboard", label: "🏠 Dashboard", desc: "Overview + balance" },
            { id: "transactions", label: "↕ Transactions", desc: "Auto-parsed SMS list" },
            { id: "analytics", label: "◎ Analytics", desc: "Spend breakdown" },
            { id: "insights", label: "✦ Insights", desc: "AI nudges + alerts" },
          ].map(s => (
            <button key={s.id} onClick={() => setScreen(s.id)} style={{
              background: screen === s.id ? "rgba(99, 179, 237, 0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${screen === s.id ? "rgba(99, 179, 237, 0.3)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 10, padding: "8px 12px", cursor: "pointer", textAlign: "left",
              transition: "all 0.2s",
            }}>
              <div style={{ color: screen === s.id ? "#63B3ED" : "#9CA3AF", fontSize: 12, fontWeight: 600 }}>{s.label}</div>
              <div style={{ color: "#4A5568", fontSize: 11, marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: "12px", background: "rgba(74, 222, 128, 0.05)", border: "1px solid rgba(74, 222, 128, 0.15)", borderRadius: 10 }}>
          <div style={{ color: "#4ADE80", fontSize: 11, fontWeight: 600 }}>💡 Week 1 Goal</div>
          <div style={{ color: "#4A5568", fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>Build the SMS parser that produces this data. Start with SBI + HDFC patterns.</div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ setScreen, totalSpent, totalIncome }) {
  return (
    <div className="fade-in" style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#4A5568", fontSize: 12 }}>Good morning,</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Arjun 👋</div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #667EEA, #764BA2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>A</div>
          <div className="pulse" style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, background: "#FF6B6B", borderRadius: "50%", border: "2px solid #111827" }} />
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ margin: "16px 20px", background: "linear-gradient(135deg, #1A2340 0%, #0F172A 100%)", borderRadius: 20, padding: "20px", border: "1px solid rgba(99, 179, 237, 0.15)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(99, 179, 237, 0.05)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, background: "rgba(167, 139, 250, 0.05)", borderRadius: "50%" }} />
        <div style={{ color: "#4A5568", fontSize: 12, marginBottom: 4 }}>February 2025 · Spent</div>
        <div style={{ color: "#fff", fontSize: 32, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1 }}>
          ₹{totalSpent.toLocaleString('en-IN')}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ color: "#4A5568", fontSize: 10, marginBottom: 4 }}>↓ Income</div>
            <div style={{ color: "#4ADE80", fontSize: 15, fontWeight: 600 }}>₹{totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ color: "#4A5568", fontSize: 10, marginBottom: 4 }}>💰 Saved</div>
            <div style={{ color: "#63B3ED", fontSize: 15, fontWeight: 600 }}>₹{(totalIncome - totalSpent).toLocaleString('en-IN') || "0"}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ color: "#4A5568", fontSize: 10, marginBottom: 4 }}>📊 Txns</div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>47</div>
          </div>
        </div>
      </div>

      {/* Anomaly Alert */}
      <div onClick={() => setScreen("insights")} style={{ margin: "0 20px 16px", background: "rgba(255, 107, 107, 0.08)", border: "1px solid rgba(255, 107, 107, 0.25)", borderRadius: 14, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pulse" style={{ fontSize: 18 }}>⚠️</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#FF6B6B", fontSize: 12, fontWeight: 600 }}>Anomaly Detected</div>
          <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>Unusual ₹8,500 transaction at unknown merchant</div>
        </div>
        <div style={{ color: "#FF6B6B", fontSize: 16 }}>›</div>
      </div>

      {/* Weekly Chart */}
      <div style={{ margin: "0 20px 16px", background: "#161B2E", borderRadius: 16, padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>This Week</div>
          <div style={{ color: "#4A5568", fontSize: 11 }}>₹{weeklyData.reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
          {weeklyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div className="bar-fill" style={{
                width: "100%",
                height: `${(d.amount / maxWeekly) * 52}px`,
                background: i === 5 ? "linear-gradient(180deg, #63B3ED, #3182CE)" : "rgba(255,255,255,0.08)",
                borderRadius: "4px 4px 2px 2px",
                position: "relative",
              }}>
                {i === 5 && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", color: "#63B3ED", fontSize: 9, whiteSpace: "nowrap", fontWeight: 600 }}>peak</div>}
              </div>
              <div style={{ color: "#4A5568", fontSize: 9 }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>Recent</div>
          <div onClick={() => setScreen("transactions")} style={{ color: "#63B3ED", fontSize: 12, cursor: "pointer" }}>See all →</div>
        </div>
        {transactions.slice(0, 3).map(tx => (
          <div key={tx.id} className="tx-row" onClick={() => setScreen("transactions")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 12, marginBottom: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: tx.anomaly ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{tx.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: tx.anomaly ? "#FF6B6B" : "#fff", fontSize: 13, fontWeight: 500 }}>{tx.merchant}</div>
              <div style={{ color: "#4A5568", fontSize: 11 }}>{tx.category} · {tx.time}</div>
            </div>
            <div style={{ color: tx.type === "credit" ? "#4ADE80" : "#fff", fontSize: 14, fontWeight: 600 }}>
              {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsScreen({ setScreen, setSelectedTx }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Food", "Travel", "Health", "Bills"];
  const filtered = filter === "All" ? transactions : transactions.filter(t => t.category === filter);

  return (
    <div className="fade-in" style={{ padding: "16px 0 20px" }}>
      <div style={{ padding: "0 24px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Transactions</div>
        <div style={{ color: "#4A5568", fontSize: 12 }}>Feb 2025</div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 16, overflowX: "auto" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "#63B3ED" : "rgba(255,255,255,0.06)",
            border: "none", borderRadius: 20, padding: "6px 14px",
            color: filter === f ? "#0D1117" : "#9CA3AF",
            fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
          }}>{f}</button>
        ))}
      </div>

      {/* Transaction List */}
      <div style={{ padding: "0 16px" }}>
        {["Today", "Yesterday", "25 Feb"].map(date => {
          const dayTxs = filtered.filter(t => t.date === date);
          if (!dayTxs.length) return null;
          return (
            <div key={date}>
              <div style={{ color: "#4A5568", fontSize: 11, fontWeight: 600, padding: "8px 8px 4px", textTransform: "uppercase", letterSpacing: 1 }}>{date}</div>
              {dayTxs.map(tx => (
                <div key={tx.id} className="tx-row" onClick={() => { setSelectedTx(tx); setScreen("txdetail"); }} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 10px",
                  borderRadius: 14, marginBottom: 4,
                  background: tx.anomaly ? "rgba(255,107,107,0.06)" : "transparent",
                  border: tx.anomaly ? "1px solid rgba(255,107,107,0.15)" : "1px solid transparent",
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: tx.anomaly ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{tx.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: tx.anomaly ? "#FF6B6B" : "#E2E8F0", fontSize: 13, fontWeight: 600 }}>{tx.merchant}</span>
                      {tx.anomaly && <span style={{ background: "rgba(255,107,107,0.2)", color: "#FF6B6B", fontSize: 9, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>ANOMALY</span>}
                    </div>
                    <div style={{ color: "#4A5568", fontSize: 11, marginTop: 2 }}>{tx.bank} · {tx.category} · {tx.time}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: tx.type === "credit" ? "#4ADE80" : "#E2E8F0", fontSize: 14, fontWeight: 700 }}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: "#2D3748", fontSize: 10 }}>›</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsScreen({ setScreen }) {
  const total = categories.reduce((s, c) => s + c.spent, 0);
  return (
    <div className="fade-in" style={{ padding: "16px 0 20px" }}>
      <div style={{ padding: "0 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Analytics</div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "4px 10px", color: "#9CA3AF", fontSize: 11 }}>Feb 2025</div>
      </div>

      {/* Donut Chart (CSS) */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative" }}>
        <div style={{ width: 140, height: 140, borderRadius: "50%", background: `conic-gradient(#FF6B6B 0deg ${360 * 4200 / total}deg, #4ECDC4 ${360 * 4200 / total}deg ${360 * (4200 + 3100) / total}deg, #A78BFA ${360 * (4200 + 3100) / total}deg ${360 * (4200 + 3100 + 999) / total}deg, #FCD34D ${360 * (4200 + 3100 + 999) / total}deg ${360 * (4200 + 3100 + 999 + 2400) / total}deg, #6EE7B7 ${360 * (4200 + 3100 + 999 + 2400) / total}deg ${360 * (4200 + 3100 + 999 + 2400 + 680) / total}deg, #FB923C ${360 * (4200 + 3100 + 999 + 2400 + 680) / total}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#111827", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#4A5568", fontSize: 9 }}>Total Spent</div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Category Breakdown</div>
        {categories.map(cat => (
          <div key={cat.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                <span style={{ color: "#E2E8F0", fontSize: 13 }}>{cat.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>₹{cat.spent.toLocaleString('en-IN')}</span>
                <span style={{ color: "#4A5568", fontSize: 11 }}> / ₹{cat.budget.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
              <div className="progress-bar" style={{ height: "100%", width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`, background: cat.color, borderRadius: 10 }} />
            </div>
            {cat.spent >= cat.budget * 0.9 && (
              <div style={{ color: "#FB923C", fontSize: 10, marginTop: 3 }}>
                {cat.spent >= cat.budget ? "⚠️ Budget exceeded" : "⚡ Almost at budget limit"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsScreen({ setScreen }) {
  const insightColors = { warning: "#FCD34D", success: "#4ADE80", tip: "#63B3ED", alert: "#FF6B6B" };
  const insightBg = { warning: "rgba(252,211,77,0.06)", success: "rgba(74,222,128,0.06)", tip: "rgba(99,179,237,0.06)", alert: "rgba(255,107,107,0.08)" };

  return (
    <div className="fade-in" style={{ padding: "16px 0 20px" }}>
      <div style={{ padding: "0 24px", marginBottom: 20 }}>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>AI Insights</div>
        <div style={{ color: "#4A5568", fontSize: 12, marginTop: 4 }}>Personalized just for you</div>
      </div>

      {/* Forecast Card */}
      <div style={{ margin: "0 20px 20px", background: "linear-gradient(135deg, #1A2340, #0F172A)", borderRadius: 18, padding: "18px", border: "1px solid rgba(99,179,237,0.15)" }}>
        <div style={{ color: "#63B3ED", fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>📈 March Forecast</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>₹16,400</div>
          <div style={{ color: "#FB923C", fontSize: 12 }}>↑ 12% vs last month</div>
        </div>
        <div style={{ color: "#4A5568", fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>Prophet model predicts higher food + travel spend next month based on your patterns.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {["Food ↑", "Travel ↑", "Bills ≈"].map(tag => (
            <span key={tag} style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF", fontSize: 10, padding: "4px 10px", borderRadius: 8, fontWeight: 500 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>This Month</div>
        {insights.map((ins, i) => (
          <div key={i} style={{ background: insightBg[ins.type], border: `1px solid ${insightColors[ins.type]}25`, borderRadius: 14, padding: "14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 20, marginTop: 2 }}>{ins.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#E2E8F0", fontSize: 13, lineHeight: 1.5 }}>{ins.text}</div>
              {ins.type === "tip" && (
                <div style={{ marginTop: 8 }}>
                  <button style={{ background: "#63B3ED", border: "none", borderRadius: 8, padding: "6px 14px", color: "#0D1117", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Set Reminder</button>
                </div>
              )}
              {ins.type === "alert" && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ background: "#FF6B6B", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Yes, it was me</button>
                  <button style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#9CA3AF", fontSize: 11, cursor: "pointer" }}>Report Fraud</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TxDetailScreen({ setScreen, tx }) {
  if (!tx) { setScreen("transactions"); return null; }
  return (
    <div className="slide-in" style={{ padding: "16px 0 20px" }}>
      <div style={{ padding: "0 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setScreen("transactions")} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>Transaction Detail</div>
      </div>

      <div style={{ margin: "0 20px", background: "#161B2E", borderRadius: 20, padding: "24px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{tx.icon}</div>
        <div style={{ color: tx.anomaly ? "#FF6B6B" : "#E2E8F0", fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{tx.merchant}</div>
        <div style={{ color: tx.type === "credit" ? "#4ADE80" : "#fff", fontSize: 32, fontWeight: 700, marginTop: 8 }}>
          {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
        </div>
        {tx.anomaly && <div style={{ marginTop: 8, background: "rgba(255,107,107,0.15)", color: "#FF6B6B", fontSize: 12, padding: "4px 12px", borderRadius: 20, display: "inline-block", fontWeight: 600 }}>⚠️ Anomaly: 6x your avg transaction</div>}
      </div>

      <div style={{ margin: "0 20px", background: "#161B2E", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        {[
          { label: "Date & Time", value: `${tx.date}, ${tx.time}` },
          { label: "Bank", value: tx.bank },
          { label: "Category", value: tx.category },
          { label: "Channel", value: "UPI" },
          { label: "Status", value: "Completed" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <span style={{ color: "#4A5568", fontSize: 13 }}>{row.label}</span>
            <span style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <div style={{ margin: "0 20px", background: "#161B2E", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ color: "#4A5568", fontSize: 11, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Raw SMS</div>
        <div style={{ color: "#9CA3AF", fontSize: 12, lineHeight: 1.6, fontFamily: "monospace" }}>{tx.raw}</div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", gap: 10 }}>
        <button style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: "12px", color: "#9CA3AF", fontSize: 13, cursor: "pointer" }}>✏️ Edit Category</button>
        <button style={{ flex: 1, background: tx.anomaly ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 12, padding: "12px", color: tx.anomaly ? "#FF6B6B" : "#9CA3AF", fontSize: 13, cursor: "pointer" }}>🚩 Report Issue</button>
      </div>
    </div>
  );
}

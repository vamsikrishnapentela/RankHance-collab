import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getManagerDashboard, getAdminTickets, replyToTicketAdmin } from "./api";
import Container from "./components/Container";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Eye, EyeOff, FileText, Mail, Download, CheckCircle, Info, LayoutDashboard, Users, UserPlus, MessageCircle, Trophy, Settings, Copy } from "lucide-react";
import jsPDF from "jspdf";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [view, setView] = useState("stats"); // toggle: stats | users | creators | tickets | modelmock
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | paid | free

  const [showPrivacy, setShowPrivacy] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    if (view === "tickets") {
      fetchTickets();
    }
  }, [view]);

  const fetchTickets = async () => {
    try {
      const res = await getAdminTickets();
      setTickets(res);
      if (activeTicket) {
        const updated = res.find((t) => t._id === activeTicket._id);
        if (updated) setActiveTicket(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyTicket = async (e, closeTicket = false) => {
    if (e) e.preventDefault();
    if (!activeTicket) return;
    if (!replyMessage && !closeTicket) return;

    try {
      const updated = await replyToTicketAdmin({
        ticketId: activeTicket._id,
        message: replyMessage,
        status: closeTicket ? 'Closed' : 'Responded'
      });
      const finalUpdated = {
        ...updated,
        userId: updated.userId?.name ? updated.userId : activeTicket.userId,
        messages: updated.messages || activeTicket.messages || []
      };
      setTickets(tickets.map(t => t._id === finalUpdated._id ? finalUpdated : t));
      setActiveTicket(finalUpdated);
      if (!closeTicket) setReplyMessage('');
    } catch (err) {
      alert("Failed to update ticket.");
    }
  };

  useEffect(() => {
    if (!user) return;

    if (!user.isManager && !user.isSuperAdmin) {
      navigate("/");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const res = await getManagerDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = (type) => {
    const list = data.users.filter(u => type === 'all' || (type === 'paid' ? u.isPaid : !u.isPaid));
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`RankHance ${type.toUpperCase()} Users List`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    let y = 40;
    doc.setFont(undefined, 'bold');
    doc.text("S.No", 14, y);
    doc.text("Name", 30, y);
    doc.text("Email", 90, y);
    doc.text("Status", 160, y);
    y += 7;
    doc.setFont(undefined, 'normal');

    list.forEach((u, i) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}`, 14, y);
      doc.text(`${u.name || 'N/A'}`, 30, y);
      doc.text(`${u.email}`, 90, y);
      doc.text(`${u.isPaid ? 'PAID' : 'FREE'}`, 160, y);
      y += 6;
    });

    doc.save(`RankHance_${type}_users.pdf`);
  };

  const handleCopyBCC = (type) => {
    const emails = data.users
      .filter(u => type === 'all' || (type === 'paid' ? u.isPaid : !u.isPaid))
      .map(u => u.email)
      .join(", ");

    navigator.clipboard.writeText(emails);
    alert(`Copied ${type} user emails to clipboard for BCC!`);
  };

  const copyReferralLink = (code) => {
    const link = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert(`Link for code ${code} copied!`);
  };

  if (!data) return <div className="pt-28 text-center text-gray-500 font-bold">Loading Manager Platform...</div>;

  return (
    <div className="pt-24 sm:pt-28 bg-gray-50 min-h-screen px-4 sm:px-6 pb-20">
      <Container className="max-w-6xl space-y-6 sm:space-y-8">

        {/* 🔁 NAVIGATION & TOOLS */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="flex flex-row overflow-x-auto pb-2 sm:pb-0 scrollbar-hide gap-2 sm:gap-3">
            <button
              onClick={() => setView("stats")}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm ${view === "stats" ? "bg-orange-500 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"
                }`}
            >
              <LayoutDashboard size={16} /> <span>Overview</span>
            </button>
            <button
              onClick={() => setView("users")}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm ${view === "users" ? "bg-orange-500 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"
                }`}
            >
              <Users size={16} /> <span>Users</span>
            </button>
            <button
              onClick={() => setView("creators")}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm ${view === "creators" ? "bg-orange-500 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"
                }`}
            >
              <UserPlus size={16} /> <span>Creators</span>
            </button>
            <button
              onClick={() => setView("tickets")}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm ${view === "tickets" ? "bg-orange-500 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"
                }`}
            >
              <MessageCircle size={16} /> <span>Tickets</span>
            </button>
            <button
              onClick={() => setView("modelmock")}
              className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm ${view === "modelmock" ? "bg-orange-500 text-white" : "bg-white border hover:bg-gray-50 text-gray-600"
                }`}
            >
              <Trophy size={16} /> <span>Mock</span>
            </button>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 gap-2">
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className={`p-2 rounded-xl transition-all ${showPrivacy ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {showPrivacy ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Quick search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 bg-white rounded-2xl border shadow-sm focus:outline-none focus:border-orange-500 font-medium text-sm sm:text-base"
          />

          {view === "users" && (
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl border bg-white shadow-sm font-bold text-gray-700 text-xs sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid only</option>
                <option value="free">Free only</option>
              </select>

              <button
                onClick={() => handleDownloadPDF(filter)}
                className="px-4 py-3 bg-white border rounded-2xl shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-bold text-gray-600 whitespace-nowrap"
              >
                <FileText size={16} className="text-red-500" /> PDF
              </button>

              <button
                onClick={() => handleCopyBCC(filter)}
                className="px-4 py-3 bg-white border rounded-2xl shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-xs font-bold text-gray-600 whitespace-nowrap"
              >
                <Mail size={16} className="text-blue-500" /> Copy BCC
              </button>
            </div>
          )}
        </div>


        {/* 📊 STATS OVERVIEW VIEW */}
        {view === "stats" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {[
                { label: "Total Users", value: data.usersStats.totalUsers, color: "text-gray-900" },
                { label: "Paid Users", value: data.usersStats.paidUsers, color: "text-green-600" },
                { label: "Total Revenue", value: `₹${data.usersStats.totalRevenue}`, color: "text-green-600" },
                { label: "Total Commission", value: `₹${data.creatorStats.totalCommission}`, color: "text-purple-600" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all">
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h2 className={`text-xl sm:text-3xl font-black ${stat.color}`}>
                    {!showPrivacy ? "••••" : stat.value}
                  </h2>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">User Distribution</h2>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Comparison of segment sizes</p>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart
                    data={[
                      { name: "Total", value: data.usersStats.totalUsers },
                      { name: "Paid", value: data.usersStats.paidUsers },
                      { name: "Free", value: data.usersStats.freeUsers }
                    ]}
                  >
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: '#F9FAFB' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#F97316" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}


        {/* 👥 USERS TABLE */}
        {view === "users" && (
          <div className="bg-white p-2 sm:p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                    <th className="p-4">Student Info</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Referred By</th>
                    <th className="p-4 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                  {data.users
                    .filter((u) => {
                      const name = u.name?.toLowerCase() || "";
                      const email = u.email?.toLowerCase() || "";
                      const matchSearch = name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
                      const matchFilter = filter === "all" || (filter === "paid" && u.isPaid) || (filter === "free" && !u.isPaid);
                      return matchSearch && matchFilter;
                    })
                    .map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px]">{u.email}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-black rounded-full ${u.isPaid ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"}`}>
                            {u.isPaid ? "PAID" : "FREE"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-400">{u.referredBy || "Direct"}</span>
                        </td>
                        <td className="p-4 text-right text-[10px] sm:text-xs font-bold text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🎨 CREATORS TABLE */}
        {view === "creators" && (
          <div className="bg-white p-2 sm:p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                    <th className="p-4">Creator Info</th>
                    <th className="p-4 text-center">Code</th>
                    <th className="p-4 text-center">Refs (Paid)</th>
                    <th className="p-4 text-right">Total Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                  {data.creators
                    .filter((c) => {
                      const name = c.name?.toLowerCase() || "";
                      const email = c.email?.toLowerCase() || "";
                      const code = c.referralCode?.toLowerCase() || "";
                      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
                    })
                    .map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{c.name}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{c.email}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] sm:text-xs font-black">{c.referralCode}</span>
                            <button
                              onClick={() => copyReferralLink(c.referralCode)}
                              className="p-1 hover:bg-orange-50 text-orange-400 hover:text-orange-600 rounded-lg transition-colors"
                              title="Copy Full Link"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center text-xs">
                          <span className="font-bold text-gray-900">{c.referralCount || 0}</span>
                          <span className="text-green-600 font-bold"> ({c.paidReferrals || 0})</span>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-black text-gray-900">₹{c.earnings || 0}</p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🎫 TICKETS VIEW */}
        {view === "tickets" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex h-[500px] sm:h-[600px] overflow-hidden gap-0 sm:gap-6">
            {/* Tickets List */}
            <div className={`w-full md:w-80 border-r pr-0 sm:pr-6 flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
              <h2 className="text-lg sm:text-xl font-bold p-4 sm:p-0 sm:mb-6 text-gray-900">Support Hub</h2>
              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 p-4 sm:p-0 pb-4">
                {tickets.map(t => (
                  <div
                    key={t._id}
                    onClick={() => setActiveTicket(t)}
                    className={`p-3 sm:p-4 rounded-2xl cursor-pointer transition-all border ${activeTicket?._id === t._id ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${t.status === 'Closed' ? 'bg-gray-200 text-gray-600' : t.status === 'Open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {t.status}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">{t.subject}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-medium truncate">{t.userId?.email || 'Student'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
              {!activeTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                  <MessageCircle size={60} strokeWidth={1} className="mb-4" />
                  <p className="font-bold text-[10px] sm:text-xs tracking-widest uppercase">Select a ticket</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="p-4 sm:p-0 sm:pb-6 border-b flex justify-between items-center bg-white">
                    <div className="min-w-0">
                      <h3 className="font-black text-sm sm:text-xl text-gray-900 truncate">{activeTicket.subject}</h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 font-medium truncate">{activeTicket.userId?.name} ({activeTicket.userId?.email})</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setActiveTicket(null)} className="md:hidden px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold">Back</button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-0 sm:py-8 space-y-4 sm:space-y-6 sm:pr-4">
                    {(activeTicket.messages || []).map((msg, idx) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div key={idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2.5 sm:px-5 sm:py-4 ${isAdmin ? 'bg-orange-500 text-white rounded-br-none shadow-md' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-[8px] sm:text-[10px] font-black mb-1 opacity-60 uppercase tracking-widest">{isAdmin ? 'Assistant' : 'Student'}</p>
                            <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {activeTicket.status !== 'Closed' ? (
                    <form onSubmit={(e) => handleReplyTicket(e, false)} className="p-3 sm:p-0 sm:pt-6 border-t flex gap-2">
                      <input
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Response..."
                        className="flex-1 px-4 py-2 sm:px-5 sm:py-4 bg-gray-50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-xs sm:text-sm"
                      />
                      <button type="submit" disabled={!replyMessage} className="px-5 py-2 sm:px-8 sm:py-4 bg-orange-500 text-white font-black rounded-xl sm:rounded-2xl disabled:opacity-50 text-[10px] sm:text-xs">
                        Reply
                      </button>
                    </form>
                  ) : (
                    <div className="py-4 border-t text-center text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Archived</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🏆 MODEL MOCK VIEW */}
        {view === "modelmock" && (
          <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-8 border-b border-gray-50 gap-4">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-3xl shadow-inner">
                  🏆
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">Leaderboard</h2>
                  <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-widest">Active Batch Results</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 bg-gray-50 px-4 py-2 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl border border-gray-100">
                <span className="text-gray-400 font-black text-[8px] sm:text-xs uppercase tracking-tighter">Total Attempts</span>
                <span className="text-orange-600 font-black text-2xl sm:text-4xl leading-none">{data.modelMockLeaderboard?.length || 0}</span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:-mx-8 sm:px-8 scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-gray-400 text-[8px] sm:text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.modelMockLeaderboard
                    ?.filter((attempt) => {
                      const name = attempt.userName?.toLowerCase() || "";
                      const email = attempt.userEmail?.toLowerCase() || "";
                      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
                    })
                    .map((attempt, idx) => (
                      <tr key={idx} className={`group hover:bg-orange-50/30 transition-all ${idx < 3 ? 'bg-orange-50/10' : ''}`}>
                        <td className="p-4 text-center">
                          {idx === 0 ? <span className="text-xl sm:text-2xl drop-shadow-sm">🥇</span> :
                            idx === 1 ? <span className="text-xl sm:text-2xl drop-shadow-sm">🥈</span> :
                              idx === 2 ? <span className="text-xl sm:text-2xl drop-shadow-sm">🥉</span> :
                                <span className="font-black text-gray-300 text-[10px] sm:text-xs">#{idx + 1}</span>}
                        </td>
                        <td className="p-4">
                          <p className="font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase text-xs sm:text-sm tracking-tight">{attempt.userName}</p>
                          <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold truncate max-w-[120px]">{attempt.userEmail}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white border border-gray-100 text-gray-500 rounded-lg text-[10px] sm:text-xs font-bold font-mono">
                            {attempt.userPhone || '—'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg ${idx < 3 ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>
                            {attempt.score}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-[10px] sm:text-sm font-black text-gray-900">
                            {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}

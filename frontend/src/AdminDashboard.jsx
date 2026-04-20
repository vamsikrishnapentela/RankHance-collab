import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  superAdminUserSearch,
  superAdminUpdateUser,
  superAdminReferralReport,
  superAdminGetAnalytics,
  superAdminExportUsers,
  getPublicAnnouncement,
  superAdminUpdateAnnouncement,
  superAdminBatchVerify
} from "./api";
import Container from "./components/Container";
import Button from "./components/Button";
import {
  Search, Shield, User, DollarSign, ExternalLink,
  CheckCircle, XCircle, BarChart3, Download, Eye, EyeOff, Lock, Megaphone, Save, ClipboardCheck, FileText, AlertCircle, RefreshCcw, UserMinus, Copy
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchEmail, setSearchEmail] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [referralData, setReferralData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("search"); // search | referrals | analytics | announcement | verify
  const [analyticsType, setAnalyticsType] = useState("daily"); // daily | monthly | yearly

  const [announcement, setAnnouncement] = useState({ title: "", content: "", isActive: false, buttonText: "", buttonLink: "", displayDate: "" });

  // Verification Hub States
  const [bulkInput, setBulkInput] = useState("");
  const [verifyResults, setVerifyResults] = useState({
    verified: [],
    unpaid: [],
    missing: [],
    duplicates: [],
    gapUsers: [] // Paid in DB but not in Input
  });

  useEffect(() => {
    if (!user) return;
    if (!user.isSuperAdmin) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchEmail) return;
    setLoading(true);
    try {
      const data = await superAdminUserSearch(searchEmail);
      setTargetUser(data);
    } catch (err) {
      alert("User not found or error occurred.");
      setTargetUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates) => {
    if (!targetUser) return;
    const key = prompt("Enter Security Key to confirm action:");
    if (!key) return;

    try {
      const { user: updated } = await superAdminUpdateUser(targetUser.email, updates, key);
      setTargetUser(updated);
      alert("User updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  const fetchReferralReport = async () => {
    setLoading(true);
    try {
      const data = await superAdminReferralReport();
      setReferralData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await superAdminGetAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const data = await getPublicAnnouncement();
      setAnnouncement(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === "referrals") fetchReferralReport();
    if (view === "analytics") fetchAnalytics();
    if (view === "announcement") fetchAnnouncement();
  }, [view]);

  const handleUpdateAnnouncement = async () => {
    const key = prompt("Enter Security Key to save announcement:");
    if (!key) return;

    try {
      await superAdminUpdateAnnouncement({ ...announcement, key });
      alert("Announcement updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update announcement.");
    }
  };

  const handleExportCSV = async (type) => {
    try {
      const data = await superAdminExportUsers(type);
      const headers = ["Name", "Email", "Phone", "Status", "Joined At"];
      const csvContent = [
        headers.join(","),
        ...data.map(u => [
          `"${u.name}"`,
          `"${u.email}"`,
          `"${u.phone || 'N/A'}"`,
          u.isPaid ? "Paid" : "Free",
          new Date(u.createdAt).toLocaleDateString()
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `RankHance_Users_${type}_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Export failed.");
    }
  };

  const handleBatchVerify = async () => {
    if (!bulkInput.trim()) return;
    setLoading(true);
    try {
      // Strictly extract emails only
      const emails = bulkInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (emails.length === 0) {
        alert("No valid emails found in input.");
        return;
      }

      const { results, missingFromInput } = await superAdminBatchVerify(emails);

      // Categorize results
      const categorized = {
        verified: [],
        unpaid: [],
        missing: [],
        duplicates: [],
        gapUsers: missingFromInput // Users who are Paid but missed in input
      };

      const seen = new Set();

      results.forEach(res => {
        const key = res.inputEmail.toLowerCase();
        if (seen.has(key)) {
          categorized.duplicates.push(res);
          return;
        }
        seen.add(key);

        if (!res.dbUser) {
          categorized.missing.push(res);
        } else if (res.dbUser.isPaid) {
          categorized.verified.push(res);
        } else {
          categorized.unpaid.push(res);
        }
      });

      setVerifyResults(categorized);
    } catch (err) {
      alert("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadVerifyReport = (format) => {
    const allResults = [
      ...verifyResults.unpaid.map(r => ({ ...r, category: "UNPAID DISCREPANCY" })),
      ...verifyResults.missing.map(r => ({ ...r, category: "ADDITIONAL (NOT IN DB)" })),
      ...verifyResults.gapUsers.map(r => ({ ...r, category: "DB PAID (MISSING FROM INPUT)", inputEmail: r.email })),
      ...verifyResults.verified.map(r => ({ ...r, category: "VERIFIED MATCH" })),
      ...verifyResults.duplicates.map(r => ({ ...r, category: "DUPLICATE ENTRY" }))
    ];

    if (allResults.length === 0) return;

    if (format === 'csv') {
      const headers = ["Category", "Email", "DB User Found", "DB Plan", "Name"];
      const data = allResults.map(r => [
        `"${r.category}"`,
        `"${r.inputEmail || r.email || '-'}"`,
        r.dbUser || r.id ? 'YES' : 'NO',
        'PAID', // Most logic here implies checking paid or gap
        `"${r.dbUser?.name || r.name || '-'}"`
      ].join(","));

      const blob = new Blob([[headers.join(","), ...data].join("\n")], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Verification_Report_${new Date().toLocaleDateString()}.csv`;
      link.click();
    } else {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Email Verification Hub Report", 14, 20);
      doc.setFontSize(8);
      let y = 30;
      allResults.forEach((r, i) => {
        if (y > 280) { doc.addPage(); y = 20; }
        const email = r.inputEmail || r.email || '-';
        const name = r.dbUser?.name || r.name || '-';
        doc.text(`${i + 1}. [${r.category}] Email: ${email} | Name: ${name}`, 14, y);
        y += 6;
      });
      doc.save("Verification_Report.pdf");
    }
  };

  const copyReferralLink = (code) => {
    const link = `${window.location.origin}/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert("Link copied! Ready to share.");
  };

  if (!user?.isSuperAdmin) return null;

  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-4 pb-20 sm:px-6">
      <Container className="max-w-6xl space-y-6 sm:space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Super Admin Hub</h1>
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
            {[
              { id: 'search', label: 'User Editor' },
              { id: 'referrals', label: 'Referral Tree' },
              { id: 'analytics', label: 'Advanced Stats' },
              { id: 'announcement', label: '📣 Alerts' },
              { id: 'verify', label: '🛡️ Verification' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${view === tab.id ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {view === "search" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Search user by exact email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium text-sm sm:text-base"
                    />
                  </div>
                  <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto h-12">
                    {loading ? "..." : "Lookup"}
                  </Button>
                </form>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center gap-2 sm:flex-col sm:items-stretch">
                <Button variant="secondary" onClick={() => handleExportCSV('paid')} className="flex-1 text-[10px] sm:text-xs py-2 px-3 flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> Paid Users
                </Button>
                <Button variant="secondary" onClick={() => handleExportCSV('all')} className="flex-1 text-[10px] sm:text-xs py-2 px-3 flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" /> All
                </Button>
              </div>
            </div>

            {targetUser && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animation-slide-up">
                <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
                        {targetUser.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">{targetUser.name}</h2>
                        <p className="text-gray-500 text-xs sm:text-sm truncate max-w-full">{targetUser.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Status</span>
                        <span className={`px-3 py-1 rounded-lg font-bold ${targetUser.isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {targetUser.isPaid ? "PREMIUM" : "FREE"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Phone</span>
                        <span className="font-bold text-gray-900">{targetUser.phone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Joined On</span>
                        <span className="text-gray-900 font-bold">{new Date(targetUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 text-gray-300 p-6 rounded-3xl shadow-lg font-mono text-[10px] space-y-3 overflow-x-auto">
                    <h3 className="text-white font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-widest">RAW DB INFO</h3>
                    <div className="space-y-1.5 border-t border-gray-800 pt-3">
                      <p><span className="text-gray-500">_id:</span> {targetUser._id}</p>
                      <p><span className="text-gray-500">googleId:</span> {targetUser.googleId || "N/A"}</p>
                      <p><span className="text-gray-500">razorpayOrderId:</span> {targetUser.razorpayOrderId || "N/A"}</p>
                      <p><span className="text-gray-500">paymentId:</span> {targetUser.razorpayPaymentId || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-500" /> Administrative Actions
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleUpdate({ isPaid: !targetUser.isPaid })}
                        className={`p-4 sm:p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${targetUser.isPaid ? 'border-green-200 bg-green-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                      >
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Premium</p>
                          <p className={`font-bold text-base sm:text-lg ${targetUser.isPaid ? 'text-green-700' : 'text-gray-700'}`}>
                            {targetUser.isPaid ? "Is Paid User" : "Make Paid"}
                          </p>
                        </div>
                        {targetUser.isPaid ? <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" /> : <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />}
                      </button>

                      <button
                        onClick={() => handleUpdate({ isCreator: !targetUser.isCreator })}
                        className={`p-4 sm:p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${targetUser.isCreator ? 'border-orange-200 bg-orange-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                      >
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Creator</p>
                          <p className={`font-bold text-base sm:text-lg ${targetUser.isCreator ? 'text-orange-700' : 'text-gray-700'}`}>
                            {targetUser.isCreator ? "Is Creator" : "Make Creator"}
                          </p>
                        </div>
                        {targetUser.isCreator ? <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" /> : <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />}
                      </button>

                      <button
                        onClick={() => handleUpdate({ isManager: !targetUser.isManager })}
                        className={`p-4 sm:p-6 rounded-2xl flex items-center justify-between border-2 transition-all ${targetUser.isManager ? 'border-blue-200 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                      >
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Manager</p>
                          <p className={`font-bold text-base sm:text-lg ${targetUser.isManager ? 'text-blue-700' : 'text-gray-700'}`}>
                            {targetUser.isManager ? "Is Manager" : "Make Manager"}
                          </p>
                        </div>
                        {targetUser.isManager ? <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" /> : <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />}
                      </button>

                      <div className="p-4 sm:p-6 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col justify-center items-center text-center opacity-50">
                        <p className="text-gray-400 font-bold text-xs">Super Admin Status</p>
                        <p className="text-[10px] text-gray-400">Manage via MongoDB</p>
                      </div>
                    </div>
                  </div>

                  {targetUser.isCreator && (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-500" /> Creator Config
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase px-1">Commission %</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={targetUser.commissionRate || 0}
                              onChange={(e) => setTargetUser({ ...targetUser, commissionRate: e.target.value })}
                              className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 font-bold"
                            />
                            <Button variant="secondary" onClick={() => handleUpdate({ commissionRate: Number(targetUser.commissionRate) })}>Update</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase px-1">Referral Code</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={targetUser.referralCode || ""}
                              onChange={(e) => setTargetUser({ ...targetUser, referralCode: e.target.value })}
                              className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 font-bold"
                            />
                            <Button variant="secondary" onClick={() => handleUpdate({ referralCode: targetUser.referralCode })}>Update</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "analytics" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-900">
                <BarChart3 className="w-6 h-6 text-orange-500" /> Data Overboard
              </h2>
              <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
                {['daily', 'monthly', 'yearly'].map(t => (
                  <button
                    key={t}
                    onClick={() => setAnalyticsType(t)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold capitalize transition-all whitespace-nowrap ${analyticsType === t ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {!analytics ? (
              <div className="bg-white p-12 sm:p-20 rounded-3xl text-center border border-gray-100">
                <p className="text-gray-400 animate-pulse font-bold text-sm sm:text-base">Aggregating historical data...</p>
              </div>
            ) : (
              <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={analytics[analyticsType]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#F9FAFB' }}
                      />
                      <Bar dataKey="count" fill="#F97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "announcement" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-8 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-orange-100 text-orange-600 rounded-2xl mb-2">
                  <Megaphone className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Announcement Center</h2>
                <p className="text-gray-500 text-sm font-medium">Flash alerts on the landing page</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Popup Title</label>
                  <input
                    type="text"
                    value={announcement.title || ""}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    placeholder="e.g., Flash Sale: 50% Off!"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Detailed Message</label>
                  <textarea
                    value={announcement.content}
                    onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                    placeholder="e.g., Unlock all premium features today."
                    className="w-full h-32 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Button Text</label>
                    <input
                      type="text"
                      value={announcement.buttonText || ""}
                      onChange={(e) => setAnnouncement({ ...announcement, buttonText: e.target.value })}
                      placeholder="e.g., Grab Offer"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Button Link</label>
                    <input
                      type="text"
                      value={announcement.buttonLink || ""}
                      onChange={(e) => setAnnouncement({ ...announcement, buttonLink: e.target.value })}
                      placeholder="e.g., https://wa.me/..."
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Display Date / Timing Text</label>
                    <input
                      type="text"
                      value={announcement.displayDate || ""}
                      onChange={(e) => setAnnouncement({ ...announcement, displayDate: e.target.value })}
                      placeholder="e.g., Live on 15th April at 9 PM"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-medium text-gray-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${announcement.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-bold text-gray-700">Landing Page Popup</span>
                  </div>
                  <button
                    onClick={() => setAnnouncement({ ...announcement, isActive: !announcement.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-all flex items-center p-1 ${announcement.isActive ? 'bg-orange-500 justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                  </button>
                </div>

                <Button
                  variant="primary"
                  onClick={handleUpdateAnnouncement}
                  className="w-full h-14 text-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {view === "verify" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-orange-500" /> Email Verification Hub
                  </h3>
                  <p className="text-xs text-gray-500">Paste Razorpay emails. We will check status and find users missing from your list.</p>
                  <textarea
                    className="w-full h-80 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
                    placeholder="ruhiazan@gmail.com&#10;sandeeprepala3@gmail.com&#10;test99@gmail.com"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                  />
                  <Button variant="primary" className="w-full h-12" onClick={handleBatchVerify} disabled={loading}>
                    {loading ? "Analyzing..." : "Compare Emails Now"}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center sm:px-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Results</h3>
                  {(verifyResults.verified.length > 0 || verifyResults.unpaid.length > 0 || verifyResults.missing.length > 0 || verifyResults.gapUsers.length > 0) && (
                    <div className="flex gap-2">
                      <Button variant="secondary" className="h-8 text-[10px] px-3 flex items-center gap-1" onClick={() => downloadVerifyReport('csv')}><Download className="w-3 h-3" /> CSV</Button>
                      <Button variant="secondary" className="h-8 text-[10px] px-3 flex items-center gap-1" onClick={() => downloadVerifyReport('pdf')}><FileText className="w-3 h-3" /> PDF</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* CATERGORY: STATUS DISCREPANCY (UNPAID) */}
                  {verifyResults.unpaid.length > 0 && (
                    <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="px-4 py-3 bg-orange-50 flex items-center gap-2 border-b border-orange-100">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <h4 className="text-xs font-black text-orange-700 uppercase tracking-widest">STATUS MISMATCH ({verifyResults.unpaid.length})</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] sm:text-xs">
                          <thead className="bg-gray-50/50 border-b">
                            <tr>
                              <th className="p-4">Input Email</th>
                              <th className="p-4">DB Record</th>
                              <th className="p-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verifyResults.unpaid.map((res, i) => (
                              <tr key={i} className="border-b last:border-none hover:bg-orange-50/20 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-gray-900">{res.inputEmail}</p>
                                </td>
                                <td className="p-4">
                                  <p className="font-bold text-orange-600">{res.dbUser.name}</p>
                                  <p className="text-[10px] text-gray-400">P: {res.dbUser.phone || 'N/A'}</p>
                                </td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 rounded-lg font-black text-[9px] bg-red-500 text-white uppercase">NEEDS UPGRADE</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CATERGORY: ADDITIONAL (IN RPAY NOT IN DB) */}
                  {verifyResults.missing.length > 0 && (
                    <div className="bg-white rounded-3xl border-2 border-red-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="px-4 py-3 bg-red-50 flex items-center gap-2 border-b border-red-100">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-black text-red-700 uppercase tracking-widest">NOT IN DB ({verifyResults.missing.length})</h4>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {verifyResults.missing.map((res, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100 italic">
                            {res.inputEmail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CATERGORY: GAP USERS (PAID IN DB BUT NOT IN INPUT) */}
                  {verifyResults.gapUsers.length > 0 && (
                    <div className="bg-white rounded-3xl border-2 border-purple-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
                      <div className="px-4 py-3 bg-purple-50 flex items-center gap-2 border-b border-purple-100">
                        <UserMinus className="w-4 h-4 text-purple-500" />
                        <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest">PAID IN DB (MISSED IN LIST) ({verifyResults.gapUsers.length})</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] sm:text-xs">
                          <thead className="bg-gray-50/50 border-b">
                            <tr>
                              <th className="p-4">User Details</th>
                              <th className="p-4">Contact info</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verifyResults.gapUsers.map((res, i) => (
                              <tr key={i} className="border-b last:border-none hover:bg-purple-50/20 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-gray-900">{res.name}</p>
                                  <p className="text-[10px] text-purple-600 font-bold">{res.email}</p>
                                </td>
                                <td className="p-4">
                                  <p className="text-gray-500 font-medium">{res.phone || 'No phone'}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CATERGORY: VERIFIED MATCHES (LIGHT COLORS) */}
                  {verifyResults.verified.length > 0 && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden opacity-40">
                      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">MATCHES OK ({verifyResults.verified.length})</h4>
                        </div>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {verifyResults.verified.map((res, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium text-gray-400">
                            {res.inputEmail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CATERGORY: DUPLICATES */}
                  {verifyResults.duplicates.length > 0 && (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm overflow-hidden opacity-40">
                      <div className="px-4 py-3 bg-gray-50/50 flex items-center gap-2 border-b border-dashed border-gray-200">
                        <RefreshCcw className="w-4 h-4 text-gray-400" />
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">DUPLICATES ({verifyResults.duplicates.length})</h4>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2 text-[10px] text-gray-300">
                        {verifyResults.duplicates.map((res, i) => res.inputEmail).join(", ")}
                      </div>
                    </div>
                  )}

                  {/* EMPTY STATE */}
                  {verifyResults.verified.length === 0 && verifyResults.unpaid.length === 0 && verifyResults.missing.length === 0 && verifyResults.gapUsers.length === 0 && (
                    <div className="h-[400px] flex flex-col items-center justify-center text-gray-300 p-10 text-center bg-white rounded-3xl border border-gray-100">
                      <Search className="w-12 h-12 mb-2" />
                      <p className="font-bold text-sm">Paste emails to start auditing...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "referrals" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ExternalLink className="w-5 h-5" /></div>
              <h2 className="text-xl font-bold text-gray-800">Referral Network</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {referralData.map((creator, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-6 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {creator.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{creator.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] sm:text-xs text-gray-500">{creator.email} <span className="hidden sm:inline mx-1 opacity-20">|</span> <span className="text-orange-600 font-black">{creator.referralCode}</span></p>
                          <button
                            onClick={() => copyReferralLink(creator.referralCode)}
                            className="p-1 hover:bg-orange-50 text-orange-400 hover:text-orange-600 rounded transition-colors group"
                            title="Copy Referral Link"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 sm:gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signups</p>
                        <p className="font-bold text-gray-900">{creator.referralCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid</p>
                        <p className="font-bold text-green-600">{creator.paidPreferrals}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4 overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                      <thead>
                        <tr className="text-gray-400 font-bold border-b">
                          <th className="pb-3 px-4">Student</th>
                          <th className="pb-3 px-4">Email</th>
                          <th className="pb-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creator.referredUsers?.map((stu, j) => (
                          <tr key={j} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-semibold">{stu.name}</td>
                            <td className="py-3 px-4 text-gray-500">{stu.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${stu.isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {stu.isPaid ? 'PAID' : 'FREE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

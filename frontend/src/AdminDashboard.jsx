import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard, getAdminTickets, replyToTicketAdmin } from "./api";
import Container from "./components/Container";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';


export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [view, setView] = useState("users"); // toggle
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | paid | free

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

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    fetchData();
  }, [user, navigate]);
  
  const fetchData = async () => {
    try {
      const res = await getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="pt-28 text-center">Loading Admin Dashboard...</div>;

  return (
    

    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-6xl space-y-8">

        {/* 🔁 TOGGLE */}
        <div className="flex gap-4">
          <button
            onClick={() => setView("users")}
            className={`px-5 py-2 rounded-xl font-semibold ${
              view === "users"
                ? "bg-orange-500 text-white"
                : "bg-white border"
            }`}
          >
            Users
          </button>

          <button
            onClick={() => setView("creators")}
            className={`px-5 py-2 rounded-xl font-semibold ${
              view === "creators"
                ? "bg-orange-500 text-white"
                : "bg-white border"
            }`}
          >
            Creators
          </button>

          <button
            onClick={() => setView("tickets")}
            className={`px-5 py-2 rounded-xl font-semibold ${
              view === "tickets"
                ? "bg-orange-500 text-white"
                : "bg-white border"
            }`}
          >
            Support Tickets
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">

          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 rounded-xl border focus:outline-none focus:border-orange-500"
          />

          {/* 🎯 Filter (only for users view) */}
          {view === "users" && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          )}

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Users</p>
            <h2 className="text-2xl font-bold">{data.usersStats.totalUsers}</h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Paid</p>
            <h2 className="text-2xl font-bold text-green-600">
              {data.usersStats.paidUsers}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Revenue</p>
            <h2 className="text-2xl font-bold text-green-600">
              ₹{data.usersStats.totalRevenue}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-sm text-gray-500">Commission</p>
            <h2 className="text-2xl font-bold text-purple-600">
              ₹{data.creatorStats.totalCommission}
            </h2>
          </div>

        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-bold mb-4">Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Users", value: data.usersStats.totalUsers },
                { name: "Paid", value: data.usersStats.paidUsers },
                { name: "Free", value: data.usersStats.freeUsers }
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* 👥 USERS TABLE */}
        {view === "users" && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">All Users</h2>

            <div className="space-y-3">
              {data.users
                .filter((u) => {
                  const name = u.name?.toLowerCase() || "";
                  const email = u.email?.toLowerCase() || "";

                  const matchSearch =
                    name.includes(search.toLowerCase()) ||
                    email.includes(search.toLowerCase());

                  const matchFilter =
                    filter === "all" ||
                    (filter === "paid" && u.isPaid) ||
                    (filter === "free" && !u.isPaid);

                  return matchSearch && matchFilter;
                })
                .map((u, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border p-3 rounded-xl"
                  >
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400">
                      Referred: {u.referredBy || "—"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      u.isPaid
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-500"
                    }`}
                  >
                    {u.isPaid ? "Paid" : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 CREATORS TABLE */}
        {view === "creators" && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Creators</h2>

            <div className="space-y-3">
              {data.creators
                .filter((c) => {
                  const name = c.name?.toLowerCase() || "";
                  const email = c.email?.toLowerCase() || "";
                  const code = c.referralCode?.toLowerCase() || "";

                  return (
                    name.includes(search.toLowerCase()) ||
                    email.includes(search.toLowerCase()) ||
                    code.includes(search.toLowerCase())
                  );
                })
                .map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border p-4 rounded-xl"
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.email}</p>
                    <p className="text-xs text-gray-400">
                      Code: {c.referralCode}
                    </p>
                  </div>

                  <div className="text-right">
                  <p>Ref: {c.referralCount || 0}</p>
                  <p>Paid: {c.paidReferrals || 0}</p>
                  <p className="text-green-600">₹{c.earnings || 0}</p>
                </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🎫 TICKETS VIEW */}
        {view === "tickets" && (
          <div className="bg-white p-6 rounded-2xl shadow flex h-[600px] overflow-hidden">
            {/* Tickets List */}
            <div className={`w-full md:w-1/3 border-r pr-4 flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
              <h2 className="text-xl font-bold mb-4">Support Hub</h2>
              <div className="flex-1 overflow-y-auto space-y-3">
                {tickets.map(t => (
                  <div 
                    key={t._id} 
                    onClick={() => setActiveTicket(t)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${activeTicket?._id === t._id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800 line-clamp-1">{t.subject}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === 'Closed' ? 'bg-gray-200 text-gray-600' : t.status === 'Open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{t.userId?.email || 'Unknown User'}</p>
                  </div>
                ))}
                {tickets.length === 0 && <p className="text-center text-sm text-gray-400 mt-4">No tickets found.</p>}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col pl-4 md:pl-6 ${!activeTicket ? 'hidden md:flex' : 'flex'}`}>
              {!activeTicket ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a ticket to view and reply.
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full">
                  <div className="pb-4 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{activeTicket.subject}</h3>
                      <p className="text-sm text-gray-500">{activeTicket.userId?.name} ({activeTicket.userId?.email})</p>
                    </div>
                    <div className="flex gap-2">
                       {activeTicket.status !== 'Closed' && (
                         <button onClick={(e) => handleReplyTicket(e, true)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300">
                           Close Ticket
                         </button>
                       )}
                       <button onClick={() => setActiveTicket(null)} className="md:hidden px-3 py-1 bg-orange-100 text-orange-600 rounded-lg">Back</button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                    {(activeTicket.messages || []).map((msg, idx) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div key={idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl p-3 ${isAdmin ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm font-semibold mb-1 opacity-70">{msg.senderName || 'Admin'}</p>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {activeTicket.status !== 'Closed' ? (
                    <form onSubmit={(e) => handleReplyTicket(e, false)} className="pt-4 border-t flex gap-3">
                      <input 
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply to student..."
                        className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:border-orange-500"
                      />
                      <button type="submit" disabled={!replyMessage} className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-xl disabled:opacity-50">
                        Reply
                      </button>
                    </form>
                  ) : (
                    <div className="pt-4 border-t text-center text-sm text-gray-500">Ticket Closed.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}

/* 🔹 Small Components */

const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-3xl font-bold">{value}</h2>
  </div>
);

const Stat = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-bold">{value}</p>
  </div>

  
);
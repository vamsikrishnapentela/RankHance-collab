import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "./api";
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
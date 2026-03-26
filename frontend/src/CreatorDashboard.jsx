import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getCreatorDashboard } from "./api";
import Container from "./components/Container";
import Button from "./components/Button";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getCreatorDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!user.isCreator) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  if (!data) return <div className="pt-28 text-center">Loading...</div>;

  const referralLink = `${window.location.origin}/?ref=${data.referralCode}`;

  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-5xl space-y-8">

        {/* 🔗 Referral Link */}
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
          <h2 className="text-xl font-bold">Your Referral Link</h2>

          <div className="flex gap-3">
            <input
              value={referralLink}
              readOnly
              className="flex-1 border rounded-xl px-4 py-2 text-sm"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert("Copied!");
              }}
            >
              Copy
            </Button>
          </div>
        </div>

        {/* 📊 Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Referrals</p>
            <h2 className="text-3xl font-bold">{data.referralCount}</h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-sm">Paid Referrals</p>
            <h2 className="text-3xl font-bold">{data.paidReferrals}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <h2 className="text-3xl font-bold text-green-600 animate-pulse ">
              ₹{data.earnings}
            </h2>
          </div>


        </div>

        {/* 👥 Referral Users */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Your Referrals</h2>

          <div className="space-y-3">
            {data.referrals.map((u, i) => (
              <div
                key={i}
                className="flex justify-between items-center border p-3 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
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

      </Container>
    </div>
  );
}
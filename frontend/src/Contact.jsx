import Container from './components/Container';

export default function Contact() {
  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-3xl bg-white p-8 rounded-2xl shadow space-y-8">

        {/* TITLE */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-sm text-gray-500">
            We’re here to help you with anything related to RankHance.
          </p>
        </div>

        {/* INTRO */}
        <p className="text-gray-600 text-sm leading-relaxed">
          If you have any questions, issues, or feedback regarding the platform, feel free to reach out to us. 
          Whether it’s about payments, technical issues, account problems, or general queries — we’re happy to assist you.
        </p>

        {/* CONTACT METHODS */}
        <div className="space-y-4">

          <h2 className="text-lg font-semibold text-gray-900">1. Email Support</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You can contact us via email for detailed queries or support requests. We usually respond within 24 hours.
          </p>

          <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
            📧 Email: <span className="font-medium">rankhance.in@gmail.com</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">2. WhatsApp Support</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            For quick help or urgent queries, you can reach out to us directly on WhatsApp.
          </p>

          <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
            📱 WhatsApp: <span className="font-medium">+91 9392609600</span>
          </div>

        </div>

        {/* SUPPORT NOTE */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-gray-700">
          💡 <span className="font-medium">Support Hours:</span> We try to respond as quickly as possible, 
          typically within a few hours during the day.
        </div>

        {/* FINAL NOTE */}
        <p className="text-gray-500 text-xs">
          Thank you for using RankHance. We’re committed to helping you achieve your best performance.
        </p>

      </Container>
    </div>
  );
}
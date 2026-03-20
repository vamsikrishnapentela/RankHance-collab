import Container from './components/Container';

export default function Privacy() {
  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-3xl bg-white p-8 rounded-2xl shadow space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Effective Date: March 2026</p>

        {/* INTRO */}
        <p className="text-gray-600 text-sm leading-relaxed">
          At <strong>RankHance</strong>, we respect your privacy and are committed to protecting 
          your personal information. This Privacy Policy explains how we collect, use, and safeguard 
          your data when you use our platform.
        </p>

        {/* SECTION 1 */}
        <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We collect only the minimum information required to provide our services. This includes:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Your name</li>
          <li>Your email address</li>
        </ul>
        <p className="text-gray-600 text-sm leading-relaxed">
          This information is collected during account registration or when you log in using Google.
        </p>

        {/* SECTION 2 */}
        <h2 className="text-lg font-semibold text-gray-900">2. Google Login</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If you choose to sign in using Google, we only access your basic profile information, 
          such as your name and email address. We do not access or store any additional personal data 
          from your Google account.
        </p>

        {/* SECTION 3 */}
        <h2 className="text-lg font-semibold text-gray-900">3. How We Use Your Data</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          The information we collect is used strictly for the following purposes:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Creating and managing your account</li>
          <li>Providing access to practice questions and mock tests</li>
          <li>Improving platform performance and user experience</li>
        </ul>

        {/* SECTION 4 */}
        <h2 className="text-lg font-semibold text-gray-900">4. Data Security</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We take appropriate security measures to protect your data from unauthorized access, 
          misuse, or disclosure. Your information is stored securely and only used for intended purposes.
        </p>

        {/* SECTION 5 */}
        <h2 className="text-lg font-semibold text-gray-900">5. No Unnecessary Data Collection</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We do not collect unnecessary personal data. RankHance does not track users beyond what 
          is required for functionality and user experience.
        </p>

        {/* SECTION 6 */}
        <h2 className="text-lg font-semibold text-gray-900">6. No Third-Party Sharing</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We do not sell, trade, or share your personal information with any third-party services. 
          Your data remains private and is used only within RankHance.
        </p>

        {/* SECTION 7 */}
        <h2 className="text-lg font-semibold text-gray-900">7. User Control</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          You have full control over your usage of the platform. You may stop using the service 
          at any time. If you have concerns regarding your data, you can contact us directly.
        </p>

        {/* SECTION 8 */}
        <h2 className="text-lg font-semibold text-gray-900">8. Policy Updates</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          This Privacy Policy may be updated from time to time for operational, legal, or 
          improvement purposes. Users are encouraged to review this page periodically.
        </p>

        {/* SECTION 9 */}
        <h2 className="text-lg font-semibold text-gray-900">9. Contact Information</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If you have any questions or concerns regarding this Privacy Policy, you can contact us:
        </p>

        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 space-y-1">
          <p>📧 Email: forw8568@gmail.com</p>
          <p>📱 WhatsApp: +91 9392609600</p>
        </div>

        {/* CONSENT */}
        <p className="text-gray-500 text-xs pt-2">
          By using RankHance, you agree to this Privacy Policy.
        </p>

      </Container>
    </div>
  );
}
import Container from './components/Container';

export default function Terms() {
  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-3xl bg-white p-8 rounded-2xl shadow space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        <p className="text-sm text-gray-500">Effective Date: March 2026</p>

        {/* INTRO */}
        <p className="text-gray-600 text-sm leading-relaxed">
          Welcome to <strong>RankHance</strong>. By accessing or using this website, you agree to be bound by 
          these Terms and Conditions. Please read them carefully before using our platform. If you do not agree 
          with any part of these terms, you should not use the service.
        </p>

        {/* SECTION 1 */}
        <h2 className="text-lg font-semibold text-gray-900">1. About the Platform</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          RankHance is an independent online learning platform designed to help students prepare for EAMCET 
          through structured practice, chapter-wise questions, mock tests, and performance analysis tools. 
          The platform is intended purely for educational and practice purposes.
        </p>

        {/* SECTION 2 */}
        <h2 className="text-lg font-semibold text-gray-900">2. User Accounts</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Users may create an account using email or Google login. You are responsible for maintaining 
          the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Provide accurate and complete information during registration</li>
          <li>Do not share your account with others</li>
          <li>Notify us in case of unauthorized access</li>
        </ul>

        {/* SECTION 3 */}
        <h2 className="text-lg font-semibold text-gray-900">3. Services Provided</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          RankHance provides access to:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Chapter-wise practice questions</li>
          <li>Full-length mock tests (160 questions)</li>
          <li>Performance tracking and analysis</li>
          <li>Structured preparation system</li>
        </ul>
        <p className="text-gray-600 text-sm leading-relaxed">
          These services are subject to availability and may be updated or modified at any time.
        </p>

        {/* SECTION 4 */}
        <h2 className="text-lg font-semibold text-gray-900">4. Premium Access</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Premium users receive full access to all platform features, including mock tests, advanced practice 
          content, and analytics tools. Access is granted after successful payment and remains valid for a 
          limited period (typically until college joining phase).
        </p>

        {/* SECTION 5 */}
        <h2 className="text-lg font-semibold text-gray-900">5. Payments and Pricing</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          All payments are processed securely. Pricing is clearly displayed on the website. By making a payment, 
          you agree to the pricing and terms associated with the purchase.
        </p>

        {/* SECTION 6 */}
        <h2 className="text-lg font-semibold text-gray-900">6. Refund Policy</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          All payments are non-refundable once access is granted. Please review all features carefully before 
          purchasing. By completing the payment, you agree to this policy.
        </p>

        {/* SECTION 7 */}
        <h2 className="text-lg font-semibold text-gray-900">7. Acceptable Use</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          You agree not to misuse the platform. The following actions are strictly prohibited:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Copying or redistributing platform content</li>
          <li>Attempting to hack or disrupt the system</li>
          <li>Using the platform for illegal purposes</li>
        </ul>

        {/* SECTION 8 */}
        <h2 className="text-lg font-semibold text-gray-900">8. Intellectual Property</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          All content, including questions, design, and platform features, is the intellectual property of RankHance. 
          Unauthorized use, reproduction, or distribution is strictly prohibited.
        </p>

        {/* SECTION 9 */}
        <h2 className="text-lg font-semibold text-gray-900">9. Disclaimer</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          RankHance is not affiliated with EAMCET, JNTU, or any government authority. The platform does not guarantee 
          exam results, ranks, or admissions. It is intended to support preparation only.
        </p>

        {/* SECTION 10 */}
        <h2 className="text-lg font-semibold text-gray-900">10. Limitation of Liability</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          RankHance shall not be held responsible for any academic outcomes, losses, or damages arising from the use 
          of the platform. Use of the service is at your own risk.
        </p>

        {/* SECTION 11 */}
        <h2 className="text-lg font-semibold text-gray-900">11. Service Availability</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We may update, modify, or temporarily suspend services for maintenance or improvements at any time without notice.
        </p>

        {/* SECTION 12 */}
        <h2 className="text-lg font-semibold text-gray-900">12. Changes to Terms</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          These Terms and Conditions may be updated periodically. Continued use of the platform after changes 
          indicates your acceptance of the updated terms.
        </p>

        {/* SECTION 13 */}
        <h2 className="text-lg font-semibold text-gray-900">13. Contact Information</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          For any questions or concerns regarding these terms, you may contact us:
        </p>

        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 space-y-1">
          <p>📧 Email: forw8568@gmail.com</p>
          <p>📱 WhatsApp: +91 9392609600</p>
        </div>

        {/* SECTION 14 */}
        <h2 className="text-lg font-semibold text-gray-900">14. Governing Law</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          These Terms shall be governed by the laws of India, under the jurisdiction of Andhra Pradesh.
        </p>

        {/* FINAL */}
        <p className="text-gray-500 text-xs pt-2">
          By using RankHance, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
        </p>

      </Container>
    </div>
  );
}
import Container from './components/Container';

export default function Refund() {
  return (
    <div className="pt-28 bg-gray-50 min-h-screen px-6">
      <Container className="max-w-3xl bg-white p-8 rounded-2xl shadow space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
        <p className="text-sm text-gray-500">Effective Date: March 2026</p>

        {/* INTRO */}
        <p className="text-gray-600 text-sm leading-relaxed">
          At <strong>RankHance</strong>, we strive to provide high-quality educational content 
          and a valuable learning experience for EAMCET aspirants. This Refund Policy explains 
          how payments are handled and under what conditions refunds may or may not be provided.
        </p>

        {/* SECTION 1 */}
        <h2 className="text-lg font-semibold text-gray-900">1. One-Time Payment Model</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          RankHance offers premium access through a one-time payment model. Once a user upgrades 
          to Premium, they receive access to all available features including full mock tests, 
          chapter-wise questions, and performance analysis tools for the defined access period.
        </p>

        {/* SECTION 2 */}
        <h2 className="text-lg font-semibold text-gray-900">2. No Refund Policy</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          All payments made on RankHance are <strong>non-refundable</strong>. Once payment is 
          successfully processed and access is granted to premium features, no refunds, cancellations, 
          or reversals will be provided under any circumstances.
        </p>

        {/* SECTION 3 */}
        <h2 className="text-lg font-semibold text-gray-900">3. Reason for No Refund</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Since RankHance provides instant access to digital educational content, including 
          practice questions and mock tests, it is not possible to revoke access once it has 
          been granted. Therefore, refunds cannot be issued after purchase.
        </p>

        {/* SECTION 4 */}
        <h2 className="text-lg font-semibold text-gray-900">4. User Responsibility</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Users are encouraged to review all features, pricing, and details before making a 
          purchase. By completing the payment, you acknowledge that you understand and agree 
          to this Refund Policy.
        </p>

        {/* SECTION 5 */}
        <h2 className="text-lg font-semibold text-gray-900">5. Technical Issues</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          In case of any technical issues (such as payment failures, duplicate transactions, 
          or access-related problems), users can contact support. We will investigate the issue 
          and ensure proper resolution, but this does not guarantee a refund.
        </p>

        {/* SECTION 6 */}
        <h2 className="text-lg font-semibold text-gray-900">6. Contact Support</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          If you face any issues related to payments or access, feel free to contact us:
        </p>

        <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 space-y-1">
          <p>📧 Email: rankhance.in@gmail.com</p>
          <p>📱 WhatsApp: +91 9392609600</p>
        </div>

        {/* FINAL NOTE */}
        <p className="text-gray-500 text-xs pt-2">
          By purchasing Premium on RankHance, you agree to this Refund Policy.
        </p>

      </Container>
    </div>
  );
}
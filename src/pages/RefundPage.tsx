function RefundPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-hidden p-5 py-10 pt-32 text-gray-100">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-3 text-center text-4xl tracking-wider md:text-6xl font-life-craft">Refund Policy</h1>
        <div className="mt-[3em] space-y-6">
          <div>
            <h2 className="mt-4 text-2xl font-semibold">Introduction</h2>
            <p className="mt-2 text-slate-200">
              We offer a seamless registration process using Razorpay, a secure payment gateway. This page
              outlines our refund policy to provide clarity and peace of mind in case of any issues with your payment.
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-2xl font-semibold">Payment Process</h2>
            <p className="mt-2 text-slate-200">
              Our payment process is designed to be easy and convenient for you. We offer multiple payment options,
              including credit/debit cards, net banking, and UPI. Once you select your preferred payment method, you
              will be redirected to Razorpay&apos;s secure payment gateway to complete the payment process.
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-2xl font-semibold">Refund Policy</h2>
            <p className="mt-2 text-slate-200">
              We understand that sometimes processing errors or technical glitches can occur during the payment process,
              leading to an unsuccessful transaction. In such cases, the amount paid by you will be credited back to your
              account automatically within 5-7 business days. Please note that this refund is only applicable in the case
              of an unsuccessful transaction due to processing errors and not for any other reasons.
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-2xl font-semibold">Non-Refundable Services</h2>
            <p className="mt-2 text-slate-200">
              Please note that our registration services are non-refundable and cannot be cancelled once payment has been
              made. This policy is in place to ensure that we can deliver the best possible experience for all our customers.
              Registrations from non-engineering colleges are not permitted. In the event of any false or fraudulent registration,
              the organizing committee reserves the right to cancel the registration without issuing a refund.
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-2xl font-semibold">Payment Security</h2>
            <p className="mt-2 text-slate-200">
              We take the safety and security of your payment information very seriously. Our payment gateway partner,
              Razorpay, ensures that all transactions are secure and protected by industry-standard encryption. You can be
              confident that your payment information is safe when you use our website for registration.
            </p>
          </div>

          <div>
            <h2 className="mt-4 text-2xl font-semibold">Contact Information</h2>
            <p className="mt-2 text-slate-200">
              If you have any questions or concerns about our refund policy or payment process, please do not hesitate to contact
              our team. You can reach us at
              <a href="mailto:incridea@nmamit.in" className="ml-1 font-semibold underline">
                incridea@nmamit.in
              </a>
              <span className="mx-1">or</span>
              <span className="mr-1 inline-block">+91 94488 46524 or +91 96863 56123</span>
              , and we will be happy to assist you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPage

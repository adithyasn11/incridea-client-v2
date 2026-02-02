import LiquidGlassCard from '../components/liquidglass/LiquidGlassCard';

function RefundPolicy() {
    return (
        <>
            <div 
                className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url(/temp_event_bg.png)",
                }}
            >
                <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative min-h-screen overflow-x-hidden overflow-y-auto p-4 md:p-10 pt-32 text-gray-100 flex justify-center">
            <div className="w-[95%] md:w-[85%] max-w-7xl">
                <style>{`
                    .refund-policy-card .card__content {
                        border-radius: 0 !important;
                        overflow: visible !important;
                    }
                `}</style>
                <LiquidGlassCard className="refund-policy-card !p-8 md:!p-12 !rounded-3xl !drop-shadow-none !bg-transparent !overflow-visible" >
                    <div className="mb-8">
                        <h1 className="text-4xl tracking-wider md:text-5xl font-life-craft text-fuchsia-100 drop-shadow-[0_0_15px_rgba(232,121,249,0.3)] font-moco font-bold">Refund Policy</h1>
                        <p className="mt-1 text-xs md:text-sm uppercase tracking-[0.3em] text-fuchsia-300/60 font-moco font-bold">Guidelines & Regulations</p>
                    </div>

                    <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-200/20 to-transparent" />

                    <div className="space-y-10 text-base md:text-lg text-fuchsia-50/80">
                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Introduction</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                We offer a seamless registration process using Razorpay, a secure payment gateway. This page
                                outlines our refund policy to provide clarity and peace of mind in case of any issues with your payment.
                            </p>
                        </div>

                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Payment Process</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                Our payment process is designed to be easy and convenient for you. We offer multiple payment options,
                                including credit/debit cards, net banking, and UPI. Once you select your preferred payment method, you
                                will be redirected to Razorpay&apos;s secure payment gateway to complete the payment process.
                            </p>
                        </div>

                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Refund Policy</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                We understand that sometimes processing errors or technical glitches can occur during the payment process,
                                leading to an unsuccessful transaction. In such cases, the amount paid by you will be credited back to your
                                account automatically within 5-7 business days. Please note that this refund is only applicable in the case
                                of an unsuccessful transaction due to processing errors and not for any other reasons.
                            </p>
                        </div>

                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Non-Refundable Services</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                Please note that our registration services are non-refundable and cannot be cancelled once payment has been
                                made. This policy is in place to ensure that we can deliver the best possible experience for all our customers.
                                Registrations from non-engineering colleges are not permitted. In the event of any false or fraudulent registration,
                                the organizing committee reserves the right to cancel the registration without issuing a refund.
                            </p>
                        </div>

                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Payment Security</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                We take the safety and security of your payment information very seriously. Our payment gateway partner,
                                Razorpay, ensures that all transactions are secure and protected by industry-standard encryption. You can be
                                confident that your payment information is safe when you use our website for registration.
                            </p>
                        </div>

                        <div>
                            <h2 className="mb-3 text-2xl tracking-wide text-fuchsia-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-moco font-bold">Contact Information</h2>
                            <p className="leading-relaxed text-justify opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-moco">
                                If you have any questions or concerns about our refund policy or payment process, please do not hesitate to contact
                                our team. You can reach us at{' '}
                                <a href="mailto:incridea@nmamit.in" className="text-fuchsia-100 underline decoration-fuchsia-500 underline-offset-4 hover:text-fuchsia-300 transition-colors font-moco font-bold">
                                    incridea@nmamit.in
                                </a>{' '}
                                or{' '}
                                <span className="inline-block text-fuchsia-100 font-moco font-bold">+91 94488 46524 or +91 96863 56123</span>
                                , and we will be happy to assist you.
                            </p>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
        </>
    )
}

export default RefundPolicy

"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-16 md:py-20">
          <div className="container-custom">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Terms of Service
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100"
              >
                Last updated: January 2026
              </motion.p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto prose prose-lg prose-primary">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Gryork platform (&quot;Platform&quot;),
                  you agree to be bound by these Terms of Service
                  (&quot;Terms&quot;). If you disagree with any part of these
                  terms, you may not access the Platform.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  Gryork provides a digital platform that facilitates bill
                  discounting transactions between Sub-Contractors, EPC Companies
                  (Engineering, Procurement, and Construction), and Non-Banking
                  Financial Companies (NBFCs). Our services include:
                </p>
                <ul>
                  <li>Bill submission and validation workflow</li>
                  <li>Connection between sub-contractors and NBFCs</li>
                  <li>Document management and verification</li>
                  <li>Transaction facilitation and tracking</li>
                </ul>

                <h2>3. User Registration</h2>
                <h3>3.1 Eligibility</h3>
                <p>To use our Platform, you must:</p>
                <ul>
                  <li>Be at least 18 years of age</li>
                  <li>
                    Have the legal capacity to enter into binding agreements
                  </li>
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>
                    Comply with all applicable laws and regulations
                  </li>
                </ul>

                <h3>3.2 Account Responsibilities</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your
                  account credentials and for all activities that occur under your
                  account. You must notify us immediately of any unauthorized use.
                </p>

                <h2>4. User Categories and Obligations</h2>
                <h3>4.1 Sub-Contractors</h3>
                <ul>
                  <li>
                    Submit only genuine, work-completed bills for discounting
                  </li>
                  <li>Provide accurate business and financial information</li>
                  <li>Maintain valid GST registration and KYC documents</li>
                  <li>
                    Honor the terms of accepted discount offers
                  </li>
                </ul>

                <h3>4.2 EPC Companies</h3>
                <ul>
                  <li>Validate bills accurately and in good faith</li>
                  <li>Provide timely responses to validation requests</li>
                  <li>
                    Honor payment obligations as per original bill terms
                  </li>
                  <li>Maintain updated company information</li>
                </ul>

                <h3>4.3 NBFC Partners</h3>
                <ul>
                  <li>Maintain valid RBI registration</li>
                  <li>Comply with all applicable lending regulations</li>
                  <li>Provide competitive and transparent discount rates</li>
                  <li>Disburse funds within agreed timelines</li>
                </ul>

                <h2>5. Platform Usage Rules</h2>
                <p>Users shall not:</p>
                <ul>
                  <li>
                    Submit fraudulent, forged, or misleading documents
                  </li>
                  <li>
                    Use the Platform for money laundering or illegal activities
                  </li>
                  <li>Interfere with the Platform&apos;s security features</li>
                  <li>Attempt to gain unauthorized access to other accounts</li>
                  <li>
                    Use automated systems to access the Platform without permission
                  </li>
                  <li>
                    Violate any applicable laws or regulations
                  </li>
                </ul>

                <h2>6. Transaction Terms</h2>
                <h3>6.1 Bill Discounting Process</h3>
                <p>
                  The Platform facilitates but does not directly participate in
                  bill discounting transactions. The actual lending relationship
                  is between the Sub-Contractor and the NBFC. Gryork acts solely
                  as an intermediary platform.
                </p>

                <h3>6.2 Fees and Charges</h3>
                <p>
                  Platform fees, if applicable, will be clearly communicated
                  before any transaction. NBFCs set their own discount rates.
                  All fees are exclusive of applicable taxes.
                </p>

                <h3>6.3 Disputes</h3>
                <p>
                  Transaction disputes between parties should first be attempted
                  to be resolved directly. Gryork may provide mediation services
                  but is not liable for disputes between users.
                </p>

                <h2>7. Intellectual Property</h2>
                <p>
                  All content, features, and functionality of the Platform,
                  including but not limited to text, graphics, logos, and software,
                  are owned by Gryork and protected by intellectual property laws.
                  Users may not copy, modify, or distribute any Platform content
                  without explicit permission.
                </p>

                <h2>8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Gryork shall not be
                  liable for:
                </p>
                <ul>
                  <li>
                    Indirect, incidental, or consequential damages
                  </li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>
                    Actions or omissions of third parties, including NBFCs and EPCs
                  </li>
                  <li>
                    Service interruptions or technical failures
                  </li>
                  <li>
                    Unauthorized access to user data despite security measures
                  </li>
                </ul>

                <h2>9. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Gryork, its officers,
                  directors, employees, and agents from any claims, damages, or
                  expenses arising from your use of the Platform or violation of
                  these Terms.
                </p>

                <h2>10. Termination</h2>
                <p>
                  We may terminate or suspend your account at any time for
                  violation of these Terms or for any reason we deem necessary.
                  Upon termination, your right to use the Platform ceases
                  immediately. Pending transactions will be handled according to
                  our termination procedures.
                </p>

                <h2>11. Modifications to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. Changes
                  will be effective upon posting to the Platform. Continued use
                  after changes constitutes acceptance of the modified Terms.
                </p>

                <h2>12. Governing Law</h2>
                <p>
                  These Terms shall be governed by the laws of India. Any disputes
                  shall be subject to the exclusive jurisdiction of the courts in
                  Bangalore, Karnataka.
                </p>

                <h2>13. Dispute Resolution</h2>
                <p>
                  Any disputes arising from these Terms or Platform use shall be
                  first attempted to be resolved through mediation. If mediation
                  fails, disputes shall be resolved through arbitration in
                  accordance with the Arbitration and Conciliation Act, 1996, with
                  the seat of arbitration in Bangalore.
                </p>

                <h2>14. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable,
                  the remaining provisions shall continue in full force and effect.
                </p>

                <h2>15. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact us at:
                </p>
                <ul>
                  <li>
                    <strong>Email:</strong> legal@gryork.com
                  </li>
                  <li>
                    <strong>Address:</strong> Bangalore, Karnataka, India
                  </li>
                </ul>

                <h2>16. Entire Agreement</h2>
                <p>
                  These Terms, along with our Privacy Policy and any other legal
                  notices published on the Platform, constitute the entire
                  agreement between you and Gryork regarding use of the Platform.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

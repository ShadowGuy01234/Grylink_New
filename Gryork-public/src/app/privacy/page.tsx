"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
                Privacy Policy
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
                <h2>1. Introduction</h2>
                <p>
                  Gryork (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                  respects your privacy and is committed to protecting your
                  personal data. This privacy policy explains how we collect,
                  use, disclose, and safeguard your information when you use our
                  bill discounting platform and services.
                </p>

                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Information</h3>
                <p>We may collect the following types of personal information:</p>
                <ul>
                  <li>
                    <strong>Identity Data:</strong> Name, username, date of
                    birth, PAN number, Aadhaar number (as permitted by law)
                  </li>
                  <li>
                    <strong>Contact Data:</strong> Email address, phone number,
                    business address
                  </li>
                  <li>
                    <strong>Financial Data:</strong> Bank account details, GST
                    registration, business financial statements
                  </li>
                  <li>
                    <strong>Transaction Data:</strong> Details of bills, invoices,
                    and transactions processed through our platform
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type,
                    device information, login data
                  </li>
                </ul>

                <h3>2.2 Business Information</h3>
                <p>
                  For Sub-Contractors, EPCs, and NBFCs, we collect business
                  registration documents, GST certificates, RBI registration (for
                  NBFCs), and other compliance-related documentation.
                </p>

                <h2>3. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul>
                  <li>Provide and maintain our bill discounting services</li>
                  <li>Process transactions and send related notifications</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Communicate with you about our services</li>
                  <li>Improve our platform and develop new features</li>
                  <li>
                    Conduct risk assessment and credit analysis (with consent)
                  </li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>
                  We may share your information with the following parties for
                  legitimate business purposes:
                </p>
                <ul>
                  <li>
                    <strong>NBFC Partners:</strong> To facilitate bill discounting
                    transactions and risk assessment
                  </li>
                  <li>
                    <strong>EPC Companies:</strong> For bill validation and
                    confirmation
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who
                    assist in our operations (payment processors, cloud services,
                    etc.)
                  </li>
                  <li>
                    <strong>Regulatory Authorities:</strong> As required by
                    applicable laws and regulations
                  </li>
                </ul>

                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal data, including:
                </p>
                <ul>
                  <li>End-to-end encryption for data transmission</li>
                  <li>Secure data storage with access controls</li>
                  <li>Regular security audits and assessments</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>

                <h2>6. Data Retention</h2>
                <p>
                  We retain your personal data only for as long as necessary to
                  fulfill the purposes for which it was collected, including
                  legal, accounting, or reporting requirements. Transaction data
                  is typically retained for 8 years as per Indian financial
                  regulations.
                </p>

                <h2>7. Your Rights</h2>
                <p>Subject to applicable laws, you have the right to:</p>
                <ul>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data (where applicable)</li>
                  <li>Object to processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>

                <h2>8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your
                  experience on our platform. You can manage cookie preferences
                  through your browser settings. Essential cookies required for
                  platform functionality cannot be disabled.
                </p>

                <h2>9. Third-Party Links</h2>
                <p>
                  Our platform may contain links to third-party websites. We are
                  not responsible for the privacy practices of these external
                  sites. We encourage you to review their privacy policies.
                </p>

                <h2>10. Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will
                  notify you of any material changes by posting the new policy on
                  this page and updating the &quot;Last updated&quot; date.
                </p>

                <h2>11. Contact Us</h2>
                <p>
                  If you have questions about this privacy policy or our data
                  practices, please contact us:
                </p>
                <ul>
                  <li>
                    <strong>Email:</strong> privacy@gryork.com
                  </li>
                  <li>
                    <strong>Address:</strong> Bangalore, Karnataka, India
                  </li>
                </ul>

                <h2>12. Grievance Officer</h2>
                <p>
                  In accordance with Information Technology Act 2000 and rules
                  made thereunder, the name and contact details of the Grievance
                  Officer are provided below:
                </p>
                <ul>
                  <li>
                    <strong>Name:</strong> Grievance Officer
                  </li>
                  <li>
                    <strong>Email:</strong> grievance@gryork.com
                  </li>
                  <li>
                    <strong>Address:</strong> Bangalore, Karnataka, India
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

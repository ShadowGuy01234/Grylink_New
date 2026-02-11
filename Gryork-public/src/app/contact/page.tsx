"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Textarea } from "@/components/ui";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(2, "Subject is required"),
  inquiryType: z.string().min(1, "Please select an inquiry type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "nbfc-partnership", label: "NBFC Partnership" },
  { value: "epc-onboarding", label: "EPC Onboarding" },
  { value: "subcontractor", label: "Sub-Contractor Support" },
  { value: "technical", label: "Technical Support" },
  { value: "media", label: "Media & Press" },
];

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "contact@gryork.com",
    subDetail: "support@gryork.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 80 4567 8900",
    subDetail: "Mon-Fri, 9 AM - 6 PM IST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "Bangalore, Karnataka",
    subDetail: "India",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Monday - Friday",
    subDetail: "9:00 AM - 6:00 PM IST",
  },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", data);
    setIsSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Get in Touch
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100"
              >
                Have questions? We&apos;d love to hear from you. Send us a
                message and we&apos;ll respond as soon as possible.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-white border-b">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-primary-900 mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-700">{info.detail}</p>
                  <p className="text-gray-500 text-sm">{info.subDetail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-primary-900 mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below and our team will get back to you
                    within 24 hours.
                  </p>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-lg p-8 text-center"
                  >
                    <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-accent-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you
                      within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="Full Name"
                          placeholder="John Doe"
                          error={errors.name?.message}
                          {...register("name")}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="john@company.com"
                          error={errors.email?.message}
                          {...register("email")}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label="Phone Number"
                          type="tel"
                          placeholder="+91 98765 43210"
                          error={errors.phone?.message}
                          {...register("phone")}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inquiry Type
                          </label>
                          <select
                            className="input w-full"
                            {...register("inquiryType")}
                          >
                            <option value="">Select inquiry type</option>
                            {inquiryTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {errors.inquiryType && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.inquiryType.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Input
                        label="Subject"
                        placeholder="What is this regarding?"
                        error={errors.subject?.message}
                        {...register("subject")}
                      />

                      <Textarea
                        label="Message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        error={errors.message?.message}
                        {...register("message")}
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>

              {/* FAQ Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-primary-900 mb-4">
                    Quick Answers
                  </h2>
                  <p className="text-gray-600">
                    Find answers to common questions or explore our resources.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="/how-it-works"
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-primary-900 mb-2">
                      How does Gryork work?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Learn about our bill discounting platform and how it
                      benefits all stakeholders.
                    </p>
                  </a>

                  <a
                    href="/for-nbfc"
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-primary-900 mb-2">
                      I&apos;m an NBFC - How do I partner?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Discover partnership opportunities and apply to join our
                      NBFC network.
                    </p>
                  </a>

                  <a
                    href="/for-epc"
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-primary-900 mb-2">
                      I&apos;m an EPC - How do I onboard?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Learn how EPCs can support their sub-contractors through
                      our platform.
                    </p>
                  </a>

                  <a
                    href="/for-subcontractors"
                    className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-primary-900 mb-2">
                      I&apos;m a Sub-Contractor - How do I start?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get started with quick working capital against your
                      validated bills.
                    </p>
                  </a>
                </div>

                {/* Map placeholder */}
                <div className="mt-8 bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p>Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

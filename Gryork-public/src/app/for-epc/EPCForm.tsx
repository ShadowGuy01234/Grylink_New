"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Input, Textarea } from "@/components/ui";
import { CheckCircle, Loader2 } from "lucide-react";

const epcFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(15, "Phone number is too long"),
  subContractorCount: z.string().min(1, "Please select an option"),
  preferredTime: z.string().min(1, "Please select preferred contact time"),
  message: z.string().optional(),
});

type EPCFormData = z.infer<typeof epcFormSchema>;

const subContractorOptions = [
  { value: "1-10", label: "1-10 Sub-Contractors" },
  { value: "11-50", label: "11-50 Sub-Contractors" },
  { value: "51-100", label: "51-100 Sub-Contractors" },
  { value: "100+", label: "100+ Sub-Contractors" },
];

const preferredTimeOptions = [
  { value: "morning", label: "Morning (9 AM - 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
  { value: "evening", label: "Evening (4 PM - 7 PM)" },
];

export default function EPCForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EPCFormData>({
    resolver: zodResolver(epcFormSchema),
  });

  const onSubmit = async (data: EPCFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("EPC Form submitted:", data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-accent-600" />
        </div>
        <h3 className="text-2xl font-bold text-primary-900 mb-2">
          Thank You for Reaching Out!
        </h3>
        <p className="text-gray-600 mb-6">
          Our team will contact you within 24 hours to schedule a demo.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Submit another inquiry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            placeholder="Enter your company name"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
          <Input
            label="Contact Person"
            placeholder="Your full name"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Designation"
            placeholder="e.g., Project Manager, Director"
            error={errors.designation?.message}
            {...register("designation")}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="business@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register("phone")}
        />

        {/* Number of Sub-Contractors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Sub-Contractors You Work With
          </label>
          <div className="grid grid-cols-2 gap-3">
            {subContractorOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
              >
                <input
                  type="radio"
                  value={option.value}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  {...register("subContractorCount")}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.subContractorCount && (
            <p className="text-sm text-red-600 mt-1">
              {errors.subContractorCount.message}
            </p>
          )}
        </div>

        {/* Preferred Contact Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Contact Time
          </label>
          <div className="grid grid-cols-3 gap-3">
            {preferredTimeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-center p-3 border rounded-lg cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 text-center"
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register("preferredTime")}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.preferredTime && (
            <p className="text-sm text-red-600 mt-1">
              {errors.preferredTime.message}
            </p>
          )}
        </div>

        {/* Message */}
        <Textarea
          label="Message (Optional)"
          placeholder="Tell us about your current projects, vendor payment challenges, or any specific requirements..."
          rows={4}
          error={errors.message?.message}
          {...register("message")}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request a Demo"
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to our{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </form>
    </motion.div>
  );
}

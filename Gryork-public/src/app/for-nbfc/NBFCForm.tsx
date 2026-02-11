"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";

const nbfcFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  rbiRegistration: z.string().min(5, "RBI Registration number is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  designation: z.string().min(2, "Designation is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  aumRange: z.string().min(1, "Please select AUM range"),
  sectors: z.array(z.string()).min(1, "Select at least one sector"),
  message: z.string().optional(),
});

type NBFCFormData = z.infer<typeof nbfcFormSchema>;

const aumOptions = [
  { value: "below-50", label: "Below ₹50 Cr" },
  { value: "50-200", label: "₹50 - 200 Cr" },
  { value: "200-500", label: "₹200 - 500 Cr" },
  { value: "above-500", label: "Above ₹500 Cr" },
];

const sectorOptions = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "construction", label: "Construction" },
  { value: "energy", label: "Energy" },
  { value: "transportation", label: "Transportation" },
  { value: "manufacturing", label: "Manufacturing" },
];

export default function NBFCForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NBFCFormData>({
    resolver: zodResolver(nbfcFormSchema),
    defaultValues: {
      sectors: [],
    },
  });

  const selectedSectors = watch("sectors") || [];

  const toggleSector = (sector: string) => {
    const current = selectedSectors;
    if (current.includes(sector)) {
      setValue(
        "sectors",
        current.filter((s) => s !== sector)
      );
    } else {
      setValue("sectors", [...current, sector]);
    }
  };

  const onSubmit = async (data: NBFCFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Form data:", data);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-accent-600" />
        </div>
        <h3 className="text-2xl font-bold text-primary-900 mb-2">
          Application Submitted!
        </h3>
        <p className="text-gray-600">
          Thank you for your interest. Our team will contact you within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-gray-50 rounded-2xl p-8"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          id="companyName"
          label="Company Name"
          placeholder="ABC Finance Ltd"
          required
          {...register("companyName")}
          error={errors.companyName?.message}
        />
        <Input
          id="rbiRegistration"
          label="RBI Registration Number"
          placeholder="N-XX.XXXXX"
          required
          {...register("rbiRegistration")}
          error={errors.rbiRegistration?.message}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          id="contactPerson"
          label="Contact Person"
          placeholder="Full Name"
          required
          {...register("contactPerson")}
          error={errors.contactPerson?.message}
        />
        <Input
          id="designation"
          label="Designation"
          placeholder="e.g., Head of Lending"
          required
          {...register("designation")}
          error={errors.designation?.message}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          required
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          id="phone"
          type="tel"
          label="Phone"
          placeholder="+91 XXXXX XXXXX"
          required
          {...register("phone")}
          error={errors.phone?.message}
        />
      </div>

      {/* AUM Range */}
      <div>
        <label className="label">
          AUM Range <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {aumOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                watch("aumRange") === option.value
                  ? "border-primary-600 bg-primary-50 text-primary-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                value={option.value}
                {...register("aumRange")}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.aumRange && (
          <p className="mt-1.5 text-sm text-red-500">{errors.aumRange.message}</p>
        )}
      </div>

      {/* Sectors */}
      <div>
        <label className="label">
          Interested Sectors <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {sectorOptions.map((sector) => (
            <button
              key={sector.value}
              type="button"
              onClick={() => toggleSector(sector.value)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                selectedSectors.includes(sector.value)
                  ? "border-primary-600 bg-primary-50 text-primary-600"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {sector.label}
            </button>
          ))}
        </div>
        {errors.sectors && (
          <p className="mt-1.5 text-sm text-red-500">{errors.sectors.message}</p>
        )}
      </div>

      <Textarea
        id="message"
        label="Message (Optional)"
        placeholder="Tell us about your lending focus or any specific requirements..."
        rows={4}
        {...register("message")}
      />

      <Button type="submit" variant="secondary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </motion.form>
  );
}

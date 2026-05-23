import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is this an online or offline program?",
    a: "This is a hybrid program with primarily offline sessions at our center. However, certain guest sessions by industry experts will be conducted online.",
  },
  {
    q: "Who can participate in this training?",
    a: "The program is exclusively designed for B.Tech students (all branches and years) who want to gain practical industry exposure before graduating.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes, upon successful completion and project submission, you will receive an industry-recognized certificate from Gryork Consultants Pvt Ltd (A DPIIT Recognized Startup).",
  },
  {
    q: "Do I need prior coding experience?",
    a: "Basic understanding of computers is sufficient. Our program covers everything from fundamentals to advanced tools, and mentorship is provided at every step.",
  },
  {
    q: "How do I choose my specialization track?",
    a: "You will be introduced to all three tracks in Week 1. Based on your interest and mentor guidance, you can select your final track for Week 2 onwards.",
  },
  {
    q: "Is the registration fee refundable?",
    a: "No, the registration fee is strictly non-refundable as seats are limited and resources are allocated per student in advance.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-pad" ref={ref}>
      <div className="page-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-blue mb-4 inline-block">FAQ</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            Common <span className="text-highlight">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`card overflow-hidden transition-colors ${isOpen ? "border-gry-blue-main ring-1 ring-gry-blue-main/30" : "hover:border-gry-blue-light/40"}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-[#060C1A]"
                >
                  <span className={`font-semibold text-sm sm:text-base pr-4 ${isOpen ? "text-gry-blue-main dark:text-gry-blue-light" : "text-slate-800 dark:text-slate-200"}`}>
                    {faq.q}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-gry-blue-main/10 text-gry-blue-main" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-5 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-[#060C1A]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

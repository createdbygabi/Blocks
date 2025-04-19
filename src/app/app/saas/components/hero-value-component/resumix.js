"use client";

import { motion } from "framer-motion";
import { FiArrowDown, FiCheck, FiMail } from "react-icons/fi";

export default function ResumixHero({ styles }) {
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Before - Better Centered UI */}
        <div
          className={`${styles.card} rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] overflow-hidden mb-3 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)] transition-shadow duration-300`}
        >
          <div className="py-5 px-6 flex items-center">
            <div className="flex-shrink-0 w-24 h-18 relative flex items-center justify-center">
              <div className="text-[80px] font-black text-red-500/15 leading-none">
                0
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[70px] font-black text-red-500 leading-none">
                  0
                </span>
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  <span>!</span>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <h3 className={`${styles.text.primary} font-bold text-xl`}>
                No Interviews
              </h3>
              <p className={`${styles.text.secondary} text-sm`}>
                Your resume is being filtered out
              </p>
            </div>
          </div>
        </div>

        {/* Arrow Divider - Bigger and Matching Theme */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-[#0EA5E9] flex items-center justify-center shadow-md">
            <FiArrowDown className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* After - Better Centered UI */}
        <div
          className={`${styles.card} rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05)] overflow-hidden mb-5 hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)] transition-shadow duration-300`}
        >
          <div className="py-5 px-6 flex items-center">
            <div className="flex-shrink-0 w-24 h-18 relative flex items-center justify-center">
              <div className="text-[80px] font-black text-[#0EA5E9]/15 leading-none">
                +5
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[70px] font-black text-[#0EA5E9] leading-none">
                  +5
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className={`${styles.text.primary} font-bold text-xl`}>
                Interviews
              </h3>
              <p className={`${styles.text.secondary} text-sm`}>
                <span className="text-emerald-500 font-semibold">500%</span>{" "}
                more responses
              </p>
            </div>
          </div>
        </div>

        {/* Compact Interview Cards */}
        <div className="space-y-2.5">
          {/* Inbox Title */}
          <div className="px-1 mb-1.5">
            <div className="flex items-center">
              <FiMail className="text-[#0EA5E9] mr-2 w-3.5 h-3.5" />
              <span className={`font-medium text-sm ${styles.text.primary}`}>
                New Messages (2)
              </span>
            </div>
          </div>

          {/* TechNova Card - Compact */}
          <div
            className={`${styles.card} rounded-xl p-3 border-l-3 border-[#0EA5E9]`}
          >
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center mr-2.5">
                <span className="font-bold text-xs">T</span>
              </div>
              <div className="min-w-0">
                <h4
                  className={`font-medium ${styles.text.primary} text-sm truncate`}
                >
                  TechNova Interview Invitation
                </h4>
                <p className={`text-xs ${styles.text.secondary} truncate`}>
                  Thank you for your application to Software Developer. We'd
                  like to schedule an interview...
                </p>
              </div>
            </div>
          </div>

          {/* Quantum Card - Compact */}
          <div
            className={`${styles.card} rounded-xl p-3 border-l-3 border-[#0EA5E9]`}
          >
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center mr-2.5">
                <span className="font-bold text-xs">Q</span>
              </div>
              <div className="min-w-0">
                <h4
                  className={`font-medium ${styles.text.primary} text-sm truncate`}
                >
                  Quantum Systems Technical Round
                </h4>
                <p className={`text-xs ${styles.text.secondary} truncate`}>
                  After reviewing your qualifications, we're inviting you to a
                  technical interview on Tuesday at 2pm...
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

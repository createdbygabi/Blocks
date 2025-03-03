"use client";

import { motion } from "framer-motion";

export function Testimonials({ styles, testimonial }) {
  return (
    <section className={`py-16 ${styles.layout.surface}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`${styles.card} max-w-3xl mx-auto p-8 rounded-2xl relative`}
        >
          {/* Success Metrics */}
          <div
            className={`absolute -top-3 -right-3 px-4 py-2 rounded-full text-sm font-medium ${styles.utils.highlight} ${styles.text.accent}`}
          >
            10x faster workflow
          </div>

          {/* Profile and Quote */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left: Profile */}
            <div className="flex-shrink-0 text-center md:text-left">
              <img
                src="/testimonials/user1.jpg"
                alt="Sarah Chen"
                className="w-16 h-16 rounded-full object-cover mx-auto md:mx-0 mb-3"
              />
              <div className={`font-semibold ${styles.text.primary}`}>
                Sarah Chen
              </div>
              <div className={`text-sm ${styles.text.secondary}`}>
                Digital Marketing Manager
              </div>
              <div className={`text-sm ${styles.text.accent} mt-1`}>
                @socialmedia_sarah
              </div>
            </div>

            {/* Right: Quote and Results */}
            <div>
              <blockquote className={`text-xl ${styles.text.primary} mb-4`}>
                "I was spending 3 hours every day manually posting content. Now
                I schedule a week's worth of content in just 15 minutes. This
                tool has literally given me my weekends back!"
              </blockquote>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100/10">
                <div>
                  <div className={`text-2xl font-bold ${styles.text.accent}`}>
                    85%
                  </div>
                  <div className={`text-sm ${styles.text.secondary}`}>
                    Time saved
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${styles.text.accent}`}>
                    2.3x
                  </div>
                  <div className={`text-sm ${styles.text.secondary}`}>
                    Engagement
                  </div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${styles.text.accent}`}>
                    12k+
                  </div>
                  <div className={`text-sm ${styles.text.secondary}`}>
                    New followers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100/10">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${styles.text.accent}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className={`text-sm ${styles.text.muted}`}>
              Verified Customer • 6 months ago
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

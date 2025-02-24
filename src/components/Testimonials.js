import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "The concept of AI-powered business automation is revolutionary. I've already joined the waitlist to ensure I don't miss out.",
    author: "Sarah Chen",
    title: "Tech Entrepreneur",
    avatar: "/avatars/sarah.jpg",
  },
  {
    quote:
      "As someone who's built multiple 7-figure businesses, this is exactly what the market needs. The future of entrepreneurship.",
    author: "Michael Roberts",
    title: "Serial Entrepreneur",
    avatar: "/avatars/michael.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/[0.02] to-white/0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-['Clash_Display'] mb-6 tracking-[-0.02em]">
          Early Feedback
        </h2>
        <p className="text-white/60 mb-16 max-w-2xl mx-auto tracking-wide text-base md:text-lg">
          Join these visionaries on the waitlist
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl blur-sm transition-all duration-500 group-hover:from-white/[0.04] group-hover:blur-md" />
            <div className="relative p-8 rounded-xl bg-gradient-to-b from-white/[0.01] to-transparent backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
              <p className="text-base md:text-lg text-white/70 mb-8 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-white/[0.05] rounded-full blur-sm" />
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="relative w-12 h-12 rounded-full border border-white/[0.05] object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white/80">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-white/40">{testimonial.title}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

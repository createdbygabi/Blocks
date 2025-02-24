import { motion } from "framer-motion";

const features = [
  {
    title: "EARLY ADOPTER BENEFITS",
    description:
      "Get lifetime VIP access, premium features, and founder-tier pricing — exclusively for waitlist members.",
    icon: "★",
  },
  {
    title: "FIRST TO MARKET",
    description:
      "Be among the first to leverage AI for automated business building.",
    icon: "◈",
  },
  {
    title: "GUARANTEED SPOT",
    description:
      "Limited spots available. Join the waitlist now to secure your position when we launch.",
    icon: "⬡",
  },
];

export default function Features() {
  return (
    <section className="py-12 sm:py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/[0.02] to-white/0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center px-4 sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Clash_Display'] mb-3 sm:mb-4 lg:mb-6 tracking-[-0.02em]">
          Why Join Early?
        </h2>
        <p className="text-white/60 mb-8 sm:mb-12 lg:mb-16 max-w-2xl mx-auto tracking-wide text-sm sm:text-base lg:text-lg">
          Secure your competitive advantage
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-b from-white/[0.03] to-transparent rounded-xl blur-sm transition-all duration-500 group-hover:from-white/[0.05] group-hover:blur-md" />
            <div className="relative p-4 sm:p-6 lg:p-8 rounded-xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm h-full">
              <div className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4 font-['Monument_Extended'] text-white/30 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-['Clash_Display'] font-bold mb-2 sm:mb-3 text-white/90">
                {feature.title}
              </h3>
              <p className="text-white/50 leading-relaxed text-xs sm:text-sm lg:text-base">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

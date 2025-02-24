import { motion } from "framer-motion";

const benefits = [
  {
    title: "Early Access",
    description: "Be among the first to experience the future",
  },
  {
    title: "Exclusive Perks",
    description: "Special benefits for waitlist members",
  },
  {
    title: "Founding Member Status",
    description: "Join our exclusive founding members club",
  },
];

export default function Benefits() {
  return (
    <section className="py-20">
      <h2 className="text-4xl font-bold text-center mb-12">Why Join Now?</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
            <p className="text-gray-400">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

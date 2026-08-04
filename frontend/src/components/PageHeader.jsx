import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="page-container pt-8 pb-6"
    >
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">{title}</h1>
      {subtitle && <p className="text-ink-300 mt-2 text-[15px] leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}

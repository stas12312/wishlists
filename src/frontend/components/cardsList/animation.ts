export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: 1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, transform: "translateY(-20px)" },
  show: {
    opacity: 1,
    transition: { duration: 0.3 },
    transform: "translateY(0px)",
  },
  exit: {
    opacity: 0,
    transform: "translateY(-20px)",
    transition: { duration: 0.1 },
  },
};

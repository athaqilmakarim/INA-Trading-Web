import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const InapassComingSoon = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const lockVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-red-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-filter backdrop-blur-sm rounded-2xl shadow-2xl p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex justify-center mb-8"
          variants={itemVariants}
        >
          <motion.div
            variants={lockVariants}
            initial="initial"
            animate="animate"
          >
            <FaLock className="text-white text-6xl" />
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-center text-white mb-4"
          variants={itemVariants}
        >
          Coming Soon
        </motion.h1>

        <motion.p
          className="text-gray-300 text-center mb-8"
          variants={itemVariants}
        >
          INAPASS authentication is currently under development. We're working hard to bring you this feature soon!
        </motion.p>

        <motion.div
          className="flex justify-center"
          variants={itemVariants}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Stay tuned for updates!
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InapassComingSoon; 
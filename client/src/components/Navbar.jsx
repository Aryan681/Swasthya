import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/triage', label: 'Triage' },
  { to: '/map', label: 'ClinicLocator' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] bg-white/30 backdrop-blur-md shadow-md border-b border-white/40">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
            Swasthya
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 lg:gap-8">
          {navLinks.map(link => (
            <motion.div
              key={link.to}
              whileHover={{ scale: 1.12, color: '#4F8CFF' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                to={link.to}
                className="text-gray-700 hover:text-blue-600 font-semibold px-2 py-1 rounded transition-colors duration-200"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-100"
            >
              <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
                {navLinks.map(link => (
                  <motion.div
                    key={link.to}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={link.to}
                      className="block text-gray-700 hover:text-blue-600 font-semibold px-3 py-2 rounded-lg transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
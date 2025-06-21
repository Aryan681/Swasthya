import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/triage', label: 'Triage' },
  { to: '/map', label: 'ClinicLocator' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md shadow-md border-b border-white/40">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
            Swasthya
          </Link>
        </motion.div>
        <div className="flex gap-4 md:gap-8">
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
      </div>
    </nav>
  );
} 
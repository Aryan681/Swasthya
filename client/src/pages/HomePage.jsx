import { motion } from 'framer-motion';
import { FaHeartbeat, FaClinicMedical, FaLanguage, FaShieldAlt, FaUserMd, FaChartLine, FaMobileAlt } from 'react-icons/fa';
import medicalTeam from '../assets/medical-team.jpg';
import appInterface from '../assets/app-interface.png';
import haitiMap from '../assets/haiti-map.png';
import statsGraphic from '../assets/stats-graphic.jpg';

export default function HomePage() {
  return (
    <div className="bg-white w-full font-sans">
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/40 z-0" />
        <img 
          src={medicalTeam} 
          alt="Medical professionals in Haiti"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col justify-center min-h-screen px-6 py-24 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              <span className="text-blue-500">Advanced</span> Medical Triage <br />
              <span className="text-orange-300">for Haiti</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto"
            >
              AI-powered diagnostic support bridging the healthcare gap in underserved communities
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a 
                href="/triage" 
                className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Start Triage Assessment
              </a>
              <a 
                href="#how-it-works" 
                className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold text-lg rounded-lg border border-white/40 transition-all hover:scale-105"
              >
                Learn More
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Healthcare Access Crisis in Haiti
            </h2>
            <div className="w-24 h-1 bg-orange-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              With only <strong>2.5 physicians per 10,000 people</strong>, rural communities face critical delays in medical assessment. 
              Swasthya bridges this gap with immediate AI triage.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaUserMd className="text-4xl text-blue-600 mb-4" />,
                title: "Physician Shortage",
                stat: "2.5 per 10,000",
                desc: "Far below WHO recommended minimum"
              },
              {
                icon: <FaClinicMedical className="text-4xl text-blue-600 mb-4" />,
                title: "Clinic Distance",
                stat: "15km average",
                desc: "For rural populations"
              },
              {
                icon: <FaHeartbeat className="text-4xl text-blue-600 mb-4" />,
                title: "Response Time",
                stat: "48+ hours",
                desc: "For critical conditions"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center"
              >
                <div className="flex justify-center">{item.icon}</div>
                <h3 className="text-2xl font-bold text-blue-800 mb-2">{item.title}</h3>
                <p className="text-4xl font-bold text-orange-500 mb-3">{item.stat}</p>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Our <span className="text-orange-500">Technology</span>
            </h2>
            <div className="w-24 h-1 bg-orange-400 mx-auto mb-8"></div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src={appInterface} 
                alt="Swasthya app interface"
                className="rounded-xl shadow-2xl border-8 border-white w-full max-w-lg mx-auto"
              />
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -right-8 bg-white p-4 rounded-lg shadow-lg border border-gray-200"
              >
                <FaMobileAlt className="text-4xl text-blue-600" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">1. Symptom Input</h3>
                  <p className="text-lg text-gray-700">
                    Patients describe symptoms in English or Haitian Creole via text or voice input.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">2. AI Analysis</h3>
                  <p className="text-lg text-gray-700">
                    Our medically-validated algorithm assesses urgency and potential conditions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">3. Action Plan</h3>
                  <p className="text-lg text-gray-700">
                    Immediate recommendations tailored to available local resources.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact & Features */}
      <section className="py-24 px-6 bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proven <span className="text-orange-300">Impact</span>
            </h2>
            <div className="w-24 h-1 bg-orange-400 mx-auto mb-8"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={statsGraphic} 
                alt="Health impact statistics"
                className="rounded-xl shadow-lg w-full"
              />
            </motion.div>
            
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {[
                {
                  icon: <FaChartLine className="text-3xl text-orange-300" />,
                  title: "87% Accuracy",
                  desc: "In preliminary diagnosis matching physician assessment"
                },
                {
                  icon: <FaShieldAlt className="text-3xl text-orange-300" />,
                  title: "3x Faster",
                  desc: "Emergency response time for critical cases"
                },
                {
                  icon: <FaLanguage className="text-3xl text-orange-300" />,
                  title: "100% Bilingual",
                  desc: "Fully accessible in both English and Haitian Creole"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-blue-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-blue-800/50 p-8 rounded-xl"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Clinic Integration</h3>
                <p className="text-blue-100">
                  Our system directs patients to the nearest appropriate healthcare facility, with case details 
                  pre-shared when possible.
                </p>
              </div>
              <div>
                <img 
                  src={haitiMap} 
                  alt="Healthcare facility map"
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-gradient-to-r from-blue-700 to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to <span className="text-orange-300">Deploy</span> in Your Community?
            </h2>
            <div className="w-24 h-1 bg-orange-400 mx-auto mb-8"></div>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Implement Swasthya's AI triage system to improve healthcare access and save lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/triage" 
                className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Start Triage
              </a>
             
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
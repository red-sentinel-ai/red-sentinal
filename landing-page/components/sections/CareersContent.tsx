'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const jobOpenings = [
  {
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full Time',
    slug: 'frontend-developer',
    responsibilities: [
      'Develop and maintain scalable, robust, and performant frontend applications using React, TypeScript, and CSS',
      'Translate designs from Figma into complex layouts and animations',
    ],
    about: [
      'Strong general engineering ability: writing modular, maintainable code within a complex codebase',
      'Deep understanding of modern React and TypeScript concepts',
      'Expertise in responsive and adaptive design principles',
      'Excellent problem-solving skills and attention to detail',
      'Have Decent understanding of blockchain technology and portfolio of Web3 apps.',
    ],
  },
  {
    title: 'Web Designer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full Time',
    slug: 'web-designer',
    responsibilities: [
      'Create wireframes, mockups, and prototypes for website and application interfaces',
      'Collaborate with developers to ensure faithful translation of designs into code',
      'Maintain and evolve the brand’s visual identity across all digital platforms',
    ],
    about: [
      'Proficiency in design tools like Figma, Sketch, or Adobe XD',
      'Strong portfolio showcasing visual design skills and user-centric design thinking',
      'Understanding of HTML, CSS, and responsive design principles',
      'Creative mindset with a keen eye for detail and aesthetics',
    ],
  },
]

export function CareersContent() {
  return (
    <>
      <section
        className="py-24 pt-48 relative text-black min-h-screen bg-no-repeat"
        style={{
          backgroundImage: "url('/img/hero_bg.png')",
          backgroundSize: '100% auto',
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Work With Us</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Join our mission to build the future of decentralized AI security.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
            <div className="flex flex-col gap-8">
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border border-black p-6 rounded-lg flex flex-col"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold">{job.title}</h3>
                      <p className="text-gray-600 mt-1">
                        {job.department} • {job.location} • {job.type}
                      </p>
                    </div>
                    <Link
                      href={`/careers/apply/${job.slug}`}
                      className="btn btn-outline mt-4 md:mt-0 flex items-center justify-center"
                    >
                      Apply Now
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold mb-3">Key Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>

                    <h4 className="text-lg font-semibold mt-6 mb-3">About You</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {job.about.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {jobOpenings.length === 0 && (
              <p className="text-lg text-gray-700 text-center py-10">
                We don&apos;t have any open positions right now, but we&apos;re always looking for
                talented people. Feel free to reach out!
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

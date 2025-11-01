'use client'

import { motion } from 'framer-motion'

const jobOpenings = [
  {
    title: 'Web Designer',
    location: 'Remote',
    type: 'Internship',
  },
]

export function CareersContent() {
  return (
    <section className="py-24 pt-48 relative text-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Work With Us</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join our mission to build the future of decentralized AI security.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="flex flex-col gap-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-black p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <h3 className="text-2xl font-semibold">{job.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {job.location} • {job.type}
                  </p>
                </div>
                <button className="btn btn-outline mt-4 md:mt-0">Apply Now</button>
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
  )
}

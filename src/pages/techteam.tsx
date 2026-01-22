import { motion } from 'framer-motion'
import TechCard from '../components/TechCard'

// Sample tech team members data
const people = [
  {
    image: '/chill.jpg',
    name: 'Tech Lead',
    quote: 'Building the future one line at a time.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Frontend Dev',
    quote: 'Making things look good.',
    socials: { instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'UI/UX Designer',
    quote: 'Designing experiences.',
    socials: { instagram: '#', linkedin: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'DevOps',
    quote: 'Keeping it all running.',
    socials: { github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
];

export default function TechTeamPage() {
  return (
    <>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Michroma&display=swap');`}
      </style>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/temp_event_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <section className="flex flex-col items-center w-full py-12 px-4">
        {/* Tech Team Section */}
        <div className="relative pt-20 flex flex-col items-center justify-center w-full">
          {/* Animated Title - Fade Up */}
          <motion.h1
            className="font-['Michroma'] text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent tracking-wider text-center whitespace-nowrap"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.5
            }}
          >
            TECH TEAM
          </motion.h1>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16 w-full max-w-6xl justify-items-center">
            {people.map((member, index) => (
              <TechCard
                key={index}
                image={member.image}
                name={member.name}
                quote={member.quote}
                socials={member.socials}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

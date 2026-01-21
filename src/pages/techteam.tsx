import { motion } from 'framer-motion'
import Slideshow from '../components/slideshow/slideshow'
import TechCard from '../components/TechCard'

// Sample tech team members data
const people = [
  {
    image: '/chill.jpg',
    name: 'Tech Lead',
    role: 'FullStack',
    quote: 'Building the future one line at a time.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Frontend Dev',
    role: 'FullStack',
    quote: 'Making things look good.',
    socials: { instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    role: 'FullStack',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    role: 'FullStack',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Backend Dev',
    role: 'FullStack',
    quote: 'Handling the heavy lifting.',
    socials: { linkedin: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'UI/UX Designer',
    role: 'Frontend',
    quote: 'Designing experiences.',
    socials: { instagram: '#', linkedin: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'DevOps',
    role: 'Backend',
    quote: 'Keeping it all running.',
    socials: { github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Backend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Backend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Backend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Frontend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Frontend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Frontend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Backend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
  {
    image: '/chill.jpg',
    name: 'Full Stack',
    role:'Frontend',
    quote: 'Jack of all trades.',
    socials: { linkedin: '#', instagram: '#', github: '#' }
  },
];

export default function TechTeamPage() {
  const teamImages = [
    '/temp_event_bg.png',
    '/temp_event_bg.png',
    '/temp_event_bg.png',
  ];

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
        <Slideshow
          images={teamImages}
          autoplayDelay={4000}
        />
        {/* Fullstack section */}
        <div className="relative pt-20 mt-10 flex flex-col items-center justify-center w-full">
        {/* Animated Title - Fade Up */}
          <motion.h1
            className="font-['Michroma'] text-4xl sm:text-5xl sm:top-13 md:top-11 lg:top-4  top-16 text-center md:text-6xl absolute lg:text-8xl font-bold w-full mt-12 bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent tracking-wider"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut", 
              delay: 0.5
            }}
          >
            FULL STACK
          </motion.h1>

          {/* Team Members Grid */}
          <div className="flex flex-wrap  relative z-20 gap-16 mt-16 w-full max-w-4xl justify-center">
            {people.filter(member => member.role === 'FullStack').map((member, index) => (
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
        {/* Frontend section */}
        <div className="relative pt-20 mt-20 flex flex-col items-center justify-center w-full">
        {/* Animated Title - Fade Up */}
          <motion.h1
            className="font-['Michroma'] text-4xl sm:text-5xl sm:top-13 md:top-11 lg:top-4  top-16 text-center md:text-6xl absolute lg:text-8xl font-bold w-full mt-12 bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent tracking-wider"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut", 
              delay: 0.5
            }}
          >
            FRONT END
          </motion.h1>

          {/* Team Members Grid */}
          <div className="flex flex-wrap  relative z-20 gap-16 mt-16 w-full max-w-4xl justify-center">
            {people.filter(member => member.role === 'Frontend').map((member, index) => (
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
        {/* Back End section */}
        <div className="relative pt-20 mt-20 flex flex-col items-center justify-center w-full">
        {/* Animated Title - Fade Up */}
          <motion.h1
            className="font-['Michroma'] text-4xl sm:text-5xl sm:top-13 md:top-11 lg:top-4  top-16 text-center md:text-6xl absolute lg:text-8xl font-bold w-full mt-12 bg-gradient-to-b from-white via-white to-transparent bg-clip-text text-transparent tracking-wider"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut", 
              delay: 0.5
            }}
          >
            BACK END
          </motion.h1>

          {/* Team Members Grid */}
          <div className="flex flex-wrap  relative z-20 gap-16 mt-16 w-full max-w-4xl justify-center">
            {people.filter(member => member.role === 'Backend').map((member, index) => (
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

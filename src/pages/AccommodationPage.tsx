import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import { IndividualBookingForm, TeamBookingForm } from '../components/accommodation/BookingForms'
import { getAccommodationStats } from '../api/accommodation'
import { Loader2, Moon, Users, User, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function AccommodationPage() {
  const [activeTab, setActiveTab] = useState(0)

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['accommodationStats'],
    queryFn: getAccommodationStats,
  })

  // Simple check - in real app might want to check user gender context too if applicable
  const accommodationsFull = stats && stats.boys.available <= 0 && stats.girls.available <= 0

  return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <header className="mb-10 text-center relative">
           <h1 className="text-4xl md:text-5xl font-font-heading font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 mb-4">
            Accommodation
           </h1>
           <p className="text-gray-400 max-w-2xl mx-auto">
             Book your stay for Incridea. Secure a spot for yourself or your team.
             Limited availability!
           </p>
        </header>

        {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats / Info Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                            <Moon className="w-5 h-5 mr-2 text-yellow-400" /> Availability
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Boys</span>
                                <span className={clsx("font-bold px-2 py-1 rounded text-sm", 
                                    (stats?.boys.available || 0) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                    {stats?.boys.available} Beds Left
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                <span className="text-gray-300">Girls</span>
                                <span className={clsx("font-bold px-2 py-1 rounded text-sm", 
                                    (stats?.girls.available || 0) > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                    {stats?.girls.available} Beds Left
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-xs text-gray-500">
                            * Accommodation is provided on a first-come, first-served basis.
                        </div>
                    </div>
                </div>

                {/* Booking Forms */}
                <div className="lg:col-span-2">
                     <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                            <Tab.List className="flex border-b border-white/10">
                                <Tab className={({ selected }) =>
                                    clsx('flex-1 py-4 text-sm font-medium focus:outline-none transition-colors flex justify-center items-center',
                                    selected ? 'bg-white/10 text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-white/5')
                                }>
                                    <User className="w-4 h-4 mr-2" /> Individual
                                </Tab>
                                <Tab className={({ selected }) =>
                                    clsx('flex-1 py-4 text-sm font-medium focus:outline-none transition-colors flex justify-center items-center',
                                    selected ? 'bg-white/10 text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white hover:bg-white/5')
                                }>
                                    <Users className="w-4 h-4 mr-2" /> Team
                                </Tab>
                            </Tab.List>
                            <Tab.Panels className="p-6">
                                <Tab.Panel>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                        {accommodationsFull ? (
                                            <div className="text-center py-10 text-red-400">
                                                Accommodation is currently full. Please check back later.
                                            </div>
                                        ) : (
                                            <IndividualBookingForm onSuccess={() => refetch()} />
                                        )}
                                    </motion.div>
                                </Tab.Panel>
                                <Tab.Panel>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                         {accommodationsFull ? (
                                            <div className="text-center py-10 text-red-400">
                                                Accommodation is currently full. Please check back later.
                                            </div>
                                        ) : (
                                            <TeamBookingForm onSuccess={() => refetch()} />
                                        )}
                                    </motion.div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                     </div>
                </div>
            </div>
        )}
      </div>
  )
}

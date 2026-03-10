import HeroCarousel from '../components/Home/HeroCarousel';
import Completed from '../components/Home/Completed';
import New from '../components/Home/New';
import Update from '../components/Home/Update';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex flex-col gap-10 pb-20'
    >
      {/* Trending Hero Section */}
      <HeroCarousel />

      {/* Home Content Sections */}
      <div className='max-w-7xl mx-auto w-full px-6 space-y-16'>
        <Update />
        <Completed />
        <New />
      </div>
    </motion.div>
  )
}
export default Home;
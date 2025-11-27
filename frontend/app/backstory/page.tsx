import { Metadata } from 'next'
import { BackstoryGridWrapper } from '@/components/backstory/BackstoryGridWrapper'

export const metadata: Metadata = {
  title: 'Backstory | Sui Sentinel',
  description: 'Explore the lore and origins of the Sui Sentinel AI agents.',
}

const STORIES = [
  {
    id: 'arc-1',
    arcLabel: 'Arc 1',
    title: 'The Awakening',
    image: '/img/the_awaking_circles.png',
    imgWidth: 276,
    imgHeight: 252,
    activeGradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
    borderColor: 'border-[#F632F3]',
    imgClass: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    link: '/backstory/the-awakening',
  },
  {
    id: 'arc-2',
    arcLabel: 'Arc 2',
    title: 'The Cosmic Roast',
    image: '/img/the_cosmic_roast_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
    borderColor: 'border-[#049414]',
    imgClass: 'top-0 left-1/2 -translate-x-1/2 w-full',
    link: '/backstory/the-cosmic-roast',
  },
  {
    id: 'arc-3',
    arcLabel: 'Arc 3',
    title: 'The Ego Crisis',
    image: '/img/the_ego_crisis_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
    borderColor: 'border-[#C532F6]',
    imgClass: 'top-0 left-1/2 -translate-x-1/2 w-full mix-blend-difference',
    link: '/backstory/the-ego-crisis',
  },
  {
    id: 'arc-4',
    arcLabel: 'Arc 4',
    title: 'The Challenge Begins',
    image: '/img/the_challenge_begins_circles.png',
    imgWidth: 644,
    imgHeight: 854,
    activeGradient: 'bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9]',
    borderColor: 'border-[#947204]',
    imgClass: 'top-0 -left-4 w-full',
    link: '/backstory/the-challenge-begins',
  },
]

export default function BackStoryPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-4 pt-40 min-h-body leading-loose">
      <h1 className="text-2xl md:text-[48px] font-bold mb-20">
        <span>THE SUI SENTINEL</span>
        <br />
        <br />
        <span className="text-[#C871FF]">BACKSTORY</span>
      </h1>

      <BackstoryGridWrapper stories={STORIES} />
    </div>
  )
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import NumberFlow from '@number-flow/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  year: number;
  heading: string;
  description: string;
  image: string;
  imageAlt?: string;
}

export interface HistoryTimelineProps {
  title?: string;
  introText?: string;
  events?: TimelineEvent[];
  defaultYear?: number;
  className?: string;
}

const defaultTimelineEvents: TimelineEvent[] = [
  {
    year: 2018,
    heading: "FOUNDATION YEAR",
    description: "Foundation year.",
    image: "/images/history/placeholder-03.jpg",
    imageAlt: "KTH AI Society founding",
  },
  {
    year: 2019,
    heading: "FIRST AI DAY",
    description: "We had our first AI Day in 2019, marking the beginning of our flagship event series.",
    image: "/images/history/mckinsey-2023.jpg",
    imageAlt: "First AI Day 2019",
  },
  {
    year: 2020,
    heading: "MCKINSEY PARTNERSHIP",
    description: "Landed McKinsey sponsor in 2020, establishing a long-term partnership that would support our growth and initiatives.",
    image: "/images/history/mckinsey-2024.jpg",
    imageAlt: "McKinsey partnership 2020",
  },
  {
    year: 2021,
    heading: "AI DAY ON TOUR",
    description: "AI Day Fall 2021: KTH AI Society's AI Day on Tour gave 25 KTH students the opportunity to visit Sana Labs, QuantumBlack, and Modulai.",
    image: "/images/history/placeholder-02.jpg",
    imageAlt: "AI Day on Tour 2021",
  },
  {
    year: 2022,
    heading: "NORDIC AI & OPEN DATA HACKATHON",
    description: "A Nordic hackathon (Stockholm, Copenhagen, and online) focused on AI, open data, and responsible digitalization aligned with the UN SDGs.",
    image: "/images/history/hackathon.jpg",
    imageAlt: "Nordic AI & Open Data Hackathon 2022",
  },
  {
    year: 2023,
    heading: "AI INNOVATION IN SWEDEN, EUROPE, AND BEYOND",
    description: "We helped and participated with organizers KTH Innovation and Google, featuring Sundar Pichai alongside Sweden's Prime Minister.",
    image: "/images/history/placeholder-04.jpg",
    imageAlt: "Event with Sundar Pichai and Sweden's Prime Minister 2023",
  },
  {
    year: 2024,
    heading: "REBRAND AND SCALING",
    description: "Rebrand and scaled marketing efforts, resulting in successful events with Ericsson, McKinsey QuantumBlack, multiple workshops, and two TEDxKTH Library events.",
    image: "/images/history/ericsson.jpg",
    imageAlt: "Rebranded KTH AI Society 2024",
  },
  {
    year: 2025,
    heading: "Microsoft Hackathon",
    description: "We hosted a Microsoft Hackathon in collaboration with SSE Business Lab.",
    image: "/images/history/placeholder-01.jpg",
    imageAlt: "Microsoft Hackathon 2025",
  },
];

export function HistoryTimeline({
  title: _title = 'OUR HISTORY',
  introText: _introText = 'ZCMC, and the Kajaran deposit, has a long standing history...',
  events = defaultTimelineEvents,
  defaultYear,
  className,
}: HistoryTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.year - a.year);
  const initialYear = defaultYear ?? sortedEvents[0]?.year ?? 0;
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  const selectedEvent = sortedEvents.find(e => e.year === selectedYear) ?? sortedEvents[0];
  const currentIndex = sortedEvents.findIndex(e => e.year === selectedYear);
  const canGoPrevious = currentIndex < sortedEvents.length - 1;
  const canGoNext = currentIndex > 0;

  const handleYearClick = (year: number) => {
    if (year === selectedYear) return;
    setSelectedYear(year);
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedYear(sortedEvents[currentIndex + 1]?.year ?? selectedYear);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedYear(sortedEvents[currentIndex - 1]?.year ?? selectedYear);
    }
  };

  return (
    <section id="about" className={cn('container mx-auto py-16 px-4 w-full max-w-7xl', className)}>
        {/* Mobile Layout - Horizontal Timeline */}
        <div className="lg:hidden flex flex-col gap-8">
          {/* Image Display */}
          <div className="relative w-full aspect-3/2">
            <motion.div
              key={selectedEvent.year}
              className="relative w-full h-full rounded-3xl border overflow-hidden"
            >
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.imageAlt ?? `Historical image from ${selectedEvent.year}`}
                fill
                className="object-cover rounded-3xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative px-4">
            <div className="relative flex items-center w-full">
              {/* Horizontal Line */}
              <div 
                className="absolute left-0 right-0 h-px top-[6px]" 
                style={{ backgroundColor: 'var(--color-secondary-gray)' }} 
              />
              
              {/* Year Markers */}
              <div className="relative flex justify-between w-full">
                {sortedEvents.map((event, index) => {
                  const isActive = event.year === selectedYear;
                  const position = (index / (sortedEvents.length - 1)) * 100;
                  
                  return (
                    <button
                      key={event.year}
                      type="button"
                      onClick={() => handleYearClick(event.year)}
                      className={cn(
                        'relative z-10 flex flex-col items-center gap-2 group cursor-pointer',
                        'transition-all duration-300',
                      )}
                      style={{ 
                        position: 'absolute',
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {/* Dot */}
                      <div className="relative">
                        {/* Outer circle (active state) */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 rounded-full border-2"
                            style={{ 
                              width: '20px',
                              height: '20px',
                              margin: '-4px',
                              borderColor: 'var(--color-primary)',
                            }}
                          />
                        )}
                        
                        {/* Inner dot */}
                        <motion.div
                          animate={{
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary-gray)',
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-3 h-3 rounded-full"
                        />
                      </div>

                      {/* Year Label */}
                      <motion.span
                        animate={{
                          fontWeight: isActive ? 600 : 400,
                        }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'text-xs sm:text-sm select-none whitespace-nowrap',
                          isActive ? 'text-foreground font-semibold' : 'text-secondary-gray'
                        )}
                      >
                        {event.year}
                      </motion.span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex flex-col">
            {/* Large Year Number with NumberFlow Animation */}
            <div className="relative sm:mb-4 flex items-start">
              <NumberFlow
                value={selectedEvent.year}
                format={{ minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: false }}
                className="text-6xl sm:text-8xl font-serif text-foreground leading-none"
              />
            </div>

            {/* Main Heading */}
            <motion.h2
              key={`${selectedEvent.year}-heading`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl sm:text-2xl text-foreground mb-4 tracking-tight"
            >
              {selectedEvent.heading}
            </motion.h2>

            {/* Descriptive Text */}
            <motion.p
              key={`${selectedEvent.year}-description`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm sm:text-base text-foreground/80 leading-relaxed"
            >
              {selectedEvent.description}
            </motion.p>
          </div>
        </div>

        {/* Desktop Layout - Vertical Timeline */}
        <div className="hidden lg:grid grid-cols-12 gap-8 lg:gap-12">
          {/* Left Content Panel */}
          <div className="col-span-4 flex flex-col">
            {/* Large Year Number with NumberFlow Animation */}
            <div className="relative mb-6 flex items-start">
              <NumberFlow
                value={selectedEvent.year}
                format={{ minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: false }}
                className="text-8xl font-serif text-foreground leading-none"
              />
            </div>

            {/* Main Heading */}
            <motion.h2
              key={`${selectedEvent.year}-heading-desktop`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl md:text-2xl text-foreground mb-4 tracking-tight"
            >
              {selectedEvent.heading}
            </motion.h2>

            {/* Descriptive Text */}
            <motion.p
              key={`${selectedEvent.year}-description-desktop`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm md:text-base text-foreground/80 leading-relaxed mb-6 flex flex-col justify-start items-start gap-2"
            >
              {selectedEvent.description}
            </motion.p>
          </div>

          {/* Central Vertical Timeline */}
          <div className="col-span-1 flex justify-center lg:justify-start relative">
            <div className="relative flex flex-col items-center h-full min-h-[500px]">
              {/* Vertical Line */}
              <div className="absolute top-0 bottom-0 w-px left-[5.5px]" style={{ backgroundColor: 'var(--color-secondary-gray)' }} />
              
              {/* Year Markers */}
              <div className="relative flex flex-col justify-between h-full py-4">
                {sortedEvents.map((event, index) => {
                  const isActive = event.year === selectedYear;
                  const position = (index / (sortedEvents.length - 1)) * 100;
                  
                  return (
                    <button
                      key={event.year}
                      type="button"
                      onClick={() => handleYearClick(event.year)}
                      className={cn(
                        'relative z-10 flex items-center gap-4 group cursor-pointer',
                        'transition-all duration-300',
                        'px-4 py-4 -mx-4',
                      )}
                      style={{ 
                        position: 'absolute',
                        top: `${position}%`,
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {/* Dot */}
                      <div className="relative">
                        {/* Outer circle (active state) */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 rounded-full border-2"
                            style={{ 
                              width: '20px',
                              height: '20px',
                              margin: '-4px',
                              borderColor: 'var(--color-primary)',
                            }}
                          />
                        )}
                        
                        {/* Inner dot */}
                        <motion.div
                          animate={{
                            scale: isActive ? 1.2 : 1,
                            backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary-gray)',
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-3 h-3 rounded-full"
                        />
                      </div>

                      {/* Year Label */}
                      <motion.span
                        animate={{
                          fontWeight: isActive ? 600 : 400,
                        }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'text-sm md:text-base select-none',
                          isActive ? 'text-foreground font-semibold' : 'text-secondary-gray'
                        )}
                      >
                        {event.year}
                      </motion.span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="col-span-7 flex flex-col">
            {/* Image Display */}
            <div className="relative w-full aspect-3/2">
              <motion.div
                key={`${selectedEvent.year}-image-desktop`}
                className="relative w-full h-full rounded-3xl border overflow-hidden"
              >
                <Image
                  src={selectedEvent.image}
                  alt={selectedEvent.imageAlt ?? `Historical image from ${selectedEvent.year}`}
                  fill
                  className="object-cover rounded-3xl"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            </div>
          </div>
        </div>
    </section>
  );
}

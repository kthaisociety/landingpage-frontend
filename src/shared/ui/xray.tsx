"use client"
import { Box } from '@mui/system';
import { animate, motion, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export interface XRayProps {
  image1: string;
  image2: string;
  alt?: string;
}

const XRay = ({ image1, image2, alt = 'X-Ray comparison' }: XRayProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const mouseStartY = useRef(0);
  const [scannerOpacity, setScannerOpacity] = useState(0);
  const animationRef = useRef<any>(null);

  const initialScannerPosition = 174;
  const scanLineOffset = 2;

  const y = useSpring(0, {
    damping: 32,
    stiffness: 500,
    mass: 0.8,
  });

  const clipPath = useTransform(y, latest => `inset(${latest}px 0 0 0)`);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const startAnimation = async () => {
      if (containerRef.current) {
        y.set(containerRef.current.clientHeight);

        await new Promise<void>(resolve => {
          setTimeout(resolve, 300);
        });
        setScannerOpacity(1);
        animationRef.current = animate(y, initialScannerPosition, {
          type: 'spring',
          stiffness: 350,
          damping: 50,
          mass: 0.3,
        });
      }
    };

    startAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [y]);

  const constrainValue = (value: number, [min, max]: any, multiplier = 2) => {
    if (value > max) {
      const diff = value - max;
      return (
        max + (diff > 0 ? Math.sqrt(diff) : -Math.sqrt(-diff)) * multiplier
      );
    }
    if (value < min) {
      const diff = value - min;
      return (
        min + (diff > 0 ? Math.sqrt(diff) : -Math.sqrt(-diff)) * multiplier
      );
    }
    return value;
  };

  const handleMouseEnter = () => {
    const { y: rectY } = containerRef.current!.getBoundingClientRect();
    mouseStartY.current = rectY;
  };

  const handleMouseLeave = () => {
    animate(y, initialScannerPosition, {
      type: 'spring',
      stiffness: 350,
      damping: 50,
    });
  };

  const handleMouseMove = (event: any) => {
    let offset = event.clientY - mouseStartY.current;
    offset = constrainValue(
      offset,
      [100, containerRef.current!.offsetHeight - 100],
      6
    );
    y.set(offset);
  };

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={containerRef}
      sx={{
        padding: '90px 48px',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Corner position="top-left" />
      <Corner position="top-right" />
      <Corner position="bottom-left" />
      <Corner position="bottom-right" />

      {/* Base image (image1) */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={image1}
          alt={`${alt} - before`}
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Box>

      {/* Scanner line */}
      <Box
        component={motion.div}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          background: '#009e86',
          height: '2px',
          width: '100%',
          zIndex: 3,
        }}
        style={{
          y: useTransform(y, v => v - scanLineOffset),
          opacity: scannerOpacity,
        }}
      />

      {/* Revealed image (image2) - clipped by scanner position */}
      <Box
        component={motion.div}
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 2,
          overflow: 'hidden',
        }}
        style={{ clipPath, opacity: scannerOpacity }}
      >
        <Image
          src={image2}
          alt={`${alt} - after`}
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Box>
    </Box>
  );
};

interface CornerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const Corner = ({ position }: CornerProps) => {
  const baseStyles = {
    position: 'absolute',
    width: 15,
    height: 15,
    '&:before': {
      content: '""',
      position: 'absolute',
      background: '#009e86',
      width: 15,
      height: '1px',
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      background: '#009e86',
      width: '1px',
      height: 15,
    },
  } as const;

  const positionStyles = {
    'top-left': {
      top: '-1px',
      left: '-1px',
      '&:before': {
        ...baseStyles['&:before'],
        left: 0,
        top: 0,
      },
      '&:after': {
        ...baseStyles['&:after'],
        left: 0,
        top: 0,
      },
    },
    'top-right': {
      top: '-1px',
      right: '-1px',
      '&:before': {
        ...baseStyles['&:before'],
        right: 0,
        top: 0,
      },
      '&:after': {
        ...baseStyles['&:after'],
        right: 0,
        top: 0,
      },
    },
    'bottom-left': {
      bottom: '-1px',
      left: '-1px',
      '&:before': {
        ...baseStyles['&:before'],
        left: 0,
        bottom: 0,
      },
      '&:after': {
        ...baseStyles['&:after'],
        left: 0,
        bottom: 0,
      },
    },
    'bottom-right': {
      bottom: '-1px',
      right: '-1px',
      '&:before': {
        ...baseStyles['&:before'],
        right: 0,
        bottom: 0,
      },
      '&:after': {
        ...baseStyles['&:after'],
        right: 0,
        bottom: 0,
      },
    },
  } as const;

  return (
    <Box
      sx={{
        ...baseStyles,
        ...positionStyles[position],
      }}
    />
  );
};

export { XRay };
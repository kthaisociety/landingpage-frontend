'use client';

import * as React from 'react';
import { motion, type Transition, type HTMLMotionProps } from 'framer-motion';

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

type TooltipProviderProps = React.ComponentProps<typeof TooltipProvider>;
type TooltipContentProps = React.ComponentProps<typeof TooltipContent>;

type AvatarGroupTooltipContextValue = Pick<
  TooltipContentProps,
  'side' | 'sideOffset' | 'align' | 'alignOffset'
>;

const AvatarGroupTooltipContext =
  React.createContext<AvatarGroupTooltipContextValue>({
    side: 'top',
    sideOffset: 0,
    align: 'center',
    alignOffset: 0,
  });

type AvatarProps = Omit<HTMLMotionProps<'div'>, 'translate'> & {
  children: React.ReactNode;
  zIndex: number;
  translate?: string | number;
};

function AvatarContainer({
  zIndex,
  translate,
  ...props
}: AvatarProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          data-slot="avatar-container"
          initial="initial"
          whileHover="hover"
          whileTap="hover"
          style={{ position: 'relative', zIndex }}
        >
          <motion.div
            variants={{
              initial: { y: 0 },
              hover: { y: translate },
            }}
            {...props}
          />
        </motion.div>
      </TooltipTrigger>
    </Tooltip>
  );
}

type AvatarGroupProps = Omit<React.ComponentProps<'div'>, 'translate'> & {
  children: React.ReactElement[];
  invertOverlap?: boolean;
  translate?: string | number;
  transition?: Transition;
} & Omit<TooltipProviderProps, 'children'> &
  AvatarGroupTooltipContextValue;

function AvatarGroup({
  ref,
  children,
  id,
  transition = { type: 'spring', stiffness: 300, damping: 17 },
  invertOverlap = false,
  translate = '-30%',
  delayDuration = 0,
  side = 'top',
  sideOffset = 25,
  align = 'center',
  alignOffset = 0,
  style,
  ...props
}: AvatarGroupProps) {
  const tooltipContextValue = {
    side,
    sideOffset,
    align,
    alignOffset,
  };

  return (
    <TooltipProvider
      delayDuration={delayDuration}
    >
      <AvatarGroupTooltipContext.Provider value={tooltipContextValue}>
        <div
          ref={ref}
          id={id}
          data-slot="avatar-group"
          style={{
            display: 'flex',
            alignItems: 'center',
            ...style,
          }}
          {...props}
        >
          {children?.map((child, index) => (
            <AvatarContainer
              key={index}
              zIndex={
                invertOverlap ? React.Children.count(children) - index : index
              }
              transition={transition}
              translate={translate}
            >
              {child}
            </AvatarContainer>
          ))}
        </div>
      </AvatarGroupTooltipContext.Provider>
    </TooltipProvider>
  );
}

type AvatarGroupTooltipProps = TooltipContentProps;

function AvatarGroupTooltip(props: AvatarGroupTooltipProps) {
  const tooltipContextValue = React.useContext(AvatarGroupTooltipContext);

  return <TooltipContent {...tooltipContextValue} {...props} />;
}

export {
  AvatarGroup,
  AvatarGroupTooltip,
  type AvatarGroupProps,
  type AvatarGroupTooltipProps,
};

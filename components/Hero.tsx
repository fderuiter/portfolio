// Source: https://ui.aceternity.com/components/background-beams-with-collision
"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";
import { usePretextLayout } from "@/hooks/usePretextLayout";
import { AnimatedGridPattern } from "@/components/AnimatedGridPattern";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const beams = [
    {
      initialX: 10,
      translateX: 10,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
    },
    {
      initialX: 600,
      translateX: 600,
      duration: 3,
      repeatDelay: 3,
      delay: 4,
    },
    {
      initialX: 100,
      translateX: 100,
      duration: 7,
      repeatDelay: 7,
      className: "h-6",
    },
    {
      initialX: 400,
      translateX: 400,
      duration: 5,
      repeatDelay: 14,
      delay: 4,
    },
    {
      initialX: 800,
      translateX: 800,
      duration: 11,
      repeatDelay: 2,
      className: "h-20",
    },
    {
      initialX: 1000,
      translateX: 1000,
      duration: 4,
      repeatDelay: 2,
      className: "h-12",
    },
    {
      initialX: 1200,
      translateX: 1200,
      duration: 6,
      repeatDelay: 4,
      delay: 2,
      className: "h-6",
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "h-screen bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-800 relative flex items-center w-full justify-center overflow-hidden",
        className
      )}
    >
      {beams.map((beam) => (
        <CollisionMechanism
          key={beam.initialX + "beam-idx"}
          beamOptions={beam}
          containerRef={containerRef}
          parentRef={parentRef}
        />
      ))}

      {children}
      <div
        ref={containerRef}
        className="absolute bottom-0 bg-neutral-100 w-full inset-x-0 pointer-events-none"
        style={{
          boxShadow:
            "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
        }}
      ></div>
    </div>
  );
};

const CollisionMechanism = React.forwardRef<
  HTMLDivElement,
  {
    containerRef: React.RefObject<HTMLDivElement | null>;
    parentRef: React.RefObject<HTMLDivElement | null>;
    beamOptions?: {
      initialX?: number;
      translateX?: number;
      initialY?: number | string;
      translateY?: number | string;
      rotate?: number;
      className?: string;
      duration?: number;
      delay?: number;
      repeatDelay?: number;
    };
  }
>(({ parentRef, containerRef, beamOptions = {} }) => {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const parentRect = parentRef.current.getBoundingClientRect();

        if (beamRect.bottom >= containerRect.top) {
          const relativeX =
            beamRect.left - parentRect.left + beamRect.width / 2;
          const relativeY = beamRect.bottom - parentRect.top;

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          });
          setCycleCollisionDetected(true);
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);

    return () => clearInterval(animationInterval);
  }, [cycleCollisionDetected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycleCollisionDetected(false);
      }, 2000);

      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1);
      }, 2000);
    }
  }, [collision]);

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{
          translateY: beamOptions.initialY || "-200px",
          translateX: beamOptions.initialX || "0px",
          rotate: beamOptions.rotate || 0,
        }}
        variants={{
          animate: {
            translateY: beamOptions.translateY || "1800px",
            translateX: beamOptions.translateX || "0px",
            rotate: beamOptions.rotate || 0,
          },
        }}
        transition={{
          duration: beamOptions.duration || 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0,
        }}
        className={cn(
          "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            className=""
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const [spans] = useState<
    Array<{
      id: number;
      initialX: number;
      initialY: number;
      directionX: number;
      directionY: number;
      duration: number;
    }>
  >(() =>
    Array.from({ length: 20 }, (_, index) => ({
      id: index,
      initialX: 0,
      initialY: 0,
      directionX: Math.floor(Math.random() * 80 - 40),
      directionY: Math.floor(Math.random() * -50 - 10),
      duration: Math.random() * 1.5 + 0.5,
    }))
  );

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: span.duration, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  );
};

interface HeroTextProps {
  text: string;
}

export const HeroText: React.FC<HeroTextProps> = ({ text }) => {
  const { ref, height, isReady } = usePretextLayout({
    text,
    fontSize: 16,
    lineHeight: 28,
    fontFamilyVariable: "--font-inter",
  });

  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 110,
        damping: 14,
        mass: 0.4,
      },
    },
  };

  return (
    <div
      style={{
        height: isReady ? `${height}px` : "auto",
        transition: "height 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="relative w-full max-w-2xl mx-auto overflow-hidden min-h-[56px] select-none"
    >
      <div ref={ref} className="w-full">
        {!isReady ? (
          // Prerendering skeleton/invisible text for SEO parsing on initial render
          <p className="text-neutral-400 text-sm md:text-base leading-[28px] text-center opacity-0 pointer-events-none">
            {text}
          </p>
        ) : (
          <motion.p
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-neutral-400 text-sm md:text-base leading-[28px] text-center flex flex-wrap justify-center"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block mr-[0.35em] will-change-transform"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        )}
      </div>
    </div>
  );
};

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className }) => {
  const introText =
    "Connecting high-performance canvas text layout pipelines, serverless Postgres data streams, and cutting-edge visual design systems into a unified engineering showcase.";

  return (
    <section
      className={cn(
        "relative h-screen min-h-[600px] w-full flex flex-col justify-center items-center overflow-hidden bg-brand-dark px-4 md:px-8",
        className
      )}
    >
      {/* 1. Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none">
        <AnimatedGridPattern
          numSquares={45}
          maxOpacity={0.12}
          duration={4}
          repeatDelay={1}
          className="fill-brand-cyan/20 stroke-neutral-800"
        />
      </div>

      {/* 2. Radial Blurred Ambient Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35vw] h-[35vw] rounded-full bg-brand-blue/10 blur-[130px] pointer-events-none" />

      {/* 3. Hero Content Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        {/* Sub-header mono tag */}
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="px-3 py-1 mb-6 text-[10px] md:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-brand-cyan bg-brand-cyan/5 border border-brand-cyan/20 rounded-full"
        >
          Active Portfolio Hub v1.0.0
        </motion.span>

        {/* Dynamic Staggered Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 select-none leading-tight md:leading-none">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 to-neutral-400">
            Engineering Premium
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-neutral-200 mt-2">
            Digital Experiences
          </span>
        </h1>

        {/* Text Reveal Component (using Pretext + Framer Motion) */}
        <HeroText text={introText} />

        {/* CTA Button Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring", stiffness: 80 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#case-studies"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-brand-dark bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            {/* Hover reflection */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent transition-transform duration-1000 ease-out" />
            Explore Engineering
          </a>
          <a
            href="https://github.com/fderuiter/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-md"
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            GitHub Repository
          </a>
        </motion.div>
      </div>
    </section>
  );
};

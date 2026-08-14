// Source: https://magicui.design/docs/components/animated-grid-pattern
"use client"

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useResizeObserver } from "@/hooks/useResizeObserver"

import { cn } from "@/lib/utils"

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

type Square = {
  id: number
  pos: [number, number]
  iteration: number
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId()
  const shouldReduceMotion = useReducedMotion()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useResizeObserver<SVGSVGElement>((entry) => {
    setDimensions((currentDimensions) => {
      const nextWidth = entry.contentRect.width
      const nextHeight = entry.contentRect.height
      if (
        currentDimensions.width === nextWidth &&
        currentDimensions.height === nextHeight
      ) {
        return currentDimensions
      }
      return { width: nextWidth, height: nextHeight }
    })
  })
  const [squares, setSquares] = useState<Array<Square>>([])

  const getPos = useCallback((seedOffset: number = 0): [number, number] => {
    const isTest = typeof window !== "undefined" && (
      (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ ||
      navigator.userAgent.includes("Playwright") ||
      navigator.userAgent.includes("Headless")
    );

    let r = Math.random();
    if (isTest) {
      // Simple LCG with seed based on seedOffset
      let seed = (seedOffset + 1) * 123456789;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      r = seed / 4294967296;
    }

    const xPos = Math.floor((r * dimensions.width) / width);

    let r2 = Math.random();
    if (isTest) {
      let seed = (seedOffset + 2) * 987654321;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      r2 = seed / 4294967296;
    }
    const yPos = Math.floor((r2 * dimensions.height) / height);

    return [xPos, yPos];
  }, [dimensions.height, dimensions.width, height, width])

  const generateSquares = useCallback(
    (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(i),
        iteration: 0,
      }))
    },
    [getPos]
  )

  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) => {
        const current = currentSquares[squareId]
        if (!current || current.id !== squareId) return currentSquares

        const nextSquares = currentSquares.slice()
        nextSquares[squareId] = {
          ...current,
          pos: getPos(squareId + (current.iteration + 1) * 1000),
          iteration: current.iteration + 1,
        }

        return nextSquares
      })
    },
    [getPos]
  )

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSquares(generateSquares(numSquares))
    }
  }, [dimensions.width, dimensions.height, generateSquares, numSquares])

  // Managed by unified useResizeObserver hook

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id, iteration }, index) => (
          <motion.rect
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: maxOpacity }}
            transition={shouldReduceMotion ? undefined : {
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
              repeatDelay,
            }}
            onAnimationComplete={shouldReduceMotion ? undefined : () => updateSquarePosition(id)}
            key={shouldReduceMotion ? `${id}` : `${id}-${iteration}`}
            opacity={shouldReduceMotion ? maxOpacity : undefined}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  )
}

// Source: https://magicui.design/docs/components/text-reveal
"use client"

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "framer-motion"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <div ref={sectionRef} className={cn("relative z-0 h-[75vh] sm:h-[85vh] md:h-[100vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[60%] max-w-4xl items-center justify-center bg-transparent px-4 sm:px-6 py-8 md:py-12"
        }
      >
        <span
          className={
            "flex flex-wrap p-3 sm:p-5 text-xl sm:text-2xl font-bold text-black/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl dark:text-white/20 leading-relaxed"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const color = useTransform(progress, range, ["#a1a1aa", "#ffffff"])
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <motion.span
        style={{ color }}
      >
        {children}
      </motion.span>
    </span>
  )
}

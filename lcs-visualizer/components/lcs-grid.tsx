"use client"

import { useEffect, useState } from "react"

interface LCSGridProps {
  word1: string
  word2: string
}

interface PathStep {
  i: number
  j: number
  isDiagonal?: boolean
  character?: string
}

export function LCSGrid({ word1, word2 }: LCSGridProps) {
  const [animatedPath, setAnimatedPath] = useState<PathStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  // Add epsilon prefix
  const word1WithEpsilon = "ε" + word1
  const word2WithEpsilon = "ε" + word2

  // Create the DP grid
  const grid = createGrid(word1WithEpsilon, word2WithEpsilon)
  const rows = word1WithEpsilon.length
  const cols = word2WithEpsilon.length

  // Get backtracking path with diagonal information
  const path = getBacktrackPath(grid, word1WithEpsilon, word2WithEpsilon)

  useEffect(() => {
    // Reset animation
    setAnimatedPath([])
    setCurrentStep(0)

    // Start animation from the bottom-right
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < path.length - 1) {
          setAnimatedPath((prevPath) => [...prevPath, path[prev + 1]])
          return prev + 1
        } else {
          clearInterval(timer)
          return prev
        }
      })
    }, 800)

    return () => clearInterval(timer)
  }, [word1, word2])

  // Calculate responsive cell size that ensures the grid always fits
  // Account for container padding (16px * 2) + card padding (24px * 2) + margins = ~100px total
  // Account for SVG padding - reduced top padding for better positioning
  const containerPadding = 100
  const svgPaddingHorizontal = 80
  const svgPaddingVertical = 60 // Reduced from 80 to shift grid up
  
  // Calculate available space (conservative estimates for viewport)
  // Use safe defaults that work across different screen sizes
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  
  const availableWidth = Math.min(viewportWidth * 0.75, 1200) - containerPadding
  const availableHeight = Math.min(viewportHeight * 0.6, 700) - containerPadding
  
  // Calculate max cell size based on available space
  const maxCellWidth = (availableWidth - svgPaddingHorizontal) / cols
  const maxCellHeight = (availableHeight - svgPaddingVertical) / rows
  const maxCellSize = Math.min(maxCellWidth, maxCellHeight)
  
  // Set reasonable bounds for cell size with more conservative minimum
  const cellSize = Math.min(50, Math.max(20, Math.floor(maxCellSize)))
  
  const gridWidth = cols * cellSize
  const gridHeight = rows * cellSize
  const totalSvgWidth = gridWidth + svgPaddingHorizontal
  const totalSvgHeight = gridHeight + svgPaddingVertical

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
      <div className="bg-gray-800/30 rounded-lg border border-gray-600/50 p-6 shadow-lg backdrop-blur-sm max-w-full max-h-full">
        <svg
          width={totalSvgWidth}
          height={totalSvgHeight}
          className="max-w-full max-h-full"
          viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
        {/* Grid lines */}
        {/* Vertical lines */}
        {Array.from({ length: cols + 1 }, (_, x) => (
          <line
            key={`v-${x}`}
            x1={x * cellSize + 40}
            y1={20}
            x2={x * cellSize + 40}
            y2={rows * cellSize + 20}
            stroke="#374151"
            strokeWidth="1"
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: rows + 1 }, (_, y) => (
          <line
            key={`h-${y}`}
            x1={40}
            y1={y * cellSize + 20}
            x2={cols * cellSize + 40}
            y2={y * cellSize + 20}
            stroke="#374151"
            strokeWidth="1"
          />
        ))}

        {/* Character labels on x-axis (word2) */}
        {word2WithEpsilon.split("").map((char, j) => (
          <text
            key={`x-label-${j}`}
            x={j * cellSize + 40 + cellSize / 2}
            y={15}
            textAnchor="middle"
            fontSize={Math.min(12, Math.max(8, cellSize * 0.25))}
            fontWeight="bold"
            fill="#9CA3AF"
          >
            {char}
          </text>
        ))}

        {/* Character labels on y-axis (word1) */}
        {word1WithEpsilon.split("").map((char, i) => (
          <text
            key={`y-label-${i}`}
            x={30}
            y={i * cellSize + 20 + cellSize / 2 + 4}
            textAnchor="middle"
            fontSize={Math.min(12, Math.max(8, cellSize * 0.25))}
            fontWeight="bold"
            fill="#9CA3AF"
          >
            {char}
          </text>
        ))}

        {/* Grid values */}
        {grid.map((row, i) =>
          row.map((value, j) => (
            <text
              key={`cell-${i}-${j}`}
              x={j * cellSize + 40 + cellSize / 2}
              y={i * cellSize + 20 + cellSize / 2 + 4}
              textAnchor="middle"
              fontSize={Math.min(10, Math.max(6, cellSize * 0.2))}              
              fill="#E5E7EB"
            >
              {value}
            </text>
          )),
        )}

        {/* Highlight diagonal movements (LCS matches) */}
        {animatedPath.map((step, index) => {
          if (step.isDiagonal && step.character) {
            return (
              <g key={`highlight-${index}`}>
                <circle
                  cx={step.j * cellSize + 40 + cellSize / 2}
                  cy={step.i * cellSize + 20 + cellSize / 2}
                  r={cellSize * 0.4}
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <text
                  x={step.j * cellSize + 40 + cellSize / 2}
                  y={step.i * cellSize + 20 - cellSize * 0.6}
                  textAnchor="middle"
                  fontSize={Math.min(8, Math.max(6, cellSize * 0.15))}
                  fill="#9CA3AF"
                  fontWeight="bold"
                >
                  {step.character}
                </text>
              </g>
            )
          }
          return null
        })}

        {/* Animated backtracking path */}
        {animatedPath.map((step, index) => {
          if (index === 0) return null
          const prevStep = animatedPath[index - 1]

          const startX = prevStep.j * cellSize + 40 + cellSize / 2
          const startY = prevStep.i * cellSize + 20 + cellSize / 2
          const endX = step.j * cellSize + 40 + cellSize / 2
          const endY = step.i * cellSize + 20 + cellSize / 2

          return (
            <g key={`arrow-${index}`}>
              <defs>
                <marker id={`arrowhead-${index}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
                </marker>
              </defs>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#6B7280"
                strokeWidth="2"
                className="animate-pulse"
              />
            </g>
          )
        })}
        </svg>
      </div>
    </div>
  )
}

function createGrid(word1: string, word2: string): number[][] {
  const rows = word1.length
  const cols = word2.length
  const grid: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0))

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (word1[i] === word2[j]) {
        grid[i][j] = grid[i - 1][j - 1] + 1
      } else {
        grid[i][j] = Math.max(grid[i - 1][j], grid[i][j - 1])
      }
    }
  }

  return grid
}

function getBacktrackPath(grid: number[][], word1: string, word2: string): PathStep[] {
  let i = grid.length - 1
  let j = grid[0].length - 1
  const path: PathStep[] = [{ i, j }]

  while (i >= 1 || j >= 1) {
    if (i === 0 && j === 0) break

    const left = j - 1 >= 0 && grid[i][j] === grid[i][j - 1]
    const up = i - 1 >= 0 && grid[i][j] === grid[i - 1][j]

    const prevI = i
    const prevJ = j

    if (left && !up) {
      j -= 1
    } else if (up && !left) {
      i -= 1
    } else if (up && left) {
      i -= 1 // up by default
    } else if (!up && !left) {
      // This is a diagonal movement - LCS character found
      i -= 1
      j -= 1
      path.push({
        i,
        j,
        isDiagonal: true,
        character: word1[prevI],
      })
      continue
    }

    path.push({ i, j })
  }

  return path
}

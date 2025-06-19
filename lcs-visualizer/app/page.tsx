"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LCSGrid } from "@/components/lcs-grid"

export default function LCSVisualizer() {
  const [word1, setWord1] = useState("abcdefgh")
  const [word2, setWord2] = useState("defabhcda")
  const [showVisualization, setShowVisualization] = useState(false)
  const [lcsResult, setLcsResult] = useState<string[]>([])

  const handleVisualize = () => {
    if (word1.trim() && word2.trim()) {
      const result = backtrack(word1.trim(), word2.trim())
      setLcsResult([...result]) // Create a new array to avoid mutation issues
      setShowVisualization(true)
    }
  }

  const handleReset = () => {
    setShowVisualization(false)
    setLcsResult([])
  }

  return (
    <div className="h-screen bg-gray-950 text-white p-4 overflow-hidden">
      <div className="container mx-auto max-w-7xl h-full flex flex-col">
        {/* Header */}
        <div className="mb-3 flex-shrink-0">
          <h1 className="text-xl font-bold mb-1">LCS Algorithm Visualizer</h1>
          <p className="text-gray-400 text-sm">
            Visualize the Longest Common Subsequence with dynamic programming grid and backtracking path
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex-shrink-0 mb-3">
          <Card className="bg-gray-900/50 border-gray-700 shadow-xl backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-4 items-end">
                {/* Input Words */}
                <div className="col-span-4 space-y-3">
                  <h3 className="text-lg font-semibold text-white">Input Words</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="word1" className="text-sm text-gray-300">
                        First Word
                      </Label>
                      <Input
                        id="word1"
                        value={word1}
                        onChange={(e) => setWord1(e.target.value)}
                        placeholder="Enter first word"
                        className="bg-gray-900 border-gray-800 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="word2" className="text-sm text-gray-300">
                        Second Word
                      </Label>
                      <Input
                        id="word2"
                        value={word2}
                        onChange={(e) => setWord2(e.target.value)}
                        placeholder="Enter second word"
                        className="bg-gray-900 border-gray-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="col-span-2 space-y-1">
                  <Label className="text-sm text-gray-300">Actions</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleVisualize} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white">
                      Visualize
                    </Button>
                    {showVisualization && (
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-gray-900"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* LCS Result */}
                <div className="col-span-6">
                  {lcsResult.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-300">LCS Result</Label>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <div className="text-xl font-mono font-bold text-center text-green-400">
                          {[...lcsResult].reverse().join("")}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 text-center">Length: {lcsResult.length}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Visualization Panel */}
          <div className="h-full">
            {showVisualization ? (
                              <Card className="bg-gray-900/50 border-gray-700 h-full shadow-2xl backdrop-blur-sm">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-lg text-white">LCS Grid Visualization</CardTitle>
                    <CardDescription className="text-gray-400">
                      DP grid with backtracking path • <span className="text-green-400">Green circles</span> = LCS matches • Result: <span className="text-green-400 font-mono">{lcsResult.length > 0 ? [...lcsResult].reverse().join("") : "None"}</span>
                    </CardDescription>
                  </CardHeader>
                <CardContent className="flex-1 h-full pb-4 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <LCSGrid word1={word1} word2={word2} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 border-gray-700 h-full shadow-2xl backdrop-blur-sm flex items-center justify-center">
                <CardContent>
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Enter words and click "Visualize" to see the LCS algorithm in action</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// LCS Algorithm Implementation (same as before)
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

function backtrack(word1: string, word2: string): string[] {
  const word1WithEpsilon = "ε" + word1
  const word2WithEpsilon = "ε" + word2

  const grid = createGrid(word1WithEpsilon, word2WithEpsilon)

  let i = grid.length - 1
  let j = grid[0].length - 1
  const chain: string[] = []

  while (i >= 1 || j >= 1) {
    if (i === 0 && j === 0) break

    const left = j - 1 >= 0 && grid[i][j] === grid[i][j - 1]
    const up = i - 1 >= 0 && grid[i][j] === grid[i - 1][j]

    if (left && !up) {
      j -= 1
    } else if (up && !left) {
      i -= 1
    } else if (up && left) {
      i -= 1 // up by default
    } else if (!up && !left) {
      chain.push(word1WithEpsilon[i] || word2WithEpsilon[j])
      i -= 1
      j -= 1
    }
  }

  return chain
}

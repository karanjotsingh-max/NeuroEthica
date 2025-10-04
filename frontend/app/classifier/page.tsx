"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Activity, BarChart3, Brain, CheckCircle2, Loader2, Download } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const sampleData = [
  { time: "0ms", alpha: 12, beta: 18, gamma: 8, theta: 15 },
  { time: "100ms", alpha: 15, beta: 22, gamma: 12, theta: 18 },
  { time: "200ms", alpha: 18, beta: 25, gamma: 15, theta: 20 },
  { time: "300ms", alpha: 22, beta: 28, gamma: 18, theta: 22 },
  { time: "400ms", alpha: 20, beta: 30, gamma: 20, theta: 25 },
  { time: "500ms", alpha: 25, beta: 32, gamma: 22, theta: 28 },
]

const classificationResults = [
  { category: "Motor Cortex", confidence: 92 },
  { category: "Visual Cortex", confidence: 78 },
  { category: "Prefrontal", confidence: 65 },
  { category: "Temporal", confidence: 54 },
]

export default function ClassifierPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setIsComplete(false)
    }
  }

  const handleProcess = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Activity className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-bold text-foreground">Neural Data Classifier</h1>
              <p className="text-muted-foreground">Upload and analyze neural activity patterns with AI</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 p-8">
          <div className="mb-6">
            <h2 className="mb-2 font-sans text-xl font-semibold text-foreground">Upload Neural Data</h2>
            <p className="text-sm text-muted-foreground">Supported formats: CSV, EDF, MAT (MATLAB), FIF (MNE-Python)</p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-6 py-12 transition-colors hover:border-primary hover:bg-muted/30"
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <span className="mb-2 text-sm font-medium text-foreground">
                {file ? file.name : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-muted-foreground">Maximum file size: 100MB</span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.edf,.mat,.fif"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleProcess} disabled={!file || isProcessing} className="gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Classify Data
                </>
              )}
            </Button>
            {isComplete && (
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {isComplete && (
          <div className="space-y-6">
            {/* Status */}
            <Card className="border-accent/50 bg-accent/5 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Classification Complete</h3>
                  <p className="text-sm text-muted-foreground">Neural patterns analyzed successfully</p>
                </div>
              </div>
            </Card>

            {/* Visualization */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-sans text-lg font-semibold text-foreground">Neural Activity Over Time</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="alpha" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="beta" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="gamma" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    <Line type="monotone" dataKey="theta" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <h3 className="font-sans text-lg font-semibold text-foreground">Classification Results</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classificationResults} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="p-6">
              <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">Analysis Summary</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-1 text-sm text-muted-foreground">Primary Classification</div>
                  <div className="text-xl font-semibold text-foreground">Motor Cortex Activity</div>
                  <div className="mt-2 text-sm text-accent">92% confidence</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-1 text-sm text-muted-foreground">Dominant Frequency</div>
                  <div className="text-xl font-semibold text-foreground">Beta Waves (13-30 Hz)</div>
                  <div className="mt-2 text-sm text-muted-foreground">Associated with active thinking</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-1 text-sm text-muted-foreground">Signal Quality</div>
                  <div className="text-xl font-semibold text-foreground">Excellent</div>
                  <div className="mt-2 text-sm text-muted-foreground">SNR: 28.4 dB</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <div className="mb-1 text-sm text-muted-foreground">Artifacts Detected</div>
                  <div className="text-xl font-semibold text-foreground">Minimal</div>
                  <div className="mt-2 text-sm text-muted-foreground">2.3% of total signal</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Section */}
        {!isComplete && (
          <Card className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h3 className="font-sans text-xl font-semibold text-foreground">How It Works</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                  1
                </div>
                <h4 className="mb-2 font-semibold text-foreground">Upload Data</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload your neural recording files in standard formats like EDF, CSV, or MATLAB.
                </p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">
                  2
                </div>
                <h4 className="mb-2 font-semibold text-foreground">AI Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our machine learning models analyze patterns, frequencies, and neural signatures.
                </p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary font-semibold">
                  3
                </div>
                <h4 className="mb-2 font-semibold text-foreground">Get Results</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receive detailed classifications, visualizations, and exportable reports.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

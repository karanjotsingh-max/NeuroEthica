"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, Brain, Wifi, WifiOff, Circle, Download, Play, Square } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type EEGChannel = {
  name: string
  data: number[]
  color: string
}

const channels: EEGChannel[] = [
  { name: "TP9 (Left Ear)", data: [], color: "hsl(var(--chart-1))" },
  { name: "AF7 (Left Forehead)", data: [], color: "hsl(var(--chart-2))" },
  { name: "AF8 (Right Forehead)", data: [], color: "hsl(var(--chart-3))" },
  { name: "TP10 (Right Ear)", data: [], color: "hsl(var(--chart-4))" },
]

const BUFFER_SIZE = 256

export default function ClassifierPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [signalQuality, setSignalQuality] = useState({ TP9: 0, AF7: 0, AF8: 0, TP10: 0 })
  const [channelData, setChannelData] = useState<EEGChannel[]>(
    channels.map((ch) => ({ ...ch, data: new Array(BUFFER_SIZE).fill(0) })),
  )
  const [frequencyData, setFrequencyData] = useState([
    { band: "Delta (0.5-4 Hz)", power: 0, color: "hsl(var(--chart-1))" },
    { band: "Theta (4-8 Hz)", power: 0, color: "hsl(var(--chart-2))" },
    { band: "Alpha (8-13 Hz)", power: 0, color: "hsl(var(--chart-3))" },
    { band: "Beta (13-30 Hz)", power: 0, color: "hsl(var(--chart-4))" },
    { band: "Gamma (30-100 Hz)", power: 0, color: "hsl(var(--chart-5))" },
  ])
  const [recordingDuration, setRecordingDuration] = useState(0)

  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setChannelData((prev) =>
        prev.map((channel) => {
          const newSample = Math.sin(Date.now() / 200) * 100 + Math.random() * 50 - 25
          return {
            ...channel,
            data: [...channel.data.slice(1), newSample],
          }
        }),
      )

      setFrequencyData([
        { band: "Delta (0.5-4 Hz)", power: Math.random() * 30 + 10, color: "hsl(var(--chart-1))" },
        { band: "Theta (4-8 Hz)", power: Math.random() * 40 + 20, color: "hsl(var(--chart-2))" },
        { band: "Alpha (8-13 Hz)", power: Math.random() * 50 + 30, color: "hsl(var(--chart-3))" },
        { band: "Beta (13-30 Hz)", power: Math.random() * 60 + 40, color: "hsl(var(--chart-4))" },
        { band: "Gamma (30-100 Hz)", power: Math.random() * 30 + 10, color: "hsl(var(--chart-5))" },
      ])

      setSignalQuality({
        TP9: Math.random() * 30 + 70,
        AF7: Math.random() * 30 + 70,
        AF8: Math.random() * 30 + 70,
        TP10: Math.random() * 30 + 70,
      })
    }, 50)

    return () => clearInterval(interval)
  }, [isConnected])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleConnect = () => {
    setIsConnected(!isConnected)
    if (isConnected) {
      setIsRecording(false)
      setRecordingDuration(0)
    }
  }

  const handleRecording = () => {
    if (!isRecording) {
      setRecordingDuration(0)
    }
    setIsRecording(!isRecording)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(
      {
        duration: recordingDuration,
        sampleRate: 256,
        channels: ["TP9", "AF7", "AF8", "TP10"],
        data: channelData,
      },
      null,
      2,
    )
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `eeg-recording-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return "text-green-500"
    if (quality >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Activity className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="font-sans text-3xl font-bold text-foreground">Neural Data Classifier</h1>
              <p className="text-muted-foreground">Real-time EEG visualization and analysis</p>
            </div>
          </div>
        </div>

        <Card className="mb-8 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-2 font-sans text-xl font-semibold text-foreground">Headset Connection</h2>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "Connected to Muse 2" : "Click connect to start streaming"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isConnected && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2">
                  <Circle className="h-3 w-3 animate-pulse fill-green-500 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Live</span>
                </div>
              )}
              <Button onClick={handleConnect} className="gap-2" variant={isConnected ? "destructive" : "default"}>
                {isConnected ? (
                  <>
                    <WifiOff className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Connect Muse 2
                  </>
                )}
              </Button>
            </div>
          </div>

          {isConnected && (
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 md:grid-cols-4">
              {Object.entries(signalQuality).map(([channel, quality]) => (
                <div key={channel} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{channel}</span>
                  <span className={`text-sm font-semibold ${getQualityColor(quality)}`}>{quality.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {isConnected && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={handleRecording} variant={isRecording ? "destructive" : "default"} className="gap-2">
                    {isRecording ? (
                      <>
                        <Square className="h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 animate-pulse fill-red-500 text-red-500" />
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                  )}
                </div>
                <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-sans text-lg font-semibold text-foreground">Live EEG Channels (256 Hz)</h3>
              </div>
              <div className="space-y-6">
                {channelData.map((channel) => (
                  <div key={channel.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{channel.name}</span>
                      <span className="text-xs text-muted-foreground">±200 μV</span>
                    </div>
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={channel.data.map((value, i) => ({ index: i, value }))}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={channel.color}
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={[-200, 200]} hide />
                        <XAxis dataKey="index" hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  <h3 className="font-sans text-lg font-semibold text-foreground">Frequency Band Power</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="band" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: "Power (μV²)", angle: -90 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="power" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-sans text-lg font-semibold text-foreground">Brain State Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Current State</div>
                    <div className="text-xl font-semibold text-foreground">
                      {frequencyData[3].power > 40
                        ? "Active Focus"
                        : frequencyData[2].power > 40
                          ? "Relaxed"
                          : "Resting"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Dominant Frequency</div>
                    <div className="text-xl font-semibold text-foreground">
                      {frequencyData.reduce((max, band) => (band.power > max.power ? band : max)).band}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="mb-1 text-sm text-muted-foreground">Average Signal Quality</div>
                    <div className="text-xl font-semibold text-foreground">
                      {(Object.values(signalQuality).reduce((a, b) => a + b, 0) / 4).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {!isConnected && (
          <Card className="p-8">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h3 className="font-sans text-xl font-semibold text-foreground">How to Connect Your Muse 2</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                  1
                </div>
                <h4 className="mb-2 font-semibold text-foreground">Power On Headset</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Turn on your Muse 2 headset and ensure it's in pairing mode.
                </p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 font-semibold text-accent">
                  2
                </div>
                <h4 className="mb-2 font-semibold text-foreground">Enable Bluetooth</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Make sure Bluetooth is enabled on your computer.
                </p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 font-semibold text-secondary">
                  3
                </div>
                <h4 className="mb-2 font-semibold text-foreground">Click Connect</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Click the "Connect Muse 2" button above to start streaming data.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

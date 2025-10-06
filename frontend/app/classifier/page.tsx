"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { Activity, Brain, Wifi, WifiOff, Circle, Download, Play, Square, ChevronLeft, ChevronRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EEGChannel = {
  name: string
  data: number[]
  color: string
}

type EEGMessage = {
  fs: number
  channels: string[]
  samples: number[][]
}
type BandsRow = {
  i: number
  gamma: number
  beta: number
  alpha: number
  theta: number
  delta: number
}

type MentalState = {
  name: string
  description: string
  dominantBand: string
  color: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUFFER_SIZE = 256

const channels: EEGChannel[] = [
  { name: "TP9 (Left Ear)", data: [], color: "#06b6d4" }, // cyan
  { name: "AF7 (Left Forehead)", data: [], color: "#8b5cf6" }, // purple
  { name: "AF8 (Right Forehead)", data: [], color: "#ec4899" }, // pink
  { name: "TP10 (Right Ear)", data: [], color: "#f97316" }, // orange
]
const bandColors = {
  gamma: "#22d3ee", // cyan-400
  beta: "#3b82f6", // blue-500
  alpha: "#10b981", // emerald-500
  theta: "#f59e0b", // amber-500
  delta: "#ef4444", // red-500
}

const brainwaveInfo = [
  {
    name: "Gamma waves",
    range: "30 - 100 Hz",
    color: bandColors.gamma,
    description:
      "The fastest brain waves, associated with peak concentration, complex problem-solving, learning, and heightened awareness or insight.",
  },
  {
    name: "Beta waves",
    range: "13 - 30 Hz",
    color: bandColors.beta,
    description:
      "Associated with active thinking, focus, sustained attention, and cognitive processing. Dominant during waking consciousness and mental activity.",
  },
  {
    name: "Alpha waves",
    range: "8 - 13 Hz",
    color: bandColors.alpha,
    description:
      "Present during relaxed wakefulness, meditation, and calm mental states. Bridge between conscious thinking and subconscious mind.",
  },
  {
    name: "Theta waves",
    range: "4 - 8 Hz",
    color: bandColors.theta,
    description:
      "Associated with deep relaxation, meditation, creativity, and light sleep. Important for memory consolidation and emotional processing.",
  },
  {
    name: "Delta waves",
    range: "0.5 - 4 Hz",
    color: bandColors.delta,
    description:
      "The slowest brain waves, dominant during deep sleep. Essential for healing, regeneration, and restorative sleep processes.",
  },
]

const bandDomain = (series: number[]) => {
  if (!series.length) return [0, 1]
  const mn = Math.min(...series)
  const mx = Math.max(...series)
  const pad = (mx - mn) * 0.15 || 1
  return [mn - pad, mx + pad]
}
// Simple variability metric used as a proxy for contact/quality
function stdDev(arr: number[]): number {
  if (!arr || arr.length === 0) return 0
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length
  const v = arr.reduce((s, v) => s + (v - mean) * (v - mean), 0) / arr.length
  return Math.sqrt(v)
}

const mentalStates: Record<string, MentalState> = {
  gamma: {
    name: "Peak Focus",
    description: "Deep concentration and complex problem-solving",
    dominantBand: "Gamma",
    color: bandColors.gamma,
  },
  beta: {
    name: "Active Thinking",
    description: "Alert, focused, and mentally engaged",
    dominantBand: "Beta",
    color: bandColors.beta,
  },
  alpha: {
    name: "Relaxed & Calm",
    description: "Peaceful awareness and mental clarity",
    dominantBand: "Alpha",
    color: bandColors.alpha,
  },
  theta: {
    name: "Deep Relaxation",
    description: "Creative flow and meditative state",
    dominantBand: "Theta",
    color: bandColors.theta,
  },
  delta: {
    name: "Deep Rest",
    description: "Restorative sleep and recovery",
    dominantBand: "Delta",
    color: bandColors.delta,
  },
}

const ClassifierPage = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<string>("Disconnected")
  const [bandHistory, setBandHistory] = useState<BandsRow[]>([])
  const bandIndexRef = useRef(0)
  const [activeWaveIndex, setActiveWaveIndex] = useState(0)
  const [channelData, setChannelData] = useState<EEGChannel[]>(
    channels.map((ch) => ({ ...ch, data: new Array(BUFFER_SIZE).fill(0) })),
  )
  const [signalQuality, setSignalQuality] = useState({ TP9: 0, AF7: 0, AF8: 0, TP10: 0 })
  const wsRef = useRef<WebSocket | null>(null)

  const getCurrentMentalState = (): MentalState => {
    if (bandHistory.length === 0) {
      return mentalStates.alpha // default state
    }

    const recentReadings = bandHistory.slice(-10)

    const averages = {
      gamma: recentReadings.reduce((sum, r) => sum + r.gamma, 0) / recentReadings.length,
      beta: recentReadings.reduce((sum, r) => sum + r.beta, 0) / recentReadings.length,
      alpha: recentReadings.reduce((sum, r) => sum + r.alpha, 0) / recentReadings.length,
      theta: recentReadings.reduce((sum, r) => sum + r.theta, 0) / recentReadings.length,
      delta: recentReadings.reduce((sum, r) => sum + r.delta, 0) / recentReadings.length,
    }

    const dominantBand = Object.entries(averages).reduce(
      (max, [band, value]) => (value > max.value ? { band, value } : max),
      { band: "alpha", value: averages.alpha },
    ).band

    return mentalStates[dominantBand]
  }

  const currentState = getCurrentMentalState()

  useEffect(() => {
    if (!isConnected) return

    const wsUrl = process.env.NEXT_PUBLIC_EEG_WS_URL || "ws://127.0.0.1:8000/ws/eeg"

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => setConnectionStatus("Connected")

      ws.onmessage = (event) => {
        try {
          const message: EEGMessage = JSON.parse(event.data)
          if (message.samples && message.samples.length > 0) {
            const enforcedSamples = message.samples.map((sample) => sample.slice(0, 4))
            console.log("Incoming batch:", enforcedSamples)

            setChannelData((prev) => {
              const updated = prev.map((channel, idx) => {
                const incoming = enforcedSamples.map((s) => {
                  const val = s[idx]
                  return typeof val === "number" && !isNaN(val) ? val : 0
                })
                const merged = [...channel.data, ...incoming].slice(-BUFFER_SIZE)
                return { ...channel, data: merged }
              })
              return updated
            })

            const q = { TP9: 0, AF7: 0, AF8: 0, TP10: 0 }
            ;["TP9", "AF7", "AF8", "TP10"].forEach((label, idx) => {
              const samples = enforcedSamples.map((s) => s[idx] || 0)
              const sdev = stdDev(samples)
              const score = Math.max(0, Math.min(100, (sdev / 100) * 100))
              ;(q as any)[label] = score
            })
            setSignalQuality(q)
          }
        } catch (e) {
          console.error("WS parse error:", e)
        }
      }

      ws.onerror = (e) => {
        console.error("WebSocket error:", e)
        setConnectionStatus("Error")
      }

      ws.onclose = () => {
        setConnectionStatus("Disconnected")
        setIsConnected(false)
      }
    } catch (e) {
      console.error("WS create error:", e)
      setConnectionStatus("Error")
      setIsConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [isConnected])

  useEffect(() => {
    if (!isConnected) return

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
    const refresh = Number(process.env.NEXT_PUBLIC_BANDS_REFRESH_MS || 250)
    let timer: NodeJS.Timeout | null = null
    let aborted = false

    const tick = async () => {
      try {
        const res = await Promise.race([
          fetch(`${apiBase}/bands`),
          new Promise<Response>((_, rej) => setTimeout(() => rej(new Error("timeout")), 1500)),
        ])
        if (!res || !res.ok) throw new Error("bands fetch failed")

        const payload = await res.json()
        const b = payload?.bands ?? payload

        let next: { gamma: number; beta: number; alpha: number; theta: number; delta: number }

        if (typeof b?.gamma === "number" || typeof b?.beta === "number") {
          next = {
            gamma: Number(b?.gamma ?? 0),
            beta: Number(b?.beta ?? 0),
            alpha: Number(b?.alpha ?? 0),
            theta: Number(b?.theta ?? 0),
            delta: Number(b?.delta ?? 0),
          }
        } else {
          const channels = Object.values(b || {}).filter((v) => v && typeof v === "object") as Array<
            Record<string, number>
          >
          const avg = (key: string) => {
            const vals = channels.map((c) => Number(c?.[key] ?? 0)).filter((v) => Number.isFinite(v))
            return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
          }
          next = {
            gamma: avg("gamma"),
            beta: avg("beta"),
            alpha: avg("alpha"),
            theta: avg("theta"),
            delta: avg("delta"),
          }
        }

        for (const k of Object.keys(next) as (keyof typeof next)[]) {
          if (!isFinite(next[k]!)) next[k] = 0
        }

        setBandHistory((prev) => {
          const i = bandIndexRef.current + 1
          bandIndexRef.current = i
          const row = { i, ...next }
          const LIMIT = 300
          return [...prev, row].slice(-LIMIT)
        })
      } catch {
        // ignore; next tick will retry
      } finally {
        if (!aborted) timer = setTimeout(tick, refresh)
      }
    }

    tick()
    return () => {
      aborted = true
      if (timer) clearTimeout(timer)
    }
  }, [isConnected])

  useEffect(() => {
    let t: NodeJS.Timeout | undefined
    if (isRecording) {
      t = setInterval(() => setRecordingDuration((p) => p + 1), 1000)
    }
    return () => {
      if (t) clearInterval(t)
    }
  }, [isRecording])

  const handleConnect = () => {
    setIsConnected((v) => !v)
    if (isConnected) {
      setIsRecording(false)
      setRecordingDuration(0)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }

  const handleRecording = () => {
    if (!isRecording) setRecordingDuration(0)
    setIsRecording((v) => !v)
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
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `eeg-recording-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const getQualityColor = (q: number) => {
    if (q >= 80) return "text-green-500"
    if (q >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const handlePrevWave = () => {
    setActiveWaveIndex((prev) => (prev === 0 ? brainwaveInfo.length - 1 : prev - 1))
  }

  const handleNextWave = () => {
    setActiveWaveIndex((prev) => (prev === brainwaveInfo.length - 1 ? 0 : prev + 1))
  }

  const BandTooltip = ({
    active,
    payload,
    label,
    bandName,
    color,
  }: TooltipProps<number, string> & { bandName?: string; color?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-medium text-muted-foreground">{bandName}</p>
          <p className="text-sm font-semibold" style={{ color }}>
            {payload[0].value?.toFixed(3)}
          </p>
        </div>
      )
    }
    return null
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
              <h1 className="font-sans text-3xl font-bold text-foreground">Neural Data Viewer</h1>
              <p className="text-muted-foreground">Real-time Muse 2 EEG (raw, 4 channels only)</p>
            </div>
          </div>
        </div>

        <Card className="mb-8 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-2 font-sans text-xl font-semibold text-foreground">Headset Connection</h2>
              <p className="text-sm text-muted-foreground">
                {isConnected ? `Connected (${connectionStatus})` : "Click connect to start streaming"}
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
                {channelData.map((channel) => {
                  const minValue = Math.min(...channel.data)
                  const maxValue = Math.max(...channel.data)
                  const range = maxValue - minValue
                  const padding = range * 0.1 || 10
                  const yMin = minValue - padding
                  const yMax = maxValue + padding

                  const chartData = channel.data.map((value, i) => ({ index: i, value }))

                  return (
                    <div key={channel.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{channel.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {minValue.toFixed(1)} to {maxValue.toFixed(1)} μV
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={chartData}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={channel.color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                          />
                          <YAxis domain={[yMin, yMax]} stroke="#888888" width={60} />
                          <XAxis dataKey="index" stroke="#888888" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.5} />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  <h3 className="font-sans text-lg font-semibold text-foreground">Live Brainwave Bands</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: bandColors.gamma }}>
                        Gamma waves
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={bandHistory}>
                        <Line
                          type="monotone"
                          dataKey="gamma"
                          stroke={bandColors.gamma}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={bandDomain(bandHistory.map((d) => d.gamma))} hide />
                        <XAxis dataKey="i" hide />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <Tooltip content={<BandTooltip bandName="Gamma" color={bandColors.gamma} />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: bandColors.beta }}>
                        Beta waves
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={bandHistory}>
                        <Line
                          type="monotone"
                          dataKey="beta"
                          stroke={bandColors.beta}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={bandDomain(bandHistory.map((d) => d.beta))} hide />
                        <XAxis dataKey="i" hide />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <Tooltip content={<BandTooltip bandName="Beta" color={bandColors.beta} />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: bandColors.alpha }}>
                        Alpha waves
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={bandHistory}>
                        <Line
                          type="monotone"
                          dataKey="alpha"
                          stroke={bandColors.alpha}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={bandDomain(bandHistory.map((d) => d.alpha))} hide />
                        <XAxis dataKey="i" hide />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <Tooltip content={<BandTooltip bandName="Alpha" color={bandColors.alpha} />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: bandColors.theta }}>
                        Theta waves
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={bandHistory}>
                        <Line
                          type="monotone"
                          dataKey="theta"
                          stroke={bandColors.theta}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={bandDomain(bandHistory.map((d) => d.theta))} hide />
                        <XAxis dataKey="i" hide />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <Tooltip content={<BandTooltip bandName="Theta" color={bandColors.theta} />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: bandColors.delta }}>
                        Delta waves
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={70}>
                      <LineChart data={bandHistory}>
                        <Line
                          type="monotone"
                          dataKey="delta"
                          stroke={bandColors.delta}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <YAxis domain={bandDomain(bandHistory.map((d) => d.delta))} hide />
                        <XAxis dataKey="i" hide />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <Tooltip content={<BandTooltip bandName="Delta" color={bandColors.delta} />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="flex-1 p-6">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${currentState.color}20` }}
                    >
                      <Brain className="h-8 w-8" style={{ color: currentState.color }} />
                    </div>
                    <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Current State of Mind
                    </h3>
                    <h2 className="mb-2 text-3xl font-bold" style={{ color: currentState.color }}>
                      {currentState.name}
                    </h2>
                    <p className="mb-3 text-sm text-muted-foreground">Dominant: {currentState.dominantBand} waves</p>
                    <p className="text-balance text-sm leading-relaxed text-foreground">{currentState.description}</p>
                  </div>
                </Card>

                <Card className="flex-1 p-6">
                  <div className="flex h-full flex-col">
                    <div className="flex-1">
                      <h4 className="mb-2 text-2xl font-bold" style={{ color: brainwaveInfo[activeWaveIndex].color }}>
                        {brainwaveInfo[activeWaveIndex].name}
                      </h4>
                      <p className="mb-4 text-lg font-medium text-muted-foreground">
                        {brainwaveInfo[activeWaveIndex].range}
                      </p>
                      <p className="text-balance leading-relaxed text-foreground">
                        {brainwaveInfo[activeWaveIndex].description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={handlePrevWave} className="h-8 w-8">
                        <ChevronLeft className="h-5 w-5" />
                      </Button>

                      <div className="flex gap-2">
                        {brainwaveInfo.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveWaveIndex(index)}
                            className={`h-2 w-2 rounded-full transition-all ${
                              index === activeWaveIndex
                                ? "w-6 bg-primary"
                                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            }`}
                            aria-label={`Go to ${brainwaveInfo[index].name}`}
                          />
                        ))}
                      </div>

                      <Button variant="ghost" size="icon" onClick={handleNextWave} className="h-8 w-8">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
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

export default ClassifierPage

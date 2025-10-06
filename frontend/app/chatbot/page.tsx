"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Network,
  Filter,
  Lightbulb,
  X,
} from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  context?: Array<{
    doc_id: string
    page: number
    text: string
  }>
}

interface GraphNode {
  id: string
  label: string
  category: string
  x?: number
  y?: number
}

interface GraphEdge {
  source: string
  target: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface PDFInsight {
  mainSummary: string // Added mainSummary property
  abstract: string
  methods: string
  results: string
  implications: string
}

const exampleQuestions = [
  "What are the latest findings in neural plasticity research?",
  "Explain brain-computer interface technologies",
  "How does microgravity affect neural function?",
  "What is neurogenesis in space environments?",
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your NASA Bioscience Research Assistant, trained on thousands of scientific publications. Ask me anything about neuroscience, brain-computer interfaces, or space biology research.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [contextSize, setContextSize] = useState(5)
  const [expandedContext, setExpandedContext] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [nodeAnalysis, setNodeAnalysis] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoadingGraph, setIsLoadingGraph] = useState(false)
  const [graphError, setGraphError] = useState<string>("")

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfInsights, setPdfInsights] = useState<PDFInsight | null>(null)
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string>("")

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"

  useEffect(() => {
    console.log("[v0] Backend API URL:", apiUrl)
  }, [apiUrl])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    const newMessages = [...messages, { role: "user" as const, content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      console.log("[v0] Calling API:", `${apiUrl}/qa`)
      console.log("[v0] Request body:", { query: userMessage, k: contextSize })

      const response = await fetch(`${apiUrl}/qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          k: contextSize,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] API response:", data)

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        context: data.context || [],
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error("[v0] Error calling API:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please ensure:\n1. Backend is running at ${apiUrl}\n2. CORS is enabled on the backend\n3. The /qa endpoint is available`,
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  const toggleContext = (index: number) => {
    setExpandedContext(expandedContext === index ? null : index)
  }

  const loadGraphData = async () => {
    setIsLoadingGraph(true)
    setGraphError("")
    try {
      console.log("[v0] Loading graph data from /graph_data.json")
      const response = await fetch("/graph_data.json")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      console.log("[v0] Graph data loaded successfully:", data.nodes?.length, "nodes")
      setGraphData(data)
    } catch (error) {
      console.error("[v0] Error loading graph data:", error)
      setGraphError(
        `Failed to load graph data. Please ensure:\n1. Create a 'public/artifacts' folder in your Next.js project\n2. Place your 'graph_data.json' file there\n3. The file should be accessible at '/artifacts/graph_data.json'`,
      )
    } finally {
      setIsLoadingGraph(false)
    }
  }

  const analyzeNode = async (node: GraphNode) => {
    setSelectedNode(node)
    setIsAnalyzing(true)
    setNodeAnalysis("")

    try {
      console.log("[v0] Analyzing node:", node.label)

      const response = await fetch(`${apiUrl}/qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `What are the key biological findings related to '${node.label}' in space bioscience?`,
          k: 6,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setNodeAnalysis(data.answer)
    } catch (error) {
      console.error("[v0] Error analyzing node:", error)
      setNodeAnalysis(`Failed to analyze node. Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getFilteredNodes = () => {
    if (!graphData) return []
    if (categoryFilter === "all") return graphData.nodes
    return graphData.nodes.filter((node) => node.category === categoryFilter)
  }

  const categories = graphData ? Array.from(new Set(graphData.nodes.map((node) => node.category))) : []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfError("")
      setPdfInsights(null)
    } else {
      setPdfError("Please select a valid PDF file")
    }
  }

  const analyzePdf = async () => {
    if (!pdfFile) return

    setIsAnalyzingPdf(true)
    setPdfError("")

    try {
      console.log("[v0] Loading PDF.js library...")
      if (typeof window === "undefined") return;
      const pdfjsLib = await import("pdfjs-dist")
      
      if (typeof window !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

      console.log("[v0] Extracting text from PDF...")
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ""
      const maxPages = Math.min(pdf.numPages, 20)

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")
        fullText += pageText + "\n"
      }

      console.log("[v0] Extracted text length:", fullText.length)
      const textSnippet = fullText.slice(0, 6000)

      console.log("[v0] Calling API for main summary...")
      const summaryResponse = await fetch(`${apiUrl}/qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `Summarize this paper and extract key insights from it:\n${textSnippet}`,
          k: 6,
        }),
      })

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text()
        console.error("[v0] Summary API error:", errorText)
        throw new Error(`API error: ${summaryResponse.status}`)
      }

      const summaryData = await summaryResponse.json()
      console.log("[v0] Main summary received")

      const sections = [
        { key: "abstract", prompt: "Summarize the research problem and main goal." },
        { key: "methods", prompt: "Explain what experimental or computational methods were used." },
        { key: "results", prompt: "Summarize the main findings and observations." },
        { key: "implications", prompt: "Explain how these findings impact space or biological science." },
      ]

      const sectionResults: any = { mainSummary: summaryData.answer }

      for (const section of sections) {
        console.log(`[v0] Analyzing section: ${section.key}`)
        const response = await fetch(`${apiUrl}/qa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `${section.prompt}\n\n${fullText.slice(0, 4000)}`,
            k: 4,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          sectionResults[section.key] = data.answer
        } else {
          console.error(`[v0] Failed to analyze ${section.key}`)
          sectionResults[section.key] = "Analysis not available"
        }
      }

      const insights: PDFInsight = {
        mainSummary: sectionResults.mainSummary,
        abstract: sectionResults.abstract,
        methods: sectionResults.methods,
        results: sectionResults.results,
        implications: sectionResults.implications,
      }

      setPdfInsights(insights)
      console.log("[v0] PDF analysis complete")
    } catch (error) {
      console.error("[v0] Error analyzing PDF:", error)
      setPdfError(
        `Failed to analyze PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please ensure the backend is running at ${apiUrl}`,
      )
    } finally {
      setIsAnalyzingPdf(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-semibold text-foreground">NASA Bioscience AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Research Q&A, Knowledge Graph & PDF Analysis</p>
            </div>
          </div>

          <Tabs defaultValue="qa" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="qa" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Q&A Chat
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                PDF Analysis
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex items-center gap-2" onClick={loadGraphData}>
                <Network className="h-4 w-4" />
                Knowledge Graph
              </TabsTrigger>
            </TabsList>

            <TabsContent value="qa" className="mt-0">
              <div className="flex h-[calc(100vh-180px)] flex-col">
                <ScrollArea className="flex-1 px-6 py-8">
                  <div className="mx-auto max-w-4xl space-y-6">
                    {messages.map((message, index) => (
                      <div key={index} className="space-y-2">
                        <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          {message.role === "assistant" && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <Card
                            className={`max-w-[80%] p-4 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-card-foreground"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </Card>
                          {message.role === "user" && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                              <User className="h-5 w-5 text-accent" />
                            </div>
                          )}
                        </div>

                        {message.context && message.context.length > 0 && (
                          <div className="ml-12">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleContext(index)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              <FileText className="mr-2 h-3 w-3" />
                              {expandedContext === index ? "Hide" : "View"} Supporting Context ({message.context.length}
                              )
                              {expandedContext === index ? (
                                <ChevronUp className="ml-2 h-3 w-3" />
                              ) : (
                                <ChevronDown className="ml-2 h-3 w-3" />
                              )}
                            </Button>

                            {expandedContext === index && (
                              <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                                {message.context.map((ctx, ctxIdx) => (
                                  <div key={ctxIdx} className="border-l-2 border-primary pl-4">
                                    <div className="mb-1 flex items-center gap-2">
                                      <span className="text-xs font-semibold text-primary">{ctx.doc_id}</span>
                                      <span className="text-xs text-muted-foreground">Page {ctx.page}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {ctx.text.substring(0, 400)}...
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <Card className="bg-card p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing research data...</span>
                          </div>
                        </Card>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {messages.length === 1 && (
                  <div className="border-t border-border bg-card/50 px-6 py-4">
                    <div className="mx-auto max-w-4xl">
                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4" />
                        <span>Try asking:</span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {exampleQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleExampleClick(question)}
                            className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-accent/5"
                          >
                            <BookOpen className="mb-2 h-4 w-4 text-primary" />
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-border bg-card px-6 py-4">
                  <div className="mx-auto max-w-4xl space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Context Size:</span>
                      <Slider
                        value={[contextSize]}
                        onValueChange={(value) => setContextSize(value[0])}
                        min={3}
                        max={10}
                        step={1}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-foreground">{contextSize}</span>
                    </div>
                    <form onSubmit={handleSubmit} className="flex gap-3">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about NASA bioscience research..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="mt-0">
              <div className="h-[calc(100vh-180px)] p-6">
                <div className="mx-auto max-w-4xl">
                  <Card className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Upload Research Paper</h2>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="flex-1"
                          disabled={isAnalyzingPdf}
                        />
                        <Button
                          onClick={analyzePdf}
                          disabled={!pdfFile || isAnalyzingPdf}
                          className="flex items-center gap-2"
                        >
                          {isAnalyzingPdf ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Analyze PDF
                            </>
                          )}
                        </Button>
                      </div>

                      {pdfError && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                          <X className="h-4 w-4" />
                          {pdfError}
                        </div>
                      )}

                      {pdfFile && !pdfError && (
                        <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-foreground">
                          Selected: {pdfFile.name}
                        </div>
                      )}
                    </div>

                    {pdfInsights && (
                      <div className="mt-6 space-y-4">
                        <div className="rounded-lg border-l-4 border-primary bg-card p-4">
                          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Sparkles className="h-5 w-5 text-primary" />
                            AI Insights Summary
                          </h3>
                          <p className="text-sm leading-relaxed text-foreground">{pdfInsights.mainSummary}</p>
                        </div>

                        <div className="mt-6">
                          <h3 className="mb-4 text-lg font-semibold text-foreground">Detailed Breakdown</h3>
                          <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                              <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                Abstract / Overview
                              </h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{pdfInsights.abstract}</p>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                              <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Methods
                              </h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{pdfInsights.methods}</p>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                              <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Results
                              </h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{pdfInsights.results}</p>
                            </div>

                            <div className="rounded-lg border border-border bg-card p-4">
                              <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                Implications
                              </h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {pdfInsights.implications}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="graph" className="mt-0">
              <div className="h-[calc(100vh-180px)] p-6">
                <div className="mx-auto max-w-7xl">
                  {isLoadingGraph ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : graphError ? (
                    <Card className="p-6">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-destructive" />
                        <div>
                          <h3 className="mb-2 font-semibold text-destructive">Graph Data Not Found</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>To use the Knowledge Graph feature:</p>
                            <ol className="ml-4 list-decimal space-y-1">
                              <li>
                                Create a <code className="rounded bg-muted px-1 py-0.5">public/artifacts</code> folder
                                in your Next.js project
                              </li>
                              <li>
                                Place your <code className="rounded bg-muted px-1 py-0.5">graph_data.json</code> file
                                there
                              </li>
                              <li>Refresh this tab to load the graph</li>
                            </ol>
                            <p className="mt-3 text-xs text-muted-foreground/70">
                              Expected path:{" "}
                              <code className="rounded bg-muted px-1 py-0.5">public/artifacts/graph_data.json</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : graphData ? (
                    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
                      <Card className="lg:col-span-2 p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-foreground">Knowledge Network</h2>
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                              className="rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground"
                            >
                              <option value="all">All Categories</option>
                              {categories.map((cat, index) => (
                                <option key={`category-${index}`} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <ScrollArea className="h-[calc(100%-60px)]">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {getFilteredNodes().map((node) => (
                              <button
                                key={node.id}
                                onClick={() => analyzeNode(node)}
                                className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                                  selectedNode?.id === node.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                                }`}
                              >
                                <div className="mb-1 text-xs font-medium text-primary">{node.category}</div>
                                <div className="font-medium text-foreground">{node.label}</div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </Card>

                      <Card className="p-6">
                        <div className="mb-4 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Node Analysis</h3>
                        </div>

                        {selectedNode ? (
                          <div className="space-y-4">
                            <div>
                              <div className="mb-1 text-xs font-medium text-muted-foreground">Selected Node</div>
                              <div className="rounded-lg border border-border bg-muted/50 p-3">
                                <div className="mb-1 text-xs text-primary">{selectedNode.category}</div>
                                <div className="font-medium text-foreground">{selectedNode.label}</div>
                              </div>
                            </div>

                            <div>
                              <div className="mb-2 text-xs font-medium text-muted-foreground">AI Insights</div>
                              {isAnalyzing ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Analyzing...</span>
                                </div>
                              ) : nodeAnalysis ? (
                                <ScrollArea className="h-[400px]">
                                  <p className="text-sm leading-relaxed text-foreground">{nodeAnalysis}</p>
                                </ScrollArea>
                              ) : (
                                <p className="text-sm text-muted-foreground">Click "Analyze" to get AI insights</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Select a node to view analysis</p>
                        )}
                      </Card>
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

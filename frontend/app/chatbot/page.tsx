"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, BookOpen, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on recent NASA bioscience publications, neural plasticity in microgravity environments shows significant adaptation patterns. Studies indicate that astronauts experience structural changes in brain connectivity during extended space missions.",
        "Brain-computer interfaces (BCIs) represent a crucial area of research for NASA. These systems enable direct communication between the brain and external devices, which could be vital for future space exploration missions where traditional interfaces may be impractical.",
        "Research from the NASA Life Sciences Data Archive suggests that microgravity affects neural function through multiple pathways, including changes in fluid distribution, altered sensory input, and modifications to cellular signaling mechanisms.",
        "The intersection of neuroscience and space biology reveals fascinating insights about human adaptation. Our research database contains extensive documentation on how the space environment influences cognitive function, motor control, and sensory processing.",
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }])
      setIsLoading(false)
    }, 1500)
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-semibold text-foreground">NASA Bioscience AI Chatbot</h1>
              <p className="text-sm text-muted-foreground">Trained on NASA research publications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
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
      </div>

      {/* Example Questions */}
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

      {/* Input */}
      <div className="border-t border-border bg-card px-6 py-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="flex gap-3">
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
          </div>
        </form>
      </div>
    </div>
  )
}

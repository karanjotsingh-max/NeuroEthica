"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, AlertCircle, MessageSquare, Send, Shield } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Phone className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mb-4 font-sans text-4xl font-bold text-foreground md:text-5xl text-balance">Contact Us</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team for support, collaboration inquiries, or to report concerns about BCI abuse.
          </p>
        </div>

        {/* BCI Abuse Hotline - Prominent */}
        <Card className="mb-12 border-destructive/50 bg-destructive/5 p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-9 w-9 text-destructive" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-2 font-sans text-2xl font-bold text-foreground">BCI-Abuse Hotline</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you are experiencing or aware of brain-computer interface abuse, misuse, or ethical violations,
                please contact our confidential hotline immediately.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <Button size="lg" variant="destructive" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Call: 1-800-BCI-HELP
                </Button>
                {/*
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Mail className="h-5 w-5" />
                  abuse@nasabio.org
                </Button> 
                */}
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-lg bg-background/50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                All reports are treated with strict confidentiality. Our team includes licensed counselors and legal
                advisors who can provide immediate support and guidance. Available 24/7.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="font-sans text-2xl font-bold text-foreground">Send Us a Message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this regarding?"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more..."
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">General inquiries</p>
                </div>
              </div>
              <a href="mailto:davis@neuroethica.ca" className="text-primary hover:underline">
                davis@neuroethica.ca
              </a>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Phone className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-sm text-muted-foreground">Business hours: Mon-Fri 9AM-5PM EST</p>
                </div>
              </div>
              <a href="tel:+1-555-NASA-BIO" className="text-primary hover:underline">
                +1 (403) 929-3287
              </a>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
            
                </div>
              </div>
              <address className="not-italic text-muted-foreground">
                8510 111 Street NW
                <br />
                Edmonton, AB T6G 2C8
                <br />
                Canada
              </address>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6">
              <h3 className="mb-3 font-semibold text-foreground">Research Collaboration</h3>
              <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                Interested in collaborating on research projects or accessing our datasets? Contact our research
                partnerships team.
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                davis@neuroethica.ca
              </Button>
            </Card>
          </div>
        </div>

        {/* Response Time */}
        <Card className="mt-8 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            We typically respond to inquiries within 24-48 hours. For urgent matters, please call our hotline.
          </p>
        </Card>
      </div>
    </div>
  )
}

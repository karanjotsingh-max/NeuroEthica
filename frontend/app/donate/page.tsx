"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Check, Rocket, Brain, Users, Shield } from "lucide-react"

const donationTiers = [
  {
    amount: 25,
    name: "Supporter",
    description: "Help maintain our AI infrastructure",
    benefits: ["Access to research database", "Monthly newsletter"],
  },
  {
    amount: 100,
    name: "Contributor",
    description: "Support neural data analysis tools",
    benefits: ["All Supporter benefits", "Early access to new features", "Contributor badge"],
  },
  {
    amount: 500,
    name: "Champion",
    description: "Fund research collaborations",
    benefits: ["All Contributor benefits", "Quarterly research reports", "Recognition on website"],
  },
  {
    amount: 1000,
    name: "Pioneer",
    description: "Advance BCI ethics and safety",
    benefits: ["All Champion benefits", "Direct consultation access", "Annual impact report"],
  },
]

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mb-4 font-sans text-4xl font-bold text-foreground md:text-5xl text-balance">
            Support Our Mission
          </h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Your contribution helps us advance neuroscience research, develop ethical BCI technologies, and make
            cutting-edge tools accessible to researchers worldwide.
          </p>
        </div>

        {/* Impact Section */}
        <Card className="mb-12 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8">
          <h2 className="mb-6 font-sans text-2xl font-bold text-foreground">Your Impact</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">AI Research Tools</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fund development of advanced neural data classifiers and analysis algorithms
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Global Access</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Provide free access to researchers in developing countries and underfunded institutions
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Ethics & Safety</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Support BCI-abuse prevention programs and ethical guidelines development
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                <Rocket className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Space Research</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enable collaboration with NASA on space neuroscience and biology projects
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Donation Tiers */}
        <div className="mb-12">
          <h2 className="mb-8 text-center font-sans text-2xl font-bold text-foreground">Choose Your Support Level</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {donationTiers.map((tier) => (
              <Card
                key={tier.amount}
                className={`cursor-pointer p-6 transition-all hover:border-primary/50 hover:shadow-lg ${
                  selectedAmount === tier.amount ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedAmount(tier.amount)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-3xl font-bold text-foreground">${tier.amount}</div>
                    <div className="mb-1 font-semibold text-foreground">{tier.name}</div>
                    <div className="text-sm text-muted-foreground">{tier.description}</div>
                  </div>
                  {selectedAmount === tier.amount && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">Custom Amount</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="pl-7"
              />
            </div>
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              Donate
            </Button>
          </div>
        </Card>

        {/* CTA */}
        {selectedAmount && (
          <Card className="border-primary/50 bg-primary/5 p-8 text-center">
            <h3 className="mb-2 font-sans text-xl font-semibold text-foreground">
              Ready to support with ${selectedAmount}?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Your contribution makes a real difference in advancing research
            </p>
            <Button size="lg" className="gap-2">
              <Heart className="h-5 w-5" />
              Complete Donation
            </Button>
          </Card>
        )}

        {/* Tax Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>All donations are tax-deductible. Tax ID: 00-0000000</p>
          <p className="mt-2">We accept all major credit cards and payment methods</p>
        </div>
      </div>
    </div>
  )
}

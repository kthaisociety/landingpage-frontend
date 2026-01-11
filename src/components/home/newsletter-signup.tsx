"use client"

import { useState } from "react"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NewsletterSignup() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    
    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name")
      return
    }

    if (!lastName.trim()) {
      setErrorMessage("Please enter your last name")
      return
    }
    
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setSuccessMessage("Successfully subscribed to our newsletter!")
      setFirstName("")
      setLastName("")
      setEmail("")
    } catch (error) {
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Something went wrong. Please try again later."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-[60vh] pb-12 w-full flex items-center justify-center">
      <div className="container px-4 md:px-6 text-center flex flex-col items-center justify-center h-full pt-20 pb-20">
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          <h2 className="text-4xl tracking-tighter bg-clip-text text-black">
            Stay Updated
            <span className=" text-[#1954A6] font-serif ml-2">
              (Newsletter)
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-black/80 tracking-tight max-w-xl mx-auto">
            Join our newsletter to stay informed about upcoming events, new projects, and the latest AI community news.
          </p>

          <form
            className="flex flex-col items-start gap-4 pt-4 w-full max-w-md mx-auto"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="firstName" className="text-left">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Alan"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    setErrorMessage("")
                  }}
                  disabled={isLoading}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="lastName" className="text-left">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Turing"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    setErrorMessage("")
                  }}
                  disabled={isLoading}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="email" className="text-left">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alan@turing.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrorMessage("")
                }}
                disabled={isLoading}
                className="h-12 text-base"
                required
              />
            </div>
            <Button
              type="submit"
              size="xl"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
            {errorMessage && (
              <div className="w-full flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="w-full flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

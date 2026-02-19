"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Users, Check, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function InvitePage() {
  const params = useParams()
  const code = params.code as string

  const [step, setStep] = useState<"loading" | "consent" | "success" | "error">("loading")
  const [groupData, setGroupData] = useState<GroupInfo | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [consentGiven, setConsentGiven] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    validateInviteCode()
  }, [code])

  const validateInviteCode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/invite/${code}`)
      const data = await response.json()

      if (data.success && data.data) {
        setGroupData({
          id: data.data.id,
          name: data.data.name,
          description: data.data.description || "",
          memberCount: data.data.memberCount || 0,
        })
        setStep("consent")
      } else {
        setErrorMessage(data.message || "Invalid invite code")
        setStep("error")
      }
    } catch (error) {
      setErrorMessage("Failed to validate invite code")
      setStep("error")
    }
  }

  const handleSubmitConsent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentGiven) {
      toast.error("Please accept the terms to join the group")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/invite/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phoneNumber }),
      })
      const data = await response.json()

      if (data.success) {
        setStep("success")
        toast.success("Successfully joined the group!")
      } else {
        toast.error(data.message || "Failed to join group")
      }
    } catch (error) {
      toast.error("Failed to join group. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Invite</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to the Group!</h2>
            <p className="text-muted-foreground mb-6">
              You have successfully joined &quot;{groupData?.name}&quot;. You will now receive notifications from this group.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{(groupData?.memberCount || 0) + 1} members</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold">Hatirlat.io</h1>
          </div>
          <h2 className="text-xl font-semibold mb-2">You are Invited!</h2>
          <p className="text-muted-foreground">
            You have been invited to join &quot;{groupData?.name}&quot;
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>{groupData?.name}</span>
            </CardTitle>
            <CardDescription>{groupData?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Current members:</span>
                <span className="font-medium">{groupData?.memberCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Join Group</span>
            </CardTitle>
            <CardDescription>
              Please provide your information and consent to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConsent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+90 555 123 4567"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This number will be used to send you notifications
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Privacy & Data Protection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Your information will only be used for group notifications</li>
                  <li>You can leave the group at any time</li>
                  <li>Your data is protected according to GDPR/KVKK regulations</li>
                </ul>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm leading-relaxed">
                  I consent to receive notifications from this group via SMS, email, or WhatsApp. I understand that I
                  can withdraw my consent at any time.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !consentGiven}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Group...
                  </>
                ) : (
                  "Join Group"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Users, Check, Phone, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function InvitePage({ params }: { params: { code: string } }) {
  const [step, setStep] = useState<"consent" | "success">("consent")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [consentGiven, setConsentGiven] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mock group data based on invite code
  const groupData = {
    name: "Family Reminders",
    description: "Important family notifications and reminders",
    inviterName: "John Doe",
    memberCount: 4,
  }

  const handleSubmitConsent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms to join the group",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setStep("success")

    toast({
      title: "Welcome!",
      description: "You've successfully joined the group",
    })
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to the Group!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You've successfully joined "{groupData.name}". You'll now receive notifications from this group.
            </p>
            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{groupData.memberCount + 1} members</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{phoneNumber}</span>
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
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hatirlat.io</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">You're Invited!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {groupData.inviterName} has invited you to join "{groupData.name}"
          </p>
        </div>

        {/* Group Info */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>{groupData.name}</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">{groupData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between items-center">
                <span>Current members:</span>
                <span className="font-medium">{groupData.memberCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Form */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Join Group</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Please provide your phone number and consent to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConsent} className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+90 555 123 4567"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This number will be used to send you notifications
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Privacy & Data Protection</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Your phone number will only be used for group notifications</li>
                  <li>• You can leave the group at any time</li>
                  <li>• Your data is protected according to GDPR/KVKK regulations</li>
                  <li>• We will never share your information with third parties</li>
                </ul>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  I consent to receive notifications from this group via SMS, email, or WhatsApp. I understand that I
                  can withdraw my consent at any time and that my personal data will be processed in accordance with
                  privacy regulations.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                disabled={isLoading || !consentGiven}
              >
                {isLoading ? "Joining Group..." : "Join Group"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            By joining this group, you agree to our{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

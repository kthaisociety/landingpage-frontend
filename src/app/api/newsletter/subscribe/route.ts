import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const mailchimpApiKey = process.env.MAILCHIMP_API_KEY
    const mailchimpAudienceId = process.env.MAILCHIMP_AUDIENCE_ID
    const mailchimpServerPrefix = process.env.MAILCHIMP_SERVER_PREFIX

    if (!mailchimpApiKey || !mailchimpAudienceId || !mailchimpServerPrefix) {
      console.error("Mailchimp configuration missing")
      return NextResponse.json(
        { error: "Newsletter service is not configured" },
        { status: 500 }
      )
    }

    // Mailchimp API endpoint
    const mailchimpUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`

    // Check if member already exists
    const subscriberHash = Buffer.from(email.toLowerCase()).toString("base64")
    const checkUrl = `https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members/${subscriberHash}`

    try {
      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mailchimpApiKey}`,
        },
      })

      if (checkResponse.ok) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        )
      }
    } catch {
      // Member doesn't exist, continue with subscription
    }

    // Add member to Mailchimp
    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: name.trim(),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Mailchimp API error:", errorData)
      
      // Handle specific Mailchimp errors
      if (response.status === 400 && errorData.title === "Member Exists") {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        )
      }

      // Handle merge field errors
      if (response.status === 400 && errorData.title === "Invalid Resource" && errorData.errors) {
        const mergeFieldErrors = errorData.errors
          .filter((err: { field?: string }) => err.field)
          .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
          .join(", ")
        
        if (mergeFieldErrors) {
          console.error("Merge field errors:", mergeFieldErrors)
        }
      }

      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(
      { 
        message: "Successfully subscribed",
        data: {
          id: data.id,
          email_address: data.email_address,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

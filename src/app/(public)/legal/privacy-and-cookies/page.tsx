'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Markdown } from '@/components/ui/markdown'
import { AsciiGrid } from '@/components/ui/ascii-grid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const privacyContent = `
# Privacy and Cookies Policy

In compliance with current regulations on the protection of personal data you are informed of the following aspects.

**Note:** This Privacy and Cookies are based on HackUPC's Privacy and Cookies retrieved July 30, 2019.

---

## 1. Data controller

KTH AI Society (hereinafter, "KTHAIS"), with organisation number 8025187249 and address Tekniska Högskolans Studentkår, Drottning Kristinas Väg 15-19, 100 44 Stockholm (Sweden) and contact email address [contact@kthais.com](mailto:contact@kthais.com) is the data controller of the processing of your personal data.

You may contact KTHAIS in the postal address previously indicated or in the following email address for any query, request or clarification regarding the processing of your personal data at [contact@kthais.com](mailto:contact@kthais.com).

---

## 2. What personal data we process and how we have obtained it

KTHAIS shall process the following personal data:

- **(i)** Any initial data that you voluntarily provide related to a request to register as a participant, information requests made to our company, requests to take part in promotions or requests to receive any of the services offered by KTHAIS (we shall give clear, precise instructions of the mandatory data you must provide on each form)
- **(ii)** Any data that are subsequently generated or exchanged with Users in order for KTHAIS to fulfil your initial request
- **(iii)** Any personal data that you provide through social media in order to handle your requests. These data shall depend on the privacy settings of each participant, the use made by each participant of social media, in addition to the privacy policies of the social media in question.

### When you subscribe to be the first to know when applications open

**Contact data:** email.

### When you register on the website independent of the role

- **Identifying data:** Name, surname/s, city, country and a picture of yourself.
- **Contact data:** Email and phone number.
- **Data on personal characteristics:** Sex and birthday.
- **Academic and professional data:** Current studies, university and year of graduation.
- **Other information:** Account password and last connection.

### When you register to an event as a Participant

- **Health data:** Food allergies and intolerances.
- **Other information:** Dietary preferences.

### When you register to an event as a Sponsor, Judge or Mentor

- **Business contact data:** Corporate email.
- **Academic and professional data:** Current position and place of work.
- **Health data:** Food allergies and intolerances.
- **Other information:** Dietary preferences.

### When you register to an event as "other attendees"

- **Health data:** Food allergies and intolerances.
- **Other information:** Dietary preferences.

---

## 3. What we process your personal data for

### When you subscribe to be the first to know when applications open, register as a Participant, register as a Judge or Mentor or register as "other attendees"

- KTHAIS shall process your personal data to handle and process requests received from you, whether for information, registration, participation in promotions or the rendering of services.
- In addition, your personal data shall be processed to send, including via electronic media, commercial communications about activities, services or products offered by KTHAIS that are of a similar nature to those previously requested by you.

### When you register as a Sponsor

- Your business contact data will be processed with the exclusive purpose of maintaining the commercial, contractual or collaborative relationships that KTHAIS has with the company, entity or organization you work for or collaborate with.
- In addition, your business contact data shall be processed to send, including via electronic media, commercial communications about activities, services or products offered by KTHAIS that are of a similar nature to those that motivate the existing relationship between our entity and the company, entity or organization that you work for or collaborate with.

### Regarding the images and videos of yourself

- KTHAIS shall process your personal data to display, broadcast and/or publish it by KTHAIS for advertising purposes through any audiovisual and/or written media (TV, press, internet, social networks...) and in any advertising and media support (brochures, banners, panels, website, memory of activities, publications, reports...).

### Regarding food allergies and intolerances

- KTHAIS shall process your personal data only in order to manage the catering service.

---

## 4. Why we may process your personal data

### When you subscribe to be the first to know when applications open, register as a Participant, register as a Judge or a Mentor or register as "other attendees"

- KTHAIS is legally entitled to process personal data for handing and processing requests from you, as this is required for KTHAIS to meet its contractual obligations in respect of such requests.
- With regard to commercial communications sent about activities, services or products offered by KTHAIS of a similar nature to those previously requested or acquired by you, the processing of your personal data responds to a legitimate interest of HACKERS AT UPC, expressly recognised by the data protection regulation, as well as by the regulations on services in the information society.
- You may now or at any time in the future object to receive commercial communications about activities, services or products offered by KTHAIS by sending an email to [contact@kthais.com](mailto:contact@kthais.com).

### When you register as a Sponsor

- The processing of your business contact data relative to maintaining the relationship between KTHAIS and the company, entity or organization you work for or collaborate with responds to a legitimate interest of our organization, specifically recognized in the privacy regulation.
- With regard to commercial communications sent about activities, services or products offered by KTHAIS of a similar nature to those that motivate the existing relationship between our entity and the company, entity or organization that you work for or collaborate with, the processing of your personal data responds to a legitimate interest of HACKERS AT UPC, expressly recognised by the data protection regulation, as well as by the regulations on services in the information society.
- You may now or at any time in the future object to receive commercial communications about activities, services or products offered by KTHAIS by sending an email to [contact@kthais.com](mailto:contact@kthais.com).

### Regarding the images and videos of yourself

- KTHAIS is legally entitled to process your personal data to display, broadcast and/or publish it because you have given express consent.

### Regarding food allergies and intolerances

- KTHAIS shall process your personal data in order to manage the catering service because you have given express consent.

---

## 5. When and why we may transfer your data to third parties

Your data may be transferred to the following addressees for these reasons.

- **Public administrations:** For compliance with legal obligations to which KTHAIS is subject based on its activity.
- **Accounting audit firms:** To comply with the legal obligations of auditing accounts to which KTHAIS is subject due to its activity.
- **Law enforcement:** When our organization is required to provide information in compliance with a legal obligation.
- **Providers** who require access to your personal data in order to provide the services that KTHAIS has hired from them, and with whom KTHAIS has subscribed confidentiality and data processing agreements that are necessary and mandatory by the privacy protection regulation.
- **Sponsors:** In the event that you request it, we will share the personal data in your resume, with the Sponsors participating at the specific event organized by KTHAIS in which you request to participate in. KTHAIS will be able to transfer your data due to the fact that you have given your consent.

You will be duly informed if KTHAIS transfers personal data to other addressees in the future.

---

## 6. International data transfers

KTHAIS has hired technology service providers located in countries that do not have a data protection regulation equivalent to the European Union ("third countries"). These service providers have signed the confidentiality and data processing agreements required by the regulation, which apply the warranties and safeguards needed to preserve your privacy.

For further information regarding warranties to your privacy, you may contact KTHAIS at the electronic or postal addresses previously indicated.

---

## 7. How long we will store your data

Your personal data will be stored while your relationship with KTHAIS is ongoing and, once said relationship is terminated for whatever cause, for the applicable legal terms. Once the relationship is terminated, your data will be processed solely to the effects of demonstrating compliance with the legal or contractual obligations of the Company. Once said legal terms are met, your data will be eliminated or, alternatively, anonymised.

---

## 8. What are your rights

We inform you that you have a right to access your personal data, rectify inaccurate data, request their erasure when they are no longer necessary, oppose or limit the processing or request the portability of the data, through the postal and electronic addresses indicated.

Furthermore, if you consider the processing of your personal data violates the regulation or your rights to privacy, you may file a complaint:

- **To KTHAIS,** through the electronic and postal addresses indicated.
- **To the Swedish Data Protection Authority (Datainspektionen)** through its electronic or postal addresses.

---

## 9. Warning to underage participants

KTHAIS hereby informs you that underage participants under 14 may not register on this Website and, therefore, they may not take part in promotional campaigns that KTHAIS may conduct in relation to its activity.

Furthermore, you are informed that if you are aged over 14 but under 18, it is recommended that you tell your parents or legal guardians that you intend to access the Website before doing so, in order that the former explain to you the implications of the Terms and Conditions and, specifically, of the Privacy and Cookies policy contained herein, as well as elucidating on the possible uses to be made of this Website, notwithstanding the specific cases in which by law the parents or legal guardians of minors between the ages of 14 and 18 must give their consent for their personal data to be processed.

---

## 10. Cookies

### What are cookies and how we use them?

A cookie is a small text file that is stored on a user's computer for record-keeping purposes. We do not link the information we store in cookies to any personally identifiable information you submit while on our Website. By accessing the Site, you expressly accept the use of this type of cookies on your devices.

There are two types of cookies: **Session cookies** and **persistent cookies**. We also allow third parties to use cookies on our Website.

- **Session Cookies:** Session cookies exist only during one online session. They are deleted from your computer when the browser is closed or the computer is turned off. We use session cookies to allow our systems to uniquely identify you during a session.
- **Persistent Cookies:** Persistent cookies are saved on the computer after you have closed the browser or shut down your computer. We use persistent cookies to track statistical and aggregate information about your activity, which can be combined with other information.
- **Third Party Cookies:** We also hire third parties to track and analyse personal and non-personal information. To do so, we allow third parties to send cookies to users of our Website, as permitted by law and without prejudice of your right to disable such cookies. We use the data collected by said third parties to help us manage and improve the quality of the Website and to analyse the use of the Website. The use of these cookies is not covered by our Privacy and Cookies policy, we do not have access or control over these cookies.

### Which cookies do we use?

We use both session ID cookies and persistent cookies. We use session cookies to make it easier for you to navigate our Website. A session ID cookie expires when you close your browser. A persistent cookie remains on your hard drive for an extended period of time.

| Cookie | Owner | Duration | Purpose |
| --- | --- | --- | --- |
| cookielaw_accepted | KTHAIS | Undefined | Determines if the user has agreed with the Privacy and Cookies policy. |
| csrftoken | KTHAIS | Undefined | Protects against CSRF attacks. |
| sessionid | KTHAIS | 15 days | Maintains the session as logged. |

### Can I refuse or opt out of cookies?

You can delete cookies at any time using the special settings of your web browser. Given the large number of browsers and versions available on the market, we cannot provide technical assistance on the process of blocking or removing cookies from each of them. For such purposes, you should consult the manuals and support services provided by the manufacturer of the browser that you are using.

If you choose to disable cookies, we may not be able to offer you some of our services.
`

export default function PrivacyAndCookiesPage() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 100px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText('PRIVACY', canvas.width / 2, canvas.height / 2)

    const dataUrl = canvas.toDataURL('image/png')
    requestAnimationFrame(() => {
      setTextMask(dataUrl)
    })
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section with ASCII Grid */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* ASCII Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={textMask}
            logoPosition="center"
            logoScale={1}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Title and Description */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
              Privacy and Cookies Policy
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
              How we collect, use, and protect your personal information and our
              use of cookies.
            </p>
          </div>
        </div>
      </section>

      {/* White Content Area */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-8 xl:px-8">
        <section className="relative max-w-7xl mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
        {/* Breadcrumbs */}
        <div className="mb-8 flex items-center">
          <Link
            href="/"
            className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
          >
            Home
          </Link>
          <span className="text-gray-300 mx-2">/</span>
          <Link
            href="/legal"
            className="text-secondary-gray hover:text-primary transition-colors text-sm font-medium"
          >
            Legal
          </Link>
          <span className="text-gray-300 mx-2">/</span>
          <span className="text-primary font-medium text-sm">
            Privacy and Cookies Policy
          </span>
        </div>

        {/* 2 Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Markdown content={privacyContent} />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-medium mb-4 text-secondary-black flex items-center gap-2">
                  Document Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-secondary-black mb-1">
                      Last Reviewed
                    </p>
                    <p className="text-muted-foreground">December 19, 2025</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-secondary-black mb-1">
                      Data Protection Authority
                    </p>
                    <p className="text-muted-foreground">
                      Datainspektionen (Sweden)
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-secondary-black mb-1">
                      Based On
                    </p>
                    <p className="text-muted-foreground">
                      HackUPC Privacy Policy
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg font-medium mb-4 text-secondary-black">
                  Questions?
                </h3>
                <div className="flex flex-col gap-3">
                  <Button variant="default" asChild className="w-full">
                    <Link
                      href="mailto:contact@kthais.com"
                      className="flex items-center justify-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Contact Us
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/legal">All Legal Documents</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Markdown } from '@/components/ui/markdown'
import { AsciiGrid } from '@/components/ui/ascii-grid'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const legalNoticeContent = `
# Legal Notice

This Legal Notice is intended to regulate access and use and, in general, the relationship between this Website, accessible from the Internet address [kthais.com](https://kthais.com) (the "website") and its users.

**Note:** This Legal notice is based on HackUPC's Legal notice retrieved July 30, 2019.

---

## 1. Identity of the service provider

The owner of this website is KTH AI SOCIETY (hereinafter, "KTHAIS") with organisation number 8025187249 and address Tekniska Högskolans Studentkår, Drottning Kristinas Väg 15-19, 100 44 Stockholm (Sweden) and contact email address [contact@kthais.com](mailto:contact@kthais.com).

This website is informative, open and available to the public. The access to the website attributes to the person who carries it out the condition of user, who accepts from that moment on, fully and without any reservation, the conditions contained in this Legal Notice.

---

## 2. Use and content of the website

The user undertakes to use the website, its contents and services in accordance with the law, this Legal Notice, the good customs and the public order. The use of the website for illicit or harmful purposes against KTHAIS or third parties is prohibited.

Reproduction, distribution or modification of the contents of this website is prohibited without the written permission of the legitimate owners.

The user expressly undertakes not to destroy, alter, render useless or in any other way damage the data, programs or electronic documents that are on the website, or to introduce programs, viruses, macros, applets, Active X controls or any other logical device or sequence of characters that cause or are likely to cause any kind of alteration in computer systems.

The duration of the service provided by the website is indefinite. Without prejudice to the foregoing, KTHAIS reserves the right to discontinue this service at any time and without prior notice.

---

## 3. Links to third party services

This Legal Notice refers only to this website and its content. Therefore, it does not apply to third party web pages accessible through links inserted in the KTHAIS website.

Under no circumstances shall KTHAIS be liable for the contents or services of other links made available on the website, nor can it guarantee the technical availability, quality, reliability, accuracy, breadth, accuracy, validity and legality of any material or information contained in any of said links.

Unless expressly stated otherwise, the contents of the website do not constitute a binding offer.

Links that appear on the website may not be approved by KTHAIS.

Likewise, the inclusion of these external connections will not imply any type of association, merger or participation with the connected entities.

---

## 4. Intellectual property

KTHAIS is the legitimate owner of all rights, titles and interests in and to the Website, its contents and software, including any modifications, updates and new versions, as well as any trademarks, trade names, know-how, copyrights, images, photographs, graphic drawings, text files, audio, video and any other intellectual or industrial property rights inherent therein.

It is strictly forbidden to remove, circumvent or manipulate the copyright notice and any other data identifying the rights of KTHAIS or their respective owners incorporated into the contents, product and/or services, as well as the technical protection devices or any information and/or identification mechanisms that may be contained therein. Under no circumstances shall the provision of these contents to the users imply the transfer of their ownership or any right of use and/or exploitation to the user, other than the use that the legitimate use entails and in accordance with the nature of the services and functionalities of KTHAIS.

Any use of any of the elements subject to industrial and intellectual property for any type of purpose, especially commercial, as well as their transmission, distribution, public communication, reproduction or storage, in whole or in part, whether for profit or for commercial or non-commercial purposes, is strictly prohibited, unless expressly authorised in writing by the owner of the same.

---

## 5. Liability

Visiting users undertake not to introduce, voluntarily or involuntarily, viruses or files of any nature that may disturb the functioning of the website; in which case they would be fully responsible.

Your use and browsing of the website is at your own risk. KTHAIS shall be exempt from any liability for damages to the user and third parties in connection with the following:

- The incorrect functioning of the website.
- The lack of adequacy of the website and/or its services or contents to satisfy the needs, specific results or expectations of the users.
- Presence of contaminating codes or viruses that could produce alterations in the computer system of the users.
- Any damage that may occur as a result of the contents of third parties included on the website.

KTHAIS reserves the right to prevent, block and/or remove from the Website those users who display inappropriate behaviour or who breach any of the clauses of this Legal Notice, without prior notice from KTHAIS.

---

## 6. Confidentiality and personal data protection

In accordance with the current data protection legislation, particularly the Regulation (EU) 2016/679 of The European Parliament and of The Council, of 27 April, on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, all personal data collected during the use of the website will be processed in accordance with the provisions of the Privacy and Cookies Policy which all users must expressly accept.

---

## 7. Applicable law and jurisdiction

This Legal Notice shall be governed by Swedish law.

In the event that the user's residence is outside Sweden, KTHAIS and the user, expressly waiving any other jurisdiction to which they may be entitled, hereby submit to the jurisdiction of the Courts and Tribunals of Stockholm.

KTHAIS will pursue the breach of this Legal Notice as well as any improper use of the website by exercising all civil and criminal actions that may correspond.

---

## 8. Modification and update

The information contained in these pages is current as of the date of the last update.

KTHAIS reserves the right to modify this Legal Notice at any time and to restrict access temporarily or permanently, indicating in the heading of this Legal Notice the date of the last modification.

If you do not agree with any updates, please contact KTHAIS.
`

export default function LegalNoticePage() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 120px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText('LEGAL', canvas.width / 2, canvas.height / 2)

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
              Legal Notice
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
              Information about the use of our website, intellectual property,
              and applicable laws.
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
            Legal Notice
          </span>
        </div>

        {/* 2 Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Markdown content={legalNoticeContent} />
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
                      Last Updated
                    </p>
                    <p className="text-muted-foreground">December 19, 2025</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-secondary-black mb-1">
                      Jurisdiction
                    </p>
                    <p className="text-muted-foreground">
                      Stockholm, Sweden
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-secondary-black mb-1">
                      Based On
                    </p>
                    <p className="text-muted-foreground">
                      HackUPC Legal Notice
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

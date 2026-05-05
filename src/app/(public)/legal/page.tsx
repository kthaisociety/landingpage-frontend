'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Shield, Scale, Mail, ArrowRight } from 'lucide-react'
import { AsciiGrid } from '@/components/ui/ascii-grid'
import { Button } from '@/components/ui/button'

const legalDocuments = [
  {
    title: 'Terms and Conditions',
    description:
      'Our terms and conditions for participating in KTHAIS events and using our services.',
    icon: FileText,
    href: '/legal/terms-and-conditions',
    available: true,
  },
  {
    title: 'Privacy and Cookies Policy',
    description:
      'How we collect, use, and protect your personal information and our use of cookies.',
    icon: Shield,
    href: '/legal/privacy-and-cookies',
    available: true,
  },
  {
    title: 'Legal Notice',
    description:
      'Information about the use of our website, intellectual property, and applicable laws.',
    icon: Scale,
    href: '/legal/legal-notice',
    available: true,
  },
]

export default function LegalPage() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 150px system-ui, -apple-system, sans-serif'
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
          {/* Icon Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
              <Scale className="w-4 h-4" />
              <span className="text-sm font-medium">Legal Documents</span>
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-base mb-6 tracking-tighter">
              Legal Documents
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
              Access our legal documents, policies, and guidelines. We are
              committed to transparency and protecting your rights.
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
          <span className="text-primary font-medium text-sm">Legal</span>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {legalDocuments.map((doc) => {
            const Icon = doc.icon
            return (
              <Link
                key={doc.href}
                href={doc.available ? doc.href : '#'}
                className={`block bg-white rounded-lg border p-8 ${
                  doc.available
                    ? 'cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!doc.available) {
                    e.preventDefault()
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-base text-secondary-black mb-2 flex items-center gap-2">
                      {doc.title}
                      {!doc.available && (
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                      {doc.available && (
                        <ArrowRight className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Contact section */}
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-2xl font-base text-secondary-black mb-4">
            Questions?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            If you have any questions about our legal documents or need
            clarification on any of our policies, please don&apos;t hesitate to
            contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="default">
              <Link
                href="mailto:contact@kthais.com"
                className="flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
        </section>
      </div>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const termsContent = `
# Terms and Conditions

This Terms and Conditions (hereinafter, "T&C") are intended to regulate the relationship between KTH AI SOCIETY (hereinafter, "KTHAIS") and the users who decide to sign up and participate in events organised by KTHAIS.

For the purposes of this agreement, the parties agree that, when used capitalized herein, the following terms shall have the following meanings unless they are otherwise defined in this Agreement.

**Note:** This Terms and Conditions are based on HackUPC's Terms and Conditions retrieved July 30, 2019.

---

## Definitions

- The **"Organiser"** refers to KTHAIS, with organisation number 8025187249 and address Tekniska Högskolans Studentkår, Drottning Kristinas Väg 15-19, 100 44 Stockholm (Sweden) and contact email address [contact@kthais.com](mailto:contact@kthais.com).
- The **"Participant"** refers to any user who decides to sign up accepting this T&C and participates in the event organised by the Organiser.
- The **"Attendee"** refers to any User who decides to sign up accepting this T&C and participates in the event organised by the Organiser in any other role that is not the role of Participant. It includes the following: Sponsor, Judge, Mentor, Organiser and other attendees.

---

## Clauses

### 1. Object

By virtue of this agreement, the Participant or Attendee agrees to participate in the corresponding event organised by KTHAIS.

This T&C apply to both the Participants and the Attendees, although some of its clauses may only be applicable to the Participant given their role in the event.

KTHAIS is an association that promotes technology, creativity and innovation and organises events, primarily related with Artificial Intelligence.

### 2. Code of Conduct

This is the Code of Conduct that we expect all event participants to abide. This is a customised version of the Code of Conduct used at MLH member hackathons. If you have a suggestion for this code of conduct or a question about them, please let us know.

#### TL;DR

**Be respectful. Harassment and abuse are never tolerated.**

#### The Code of Conduct

At KTHAIS we believe that every participant has the right to hack in a safe and welcoming environment.

Harassment includes but is not limited to offensive verbal or written comments related to gender, age, sexual orientation, disability, physical appearance, body size, race, religion, social class, economic status, veteran status, sexual images, deliberate intimidation, stalking, following, harassing photography or recording, sustained disruption of talks or other events, inappropriate physical contact, and unwelcome sexual attention. If what you're doing is making someone feel uncomfortable, that counts as harassment and is enough reason to stop doing it.

Participants asked to stop any harassing behavior are expected to comply immediately.

Sponsors, judges, mentors, organisers, and anyone else at the event are also subject to the anti-harassment policy. In particular, attendees should not use sexualised images, activities, or other material both in their hacks and during the event. Booth staff (including volunteers) should not use sexualised clothing/uniforms/costumes, or otherwise create a sexualised environment.

If a participant engages in harassing behavior, KTHAIS may take any action it deems appropriate, including warning the offender or expulsion from the event with no eligibility for reimbursement or refund of any type.

If you are being harassed, notice that someone else is being harassed, or have any other concerns, please contact KTHAIS using the reporting procedures defined below.

Event organizers will be happy to help participants contact campus security or local law enforcement, provide escorts, or otherwise assist those experiencing harassment to feel safe for the duration of the event. We value your attendance.

We expect participants to follow these rules at all event venues, online interactions in relation to the event and on event supplied transportation.

#### Reporting procedures

If you feel uncomfortable or think there may be a potential violation of the Code of Conduct, please report it immediately using one of the following methods. All reporters have the right to remain anonymous.

By sending us an email to [contact@kthais.com](mailto:contact@kthais.com), your report will be received by our organisers. If you want to remain anonymous please send us an email through an anonymous email service or create a temporary email account.

If you need to contact a team member directly, please contact the board at [contact@kthais.com](mailto:contact@kthais.com).

KTHAIS reserves the right to revise, make exceptions to, or otherwise amend these policies in whole or in part.

### 3. Cheating Response Procedure

#### Procedure

The following is a guide of actions to be taken in the case of an accusation that a team cheated or otherwise violated the rules of competition.

Accusations of cheating may include but are not limited to the following:

- A team using somebody else's code.
- A team misrepresenting the work they did.
- A team having too many team members.
- A team using code that was written outside the event.

#### Accusation

If you suspect cheating, please get in touch with the organisers of the event. If you are still at the event, please talk to an event organiser. If it is after the event, please email [contact@kthais.com](mailto:contact@kthais.com).

#### Document the report

The following steps are to be followed by KTHAIS.

Try to get as much of the allegation in written form by the reporter. If you cannot, transcribe it yourself as it was told to you.

The important information to gather include the following:

- Identifying information (name, email, phone, etc.) of the reporter.
- Identifying information (name, email, phone, etc.) of the participant/team accused of cheating.
- Reason the reporter suspects cheating.
- Other people suspected to be involved in the cheating.
- Other witnesses/people who suspect the cheating.
- Any relevant URLs (for example GitHub repositories).

KTHAIS organisers will then investigate the allegation by reviewing public materials about the hack, including project repositories, project submissions and anything else available to them.

#### Response

**A. Cheating did not occur**

If KTHAIS determines cheating did not occur, they will compile a report and inform the reporter.

**B. Other outcomes**

If KTHAIS is unable to determine that cheating did not occur based on publicly available resources, organizers will then communicate with the alleged cheater. Informing them of what has been reported about them. Allow the alleged cheater to give their side of the story to the staff. After this point, if the report stands, let the alleged cheater know what actions will be taken against them.

#### Actions that organisers will consider when dealing with alleged cheating offenders

The following actions will be considered:

- Warning the cheater to cease their behavior and that any further reports will result in sanctions.
- Not allowing the participants to demo.
- Not allowing the participants to win prizes.
- Revocation of prizes and recognitions.
- Banning the participants from future events (either indefinitely or for a certain time period).
- Publishing an account of the cheating.

Depending on the cheating allegation, KTHAIS may decide to make one or more public announcements. If necessary, this will be done with a short announcement. No one other than KTHAIS board should make any announcements.

If some attendees were angered by the cheating, it is best to apologise to them that the cheating occurred to begin with.

### 4. Termination and Cancellation

KTHAIS may at any time, in its sole discretion, immediately terminate this Agreement with or without cause. KTHAIS will make commercially reasonable efforts to notify the Participant or Attendee via email of any such termination or cancellation up to the date of the event.

Participants or Attendees may cancel and/or terminate this Agreement with or without cause at any time, always notifying KTHAIS in a reasonable period of time.

If either party does not fulfil a material obligation defined in this Agreement, the other party has the right to terminate this Agreement immediately with written notice to the party in breach, provided that such material breach remains uncured, without prejudice of the right to claim the damages caused to the non-breaching party.

### 5. Confidentiality, Personal Data Protection and Rights of Image

In accordance with the current data protection legislation, particularly the Regulation (EU) 2016/679 of The European Parliament and of The Council, of 27 April, on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, all personal data collected during the use of the website will be processed in accordance with the provisions of the Privacy and Cookies Policy which all Users must expressly accept.

As it is explained in the Privacy policy, one of the personal data that you authorize KTHAIS to process is your image.

- By accepting the Privacy and Cookies policy and this T&C you grant KTHAIS, its organisers and sponsors permission to capture photographs and/or record videos of yourself in the event you request to participate.
- You give your consent for the images and/or videos taken during the course of this event to be displayed, broadcasted and/or published by KTHAIS and/or the sponsors of the event you request to participate for advertising purposes through any audiovisual and/or written media (TV, press, internet, social networks...) and in any advertising and media support (brochures, banners, panels, website, memory of activities, publications, reports...), worldwide, for an indefinite period and without limitation.
- This authorization is perpetual and has no other limitations than those contained in the Swedish Law (1978:800) om namn och bild i reklam (on names and pictures in advertising).
- This authorization is made completely free of charge, and you undertake not to request or claim any compensation, payment or reimbursement in exchange for this authorization.
- When the photographs and/or videos are taken by KTHAIS, the applicable Privacy policy will be the KTHAIS's Privacy and Cookies policy. When the photographs and/or videos are taken by a sponsor, the applicable privacy policy will be the Sponsor's Privacy policy.

### 6. Limitation of Liability and Indemnification

#### Indemnification

You agree to indemnify, defend and hold KTHAIS, its members (hosts and volunteers) and other personalities that have a role in this event (sponsors, judges, mentors) harmless from and against any and all costs, claims, demands, liabilities, expenses, losses, damages and attorney fees arising from any claims and lawsuits or proceeding for libel, slander, copyright, and trademark violation as well as all other claims resulting from (i) the participation in the event or (ii) otherwise arising from a relationship with KTHAIS. You also agree to indemnify KTHAIS for any legal fees incurred by KTHAIS, acting reasonably, in investigating or enforcing its rights under this Agreement.

#### Limitation of liability

UNDER NO CIRCUMSTANCES WILL KTHAIS BE LIABLE TO THE PARTICIPANT OR ATTENDEE WITH RESPECT TO ANY SUBJECT MATTER OF THESE TERMS AND CONDITIONS UNDER CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHER LEGAL OR EQUITABLE THEORY, WHETHER OR NOT HACKERS AT UPC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE, FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL OR EXEMPLARY DAMAGES ARISING FROM ANY PROVISION OF THESE TERMS. THESE LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE.

### 7. Modifications

KTHAIS reserves the right to amend the provisions of the present Agreement that are minor in scope or nature, and to do so without citing any reasons, provided such modifications do not lead to the Agreement as a whole being restructured. KTHAIS will communicate, by email or other electronic means, the modified conditions at least 15 days prior to the effective date. Participants or Attendees who do not object in writing to the modification within 7 days after the receipt of the communication will be deemed to have accepted the respective modification.

If a Participant or Attendee objects to the new (modified) Terms, KTHAIS's request to modify them will be deemed to have been rejected. The Agreement will then be continued without the proposed modification only in relation to such particular event where the change was made while the Participant or Attendee was already registered, however, the new T&C with all modifications will fully apply for any new event. The right of the parties to terminate their participation in the event remains unaffected hereby.

### 8. Applicable Law and Jurisdiction

This Agreement shall be governed by Swedish law.

In the event that the User's domicile is outside Sweden, KTHAIS and the Participant or Attendee, expressly waiving any other jurisdiction to which they may be entitled, hereby submit to the jurisdiction of the Courts and Tribunals of Stockholm.

KTHAIS will pursue the breach of this Agreement by exercising all civil and criminal actions that may correspond.

### 9. General Provisions

#### Force majeure

Except for payment obligations, if either party is prevented from performing or is unable to perform any of its obligations under this Agreement due to causes beyond the reasonable control of the party invoking this provision, including but not limited to acts of God, acts of civil or military authorities, riots or civil disobedience, wars, strikes or labor disputes (each, a "force majeure event"), such party's performance shall be excused and the time for performance shall be extended accordingly provided that the party immediately takes all reasonably necessary steps to resume full performance. If such party remains unable to resume full performance fifteen (15) days after the force majeure event, the other party may terminate this Agreement upon written notice.

#### Severability

Should any of the provisions of this Agreement be adjudged invalid or unenforceable by the rules and regulations of Sweden or a Swedish court, such provisions shall be deemed several from the remainder of this Agreement and not affect the validity or enforceability of the remainder of this Agreement. In that case, such provisions shall be changed and interpreted to achieve the purposes of those provisions as much as possible within the extent of relevant laws or judgment of the court.

#### Survival

Clauses 4, 5 and 8 shall survive termination or expiration of this Agreement for any reason. All other rights and obligations of the parties under this Agreement shall expire upon termination of this Agreement, except that all payment obligations accrued hereunder prior to termination or expiration shall survive such termination.

#### Assignment

KTHAIS is hereby authorized to assign, sublicense, delegate or otherwise transfer any of its rights or obligations under this Agreement without the prior written consent of the other party provided that the assignee shall assume all rights and obligations under this Agreement.

The Participant or Attendee shall not assign, sublicense, delegate or otherwise transfer any of its rights or obligations.

#### Notices

All notices and other communications hereunder shall be in writing and shall be deemed to have been duly given when delivered in person (including by internationally recognized commercial delivery service), and on the day the notice is sent when sent by email with confirmation receipt, if the time of transmission is during recipient's business day, or if not on the next business day thereafter, in each case to the respective parties at the postal or email addresses provided by them in writing.

Either party may change its address by providing the other party with written notice of the change in accordance with this section.

#### Relationship of parties

The parties are independent contractors and will have no right to assume or create any obligation or responsibility on behalf of the other party. Neither party shall hold itself out as an agent of the other party. This Agreement will not be construed to create or imply any employment relationship, partnership, agency, joint venture or formal business entity of any kind.

#### Waiver

No delay or failure by either party to exercise any right or remedy under this Agreement will constitute a waiver of such right or remedy. All waivers must be in writing and signed by an authorized representative of the party waiving its rights. A waiver by any party of any breach or covenant shall not be construed as a waiver of any succeeding breach of any other covenant.

#### Entire agreement

This Agreement constitutes the entire agreement between the parties and supersedes all previous agreements, oral or written, with respect to the subject matter of this Agreement. The information and documents provided by the Participant or Attendee to KTHAIS, as requested by the latest in order to enter the Agreement, shall be also considered as part of this Agreement. This Agreement may not be amended without the written consent of the parties.

#### Headings

The headings of the articles and paragraphs contained in this Agreement are inserted for convenience and are not intended to be part of or to affect the interpretation of this Agreement.

#### Counterparts

This Agreement may be executed in counterparts or online, which taken together shall form one legal instrument.

#### No third party beneficiaries

This Agreement shall be binding upon and inure solely to the benefit of the parties hereto and their permitted assigns and nothing herein, express or implied, is intended to or shall confer upon any other person any legal or equitable right, benefit or remedy of any nature whatsoever under or by reason of this Agreement.
`;

export default function TermsAndConditionsPage() {
  const [textMask, setTextMask] = useState<string | undefined>(undefined);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 120px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("TERMS", canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => {
      setTextMask(dataUrl);
    });
  }, []);

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
              Terms and Conditions
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-serif max-w-2xl opacity-95">
              Our terms and conditions for participating in KTHAIS events and
              using our services.
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
              Terms and Conditions
            </span>
          </div>

          {/* 2 Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Markdown content={termsContent} />
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
                        Jurisdiction
                      </p>
                      <p className="text-muted-foreground">Stockholm, Sweden</p>
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
  );
}

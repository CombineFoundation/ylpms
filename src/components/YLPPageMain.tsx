"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroStats = [
  { value: "100+", label: "Youth Leaders" },
  { value: "1,200+", label: "Volunteers" },
  { value: "100+", label: "Universities" },
  { value: "10,000+", label: "Beneficiaries" },
];

const benefitCards = [
  {
    title: "Leadership Development",
    description: "Leadership is a skill, not a trait. Build it through real practice.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z"/></svg>
    ),
  },
  {
    title: "Project Management",
    description: "Learn planning, coordination and execution on live initiatives.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>
    ),
  },
  {
    title: "Resume & Portfolio",
    description: "Real projects and accomplishments that stand out to employers.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/></svg>
    ),
  },
  {
    title: "Time & Team Management",
    description: "Master deadlines, responsibility and people management.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
    ),
  },
  {
    title: "Nationwide Network",
    description: "Meet mentors, professionals and bright students across Pakistan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M2 21v-2a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v2"/><circle cx="18" cy="8" r="2.2"/><path d="M15.5 21v-1.6a3 3 0 0 1 3-3H19a3 3 0 0 1 3 3V21"/></svg>
    ),
  },
  {
    title: "Industry Exposure",
    description: "Understand organizational structure and career expectations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>
    ),
  },
  {
    title: "Public Speaking",
    description: "Communicate with confidence in meetings and presentations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/></svg>
    ),
  },
  {
    title: "Problem Solving",
    description: "Sharpen critical thinking to tackle real-world challenges.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18h6M10 22h4M15 8a6 6 0 0 0-8-5.6M6 8a6 6 0 0 1 4-5.6M8 8a4 4 0 0 0 8 0c0-2-2-3-2-6H10c0 3-2 4-2 6z"/></svg>
    ),
  },
];

const faqItems = [
  {
    question: "What is YLP 2.0?",
    answer: "YLP 2.0 is Pakistan&apos;s biggest youth leadership program by Combine Foundation, six-month journey helping university students build leadership, communication, project management, teamwork and professional skills through practical learning.",
  },
  {
    question: "Who can apply for YLP 2.0?",
    answer: "Any university student with Pakistani nationality can apply from any university, any academic discipline, and any gender.",
  },
  {
    question: "What is the duration of the program?",
    answer: "YLP 2.0 is a six-month leadership program consisting of workshops, mentoring, networking, community involvement and other leadership development opportunities.",
  },
  {
    question: "Is YLP 2.0 online or offline?",
    answer: "YLP 2.0 is a combination of physical and online events.",
  },
  {
    question: "Will I receive a certificate after completing the program?",
    answer: "Yes. Successful candidates are awarded a certificate by Combine Foundation, along with an experience letter and a recommendation letter.",
  },
  {
    question: "What makes YLP 2.0 different from other leadership programs?",
    answer: "YLP 2.0 is built around practical learning, students work on real projects instead of purely theoretical training.",
  },
  {
    question: "Is there any previous success in the Youth Leadership Program?",
    answer: "Yes. YLP 1.0 successfully engaged more than 60 Youth Leaders and over 300 volunteers from universities across Pakistan.",
  },
  {
    question: "How do I become part of YLP 2.0?",
    answer: "Apply through the official Combine Foundation application form. Visit the official website or social media pages for the latest updates and deadlines.",
  },
];

const galleryItems = [
  {
    src: "/assets/gallery/6.jpeg",
    alt: "Youth Leadership Program participants",
    caption: "Youth Leadership Program – Cohort Gathering",
    classes: "g-large",
  },
  {
    src: "/assets/gallery/4.svg",
    alt: "Youth leaders celebrating together",
    caption: "Youth Leaders Celebrating Teamwork & Impact",
  },
  {
    src: "/assets/gallery/2.jpg",
    alt: "Volunteer visit to Edhi Home",
    caption: "Volunteer Visit to Edhi Home Karachi",
    classes: "g-tall",
  },
  {
    src: "/assets/gallery/5.svg",
    alt: "Interactive classroom session",
    caption: "Interactive Learning Session with Students",
    classes: "g-wide",
  },
  {
    src: "/assets/gallery/3.jpg",
    alt: "Community outreach event",
    caption: "Community Outreach & Awareness Program",
    classes: "g-wide",
  },
  {
    src: "/assets/gallery/1.jpg",
    alt: "Skill workshop at NED",
    caption: "Skills workshop with students of NED",
  },
  {
    src: "/assets/gallery/7.jpeg",
    alt: "Leadership discussion",
    caption: "Leadership Discussion & Professional Development",
    classes: "g-wide",
  },
  {
    src: "/assets/gallery/8.jpeg",
    alt: "Students participating in youth activities",
    caption: "Empowering Students Through Education & Service",
    classes: "g-wide",
  },
];

export default function YLPPageMain() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <main>
        <header>
          <nav className="nav">
            <a href="#top" className="nav-logo">
              <Image src="/logo.png" alt="Combine Foundation logo" width={42} height={42} />
              Combine Foundation
            </a>
            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
              <a href="#about">About</a>
              <a href="#benefits">Benefits</a>
              <a href="#gallery">Gallery</a>
              <a href="#eligibility">Eligibility</a>
              <a href="#faq">FAQs</a>
            </div>
            <div className="nav-cta">
              <a
                className="text-sm font-semibold text-white hover:text-gray-200"
                href="/login"
              >
                Sign In
              </a>
              <a
                className="btn btn-primary"
                href="https://forms.gle/AGwTL41qL55nENdE8"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply Now
              </a>
              <button
                className="menu-toggle"
                id="menuToggle"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>
        </header>

        <section className="hero" id="top">
          <div className="container">
            <div className="hero-copy">
              <div className="hero-badge">
                🇵🇰 <b>Pakistan&apos;s Largest</b> Youth Leadership Program
              </div>
              <h1>
                What if in six months, your <em>future</em> changes forever?
              </h1>
              <p className="lead">
                YLP 2.0 by Combine Foundation is a free, six-month national
                leadership journey turning university students into confident
                leaders through real projects, mentorship, and community impact.
              </p>
              <div className="hero-actions">
                <a
                  className="btn btn-primary"
                  href="https://forms.gle/AGwTL41qL55nENdE8"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply for YLP 2.0 →
                </a>
                <a className="btn btn-outline" href="#about">
                  Learn More
                </a>
              </div>
              <div className="hero-stats">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="num">{stat.value}</div>
                    <div className="lbl">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="orbit-wrap">
                <div className="orbit-ring ring2"></div>
                <div className="orbit-ring ring1"></div>
                <div className="hero-logo-plate">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={150}
                    height={150}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div className="orbit-node" style={{ width: 64, height: 64, top: "6%", left: "8%" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6900" strokeWidth="1.8">
                    <path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1z" />
                  </svg>
                </div>
                <div className="orbit-node" style={{ width: 58, height: 58, bottom: "10%", left: "2%" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6900" strokeWidth="1.8">
                    <circle cx="9" cy="7" r="3" />
                    <path d="M2 21v-2a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v2" />
                    <circle cx="18" cy="8" r="2.2" />
                    <path d="M15.5 21v-1.6a3 3 0 0 1 3-3H19a3 3 0 0 1 3 3V21" />
                  </svg>
                </div>
                <div className="orbit-node" style={{ width: 60, height: 60, top: "4%", right: "4%" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6900" strokeWidth="1.8">
                    <path d="M22 2 11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </div>
                <div className="orbit-node" style={{ width: 58, height: 58, bottom: "6%", right: "6%" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#169AD7" strokeWidth="1.8">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="decor-wave">
            <svg viewBox="0 0 1440 90" width="100%" height="90" preserveAspectRatio="none">
              <path d="M0,40 C280,110 480,0 760,40 C1040,80 1200,10 1440,50 L1440,100 L0,100 Z" fill="#f9fafb" />
            </svg>
          </div>
        </section>

        <div className="strip" aria-hidden="true">
          <div className="strip-track">
            {[
              "Leadership",
              "Project Management",
              "Public Speaking",
              "Networking",
              "Community Service",
              "Teamwork",
              "Mentorship",
            ]
              .flatMap((item) => [item, item])
              .map((label, index) => (
                <div className="strip-item" key={`${label}-${index}`}>
                  <span className="dot"></span>
                  {label}
                </div>
              ))}
          </div>
        </div>

        <section className="about" id="about">
          <div className="container about-grid">
            <div className="about-image">
              <Image
                src="/assets/about.jpeg"
                alt="YLP 2.0 Post"
                width={760}
                height={520}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="about-copy reveal">
              <div className="eyebrow">About the program</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", marginBottom: "18px" }}>
                Pakistan&apos;s largest national youth empowerment initiative
              </h2>
              <p>
                Youth Leadership Program 2.0 is a national youth empowerment
                program by <strong>Combine Foundation</strong>, focused on
                leadership, innovation, employability, entrepreneurship,
                community service, and sustainable social impact.
              </p>
              <p>
                Over six months, selected students take part in <strong>workshops, mentor sessions, networking activities, community service, and real leadership projects</strong> collaborating with university students from every corner of Pakistan.
              </p>
              <div className="about-pills">
                {[
                  "6-month journey",
                  "Physical + online events",
                  "Certificate on completion",
                  "Open to all disciplines",
                ].map((text) => (
                  <div key={text} className="pill">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="why">
          <div className="container why-grid">
            <div className="why-copy reveal">
              <div className="eyebrow">Why this matters</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", marginBottom: "18px" }}>
                Why Pakistan needs more youth leaders
              </h2>
              <p>
                Pakistan has one of the largest youth populations in the world.
                These young people carry the energy, innovation and ideas to solve real problems but many never get the chance to build leadership skills beyond the classroom.
              </p>
              <p>
                YLP 2.0 exists to prepare Pakistan&apos;s youth to lead positive change in their universities, communities, workplaces and society at large.
              </p>
              <div className="tagline">&quot;Don&apos;t wait for change. Be the change.&quot;</div>
            </div>
            <div className="why-visual reveal">
              <h3>A movement, not just a program</h3>
              <p>
                YLP 2.0 connects students from universities across the country through a mix of physical and virtual activities making leadership accessible no matter your city.
              </p>
              <div className="why-stat-row">
                <div>
                  <span className="n">40+<br/></span>
                  <span className="l">Student body partnerships</span>
                </div>
                <div>
                  <span className="n">5M+<br/></span>
                  <span className="l">Digital reach</span>
                </div>
                <div>
                  <span className="n">100+<br/></span>
                  <span className="l">Workshops & webinars</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="journey">
          <div className="container">
            <div className="section-head center reveal">
              <div className="eyebrow" style={{ justifyContent: "center" }}>The leader&apos;s path</div>
              <h2>Your six-month leadership journey</h2>
              <p>One continuous path from your first workshop to walking away a confident, practiced leader.</p>
            </div>
            <div className="journey-track reveal">
              <svg className="line" viewBox="0 0 1200 12" preserveAspectRatio="none"><path d="M0 6 L1200 6" stroke="#e7eaee" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round"/></svg>
              <div className="journey-steps">
                {[
                  { number: 1, title: "Apply & Onboard", description: "Join as a Youth Leader or Volunteer" },
                  { number: 2, title: "Core Workshops", description: "Leadership & communication training" },
                  { number: 3, title: "Mentorship", description: "1:1 guidance from industry mentors" },
                  { number: 4, title: "Real Projects", description: "Lead community & campus initiatives" },
                  { number: 5, title: "Networking", description: "Connect nationwide with peers" },
                  { number: 6, title: "Graduate", description: "Certificate + recommendation letter" },
                ].map((step) => (
                  <div key={step.number} className="j-step">
                    <div className="j-dot">{step.number}</div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" id="benefits">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">What you gain</div>
              <h2>Skills that stay with you long after graduation</h2>
              <p>Most students spend years learning without ever practicing. YLP 2.0 closes that gap with hands-on experience.</p>
            </div>
            <div className="benefit-grid">
              {benefitCards.map((card) => (
                <div key={card.title} className="b-card reveal">
                  <div className="b-icon">{card.icon}</div>
                  <h4>{card.title}</h4>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="impact">
          <div className="container">
            <div className="section-head center reveal">
              <div className="eyebrow" style={{ justifyContent: "center" }}>The vision</div>
              <h2>Why we call it Pakistan&apos;s largest</h2>
              <p>YLP 2.0 is built to create nationwide impact. Here&apos;s the scale we&apos;re working toward.</p>
            </div>
            <div className="impact-grid">
              {[
                { value: "100+", label: "Youth Leaders" },
                { value: "1,200+", label: "Volunteers" },
                { value: "100+", label: "Universities" },
                { value: "40+", label: "Student Body Partnerships" },
                { value: "100+", label: "Workshops & Webinars" },
                { value: "10,000+", label: "Direct Beneficiaries" },
                { value: "5M+", label: "Digital Reach" },
                { value: "6", label: "Months of Impact" },
              ].map((item) => (
                <div key={item.label} className="i-card reveal">
                  <div className="num">{item.value}</div>
                  <div className="lbl">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="eligibility" id="eligibility">
          <div className="container elig-grid">
            <div className="reveal">
              <div className="eyebrow">Who can join</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", marginBottom: "24px" }}>
                Open to every Pakistani university student
              </h2>
              <div className="elig-list">
                {[
                  {
                    title: "Pakistani nationality",
                    description: "Any university student holding Pakistani nationality can apply.",
                  },
                  {
                    title: "Any university",
                    description: "Students from every university across Pakistan are welcome.",
                  },
                  {
                    title: "Any discipline",
                    description: "No restriction on major or field of study.",
                  },
                  {
                    title: "All genders",
                    description: "Both male and female students are equally encouraged to apply.",
                  },
                ].map((item) => (
                  <div key={item.title} className="elig-item">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="elig-panel reveal">
              <h3>It&apos;s not about being the &quot;best&quot; student.</h3>
              <p>
                It&apos;s about investing your time, passion, energy and dedication into making yourself and the lives of others better. If you believe leadership is about making a difference, not holding a position, this is your chance.
              </p>
              <a
                className="btn btn-primary"
                href="https://forms.gle/AGwTL41qL55nENdE8"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply for YLP 2.0 →
              </a>
            </div>
          </div>
        </section>

        <section className="legacy">
          <div className="container legacy-grid">
            <div className="reveal">
              <div className="eyebrow">Proven track record</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", marginBottom: "18px" }}>
                Built on the success of YLP 1.0
              </h2>
              <p style={{ color: "var(--gray)", fontSize: "1.05rem" }}>
                YLP 2.0 stands on a strong foundation. The first chapter of the Youth Leadership Program engaged students nationwide through webinars, campaigns, university collaborations and community events proving what young people can achieve when given the right opportunity.
              </p>
            </div>
            <div className="legacy-stats reveal">
              <div className="l-card">
                <div className="num">60+</div>
                <div className="lbl">Youth Leaders engaged</div>
              </div>
              <div className="l-card">
                <div className="num">4000+</div>
                <div className="lbl">Direct Beneficiaries</div>
              </div>
            </div>
          </div>
        </section>

        <section className="gallery" id="gallery">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">On the ground</div>
              <h2>Moments from YLP in action</h2>
              <p>Real workshops, real community service, real Youth Leaders. This is what six months of showing up looks like.</p>
            </div>
            <div className="gallery-grid">
              {galleryItems.map((item) => (
                <figure key={item.caption} className={`g-item reveal ${item.classes ?? ""}`}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    width={720}
                    height={520}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <figcaption>{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="events">
          <div className="container">
            <div className="section-head reveal">
              <div className="eyebrow">Recent activity</div>
              <h2>Webinars &amp; sessions run by our Youth Leaders</h2>
              <p>A sample of the workshops, webinars and partnerships Youth Leaders have organized under YLP.</p>
            </div>
            <div className="events-grid">
              {[
                {
                  src: "/assets/gallery/event-webinar-mdcat.jpg",
                  alt: "Webinar poster: Beyond the MDCAT, Your Academic Success and Well-being, organized by Team STEMINISTS under YLP",
                },
                {
                  src: "/assets/gallery/event-guest-speaker.jpg",
                  alt: "Guest speaker session poster featuring Mr. M Umar on building practical skills before graduation",
                },
                {
                  src: "/assets/gallery/event-future-careers.jpg",
                  alt: "Future Careers in a Changing World panel talk poster with guest industry speakers",
                },
                {
                  src: "/assets/gallery/event-partnership.jpg",
                  alt: "Student Body Partnership announcement poster between Combine Foundation and Quants Society",
                },
              ].map((item) => (
                <figure key={item.src} className="e-item reveal">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    width={720}
                    height={520}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="container">
            <div className="section-head center reveal">
              <div className="eyebrow" style={{ justifyContent: "center" }}>Got questions?</div>
              <h2>Frequently asked questions</h2>
            </div>
            <div className="faq-wrap reveal">
              {faqItems.map((item, index) => {
                const open = index === openFaqIndex;
                return (
                  <div key={item.question} className={`faq-item${open ? " open" : ""}`}>
                    <button className="faq-q" type="button" onClick={() => setOpenFaqIndex(open ? -1 : index)}>
                      {item.question}
                      <span className="faq-icon"></span>
                    </button>
                    <div className="faq-a" style={{ maxHeight: open ? "260px" : "0" }}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cta-final">
          <div className="container reveal">
            <h2>Don&apos;t wait for change. Be the change.</h2>
            <p>Join Pakistan&apos;s largest youth leadership program and become part of a generation that doesn&apos;t wait for change. Let&apos;s create it.</p>
            <a className="btn btn-final" href="https://forms.gle/AGwTL41qL55nENdE8" target="_blank" rel="noopener noreferrer">
              Apply for YLP 2.0 →
            </a>
          </div>
        </section>

        <footer>
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="footer-logo">
                  <Image src="/logo.png" alt="Combine Foundation logo" width={42} height={42} />
                  <span>Combine Foundation</span>
                </div>
                <p className="desc">Empowering Pakistan&apos;s youth through leadership, innovation and sustainable community impact in one program at a time.</p>
              </div>
              <div>
                <h5>Explore</h5>
                <ul>
                  <li><a href="#about">About YLP 2.0</a></li>
                  <li><a href="#benefits">Benefits</a></li>
                  <li><a href="#eligibility">Eligibility</a></li>
                  <li><a href="#faq">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h5>Get Involved</h5>
                <ul>
                  <li><a href="https://forms.gle/AGwTL41qL55nENdE8" target="_blank" rel="noopener noreferrer">Apply as Youth Leader</a></li>
                  <li><a href="#top">Back to top</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2026 Combine Foundation. All rights reserved.</span>
              <span>Youth Leadership Program (YLP) 2.0</span>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        :root{
          --bg:#f9fafb;
          --white:#ffffff;
          --primary:#169AD7;
          --primary-dark:#0f7bae;
          --primary-tint:#e6f4fb;
          --secondary:#FF6900;
          --secondary-dark:#e05800;
          --secondary-tint:#fff0e3;
          --navy:#111827;
          --gray:#5b6472;
          --gray-light:#8a92a0;
          --border:#e7eaee;
          --radius:18px;
          --shadow:0 8px 30px -12px rgba(17,24,39,0.15);
          --ff-display:'Sora', sans-serif;
          --ff-body:'Inter', sans-serif;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @media (prefers-reduced-motion: reduce){ html{scroll-behavior:auto;} *{animation-duration:0.001ms !important; transition-duration:0.001ms !important;} }
        body{font-family:var(--ff-body);background:var(--bg);color:var(--navy);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
        img{max-width:100%;display:block;}
        a{color:inherit;text-decoration:none;}
        h1,h2,h3,h4{font-family:var(--ff-display);line-height:1.15;letter-spacing:-0.01em;}
        .container{max-width:1180px;margin:0 auto;padding:0 24px;}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--ff-body);font-weight:700;font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--secondary);margin-bottom:14px;}
        .eyebrow::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--secondary);display:inline-block;}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:16px 32px;border-radius:100px;font-family:var(--ff-body);font-weight:700;font-size:1rem;cursor:pointer;border:2px solid transparent;transition:transform .25s ease, box-shadow .25s ease, background .25s ease;white-space:nowrap;}
        .btn:focus-visible{outline:3px solid var(--navy);outline-offset:3px;}
        .btn-primary{background:var(--primary);color:#fff;box-shadow:0 10px 24px -8px rgba(255,105,0,0.55);}
        .btn-primary:hover{background:var(--secondary-dark);transform:translateY(-2px);box-shadow:0 14px 28px -8px rgba(255,105,0,0.6);}
        .btn-outline{background:transparent;border-color:rgba(255,255,255,0.55);color:#fff;}
        .btn-outline:hover{background:rgba(255,255,255,0.12);transform:translateY(-2px);}
        .btn-outline-navy{background:transparent;border-color:var(--navy);color:var(--navy);}
        .btn-outline-navy:hover{background:var(--navy);color:#fff;}
        header{position:sticky;top:0;z-index:100;background:rgba(249,250,251,0.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);border-top:3px solid var(--secondary);}
        .nav{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;max-width:1180px;margin:0 auto;}
        .nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--ff-display);font-weight:800;font-size:1.05rem;color:var(--navy);}
        .nav-logo img{height:38px;width:auto;border-radius:6px;}
        .nav-links{display:flex;gap:32px;align-items:center;}
        .nav-links a{font-weight:600;font-size:0.95rem;color:var(--gray);transition:color .2s;}
        .nav-links a:hover{color:var(--secondary);}
        .nav-cta{display:flex;align-items:center;gap:18px;}
        .nav-cta .btn{padding:11px 22px;font-size:0.9rem;}
        .menu-toggle{display:none;background:none;border:none;cursor:pointer;padding:6px;}
        .menu-toggle span{display:block;width:24px;height:2.5px;background:var(--navy);margin:5px 0;border-radius:2px;}
        .nav-links.open{display:flex;position:absolute;top:64px;left:0;right:0;background:#fff;flex-direction:column;padding:20px 24px;gap:18px;border-bottom:1px solid #e7eaee;}
        .hero{position:relative;padding:96px 0 130px;background:linear-gradient(180deg,#e05800 0%, #FF6900 55%, #e05800 100%);color:#fff;overflow:hidden;}
        .hero .container{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr 0.9fr;gap:56px;align-items:center;}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.22);padding:8px 16px;border-radius:100px;font-size:0.82rem;font-weight:600;margin-bottom:24px;color:#dceffb;}
        .hero-badge b{color:var(--navy);}
        .hero h1{font-size:clamp(2.3rem, 4.4vw, 3.6rem);font-weight:800;margin-bottom:22px;}
        .hero h1 em{font-style:normal;color:var(--navy);}
        .hero p.lead{font-size:1.15rem;color:#c7d8e3;max-width:520px;margin-bottom:34px;}
        .hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px;}
        .hero-stats{display:flex;gap:34px;flex-wrap:wrap;}
        .hero-stats div{min-width:100px;}
        .hero-stats .num{font-family:var(--ff-display);font-weight:800;font-size:1.7rem;color:#fff;}
        .hero-stats .lbl{font-size:0.82rem;color:#9fb6c4;margin-top:2px;}
        .hero-visual{position: relative;height: 440px;}
        @media (max-width: 768px){.hero-visual{display: none;}}
        .orbit-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}
        .hero-logo-plate{width:230px;height:230px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 60px -20px rgba(0,0,0,0.5);z-index:3;}
        .hero-logo-plate img{width:150px;}
        .orbit-ring{position:absolute;border-radius:50%;border:1.5px dashed rgba(255,255,255,0.22);}
        .ring1{width:300px;height:300px;}
        .ring2{width:400px;height:400px;}
        .orbit-node{position:absolute;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,0,0,0.35);}
        .hero-blob{position:absolute;filter:blur(0px);opacity:0.9;}
        .hero .decor-wave{position:absolute;left:0;right:0;bottom:-2px;line-height:0;z-index:1;}
        .strip{background:var(--navy);padding:16px 0;overflow:hidden;}
        .strip-track{display:flex;gap:56px;white-space:nowrap;animation:marquee 26s linear infinite;width:max-content;}
        @keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        .strip-item{color:#c9d3dd;font-family:var(--ff-display);font-weight:700;font-size:0.95rem;display:flex;align-items:center;gap:10px;}
        .strip-item span.dot{width:5px;height:5px;background:var(--secondary);border-radius:50%;}
        section{padding:100px 0;}
        .section-head{max-width:680px;margin-bottom:56px;}
        .section-head.center{margin-left:auto;margin-right:auto;text-align:center;}
        .section-head h2{font-size:clamp(1.8rem,3vw,2.5rem);font-weight:800;color:var(--navy);}
        .section-head p{color:var(--gray);font-size:1.05rem;margin-top:14px;}
        .about{background:var(--white);}
        .about-grid{display:grid;grid-template-columns:0.85fr 1.15fr;gap:64px;align-items:center;}
        .about-image{border:2px solid var(--secondary);border-radius:20px;overflow:hidden;display:inline-block;}
        .about-image img{display:block;width:100%;height:auto;border-radius:inherit;}
        .about-copy p{color:var(--gray);font-size:1.05rem;margin-bottom:18px;}
        .about-copy strong{color:var(--navy);}
        .about-pills{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:26px;}
        .pill{display:flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0px 16px;background:var(--white);border:1px solid var(--border);border-radius:100px;font-size:0.9rem;font-weight:600;color:var(--navy);text-align:center;}
        .pill svg{width:16px;height:16px;stroke:var(--secondary);flex-shrink:0;}
        @media (max-width:576px){.about-pills{display:none;}}
        .why{background:var(--bg);}
        .why-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
        .why-visual{background:var(--secondary);border-radius:24px;padding:48px;color:#fff;position:relative;overflow:hidden;}
        .why-visual h3{font-family:var(--ff-display);font-size:1.5rem;margin-bottom:18px;}
        .why-visual p{color:#b9c3cf;}
        .why-stat-row{display:flex;gap:26px;margin-top:32px;flex-wrap:wrap;}
        .why-stat-row div{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 20px;flex:1;min-width:120px;}
        .why-stat-row .n{font-family:var(--ff-display);font-weight:800;font-size:1.4rem;;}
        .why-stat-row .l{font-size:0.78rem;color:#9fb0bd;margin-top:2px;}
        .why-copy p{color:var(--gray);font-size:1.05rem;margin-bottom:16px;}
        .why-copy .tagline{margin-top:20px;font-family:var(--ff-display);font-weight:700;font-size:1.15rem;color:var(--navy);border-left:4px solid var(--secondary);padding-left:16px;}
        .journey{background:var(--white);position:relative;}
        .journey-path{position:relative;padding-top:20px;}
        .journey-track{position:relative;}
        .journey-track svg.line{position:absolute;top:56px;left:0;width:100%;height:12px;z-index:0;}
        .journey-steps{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;position:relative;z-index:1;}
        .j-step{display:flex;flex-direction:column;align-items:center;text-align:center;}
        .j-dot{width:56px;height:56px;border-radius:50%;background:var(--white);border:3px solid var(--secondary);display:flex;align-items:center;justify-content:center;font-family:var(--ff-display);font-weight:800;color:var(--secondary);margin-bottom:16px;box-shadow:0 8px 18px -8px rgba(255,105,0,0.5);}
        .j-step:nth-child(even) .j-dot{border-color:var(--primary);color:var(--primary);box-shadow:0 8px 18px -8px rgba(22,154,215,0.5);}
        .j-step h4{font-size:0.95rem;margin-bottom:6px;}
        .j-step p{font-size:0.82rem;color:var(--gray-light);}
        .benefits{background:var(--bg);}
        .benefit-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
        .b-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:28px 24px;transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease;}
        .b-card:hover{transform:translateY(-6px);box-shadow:var(--shadow);border-color:transparent;}
        .b-icon{width:52px;height:52px;border-radius:14px;background:var(--secondary-tint);display:flex;align-items:center;justify-content:center;margin-bottom:18px;}
        .b-card:nth-child(3n+2) .b-icon{background:var(--primary-tint);}
        .b-icon svg{width:26px;height:26px;stroke:var(--secondary);fill:none;stroke-width:1.8;}
        .b-card:nth-child(3n+2) .b-icon svg{stroke:var(--primary);}
        .b-card h4{font-size:1.05rem;margin-bottom:8px;color:var(--navy);}
        .b-card p{font-size:0.9rem;color:var(--gray);}
        .impact{background:linear-gradient(135deg,#0d3a52,#0a2536);color:#fff;position:relative;overflow:hidden;}
        .impact .section-head p{color:#b9c3cf;}
        .impact .section-head h2{color:#fff;}
        .impact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
        .i-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:30px 0px;text-align:center;}
        .i-card .num{font-family:var(--ff-display);font-weight:800;font-size:2.1rem;color:var(--secondary);}
        .i-card .lbl{margin-top:8px;font-size:0.9rem;color:#c7d3dd;}
        .eligibility{background:var(--white);}
        .elig-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
        .elig-list{display:grid;gap:16px;}
        .elig-item{display:flex;gap:16px;align-items:flex-start;background:var(--bg);border:1px solid var(--border);padding:18px 20px;border-radius:14px;}
        .elig-item svg{width:22px;height:22px;stroke:var(--primary);flex-shrink:0;margin-top:2px;}
        .elig-item h4{font-size:1rem;margin-bottom:4px;}
        .elig-item p{font-size:0.87rem;color:var(--gray);}
        .elig-panel{background:var(--secondary-tint);border-radius:24px;padding:40px;}
        .elig-panel h3{font-size:1.3rem;margin-bottom:14px;}
        .elig-panel p{color:var(--gray);margin-bottom:22px;}
        .legacy{background:var(--bg);}
        .legacy-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
        .legacy-stats{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        .l-card{background:var(--white);border-radius:18px;padding:28px;border:1px solid var(--border);text-align:center;}
        .l-card .num{font-family:var(--ff-display);font-weight:800;font-size:2.2rem;color:var(--primary);}
        .l-card .lbl{font-size:0.85rem;color:var(--gray);margin-top:6px;}
        .gallery{background: var(--white);padding: 80px 0;}
        .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:220px;gap:20px;grid-auto-flow:dense;}
        .g-item{position:relative;overflow:hidden;border-radius:18px;box-shadow:0 10px 25px rgba(0,0,0,.12);}
        .g-item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s ease;}
        .g-item:hover img{transform:scale(1.08);}
        .g-item::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,.15),transparent);}
        .g-item figcaption{position:absolute;left:18px;right:18px;bottom:18px;color:#fff;font-size:15px;font-weight:600;line-height:1.4;z-index:2;}
        .g-large{grid-column:span 2;grid-row:span 2;}
        .g-tall{grid-row:span 2;}
        .g-wide{grid-column:span 2;}
        .g-full{grid-column:1/-1;}
        @media (max-width:992px){.gallery-grid{grid-template-columns:repeat(2,1fr);}.g-large{grid-column:1/-1;grid-row:span 2;}.g-wide,.g-full{grid-column:1/-1;}.g-tall{grid-row:span 2;}}
        @media (max-width:576px){.gallery-grid{grid-template-columns:1fr;grid-auto-rows:250px;}.g-large,.g-wide,.g-tall,.g-full{grid-column:auto;grid-row:auto;}}
        .events{background:var(--bg);}
        .events-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
        .e-item{border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--white);box-shadow:0 6px 18px -10px rgba(17,24,39,0.15);transition:transform .25s ease;}
        .e-item:hover{transform:translateY(-6px);}
        .e-item img{width:100%;height:100%;object-fit:cover;aspect-ratio:3/4;display:block;}
        .faq{background:var(--white);}
        .faq-wrap{max-width:820px;margin:0 auto;}
        .faq-item{border-bottom:1px solid var(--border);}
        .faq-q{width:100%;text-align:left;background:none;border:none;padding:22px 4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:20px;font-family:var(--ff-body);font-weight:700;font-size:1.02rem;color:var(--navy);}
        .faq-q:focus-visible{outline:3px solid var(--primary);outline-offset:2px;}
        .faq-icon{width:26px;height:26px;border-radius:50%;background:var(--primary-tint);flex-shrink:0;position:relative;}
        .faq-icon::before,.faq-icon::after{content:"";position:absolute;background:var(--primary);border-radius:2px;}
        .faq-icon::before{width:10px;height:2px;top:50%;left:50%;transform:translate(-50%,-50%);}
        .faq-icon::after{width:2px;height:10px;top:50%;left:50%;transform:translate(-50%,-50%);transition:opacity .2s;}
        .faq-item.open .faq-icon::after{opacity:0;}
        .faq-item.open .faq-icon{background:var(--secondary-tint);}
        .faq-item.open .faq-icon::before{background:var(--secondary);}
        .faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease;}
        .faq-a p{padding:0 4px 22px;color:var(--gray);font-size:0.95rem;max-width:700px;}
        .cta-final{background:linear-gradient(120deg,var(--secondary) 0%, #ff8a3d 45%, #111827 130%);color:#fff;text-align:center;position:relative;overflow:hidden;}
        .cta-final h2{font-size:clamp(1.9rem,3.6vw,2.8rem);margin-bottom:16px;}
        .cta-final p{color:#ffe6d1;max-width:560px;margin:0 auto 34px;font-size:1.08rem;}
        .cta-final .btn-final{padding:18px 40px;font-size:1.05rem;background:#fff;color:var(--navy);box-shadow:0 10px 24px -8px rgba(0,0,0,0.35);}
        .cta-final .btn-final:hover{background:var(--navy);color:#fff;transform:translateY(-2px);}
        footer{background:var(--navy);color:#c6cdd6;padding:64px 0 28px;}
        .footer-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:48px;margin-bottom:48px;}
        .footer-logo{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
        .footer-logo img{height:40px;background:#fff;border-radius:8px;padding:4px;}
        .footer-logo span{font-family:var(--ff-display);font-weight:800;color:#fff;font-size:1.1rem;}
        footer p.desc{font-size:0.9rem;color:#9aa4b0;max-width:340px;}
        footer h5{color:#fff;font-family:var(--ff-display);font-size:0.95rem;margin-bottom:18px;}
        footer ul{list-style:none;display:grid;gap:12px;}
        footer ul a{font-size:0.9rem;color:#a9b2bd;transition:color .2s;}
        footer ul a:hover{color:var(--secondary);}
        .footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:0.82rem;color:#7f8894;}
        .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease, transform .7s ease;}
        .reveal.in{opacity:1;transform:translateY(0);}
        @media (max-width:980px){.nav-links{display:none;}.menu-toggle{display:block;}.hero .container{grid-template-columns:1fr;}.hero-visual{height:320px;order:-1;}.about-grid,.why-grid,.elig-grid,.legacy-grid{grid-template-columns:1fr;}.benefit-grid{grid-template-columns:repeat(2,1fr);}.impact-grid{grid-template-columns:repeat(2,1fr);}.journey-steps{grid-template-columns:repeat(3,1fr);row-gap:36px;}.journey-track svg.line{display:none;}.footer-grid{grid-template-columns:1fr;}.gallery-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto;}.g-tall{grid-row:auto;}.g-item img{min-height:200px;}.events-grid{grid-template-columns:repeat(2,1fr);}}
        @media (max-width:560px){section{padding:70px 0;}.benefit-grid{grid-template-columns:1fr;}.impact-grid{grid-template-columns:1fr 1fr;}.journey-steps{grid-template-columns:1fr 1fr;}.hero{padding:70px 0 100px;}.hero-stats{gap:22px;}.gallery-grid{grid-template-columns:1fr;}.events-grid{grid-template-columns:1fr 1fr;}}
      `}</style>
    </>
  );
}

import { CERTIFICATE_LOGO, CERTIFICATE_SIGNATORY } from "@/config/certificate";
import { timestampToDate } from "@/utils/user-status";
import type { ApiCertificate } from "./certificate.types";

/**
 * The printable certificate (A4 landscape): Combine Foundation's orange / navy
 * bands, logo, gold rosette and seal, and the Head of RO's signature. Opened in
 * its own window and printed, where it can be saved as a PDF.
 */

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const PKT = "Asia/Karachi";

function longDate(value: ApiCertificate["eventDate"]) {
  const date = timestampToDate(value);
  return date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: PKT }) : "";
}

function ordinal(day: number) {
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  return `${day}${suffix}`;
}

/** "Awarded this 6th day of October, 2026" (Pakistan time). */
function awardedLine(value: ApiCertificate["issuedAt"]) {
  const date = timestampToDate(value) ?? new Date();
  const part = (type: "day" | "month" | "year") =>
    new Intl.DateTimeFormat("en-GB", { [type]: type === "month" ? "long" : "numeric", timeZone: PKT }).format(date);
  return `Awarded this ${ordinal(Number(part("day")))} day of ${part("month")}, ${part("year")}`;
}

function bodyText(certificate: ApiCertificate) {
  const event = `<strong>${escapeHtml(certificate.eventTitle)}</strong>`;
  const date = longDate(certificate.eventDate);
  const where = [certificate.eventLocation && `Held In ${escapeHtml(certificate.eventLocation)}`, date && `On ${escapeHtml(date)}`]
    .filter(Boolean)
    .join(" ");
  const held = where ? `, ${where}` : "";
  if (certificate.kind === "organizer") {
    const as = certificate.recipientRole === "youth-leader" ? "As A Youth Leader Of" : "As Part Of";
    return `For Successfully Leading And Organizing ${event}${held}, ${as} The Combine Foundation Youth Leadership Program, Demonstrating Initiative, Teamwork And Commitment To Serving The Community.`;
  }
  return `For Actively Participating In ${event}${held}, As Part Of The Combine Foundation Youth Leadership Program, Demonstrating Commitment, Teamwork And Service To The Community.`;
}

/** A gold "starburst" edge: `points` teeth between radius `outer` and `inner`, centred on (c, c). */
function burst(c: number, outer: number, inner: number, points: number) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(c + r * Math.cos(angle)).toFixed(2)},${(c + r * Math.sin(angle)).toFixed(2)}`);
  }
  return coords.join(" ");
}

const GOLD_DEFS = (id: string) => `
  <defs>
    <linearGradient id="${id}-edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6d77a"/><stop offset=".45" stop-color="#d4a63a"/><stop offset=".7" stop-color="#f3d27b"/><stop offset="1" stop-color="#a87a22"/>
    </linearGradient>
    <radialGradient id="${id}-face" cx=".38" cy=".32" r=".75">
      <stop offset="0" stop-color="#fbeaa6"/><stop offset=".55" stop-color="#e2b84f"/><stop offset="1" stop-color="#b8892c"/>
    </radialGradient>
  </defs>`;

/** The rosette with navy ribbons (top-left). */
function rosetteSvg() {
  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${GOLD_DEFS("ros")}
  <polygon points="58,150 18,282 50,262 74,292 104,170" fill="#c99a34"/>
  <polygon points="64,152 30,268 52,254 72,276 98,170" fill="#13284f"/>
  <polygon points="142,150 182,282 150,262 126,292 96,170" fill="#c99a34"/>
  <polygon points="136,152 170,268 148,254 128,276 102,170" fill="#13284f"/>
  <polygon points="${burst(100, 98, 86, 30)}" transform="translate(0,0)" fill="url(#ros-edge)"/>
  <circle cx="100" cy="100" r="78" fill="url(#ros-face)" stroke="#a87a22" stroke-width="2"/>
  <circle cx="100" cy="100" r="70" fill="none" stroke="#fff3c4" stroke-width="1.5" stroke-dasharray="1.5 3" opacity=".8"/>
  <circle cx="100" cy="100" r="62" fill="url(#ros-face)" stroke="#c99a34" stroke-width="1"/>
</svg>`;
}

/** The round gold seal beside the signature. */
function sealSvg() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${GOLD_DEFS("seal")}
  <polygon points="${burst(100, 99, 90, 40)}" fill="url(#seal-edge)"/>
  <circle cx="100" cy="100" r="84" fill="url(#seal-face)" stroke="#a87a22" stroke-width="2"/>
  <circle cx="100" cy="100" r="77" fill="none" stroke="#fff3c4" stroke-width="1.5" stroke-dasharray="1.5 3" opacity=".8"/>
  <circle cx="100" cy="100" r="70" fill="url(#seal-face)" stroke="#c99a34" stroke-width="1.2"/>
</svg>`;
}

/**
 * Standalone printable page for one certificate (print → "Save as PDF").
 * `assetBase` is the site origin: the page is opened from a blob: URL, so
 * images need absolute addresses.
 */
export function certificateHtml(certificate: ApiCertificate, assetBase = "") {
  const kindLine = certificate.kind === "organizer" ? "OF LEADERSHIP" : "OF PARTICIPATION";
  const asset = (path: string) => `${assetBase}${path}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(certificate.certificateNumber)} · ${escapeHtml(certificate.recipientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&family=Tinos:wght@400;700&display=swap" rel="stylesheet" />
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; background: #e5e7eb; }
  .page { position: relative; width: 297mm; height: 210mm; margin: 0 auto; background: #fff; overflow: hidden;
    font-family: Tinos, "Times New Roman", Times, serif; color: #1f2a3a; }
  .band { position: absolute; top: 0; }
  .band.left { left: 0; width: 36.8%; height: 16.5mm; background: #e25600; clip-path: polygon(0 0, 100% 0, 93.8% 100%, 0 100%); }
  .band.mid { left: 36.75%; width: 26.5%; height: 21mm; background: #174a82; clip-path: polygon(0 0, 100% 0, 89.6% 100%, 10.4% 100%); }
  .band.right { right: 0; width: 37%; height: 16.5mm; background: #e25600; clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%); }
  .bars { position: absolute; left: 0; right: 0; bottom: 0; height: 3.3mm; display: flex; gap: 1.25%; }
  .bars span { flex: 1; }
  .number { position: absolute; top: 20mm; left: 5.3mm; font-size: 3.6mm; color: #1f2a3a; }
  .rosette { position: absolute; top: 37mm; left: 13mm; width: 33mm; }
  .content { position: absolute; inset: 24mm 30mm 8mm; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .logo { height: 20mm; }
  .title { margin: 4mm 0 0; font-size: 22mm; line-height: 1; font-weight: 700; letter-spacing: 1.4mm; color: #e25600; }
  .kind { margin-top: 2.5mm; font-size: 7.5mm; letter-spacing: 3.4mm; color: #2d3748; }
  .presented { margin-top: 5mm; font-size: 6.4mm; font-weight: 700; }
  .name { margin-top: 3mm; font-size: 12.5mm; line-height: 1.1; font-weight: 700; text-transform: uppercase; letter-spacing: .2mm; }
  .rule { width: 190mm; height: .45mm; background: #1f2a3a; margin-top: 2.5mm; }
  .body { margin-top: 4mm; max-width: 215mm; font-size: 4.4mm; line-height: 1.7; color: #1f2a3a; }
  .awarded { margin-top: 4mm; font-size: 5.8mm; font-weight: 700; }
  .sign { margin-top: 3mm; display: flex; flex-direction: column; align-items: center; width: 68mm; }
  .sign img { height: 17mm; margin-bottom: -1mm; }
  .sign .line { width: 100%; height: .5mm; background: #1f2a3a; }
  .sign .who { margin-top: 3mm; font-family: Montserrat, Arial, sans-serif; font-weight: 600; font-size: 4.4mm; letter-spacing: .5mm; text-transform: uppercase; color: #1f2a3a; }
  .sign .role { margin-top: 1.2mm; font-family: Montserrat, Arial, sans-serif; font-weight: 500; font-size: 3.7mm; color: #374151; }
  .seal { position: absolute; bottom: 17mm; right: 60mm; width: 34mm; }
  .rosette svg, .seal svg { display: block; width: 100%; height: auto; }
  @media print { html, body { background: #fff; } .page { margin: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="band left"></div><div class="band mid"></div><div class="band right"></div>
  <div class="number">${escapeHtml(certificate.certificateNumber)}</div>
  <div class="rosette">${rosetteSvg()}</div>
  <div class="content">
    <img class="logo" src="${asset(CERTIFICATE_LOGO)}" alt="Combine Foundation" />
    <div class="title">CERTIFICATE</div>
    <div class="kind">${kindLine}</div>
    <div class="presented">This Is Proudly Presented To</div>
    <div class="name">${escapeHtml(certificate.recipientName)}</div>
    <div class="rule"></div>
    <div class="body">${bodyText(certificate)}</div>
    <div class="awarded">${awardedLine(certificate.issuedAt)}</div>
    <div class="sign">
      <img src="${asset(CERTIFICATE_SIGNATORY.signatureImage)}" alt="" />
      <div class="line"></div>
      <div class="who">${escapeHtml(CERTIFICATE_SIGNATORY.name)}</div>
      <div class="role">${escapeHtml(CERTIFICATE_SIGNATORY.title)}</div>
    </div>
  </div>
  <div class="seal">${sealSvg()}</div>
  <div class="bars"><span style="background:#e25600"></span><span style="background:#174a82"></span><span style="background:#2196d3"></span><span style="background:#f5ad1b"></span></div>
</div>
<script>
  // Print once the logo, signature and fonts have loaded.
  window.onload = function () {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { window.focus(); window.print(); });
  };
</script>
</body>
</html>`;
}

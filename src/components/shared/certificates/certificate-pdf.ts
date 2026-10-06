"use client";

import { certificateHtml } from "./certificate-template";
import type { ApiCertificate } from "./certificate.types";

/** Sharp enough to print, small enough to share (A4 at ~3× screen resolution). */
const PIXEL_RATIO = 3;
const LOAD_TIMEOUT_MS = 15_000;

/**
 * Saves a certificate as a real A4 landscape PDF file — same design as the
 * printable page, rendered in a hidden frame, captured and placed on the page.
 * Works on phones, where the print dialog is awkward or blocked.
 */
export async function downloadCertificatePdf(certificate: ApiCertificate): Promise<void> {
  const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  // Off-screen but laid out at full A4 size, so it renders exactly like the print page.
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1200px;height:900px;border:0;";
  document.body.appendChild(frame);

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("The certificate took too long to load. Please try again.")), LOAD_TIMEOUT_MS);
      frame.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      frame.srcdoc = certificateHtml(certificate, window.location.origin, { autoPrint: false });
    });

    const doc = frame.contentDocument!;
    await doc.fonts?.ready;
    // Wait for the logo and signature images.
    await Promise.all(
      [...doc.images].map((image) =>
        image.complete ? Promise.resolve() : new Promise((resolve) => (image.onload = image.onerror = resolve))
      )
    );

    const page = doc.querySelector<HTMLElement>(".page");
    if (!page) throw new Error("Couldn't prepare the certificate.");
    const png = await toPng(page, { pixelRatio: PIXEL_RATIO, backgroundColor: "#ffffff", cacheBust: true });

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.addImage(png, "PNG", 0, 0, 297, 210);
    pdf.setProperties({ title: `${certificate.title} · ${certificate.recipientName}`, author: "Combine Foundation" });
    pdf.save(`${certificate.certificateNumber.replace(/[^\w-]+/g, "-")}-${certificate.recipientName.replace(/[^\w-]+/g, "-")}.pdf`);
  } finally {
    frame.remove();
  }
}

/** A YLP application from the public landing page form (`applications` collection). */
export interface Application {
  id: string;
  /** Shown to the applicant, e.g. "YLP-7K3QX9". Same as the doc id. */
  referenceNumber: string;
  name: string;
  /** Lower-cased; one application per email. */
  email: string;
  /** Pakistani mobile, normalised to 03XXXXXXXXX. */
  contact: string;
  status: "new";
  source: "landing-page";
  createdAt: Date;
  updatedAt: Date;
}

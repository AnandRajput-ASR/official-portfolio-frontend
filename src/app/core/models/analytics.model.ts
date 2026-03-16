export interface Analytics {
  pageViews: number;
  resumeDownloads: number;
  contactFormViews: number;
  contactFormSubmissions: number;
  blogPostViews: number;
  projectLinkClicks: number;
  socialLinkClicks: number;
  projectClicks: Record<string, number>;
  lastReset: string;
}

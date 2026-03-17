import { Injectable, signal, effect } from '@angular/core';

export type Lang = 'en' | 'hi';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.work': 'Work',
    'nav.sideProjects': 'Side Projects',
    'nav.certs': 'Certifications',
    'nav.reviews': 'Reviews',
    'nav.writing': 'Writing',
    'nav.hire': 'Hire Me',
    'nav.resume': '↓ Resume',
    // Sections
    'section.about': '// About Me',
    'section.skills': '// Core Skills',
    'section.work': '// Professional Work',
    'section.personal': '// Personal & Freelance',
    'section.certs': '// Certifications',
    'section.experience': '// Career',
    'section.testimonials': '// Kind Words',
    'section.blog': '// Writing',
    'section.freelance': '// Open to Freelance',
    'section.contact': '// Contact',
    // Headings
    'heading.skills': 'What I Bring to Your Project',
    'heading.work': 'Work Experience',
    'heading.work.sub': 'Enterprise projects delivered across companies — click a company to explore its projects.',
    'heading.sideProjects': 'Side Projects',
    'heading.sideProjects.sub': 'Hobby builds, freelance work, and open-source contributions — things I make because I enjoy building.',
    'heading.certs': 'Certified & Verified',
    'heading.certs.sub': 'Industry certifications earned while actively delivering production systems.',
    'heading.experience': 'Experience & Education',
    'heading.testimonials': 'What People Say',
    'heading.blog': 'Technical Articles',
    'heading.blog.sub': "Sharing what I've learned across 5+ years building Angular and cloud solutions.",
    // Buttons & labels
    'btn.viewProject': 'View Project →',
    'btn.verifyCredly': 'Verify on Credly',
    'btn.sendMessage': 'Send Message →',
    'btn.downloadResume': '↓ Download PDF',
    'btn.readArticle': 'Read Article →',
    'btn.shareTestimonial': '✦ Share Your Experience Working With Me',
    'btn.cancelTestimonial': '✕ Cancel',
    'btn.submitTestimonial': 'Submit for Review →',
    'btn.liveDemo': '↗ Live Demo',
    'btn.back': '← Back to Portfolio',
    // Contact form
    'form.name': 'Your Name',
    'form.email': 'Email',
    'form.message': 'Message',
    'form.yourName': 'Jane Smith',
    'form.yourEmail': 'jane@company.com',
    'form.yourMessage': "Hi Anand, I have a project I'd like to discuss...",
    // Testimonial form
    'testi.name': 'Your Name *',
    'testi.role': 'Role / Title',
    'testi.company': 'Company',
    'testi.email': 'Your Email (optional)',
    'testi.emailPlaceholder': 'jane@company.com',
    'testi.quote': 'Your Testimonial *',
    'testi.quotePlaceholder': 'Describe your experience working with Anand...',
    'testi.rating': 'Rating',
    'testi.photo': 'Your Photo',
    'testi.photoOptional': '(optional)',
    'testi.heading': 'Leave a Testimonial',
    'testi.sub': 'Reviewed by Anand before publishing — usually within 1–2 days.',
    'testi.success': '✓ Thank you! Your testimonial has been submitted and will be reviewed before publishing.',
    'testi.uploadPhoto': 'Upload Photo',
    'testi.replacePhoto': 'Replace Photo',
    'testi.removePhoto': '✕ Remove',
    // Resume gate
    'resume.gateTitle': 'Enter your email to download',
    'resume.gateSub': 'So I can follow up if relevant opportunities arise.',
    'resume.gateEmail': 'Your Email',
    'resume.gatePlaceholder': 'jane@company.com',
    'resume.gateBtn': 'Download Resume →',
    'resume.gateCancel': 'Cancel',
    // Learning widget
    'learning.title': 'Currently Learning / Reading',
    // Skills extras
    'skills.alsoWith': 'Also comfortable with',
    // contact links
    'contact.email': 'Email',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied!',
    'contact.clipboard': 'to clipboard',
    'contact.linkedin': 'LinkedIn',
    'contact.linkedinVal': 'Connect with me',
    'contact.github': 'GitHub',
    'contact.githubVal': 'See my code',
    'contact.location': 'Location',
    'contact.status': 'Status',
    'contact.available': 'Available for freelance',
    // Misc
    'misc.minRead': 'min read',
    'misc.projects': 'projects',
    'misc.project': 'project',
    'misc.current': '● Current',
    'misc.emptyProjects': 'Projects coming soon — check back!',
    'misc.permalink': '→',
  },
  hi: {
    // Nav
    'nav.about': 'परिचय',
    'nav.skills': 'कौशल',
    'nav.work': 'कार्य',
    'nav.sideProjects': 'साइड प्रोजेक्ट',
    'nav.certs': 'प्रमाण-पत्र',
    'nav.reviews': 'समीक्षाएं',
    'nav.writing': 'लेख',
    'nav.hire': 'संपर्क करें',
    'nav.resume': '↓ रिज्यूमे',
    // Sections
    'section.about': '// परिचय',
    'section.skills': '// मुख्य कौशल',
    'section.work': '// पेशेवर कार्य',
    'section.personal': '// व्यक्तिगत & फ्रीलांस',
    'section.certs': '// प्रमाण-पत्र',
    'section.experience': '// करियर',
    'section.testimonials': '// अनुभव',
    'section.blog': '// लेखन',
    'section.freelance': '// फ्रीलांस उपलब्ध',
    'section.contact': '// संपर्क',
    // Headings
    'heading.skills': 'मैं आपके प्रोजेक्ट में क्या लाता हूँ',
    'heading.work': 'कार्य अनुभव',
    'heading.work.sub': 'विभिन्न कंपनियों में डिलीवर किए गए एंटरप्राइज प्रोजेक्ट्स — कंपनी पर क्लिक करें।',
    'heading.sideProjects': 'साइड प्रोजेक्ट्स',
    'heading.sideProjects.sub': 'शौक, फ्रीलांस कार्य और ओपन-सोर्स योगदान।',
    'heading.certs': 'प्रमाणित & सत्यापित',
    'heading.certs.sub': 'प्रोडक्शन सिस्टम बनाते हुए अर्जित प्रमाण-पत्र।',
    'heading.experience': 'अनुभव & शिक्षा',
    'heading.testimonials': 'लोग क्या कहते हैं',
    'heading.blog': 'तकनीकी लेख',
    'heading.blog.sub': 'Angular और क्लाउड में ५+ वर्षों की सीख साझा करना।',
    // Buttons & labels
    'btn.viewProject': 'प्रोजेक्ट देखें →',
    'btn.verifyCredly': 'Credly पर सत्यापित करें',
    'btn.sendMessage': 'संदेश भेजें →',
    'btn.downloadResume': '↓ PDF डाउनलोड करें',
    'btn.readArticle': 'लेख पढ़ें →',
    'btn.shareTestimonial': '✦ अपना अनुभव साझा करें',
    'btn.cancelTestimonial': '✕ रद्द करें',
    'btn.submitTestimonial': 'समीक्षा के लिए जमा करें →',
    'btn.liveDemo': '↗ लाइव डेमो',
    'btn.back': '← पोर्टफोलियो पर वापस',
    // Contact form
    'form.name': 'आपका नाम',
    'form.email': 'ईमेल',
    'form.message': 'संदेश',
    'form.yourName': 'रमेश शर्मा',
    'form.yourEmail': 'ramesh@company.com',
    'form.yourMessage': 'नमस्ते आनंद, मेरे पास एक प्रोजेक्ट है जिस पर चर्चा करनी है...',
    // Testimonial form
    'testi.name': 'आपका नाम *',
    'testi.role': 'पद / भूमिका',
    'testi.company': 'कंपनी',
    'testi.email': 'आपका ईमेल (वैकल्पिक)',
    'testi.emailPlaceholder': 'ramesh@company.com',
    'testi.quote': 'आपकी समीक्षा *',
    'testi.quotePlaceholder': 'आनंद के साथ काम करने का अपना अनुभव बताएं...',
    'testi.rating': 'रेटिंग',
    'testi.photo': 'आपकी फ़ोटो',
    'testi.photoOptional': '(वैकल्पिक)',
    'testi.heading': 'समीक्षा छोड़ें',
    'testi.sub': 'आनंद द्वारा समीक्षा के बाद प्रकाशित — आमतौर पर 1-2 दिनों में।',
    'testi.success': '✓ धन्यवाद! आपकी समीक्षा जमा हो गई है।',
    'testi.uploadPhoto': 'फ़ोटो अपलोड करें',
    'testi.replacePhoto': 'फ़ोटो बदलें',
    'testi.removePhoto': '✕ हटाएं',
    // Resume gate
    'resume.gateTitle': 'डाउनलोड के लिए ईमेल दर्ज करें',
    'resume.gateSub': 'प्रासंगिक अवसर आने पर संपर्क करने के लिए।',
    'resume.gateEmail': 'आपका ईमेल',
    'resume.gatePlaceholder': 'ramesh@company.com',
    'resume.gateBtn': 'रिज्यूमे डाउनलोड करें →',
    'resume.gateCancel': 'रद्द करें',
    // Learning widget
    'learning.title': 'अभी सीख रहा हूँ / पढ़ रहा हूँ',
    // Skills extras
    'skills.alsoWith': 'इनसे भी परिचित हूँ',
    // contact links
    'contact.email': 'ईमेल',
    'contact.copy': 'कॉपी करें',
    'contact.copied': 'कॉपी हो गया!',
    'contact.clipboard': 'क्लिपबोर्ड पर',
    'contact.linkedin': 'LinkedIn',
    'contact.linkedinVal': 'मुझसे जुड़ें',
    'contact.github': 'GitHub',
    'contact.githubVal': 'मेरा कोड देखें',
    'contact.location': 'स्थान',
    'contact.status': 'स्थिति',
    'contact.available': 'फ्रीलांस के लिए उपलब्ध',
    // Misc
    'misc.minRead': 'मिनट पढ़ें',
    'misc.projects': 'प्रोजेक्ट्स',
    'misc.project': 'प्रोजेक्ट',
    'misc.current': '● वर्तमान',
    'misc.emptyProjects': 'प्रोजेक्ट्स जल्द आ रहे हैं!',
    'misc.permalink': '→',
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'portfolio_lang';
  lang = signal<Lang>(this.getSavedLang());

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, this.lang());
      document.documentElement.setAttribute('lang', this.lang() === 'hi' ? 'hi' : 'en');
    });
  }

  toggle(): void {
    this.lang.set(this.lang() === 'en' ? 'hi' : 'en');
  }

  isHindi(): boolean {
    return this.lang() === 'hi';
  }

  t(key: string): string {
    return TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS['en'][key] ?? key;
  }

  private getSavedLang(): Lang {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Lang;
    return saved === 'hi' ? 'hi' : 'en';
  }
}

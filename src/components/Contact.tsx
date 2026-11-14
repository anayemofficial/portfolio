'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Briefcase, Send, CheckCircle2, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { GithubIcon, LinkedinIcon, FacebookIcon, InstagramIcon, PhoneIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';

export function Contact() {
  const { socials } = portfolioData.personal;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Secure server-side submission (keeps API keys protected server-side)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit your message. Please try again.');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Contact Submission Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMailClient = () => {
    const mailtoSubject = encodeURIComponent(formData.subject || 'Portfolio Inquiry');
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${socials.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(socials.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(socials.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// CONTACT & COLLABORATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Have an idea? <span className="text-gradient">Let's build it together.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            Whether you need a modern website, a full-stack application, an API, or a data-driven solution, I'd love to hear about your project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Contact Details & Links */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Direct Channels
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Feel free to reach out via email, phone, or connect through social media. I typically respond within 24 hours.
              </p>

              {/* Email Quick Card */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Direct Email</div>
                    <a
                      href={`mailto:${socials.email}`}
                      className="text-xs font-mono text-white hover:text-indigo-300 transition-colors"
                    >
                      {socials.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={copyEmail}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Phone Quick Card */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Phone / WhatsApp</div>
                    <a
                      href={`tel:${socials.phone}`}
                      className="text-xs font-mono text-white hover:text-emerald-300 transition-colors"
                    >
                      {socials.phone}
                    </a>
                  </div>
                </div>
                <button
                  onClick={copyPhone}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy phone to clipboard"
                >
                  {copiedPhone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Social Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-indigo-500/40 flex items-center gap-3 group transition-all"
                >
                  <GithubIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <div>
                    <div className="text-xs font-bold text-white">GitHub</div>
                    <div className="text-[10px] text-slate-400 font-mono">@anayemofficial</div>
                  </div>
                </a>

                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-sky-500/40 flex items-center gap-3 group transition-all"
                >
                  <LinkedinIcon className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                  <div>
                    <div className="text-xs font-bold text-white">LinkedIn</div>
                    <div className="text-[10px] text-slate-400 font-mono">md-abdullah-al-nayem</div>
                  </div>
                </a>

                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-blue-500/40 flex items-center gap-3 group transition-all"
                >
                  <FacebookIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <div>
                    <div className="text-xs font-bold text-white">Facebook</div>
                    <div className="text-[10px] text-slate-400 font-mono">nayem.abdullah01</div>
                  </div>
                </a>

                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-pink-500/40 flex items-center gap-3 group transition-all"
                >
                  <InstagramIcon className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
                  <div>
                    <div className="text-xs font-bold text-white">Instagram</div>
                    <div className="text-[10px] text-slate-400 font-mono">@na__yem_</div>
                  </div>
                </a>

                <a
                  href={socials.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-emerald-500/40 flex items-center gap-3 group transition-all col-span-2"
                >
                  <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <div>
                    <div className="text-xs font-bold text-white">Fiverr Freelance Profile</div>
                    <div className="text-[10px] text-slate-400 font-mono">Hire for custom web & AI projects</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Availability Badge */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300">
              <span className="font-bold text-emerald-400">Open for:</span> Freelance contracts, full-stack software development roles, data science projects, and international opportunities.
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="p-8 rounded-2xl glass-card border border-white/10 shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
                Send a Direct Message
              </h3>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-base mb-1">Message Sent Successfully!</p>
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        Thank you for your message. It has been sent directly to <strong>{socials.email}</strong>. Abdullah will review and respond promptly.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/60 transition-colors"
                    >
                      Send Another Message
                    </button>
                    <a
                      href={`mailto:${socials.email}`}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:underline font-mono"
                    >
                      <span>Or open in mail client</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Your Name <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Your Email <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Subject <span className="text-indigo-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Web Development / Freelance Inquiry"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Message <span className="text-indigo-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project scope, requirements, or opportunity..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={openMailClient}
                      className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      title="Open in your default email program (Outlook, Apple Mail, etc.)"
                    >
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span>Open in Mail App</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

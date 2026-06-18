import React, { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy | AI Risk Navigator'; }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-slate-400 text-sm mb-10">Last updated: June 2026</p>

      <div className="space-y-10 text-slate-700">

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">How Your Input Is Handled</h2>
          <p className="leading-relaxed">
            When you use AI Risk Navigator, the information you enter — such as AI system descriptions, security controls, and compliance details — is used solely to generate your risk assessment. Your input is processed at the time of analysis and is not stored in a way that is accessible to other users.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Data Use</h2>
          <p className="leading-relaxed">
            Data you provide is used only to produce risk scores, compliance mappings, and recommendations within your session. It is not used to train AI models, build user profiles, or inform outputs for any other user.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Data Isolation</h2>
          <p className="leading-relaxed">
            Your assessments and analysis results are isolated to your account. Data is not shared between users, organizations, or sessions. Each assessment is stored under your account and is only accessible to you and designated administrators.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">No Sale of Data</h2>
          <p className="leading-relaxed">
            We do not sell, rent, or share your personal information or assessment data with third parties for marketing or commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
          <p className="leading-relaxed">
            If you have questions about how your data is handled, please reach out through the contact form on our website.
          </p>
        </section>

      </div>
    </div>
  );
}
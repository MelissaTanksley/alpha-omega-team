import React, { useEffect } from 'react';

const sections = [
  {
    number: '1',
    title: 'Overview',
    content: (
      <>
        <p>AI Risk Navigator ("the Application") is designed to help users identify, measure, and manage risks associated with artificial intelligence systems in healthcare environments.</p>
        <p className="mt-3">This Privacy Policy explains how information is handled when you use the Application.</p>
      </>
    ),
  },
  {
    number: '2',
    title: 'Information You Provide',
    content: (
      <>
        <p className="mb-3">When using AI Risk Navigator, you may enter information such as:</p>
        <ul className="space-y-1.5 ml-4">
          {['Descriptions of AI systems', 'Risk-related inputs', 'Asset and environment details'].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
        <p className="mt-3">This information is used solely to generate risk analysis and compliance outputs.</p>
      </>
    ),
  },
  {
    number: '3',
    title: 'How Your Information Is Used',
    content: (
      <>
        <p className="mb-3">The information you provide is used only for:</p>
        <ul className="space-y-1.5 ml-4">
          {['Generating AI risk assessments', 'Producing compliance mapping (e.g., HIPAA, NIST CSF)', 'Delivering structured governance outputs'].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
        <p className="mt-3">The Application does not use your inputs for purposes outside of generating your requested analysis.</p>
      </>
    ),
  },
  {
    number: '4',
    title: 'Data Sharing',
    content: (
      <ul className="space-y-1.5 ml-4">
        {[
          'AI Risk Navigator does not share your inputs with other users.',
          'Your information is not publicly displayed or made available to other parties through the Application.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    number: '5',
    title: 'Model Training',
    content: <p>User inputs are not used to train AI models within the Application.</p>,
  },
  {
    number: '6',
    title: 'Data Storage',
    content: (
      <>
        <p className="mb-3">The Application is designed to operate in a session-based manner. Depending on system configuration:</p>
        <ul className="space-y-1.5 ml-4">
          {[
            'Some inputs may be temporarily stored to support application functionality.',
            'Data is not intended to be retained for long-term profiling or resale.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    number: '7',
    title: 'Healthcare and Sensitive Data',
    content: (
      <>
        <p className="mb-3">AI Risk Navigator is designed for risk analysis and governance purposes. Users should:</p>
        <ul className="space-y-1.5 ml-4">
          {[
            'Avoid entering real patient-identifiable information (ePHI).',
            'Use the tool for modeling and assessment scenarios.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
        <p className="mt-3">The Application is not a system of record and does not replace clinical or compliance systems.</p>
      </>
    ),
  },
  {
    number: '8',
    title: 'Security Considerations',
    content: (
      <>
        <p className="mb-3">Reasonable measures are taken to protect the integrity of the Application and user interactions. However:</p>
        <ul className="space-y-1.5 ml-4">
          {[
            'No system can guarantee complete security.',
            'Users should avoid submitting highly sensitive or regulated data.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    number: '9',
    title: 'Third-Party Services',
    content: (
      <ul className="space-y-1.5 ml-4">
        {[
          'The Application may rely on underlying infrastructure or AI processing services.',
          'These services may process inputs as necessary to deliver analysis results.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    number: '10',
    title: 'User Responsibility',
    content: (
      <>
        <p className="mb-3">Users are responsible for:</p>
        <ul className="space-y-1.5 ml-4">
          {[
            'Ensuring appropriate use of the tool.',
            'Avoiding submission of sensitive personal or patient data.',
            'Interpreting outputs as analytical support, not authoritative decisions.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    number: '11',
    title: 'Changes to This Policy',
    content: (
      <ul className="space-y-1.5 ml-4">
        {[
          'This Privacy Policy may be updated from time to time.',
          'Updates will be reflected by a revised "Effective Date."',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">—</span>{item}</li>
        ))}
      </ul>
    ),
  },
];

export default function PrivacyPolicy() {
  useEffect(() => { document.title = 'Privacy Policy | AI Risk Navigator'; }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">AI Risk Navigator &nbsp;·&nbsp; Effective Date: June 18, 2026</p>
      </div>

      <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
        {sections.map((s) => (
          <section key={s.number} className="border-b border-slate-100 pb-8 last:border-b-0 last:pb-0">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              <span className="text-slate-400 font-normal mr-1">{s.number}.</span> {s.title}
            </h2>
            {s.content}
          </section>
        ))}

        {/* Contact */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            <span className="text-slate-400 font-normal mr-1">12.</span> Contact
          </h2>
          <p className="mb-2">For questions regarding this Privacy Policy, please contact:</p>
          <p className="font-medium text-slate-900">Melissa Tanksley</p>
          <a href="mailto:missy.tanksley@gmail.com" className="text-blue-600 hover:underline">missy.tanksley@gmail.com</a>
        </section>
      </div>
    </div>
  );
}
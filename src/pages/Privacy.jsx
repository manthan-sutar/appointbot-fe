import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-[800px] px-4 pb-10 pt-8">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm md:p-8">
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="mb-5 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            This Privacy Policy explains how <strong>Booklyft</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            collects, uses, and protects information when you use our website, dashboard, and WhatsApp
            appointment assistant (the &quot;Service&quot;).
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">1. Information we collect</h2>
          <h3 className="mt-3 mb-1.5 text-base font-semibold text-slate-800">1.1 Business account information</h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            When you create a business account, we collect details such as:
          </p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>Business name and type</li>
            <li>Contact email and phone number</li>
            <li>Timezone and basic configuration</li>
          </ul>

          <h3 className="mt-3 mb-1.5 text-base font-semibold text-slate-800">1.2 Customer and appointment data</h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            To power appointment booking and reminders, we store:
          </p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>Customer name and phone number</li>
            <li>Appointment date, time, duration, staff member, and notes</li>
            <li>Reminder status and basic booking history</li>
          </ul>

          <h3 className="mt-3 mb-1.5 text-base font-semibold text-slate-800">1.3 WhatsApp data</h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            When customers interact with your business via WhatsApp, we receive message content and
            metadata (such as sender phone number and timestamp) from the WhatsApp Business Cloud API.
            We store only what is needed to:
          </p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>Understand the customer&apos;s intent and preferences</li>
            <li>Manage bookings, cancellations, and reschedules</li>
            <li>Provide reminders and conversational replies</li>
          </ul>

          <h3 className="mt-3 mb-1.5 text-base font-semibold text-slate-800">1.4 Usage and technical information</h3>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            We may collect basic technical data about how you access the Service, such as IP address,
            browser type, and device information, to monitor performance, security, and abuse.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">2. How we use information</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">We use the collected information to:</p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>Provide and operate the appointment booking assistant</li>
            <li>Send booking confirmations and reminders on your behalf</li>
            <li>Improve reliability, performance, and user experience</li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations where applicable</li>
          </ul>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">3. Data sharing</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            We do <strong>not</strong> sell customer or business data.
          </p>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">We may share data with:</p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>
              <strong>Service providers</strong> that help us host, run, or monitor the Service (for
              example, database hosting, error tracking, analytics), under appropriate data-protection
              agreements.
            </li>
            <li>
              <strong>WhatsApp / Meta</strong>, when messages are sent or received via the WhatsApp
              Business Cloud API, in accordance with Meta&apos;s terms and policies.
            </li>
            <li>
              <strong>Authorities or third parties</strong> when required by law or to protect the
              rights, property, or safety of our users or the public.
            </li>
          </ul>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">4. Data retention</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            We retain business, customer, and appointment data for as long as necessary to provide the
            Service and to meet legal or regulatory requirements. If you close your account, we will
            delete or anonymize associated data within a reasonable period, except where we are required
            to retain it.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">5. Your responsibilities as a business user</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            If you use Booklyft for your customers, you are responsible for ensuring that you have the
            appropriate consents and lawful basis to:
          </p>
          <ul className="mb-3 list-outside pl-5 text-sm leading-relaxed text-slate-800">
            <li>Store customer contact details and appointment history</li>
            <li>Send WhatsApp messages, including reminders and notifications</li>
            <li>Use our Service in compliance with applicable privacy and communications laws</li>
          </ul>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">6. Security</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            We use industry-standard technical and organizational measures to protect data, including
            access controls, encryption in transit where supported by our infrastructure, and sensible
            operational practices. However, no online service can guarantee absolute security.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">7. International transfers</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            Our infrastructure or service providers may be located in different countries. By using the
            Service, you acknowledge that your information may be processed in jurisdictions that may
            have different data protection rules than your country.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">8. Children&apos;s privacy</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            The Service is intended for use by businesses and adult end users. We do not knowingly
            collect personal data from children under 16. If you believe a child has provided us with
            personal data, please contact us so we can delete it.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">9. Changes to this policy</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last
            updated&quot; date at the top. If changes are material, we may also provide additional notice
            within the dashboard or via email.
          </p>

          <h2 className="mt-5 mb-2 text-lg font-semibold text-slate-900">10. Contact</h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            If you have questions about this Privacy Policy or our data practices, you can reach us at:
          </p>
          <p className="mb-3 text-sm leading-relaxed text-slate-800">
            <strong>Email:</strong> contact@example.com
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}


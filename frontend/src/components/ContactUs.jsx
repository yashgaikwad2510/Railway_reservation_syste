import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

function ContactUs() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Mail size={28} color="var(--orange-500)" />
          Contact Us
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>We're here to help you with your journey. Reach out to us anytime.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        
        {/* Contact Form */}
        <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
          <h3 style={{ color: 'var(--navy-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="var(--navy-600)" />
            Send us a Message
          </h3>

          {submitted ? (
            <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', background: 'var(--orange-100)', color: 'var(--orange-500)', borderRadius: '0.5rem' }}>
              <Send size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h4 style={{ marginBottom: '0.5rem' }}>Message Sent!</h4>
              <p>Thank you for contacting RailFlow. Our support team will respond to your query within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-900)' }}>Full Name</label>
                <input type="text" className="form-control" placeholder="John Doe" required />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-900)' }}>Email Address</label>
                <input type="email" className="form-control" placeholder="john@example.com" required />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-900)' }}>Subject</label>
                <select className="form-control">
                  <option>General Inquiry</option>
                  <option>Booking Issue</option>
                  <option>Payment Problem</option>
                  <option>Refund Request</option>
                  <option>Feedback</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-900)' }}>Message</label>
                <textarea className="form-control" rows="4" placeholder="How can we help you?" style={{ resize: 'none' }} required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Support Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', background: 'var(--navy-900)', color: 'white' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Direct Support</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                  <Phone size={24} color="var(--orange-500)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>24/7 Helpline</div>
                  <div style={{ fontWeight: '600' }}>1800-123-4567</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                  <Mail size={24} color="var(--orange-500)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Email Support</div>
                  <div style={{ fontWeight: '600' }}>support@railflow.com</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
            <h3 style={{ color: 'var(--navy-900)', marginBottom: '1.5rem' }}>Our Headquarters</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <MapPin size={24} color="var(--orange-400)" />
              <address style={{ fontStyle: 'normal', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <strong>RailFlow Technologies Pvt. Ltd.</strong><br />
                Computer Engineering Block, SY Campus<br />
                Station Road, Pune - 411001<br />
                Maharashtra, India
              </address>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactUs;

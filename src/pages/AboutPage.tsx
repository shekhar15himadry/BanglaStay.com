import { Award, Shield, Headphones, MapPin, Heart, Users, Mail, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export function AboutPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.pexels.com/photos/35371204/pexels-photo-35371204.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">About BanglaStay</h1>
          <p className="text-lg text-white/90">
            Bangladesh's trusted hotel booking platform — connecting travelers with unforgettable stays from the Bay of Bengal to the misty hill tracts.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>
            BanglaStay was born from a simple idea: make it effortless to discover and book the best hotels across Bangladesh. From the world's longest natural sandy beach in Cox's Bazar to the emerald tea gardens of Sylhet, the misty heights of Sajek Valley, and the wild mangroves of the Sundarbans — Bangladesh is a land of extraordinary beauty waiting to be explored.
          </p>
          <p>
            We partner with hotels of every kind — from 5-star luxury resorts to cozy eco-cottages — so every traveler finds their perfect stay. Our platform provides transparent pricing, verified reviews, and a seamless booking experience.
          </p>
          <p>
            Whether you're planning a family beach vacation, a romantic hillside getaway, or a business trip to Dhaka, BanglaStay is here to make your journey memorable.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard icon={<Shield className="w-6 h-6" />} title="Secure Booking" desc="Your data and payments are always protected with bank-grade encryption." />
            <ValueCard icon={<Award className="w-6 h-6" />} title="Best Price" desc="We guarantee the best available rates with no hidden fees." />
            <ValueCard icon={<Headphones className="w-6 h-6" />} title="24/7 Support" desc="Our team is always available to help with any questions or issues." />
            <ValueCard icon={<Heart className="w-6 h-6" />} title="Local Expertise" desc="We know Bangladesh inside out — trust us for authentic local recommendations." />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <Stat value="500+" label="Hotels" />
            <Stat value="7" label="Destinations" />
            <Stat value="10k+" label="Happy Guests" />
            <Stat value="4.7" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-500 mb-6">
                Have a question? Want to partner with us? We'd love to hear from you.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                  <span>Gulshan 2, Dhaka 1212, Bangladesh</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                  <span>+880 1700 000000</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                  <span>support@banglastay.com</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Message
              </button>
              {sent && (
                <p className="text-center text-sm text-emerald-600 font-medium">Thank you! We'll get back to you soon.</p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl sm:text-4xl font-bold text-emerald-600">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

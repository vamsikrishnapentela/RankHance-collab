import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from './components/Container';
import { Users, Code, Video, Palette, Brain, Settings, Sparkles, ArrowLeft } from 'lucide-react';

const teamData = {
  core: [
    { id: 1, name: 'Eswar', role: 'Strategic Advisor', image: '/assets/team/eswar.webp' }
  ],
  dev: [
    { id: 2, name: 'Varshith', role: 'Software Developer', image: '/assets/team/varshit.webp' },
    { id: 3, name: 'Sandeep', role: 'Software Developer', image: '/assets/team/sandeep.webp' },
    { id: 4, name: 'Karthik', role: 'Software Developer', image: '/assets/team/karthik.webp' },
    { id: 5, name: 'Venkata Sai', role: 'Software Developer', image: '/assets/team/venkatasai.webp' },
    { id: 6, name: 'Lakshmi', role: 'Software Developer', image: '/assets/team/lakshmi.webp' }
  ],
  media: [
    { id: 7, name: 'Saif & Team', role: 'Media Partner (Vaasmedia)', image: '/assets/team/saif.webp' }
  ],
  design: [
    { id: 8, name: 'Ramesh', role: 'Graphic Designer', image: '/assets/team/ramesh.webp' },
    { id: 9, name: 'Vinay Babu', role: 'Graphic Designer', image: '/assets/team/vinaybabu.webp' }
  ],
  brand: [
    { id: 10, name: 'Bobby', role: 'Brand Name Consultant', image: '/assets/team/boby.webp' }
  ],
  ops: [
    { id: 11, name: 'Hemanth', role: 'Operations Executive', image: '/assets/team/hemanth.webp' },
    { id: 12, name: 'Devi', role: 'Operations Executive', image: '/assets/team/devi.webp' },
    { id: 14, name: 'Vasu', role: 'Operations Executive', image: '/assets/team/vasu.webp' },
    { id: 15, name: 'Krishna', role: 'Operations Executive', image: '/assets/team/krishna.webp' },
    { id: 16, name: 'Nikhil', role: 'Operations Executive', image: '/assets/team/nikhil.webp' }
  ],
  architect: { id: 13, name: 'Vamsi Krishna', role: 'Product Architect', image: '/assets/team/vamsikrishna.webp' }
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
      <Icon size={24} />
    </div>
    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
    <p className="text-gray-500 font-medium">{subtitle}</p>
  </div>
);

const TeamCard = ({ member, delay = "", isMedia = false }) => (
  <div className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-6 ${delay}`}>
    <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
      <img 
        src={member.image} 
        alt={member.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${member.name}&background=fff7ed&color=f97316&bold=true`;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{member.name}</h3>
      {isMedia ? (
        <p className="text-xs font-black mt-1">
          <span className="text-gray-500">Media partner (</span>
          <span className="text-orange-600 text-sm">vaasmedia</span>
          <span className="text-gray-500">)</span>
        </p>
      ) : (
        <p className="text-xs text-gray-500 font-semibold mt-1">{member.role}</p>
      )}
    </div>
  </div>
);

export default function OurTeam() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20 overflow-hidden">
      {/* 🚀 Hero Section */}
      <div className="relative py-16 mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>
        <Container className="text-center relative">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold mb-6 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Meet Our <span className="text-orange-600">Dynamic Team</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            The creative minds and technical experts dedicated to helping EAPCET aspirants achieve their dream rank.
          </p>
        </Container>
      </div>

      <Container className="space-y-24">
        {/* 🔹 Core Team (No Header) */}
        <section>
          <div className="max-w-xs mx-auto pt-10">
            <TeamCard member={teamData.core[0]} />
          </div>
        </section>

        {/* 💻 Development Team */}
        <section>
          <SectionHeader 
            icon={Code} 
            title="Development Team" 
            subtitle="The architects of our digital platform"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamData.dev.map((m, i) => (
              <TeamCard key={m.id} member={m} delay={`delay-${i * 100}`} />
            ))}
          </div>
        </section>

        {/* 🎨 Design Team */}
        <section>
          <SectionHeader 
            icon={Palette} 
            title="Design Team" 
            subtitle="Crafting beautiful user experiences"
          />
          <div className="grid grid-cols-2 max-w-2xl mx-auto gap-8">
            {teamData.design.map((m, i) => (
              <TeamCard key={m.id} member={m} delay={`delay-${i * 200}`} />
            ))}
          </div>
        </section>

        {/* 🎥 Media Partner */}
        <section>
          <SectionHeader 
            icon={Video} 
            title="Media Partner" 
            subtitle="Creative storytelling & digital presence"
          />
          <div className="max-w-xs mx-auto">
            <TeamCard member={teamData.media[0]} isMedia={true} />
          </div>
        </section>

        {/* 🧠 Brand Naming */}
        <section>
          <SectionHeader 
            icon={Brain} 
            title="Brand Strategy" 
            subtitle="Defining the identity of RankHance"
          />
          <div className="max-w-xs mx-auto">
            <TeamCard member={teamData.brand[0]} />
          </div>
        </section>

        {/* 🤝 Operations Team */}
        <section>
          <SectionHeader 
            icon={Settings} 
            title="Operations Team" 
            subtitle="Ensuring smooth daily platform activities"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamData.ops.map((m, i) => (
              <TeamCard key={m.id} member={m} delay={`delay-${i * 100}`} />
            ))}
          </div>
        </section>

        {/* 🎯 Product Architect - AT THE END */}
        <section className="relative">
          <div className="absolute inset-0 bg-orange-600/5 -skew-y-3 rounded-[40px] -z-10 scale-110"></div>
          <SectionHeader 
            icon={Sparkles} 
            title="Product Architect" 
            subtitle="Vision behind the RankHance platform"
          />
          <div className="max-w-md mx-auto">
             <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-orange-100 flex flex-col md:flex-row items-center gap-8 group animate-in zoom-in-95 duration-1000">
                <div className="w-40 h-40 rounded-3xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                   <img 
                    src={teamData.architect.image} 
                    alt={teamData.architect.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${teamData.architect.name}&background=f97316&color=fff&bold=true`;
                    }}
                   />
                </div>
                <div className="text-center md:text-left">
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">{teamData.architect.name}</h3>
                   <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-black mb-4 uppercase tracking-wider">
                      {teamData.architect.role}
                   </div>
                   <p className="text-gray-500 text-sm font-medium leading-relaxed italic">
                      "Building tools that empower students to unlock their full potential and achieve their academic dreams."
                   </p>
                </div>
             </div>
          </div>
        </section>
      </Container>

      {/* 🚀 Footer Quote */}
      <Container className="mt-32 text-center">
         <div className="max-w-2xl mx-auto p-12 bg-gray-900 rounded-[40px] text-white space-y-4 animate-in fade-in duration-1000">
            <h2 className="text-2xl font-bold italic">"Alone we can do so little; together we can do so much."</h2>
            <p className="text-gray-400 font-medium">— RankHance Team</p>
         </div>
      </Container>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  User,
  Mail, 
  ExternalLink, 
  Linkedin, 
  Dribbble, 
  AtSign, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Share2,
  Globe,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Section = 'home' | 'work' | 'about' | 'contact';

interface Project {
  id: string | number;
  category: string;
  title: string;
  description: string;
  image: string;
  type: string;
  gallery?: string[];
}

interface HomeContent {
  title: string;
  description: string;
}

// --- Fallback Data ---
const STATIC_PROJECTS: Project[] = [
  {
    id: 4,
    category: 'IDENTIDAD VISUAL',
    title: 'Lumina Studio',
    description: 'Estrategia de marca para una consultora de iluminación arquitectónica.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800',
    type: 'Branding'
  },
  {
    id: 6,
    category: 'FOTOGRAFIA',
    title: 'Esencia Urbana',
    description: 'Capturas monocromáticas de la vida cotidiana en metrópolis contemporáneas.',
    image: 'https://images.unsplash.com/photo-1449156001933-9114b37be38d?auto=format&fit=crop&q=80&w=800',
    type: 'Street',
    gallery: [
      'https://images.unsplash.com/photo-1449156001933-9114b37be38d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 7,
    category: 'FOTOGRAFIA',
    title: 'Geometría Natural',
    description: 'Exploración de patrones fractales encontrados en la flora silvestre.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    type: 'Macro',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1469474968023-5615d637a89b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(STATIC_PROJECTS);
  const [homeContent, setHomeContent] = useState<HomeContent>({ 
    title: 'PORTFOLIO', 
    description: 'Explora una visión de diseño basada en la profesionalidad etérea y el minimalismo funcional de última generación.' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notionStatus, setNotionStatus] = useState<{ configured: boolean, error?: string }>({ configured: false });

  useEffect(() => {
    async function fetchData() {
      try {
        const healthRes = await fetch('/api/health');
        const health = await healthRes.json();
        setNotionStatus({ configured: health.notionConfigured });

        if (health.notionConfigured) {
          const [projRes, homeRes] = await Promise.all([
            fetch('/api/projects'),
            fetch('/api/content/home')
          ]);

          if (projRes.ok) {
            const dynamicProjects = await projRes.json();
            if (dynamicProjects.length > 0) setProjects(dynamicProjects);
          }
          if (homeRes.ok) {
            const content = await homeRes.json();
            setHomeContent(content);
          }
        }
      } catch (err: any) {
        setNotionStatus(prev => ({ ...prev, error: err.message }));
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const navigateTo = (section: Section) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={48} className="text-accent" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-primary/50 bg-[#F8FAFB]">
      <AnimatePresence>
        {selectedProject && (
          <GalleryModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      {!notionStatus.configured && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 bg-accent text-white p-4 rounded-2xl shadow-2xl z-50 text-xs border border-white/20 animate-pulse">
          <p className="font-bold mb-1 flex items-center gap-2"><Sparkles size={14} /> Modo Vista Previa</p>
          <p className="opacity-70">Conecta tu Notion API para ver tus datos reales aquí.</p>
        </div>
      )}

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-white z-[60] shadow-2xl flex flex-col p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="font-display font-bold text-2xl tracking-tighter text-accent">Navegación</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <SidebarLink 
                  icon={<Home size={20} />} 
                  label="Inicio" 
                  active={activeSection === 'home'} 
                  onClick={() => navigateTo('home')} 
                />
                <SidebarLink 
                  icon={<Briefcase size={20} />} 
                  label="Trabajo" 
                  active={activeSection === 'work'} 
                  onClick={() => navigateTo('work')} 
                />
                <SidebarLink 
                  icon={<User size={20} />} 
                  label="Sobre Mí" 
                  active={activeSection === 'about'} 
                  onClick={() => navigateTo('about')} 
                />
                <SidebarLink 
                  icon={<Mail size={20} />} 
                  label="Contacto" 
                  active={activeSection === 'contact'} 
                  onClick={() => navigateTo('contact')} 
                />
              </nav>

              <div className="mt-auto pt-8 border-t border-slate-100 italic text-slate-400 text-sm">
                Diseñando conexiones significativas.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95"
            aria-label="Abrir menú"
          >
            <Menu size={24} className="text-accent group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <h1 className="font-display font-bold text-xl tracking-widest text-[#0F172A] uppercase">
            Portfolio
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Removed Avatar and Status for minimalism */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 px-6 max-w-6xl mx-auto pb-12">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && <HomeSection navigateTo={navigateTo} content={homeContent} />}
          {activeSection === 'work' && <WorkSection projects={projects} onOpenGallery={(p) => setSelectedProject(p)} />}
          {activeSection === 'about' && <AboutSection />}
          {activeSection === 'contact' && <ContactSection />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Gallery Modal ---
function GalleryModal({ project, onClose }: { project: Project, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col overflow-y-auto"
    >
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 z-[110]">
        <h2 className="font-display font-bold text-xl tracking-widest text-[#0F172A] uppercase">
          Galería: {project.title}
        </h2>
        <button 
          onClick={onClose}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group active:scale-95 flex items-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cerrar</span>
          <X size={24} className="text-accent" />
        </button>
      </header>

      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-12">
          {project.gallery && project.gallery.map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mb-6 md:mb-12 break-inside-avoid rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl bg-slate-50 border border-slate-100 group"
            >
              <img 
                src={img} 
                alt={`${project.title} ${i + 1}`}
                className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- Component Parts ---

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 w-full group ${active ? 'bg-primary text-accent' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="font-display font-bold uppercase tracking-widest text-sm">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebarActiveInd"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
        />
      )}
    </button>
  );
}

// --- Sections ---

function HomeSection({ navigateTo, content }: { navigateTo: (section: Section) => void, content: HomeContent }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-12 md:py-32 lg:py-48 flex flex-col items-center justify-center min-h-[60vh] md:min-h-[75vh] px-4"
    >
      <h2 className="font-display font-bold text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] mb-6 md:mb-12 text-[#1E293B] tracking-tighter leading-none">
        {content.title}
      </h2>
      
      <p className="text-base md:text-2xl lg:text-3xl text-slate-500 leading-relaxed mb-10 md:mb-16 max-w-2xl mx-auto font-light">
        {content.description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-lg sm:max-w-none">
        <button 
          onClick={() => navigateTo('work')}
          className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-primary text-accent font-bold rounded-2xl md:rounded-3xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-lg md:text-xl"
        >
          Explorar Trabajo
        </button>
        <button 
          onClick={() => navigateTo('contact')}
          className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-2xl md:rounded-3xl hover:bg-slate-50 transition-all text-lg md:text-xl"
        >
          Hablemos
        </button>
      </div>
    </motion.div>
  );
}

function WorkSection(_props: { projects?: Project[], onOpenGallery?: (project: Project) => void } = {}) {
  const { onOpenGallery, projects = [] } = _props;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <header className="mb-16 md:mb-24 text-center max-w-3xl mx-auto px-4">
        <h2 className="font-display font-bold text-5xl md:text-8xl mb-6 text-[#1E293B] tracking-tighter">Proyectos</h2>
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-light">
          Una selección curada de trabajos que desafían la comunicación visual convencional a través de la estrategia y el arte.
        </p>
      </header>

      <div className="space-y-32">
        <section>
          <div className="flex items-center justify-between mb-10 md:mb-16 border-b border-slate-100 pb-8">
             <h3 className="font-display font-bold text-2xl md:text-4xl tracking-widest uppercase text-accent">01 IDENTIDAD VISUAL</h3>
             <span className="text-slate-300 font-mono text-sm">/ {projects.filter(p => p.category === 'IDENTIDAD VISUAL').length.toString().padStart(2, '0')} ITEM</span>
          </div>

          <div className="grid gap-20">
            {projects.filter(p => p.category === 'IDENTIDAD VISUAL').map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-20 items-center cursor-pointer group`}
                onClick={() => onOpenGallery?.(project)}
              >
                <div className="w-full md:w-1/2 rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-white border border-slate-100 relative group-hover:shadow-primary/10 transition-all duration-700 flex items-center justify-center p-4">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-[2s]" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full scale-90 group-hover:scale-100 transition-transform">
                      <ChevronRight className="text-accent w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-start translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                  <span className="px-3 py-1 bg-primary/20 text-accent text-[10px] md:text-xs font-bold rounded-lg mb-6 uppercase tracking-widest">Identidad</span>
                  <h4 className="font-display font-bold text-4xl md:text-6xl mb-6 text-slate-800 tracking-tighter leading-tight group-hover:text-accent transition-colors">{project.title}</h4>
                  <p className="text-slate-500 mb-10 text-lg md:text-xl leading-relaxed font-light">{project.description}</p>
                  <div className="flex items-center gap-3 text-accent font-bold text-sm tracking-widest uppercase border-b border-accent/20 pb-2 group-hover:border-accent transition-all">
                    VER ESTUDIO <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-10 md:mb-16 border-b border-slate-100 pb-8">
            <h3 className="font-display font-bold text-2xl md:text-4xl tracking-widest uppercase text-accent">02 FOTOGRAFIA</h3>
            <span className="text-slate-300 font-mono text-sm">/ {projects.filter(p => p.category === 'FOTOGRAFIA').length.toString().padStart(2, '0')} ITEMS</span>
          </div>

          <div className="grid gap-12 md:gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {projects.filter(p => p.category === 'FOTOGRAFIA').map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group relative cursor-pointer"
                onClick={() => onOpenGallery?.(project)}
              >
                <div className="aspect-square overflow-hidden rounded-2xl md:rounded-[3rem] bg-white mb-6 md:mb-8 border border-white shadow-xl group-hover:shadow-3xl transition-all duration-500 flex items-center justify-center p-4">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4">
                      <Sparkles className="text-white w-8 h-8 md:w-12 md:h-12 animate-pulse" />
                      <span className="text-white font-bold text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity px-4 text-center">Ver Galería Completa</span>
                    </div>
                  </div>
                </div>
                <div className="px-2 md:px-4">
                  <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 block">{project.type}</span>
                  <h4 className="font-display font-bold text-2xl md:text-3xl mb-2 md:mb-4 text-[#1E293B] group-hover:text-accent transition-colors">{project.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-lg font-light mb-6 line-clamp-2">{project.description}</p>
                  <div 
                    className="flex items-center gap-2 text-accent font-bold text-xs md:text-sm tracking-widest uppercase border-b border-accent/20 pb-1 group-hover:border-accent transition-all group/btn w-fit"
                  >
                    VER GALERÍA <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function AboutSection() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6 md:py-12"
    >
      <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-start">
        <div className="sticky top-40 lg:block mb-12 lg:mb-0">
          <div className="relative rounded-3xl md:rounded-[4rem] overflow-hidden aspect-[4/5] sm:aspect-[3/4] shadow-3xl max-w-md mx-auto lg:max-w-none">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
              alt="Profile" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-accent/10 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-24 h-24 md:w-40 md:h-40 bg-primary rounded-full flex items-center justify-center p-4 md:p-6 text-center leading-tight font-bold text-accent shadow-2xl rotate-12 text-[10px] md:text-base">
              8+ AÑOS DE EXPERIENCIA
            </div>
          </div>
        </div>

        <div className="py-0 lg:py-8">
          <div className="mb-12 md:mb-20">
            <h2 className="font-display font-bold text-5xl md:text-9xl mb-6 md:mb-8 text-accent tracking-tighter">Sobre Mí.</h2>
            <div className="w-24 md:w-32 h-1.5 md:h-2 bg-primary rounded-full mb-8 md:mb-12" />
            
            <p className="text-2xl md:text-4xl italic text-slate-800 leading-snug mb-8 md:mb-12 border-l-4 md:border-l-8 border-primary pl-6 md:pl-10 font-serif">
              "No solo diseño interfaces; esculpo diálogos invisibles entre la tecnología y el alma humana."
            </p>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-6 md:mb-8 font-light">
              Soy una alquimista visual con sede en Madrid. Mi carrera ha sido un viaje de descubrimiento a través de la armonía del espacio en blanco y la potencia de la tipografía brutalista.
            </p>

            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-12 md:mb-16 font-light">
              Mi filosofía, la <span className="text-accent font-bold">Profesionalidad Aireada</span>, se basa en la creencia de que el diseño debe respirar para que los usuarios puedan sentir su verdadera esencia.
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 mb-16 md:mb-24">
              <Badge icon={<CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />} text="Abierta a Colaboraciones" color="bg-primary/20" />
              <Badge icon={<MapPin className="w-4 h-4 md:w-5 md:h-5" />} text="Madrid, España" color="bg-[#E1EBCF]" />
            </div>
          </div>

          <div className="space-y-20">
            <section>
              <h3 className="font-display font-bold text-4xl mb-10 text-accent flex items-center gap-4">
                <Sparkles size={32} className="text-primary" /> Maestría Técnica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['UI/UX Design', 'Branding', 'Dirección de Arte', 'Tipografía', 'Diseño Web', 'Estrategia'].map(skill => (
                  <div key={skill} className="p-6 bg-white border border-slate-100 rounded-3xl text-lg font-bold text-slate-600 uppercase tracking-widest text-center hover:border-primary transition-colors cursor-default">
                    {skill}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-display font-bold text-4xl mb-10 text-accent flex items-center gap-4">
                <Share2 size={32} className="text-primary" /> Red Digital
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <SocialLink icon={<Globe size={24} />} label="Behance" href="https://behance.net" />
                <SocialLink icon={<Linkedin size={24} />} label="LinkedIn" href="https://linkedin.com" />
                <SocialLink icon={<Dribbble size={24} />} label="Dribbble" href="https://dribbble.com" />
                <SocialLink icon={<Mail size={24} />} label="Email Personal" href="mailto:hello@creative.studio" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactSection() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
     <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 max-w-4xl mx-auto px-4"
    >
      <header className="mb-16 md:mb-24 text-center">
        <h2 className="font-display font-bold text-5xl md:text-9xl mb-6 md:mb-8 text-[#1E293B] tracking-tighter">Hablemos.</h2>
        <p className="text-lg md:text-2xl text-slate-500 font-light">¿Tienes una idea que necesita una forma? Vamos a convertirla en algo inolvidable.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 md:gap-12">
        <div className="lg:col-span-3 order-2 lg:order-1">
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-50 text-center flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="text-accent w-10 h-10" />
              </div>
              <h3 className="font-display font-bold text-4xl mb-4 text-accent">¡Mensaje Enviado!</h3>
              <p className="text-slate-500 text-lg md:text-xl font-light">Gracias por tu propuesta. Me pondré en contacto contigo muy pronto.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 bg-white p-8 md:p-16 rounded-3xl md:rounded-[4rem] shadow-2xl border border-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
                <Mail size={120} />
              </div>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400">Identidad</label>
                  <input required type="text" className="w-full bg-slate-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 text-sm md:text-base" placeholder="Nombre completo" />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400">Canal</label>
                  <input required type="email" className="w-full bg-slate-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 text-sm md:text-base" placeholder="tu@email.com" />
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400">Mensaje</label>
                <textarea required rows={5} className="w-full bg-slate-50 border-none rounded-2xl md:rounded-3xl p-4 md:p-6 focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-slate-300 text-sm md:text-base" placeholder="Cuéntame sobre tu proyecto..." />
              </div>
              <button type="submit" className="w-full bg-accent text-white font-bold py-6 md:py-8 rounded-2xl md:rounded-[2rem] shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg md:text-2xl tracking-widest uppercase">
                Enviar Propuesta
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6 md:space-y-8 order-1 lg:order-2">
          <div className="bg-primary p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] text-accent">
            <h4 className="font-display font-bold text-xl md:text-2xl mb-4">Información</h4>
            <div className="space-y-4 md:space-y-6 opacity-70 text-sm md:text-base">
              <a href="mailto:hello@creative.studio" className="flex items-center gap-3 md:gap-4 hover:translate-x-1 transition-transform"><Mail className="w-4 h-4 md:w-5 md:h-5" /> hello@creative.studio</a>
              <p className="flex items-center gap-3 md:gap-4"><MapPin className="w-4 h-4 md:w-5 md:h-5" /> Madrid, España</p>
            </div>
          </div>
          <div className="bg-slate-900 p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] text-white">
            <h4 className="font-display font-bold text-xl md:text-2xl mb-4">Social</h4>
            <div className="flex gap-3 md:gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary hover:text-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary hover:text-accent transition-colors"><Dribbble className="w-5 h-5" /></a>
              <a href="mailto:hello@creative.studio" className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary hover:text-accent transition-colors"><AtSign className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Helpers ---

function Badge({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
  return (
    <div className={`flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 ${color} rounded-2xl md:rounded-3xl text-accent text-[10px] md:text-sm font-bold uppercase tracking-widest shadow-sm`}>
      <div className="p-1 md:p-1.5 bg-white/80 rounded-lg shrink-0">
        {icon}
      </div>
      <span className="truncate">{text}</span>
    </div>
  );
}

function SocialLink({ icon, label, href = "#" }: { icon: React.ReactNode, label: string, href?: string }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] hover:text-accent hover:border-accent transition-all text-slate-600 group w-full text-left"
    >
      <div className="group-hover:scale-110 md:group-hover:scale-125 group-hover:text-accent transition-all duration-300 shrink-0">
        {icon}
      </div>
      <span className="font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-sm truncate">{label}</span>
      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </a>
  );
}

import React, { useEffect } from 'react';
import { Link } from "react-router-dom"; 
import Marquee from "react-fast-marquee"; 
import { ArrowRight, Bot, BarChart, BrainCircuit, Sparkles } from "lucide-react"; 

import { Container } from "@/components/container"; 
import { Button } from "@/components/ui/button"; 
import CursorTrail from "@/components/cursor-trail";

// Type declaration for spline-viewer element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { url: string }, HTMLElement>;
    }
  }
}

// Helper component to render the Spline Web Component
const SplineWebComponent = ({ sceneUrl }: { sceneUrl: string }) => {
  useEffect(() => {
    const scriptId = 'spline-viewer-script';
    if (document.getElementById(scriptId)) return;
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.40/build/spline-viewer.js';
    document.head.appendChild(script);
  }, []);

  return (
    <spline-viewer url={sceneUrl} style={{ width: '100%', height: '100%', borderRadius: '1rem' }}></spline-viewer>
  );
};

// FeatureCard component (commented out as it's not currently used)
// const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
//   <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200/80 flex flex-col items-start text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"> 
//     <div className="p-3 bg-primary/10 rounded-lg mb-4">{icon}</div> 
//     <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3> 
//     <p className="text-sm text-muted-foreground">{description}</p> 
//   </div> 
// ); 

const HomePage = () => { 
  useEffect(() => { 
    const styleId = 'hero-background-styles'; 
    if (document.getElementById(styleId)) return; 

    const css = ` 
      .gradient-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; } 
      .gradient-sphere { position: absolute; border-radius: 50%; filter: blur(80px); } 
      .sphere-1 { width: 40vw; height: 40vw; background: linear-gradient(40deg, rgba(255, 0, 128, 0.3), rgba(255, 102, 0, 0.2)); top: -10%; left: -10%; animation: float-1 15s ease-in-out infinite alternate; } 
      .sphere-2 { width: 45vw; height: 45vw; background: linear-gradient(240deg, rgba(72, 0, 255, 0.3), rgba(0, 183, 255, 0.2)); bottom: -20%; right: -10%; animation: float-2 18s ease-in-out infinite alternate; } 
      .sphere-3 { width: 30vw; height: 30vw; background: linear-gradient(120deg, rgba(133, 89, 255, 0.25), rgba(98, 216, 249, 0.15)); top: 60%; left: 20%; animation: float-3 20s ease-in-out infinite alternate; } 
      .noise-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.04; z-index: 5; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); } 
      @keyframes float-1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(10%, 10%) scale(1.1); } } 
      @keyframes float-2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, -5%) scale(1.15); } } 
      @keyframes float-3 { 0% { transform: translate(0, 0) scale(1); opacity: 0.3; } 100% { transform: translate(-5%, 10%) scale(1.05); opacity: 0.6; } } 
      .grid-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: 50px 50px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px); z-index: 2; } 
      .glow { position: absolute; width: 40vw; height: 40vh; background: radial-gradient(circle, rgba(72, 0, 255, 0.1), transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; animation: pulse 8s infinite alternate; filter: blur(40px); } 
      @keyframes pulse { 0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); } 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); } } 
      .particles-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; } 
      .particle { position: absolute; background: #888888; border-radius: 50%; opacity: 0; pointer-events: none; }
      .mouse-particle { position: fixed; background: #888888; border-radius: 50%; opacity: 0; pointer-events: none; z-index: 9998; }
    `; 

    const styleElement = document.createElement('style'); 
    styleElement.id = styleId; 
    styleElement.innerHTML = css; 
    document.head.appendChild(styleElement); 

    const particlesContainer = document.getElementById('particles-container'); 
    if (!particlesContainer) return; 
    particlesContainer.innerHTML = ''; 

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div'); 
        particle.className = 'particle'; 
        const size = Math.random() * 2.5 + 1; 
        particle.style.width = `${size}px`; 
        particle.style.height = `${size}px`; 
        particle.style.left = `${Math.random() * 100}%`; 
        particle.style.top = `${Math.random() * 100}%`; 
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 5;
        particle.animate([
            { transform: 'translateY(0px)', opacity: Math.random() * 0.4 },
            { transform: `translateY(-${window.innerHeight}px)`, opacity: 0 }
        ], { duration: duration * 1000, delay: delay * 1000, easing: 'linear', iterations: Infinity });
    }

    const handleMouseMove = (e: MouseEvent) => { 
      const particle = document.createElement('div'); 
      particle.className = 'mouse-particle'; 
      const size = Math.random() * 4 + 2; 
      particle.style.width = `${size}px`; 
      particle.style.height = `${size}px`; 
      particle.style.left = `${e.clientX - size / 2}px`;
      particle.style.top = `${e.clientY - size / 2}px`;
      document.body.appendChild(particle); 
      particle.animate([ 
        { opacity: 0.8, transform: 'scale(1)' }, 
        { opacity: 0, transform: `scale(0) translate(${(Math.random() * 60 - 30)}px, ${(Math.random() * 60 - 30)}px)` } 
      ], { duration: 1200, easing: 'ease-out' }); 
      setTimeout(() => particle.remove(), 1200); 
    }; 
    document.addEventListener('mousemove', handleMouseMove); 

    return () => { 
      document.removeEventListener('mousemove', handleMouseMove);
      const existingStyle = document.getElementById(styleId); 
      if (existingStyle) { document.head.removeChild(existingStyle); } 
    }; 
  }, []);

  // Scroll animation effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8', 'translate-x-8', '-translate-x-8');
          entry.target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const animatedElements = document.querySelectorAll('[data-scroll-trigger]');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []); 

  return ( 
    <div className="flex flex-col w-full bg-white"> 
      <CursorTrail /> 

             {/* ============== 1. Hero Section ============== */} 
       {/* FIXED: Adjusted height and layout to fit within viewport */}
       <Container className="h-screen flex flex-col items-center px-4 pt-20 pb-8 relative overflow-hidden">
        <div className="gradient-background"> 
          <div className="gradient-sphere sphere-1"></div> 
          <div className="gradient-sphere sphere-2"></div> 
          <div className="gradient-sphere sphere-3"></div> 
          <div className="glow"></div> 
          <div className="grid-overlay"></div> 
          <div className="noise-overlay"></div> 
          <div className="particles-container" id="particles-container"></div> 
        </div> 

                 <div className="relative z-10 grid md:grid-cols-2 items-center gap-8 w-full max-w-7xl mx-auto">
             
             <div className="relative h-[500px] md:h-[500px] lg:h-[600px] md:w-[120%] md:-ml-24" >
                 <SplineWebComponent sceneUrl="https://prod.spline.design/mrmlesEvmbVssCpa/scene.splinecode" />
             </div>
             
                         <div className="flex flex-col items-center justify-center text-center">
                 <Link to="/generate"> 
                     <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"> 
                         Meet Your Interview Co-Pilot <ArrowRight className="inline ml-1 h-4 w-4" /> 
                     </span> 
                 </Link> 
                 <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900 mt-3"> 
                     Ace Your Next Interview 
                     <br /> 
                     with <span className="text-primary">AI Superpowers</span> 
                 </h1> 
                 <p className="max-w-md mt-3 text-sm md:text-base text-muted-foreground"> 
                     Boost your confidence and land your dream job. Our AI analyzes your responses, provides instant feedback, and tailors practice sessions just for you. 
                 </p> 
                 <div className="mt-6 flex flex-col items-center gap-2"> 
                     <Link to="/generate"> 
                         <Button size="lg"> 
                             Start Practicing Now <Sparkles className="ml-2 h-5 w-5" /> 
                         </Button> 
                     </Link> 
                     <p className="text-xs text-gray-500">Free to start, no credit card required.</p> 
                 </div>
             </div>
        </div>
      </Container> 

      {/* ============== 2. Features Section ============== */} 
      <section className="py-24 lg:py-32 bg-slate-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">A Smarter Way to Prepare</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Stop guessing. Get data-driven insights to transform your interview skills from good to exceptional.
            </p>
          </div>
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            {/* Features timeline on the left */}
            <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-8">
              {/* Timeline vertical line */}
              <div className="relative pl-8">
                {/* Timeline line */}
                {/* <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/5 rounded-full"></div> */}
                {/* Feature steps */}
                <div className="flex flex-col gap-8">
                  <div className="relative flex gap-4 items-start">
                    <div className="z-10 w-8 h-8 flex items-center justify-center bg-primary/90 text-white rounded-full shadow-lg ring-4 ring-primary/20 font-bold text-lg">1</div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Personalized Questions</h3>
                      <p className="text-sm text-muted-foreground">Our AI generates interview questions tailored to the specific job description and your resume.</p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 items-start">
                    <div className="z-10 w-8 h-8 flex items-center justify-center bg-primary/90 text-white rounded-full shadow-lg ring-4 ring-primary/20 font-bold text-lg">2</div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> Real-time AI Feedback</h3>
                      <p className="text-sm text-muted-foreground">Receive instant, private feedback on your answers, delivery, and even non-verbal cues.</p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 items-start">
                    <div className="z-10 w-8 h-8 flex items-center justify-center bg-primary/90 text-white rounded-full shadow-lg ring-4 ring-primary/20 font-bold text-lg">3</div>
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-6 py-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2"><BarChart className="h-5 w-5 text-primary" /> Actionable Reports</h3>
                      <p className="text-sm text-muted-foreground">Get detailed performance summaries after each session to track your progress and target weaknesses.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Image on the right */}
            <div className="flex-1 flex justify-center items-center">
              <img
                src="/assets/img/ai-features.png"
                alt="AI Powered Features"
                className="max-w-xs md:max-w-md w-full h-auto rounded-2xl shadow-2xl border-4 border-white bg-white p-2"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ============== 3. Image Gallery Section with Scroll Animations ============== */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Experience the Future of Interview Prep</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              See how our AI-powered platform transforms your interview preparation with cutting-edge technology and personalized insights.
            </p>
          </div>
          
          {/* First Image Row - Hero Image */}
          <div className="mb-16">
            <div 
              className="scroll-animate opacity-0 translate-y-8 transition-all duration-1000 ease-out"
              data-scroll-trigger
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/assets/img/hero.jpg"
                  alt="AI Interview Preparation Platform"
                  className="w-full h-[400px] md:h-[500px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">AI-Powered Interview Practice</h3>
                  <p className="text-lg opacity-90">Experience the future of job preparation with our intelligent interview simulator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Second Image Row - Office Image */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div 
              className="scroll-animate opacity-0 translate-x-8 transition-all duration-1000 ease-out"
              data-scroll-trigger
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="/assets/img/office.jpg"
                  alt="Professional Office Environment"
                  className="w-full h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Professional Environment</h3>
                  <p className="text-base opacity-90">Practice in a realistic interview setting</p>
                </div>
              </div>
            </div>
            
            <div 
              className="scroll-animate opacity-0 -translate-x-8 transition-all duration-1000 ease-out"
              data-scroll-trigger
            >
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose Our Platform?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-time AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">Get instant feedback on your responses, body language, and communication skills.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Personalized Questions</h4>
                      <p className="text-sm text-muted-foreground">Questions tailored to your specific job role and experience level.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Progress Tracking</h4>
                      <p className="text-sm text-muted-foreground">Monitor your improvement with detailed analytics and performance reports.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============== 4. Logo Cloud / Marquee Section ============== */} 
      <div className="py-20 bg-white"> 
        <Container className="flex flex-col items-center justify-center gap-8"> 
          <h3 className="text-center font-semibold text-gray-600 tracking-wider uppercase"> 
            Powered by the Best in AI & Communication Tech 
          </h3> 
          <div className="w-full"> 
            <Marquee pauseOnHover speed={40} gradient gradientColor="#FFFFFF" gradientWidth={100}> 
            <img src="/assets/img/logo/Gemini.png" alt="Gemini Logo" className="h-9 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              <img src="/assets/img/logo/firebase.png" alt="Firebase Logo" className="h-12 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              {/* <img src="/assets/img/logo/microsoft.png" alt="Microsoft Logo" className="h-8 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" />  */}
              {/* <img src="/assets/img/logo/meet.png" alt="Google Meet Logo" className="h-8 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" />  */}
              <img src="/assets/img/logo/tailwindcss.png" alt="Tailwind CSS Logo" className="h-8 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              {/* <img src="/assets/img/logo/zoom.png" alt="Zoom Logo" className="h-10 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> */}
              <img src="/assets/img/logo/Spline.png" alt="Spline Logo" className="h-9 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              <img src="/assets/img/logo/Clerk.png" alt="Clerk Logo" className="h-9 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              <img src="/assets/img/logo/Vite.png" alt="Vite Logo" className="h-16 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 
              <img src="/assets/img/logo/React1.png" alt="React Logo" className="h-16 mx-12 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100" /> 


            </Marquee> 
          </div> 
        </Container> 
      </div> 

      {/* ============== 4. Final CTA Section ============== */} 
      <div className="bg-gray-900 text-white"> 
        <Container className="py-24 lg:py-32 text-center flex flex-col items-center"> 
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight"> 
            Ready to Land Your Dream Job? 
          </h2> 
          <p className="mt-4 max-w-2xl text-gray-300 md:text-lg"> 
            Your next career move is just one great interview away. Get the AI edge and walk into your next interview with unshakable confidence. 
          </p> 
          <Link to="/generate" className="mt-8"> 
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200"> 
              Generate Your First Interview <Sparkles className="ml-2 h-5 w-5" /> 
            </Button> 
          </Link> 
        </Container> 
      </div> 
    </div> 
  ); 
}; 

export default HomePage;
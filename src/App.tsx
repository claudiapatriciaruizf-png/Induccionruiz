/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  Shield, 
  UserCheck, 
  Award, 
  FileText, 
  ExternalLink, 
  Play, 
  ArrowRight, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  HelpCircle, 
  RotateCcw, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Menu,
  X,
  Info,
  Check,
  AlertTriangle,
  Code,
  Database,
  User,
  Shuffle,
  BarChart3,
  TrendingUp,
  Users,
  CheckSquare,
  Lock,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import heroBanner from './assets/images/sena_hero_banner_1790199747727.jpg';
import reglamentoJson from './data/reglamentoSena.json';
import bancoPreguntas50 from './data/bancoPreguntas50.json';

type LearnerType = 'nuevo' | 'antiguo' | null;
type ActiveTab = 'home' | 'characterization' | 'ruta' | 'normativa' | 'regionales' | 'datos-aprendiz' | 'derechos-interactivos' | 'modulo-institucional' | 'prueba-interactiva' | 'json-viewer' | 'db-records' | 'admin-dashboard' | 'evaluacion';

interface Regional {
  id: string;
  nombre: string;
  departamento: string;
  centros: string[];
  url: string;
}

interface DatosAprendiz {
  nombres: string;
  tipoDocumento: string;
  numeroDocumento: string;
  correo: string;
  regional: string;
  centroFormacion: string;
  programaFormacion: string;
  modalidad: string;
}

const REGIONALES_SENA: Regional[] = [
  {
    id: 'dc',
    nombre: 'Regional Distrito Capital',
    departamento: 'Bogotá D.C.',
    centros: ['Centro de Electricidad, Electrónica y Telecomunicaciones', 'Centro de Diseño y Metrología', 'Centro de Tecnologías de Transporte', 'Centro de Servicios Financieros'],
    url: 'https://distritocapital.sena.edu.co/'
  },
  {
    id: 'ant',
    nombre: 'Regional Antioquia',
    departamento: 'Antioquia',
    centros: ['Centro de Tecnología de la Manufactura Avanzada', 'Centro de los Recursos Naturales Renovables', 'Centro Tecnológico del Mobiliario', 'Centro Minero Ambiental'],
    url: 'https://antioquia.sena.edu.co/'
  },
  {
    id: 'valle',
    nombre: 'Regional Valle',
    departamento: 'Valle del Cauca',
    centros: ['Centro Náutico Pesquero', 'Centro de Electricidad y Automatización Industrial', 'Centro de la Construcción', 'Centro de Biotecnología Industrial'],
    url: 'https://valle.sena.edu.co/'
  },
  {
    id: 'atlantico',
    nombre: 'Regional Atlántico',
    departamento: 'Atlántico',
    centros: ['Centro Nacional Colombo Alemán', 'Centro de Comercio y Servicios', 'Centro Industrial y de Aviación'],
    url: 'https://atlantico.sena.edu.co/'
  },
  {
    id: 'cundinamarca',
    nombre: 'Regional Cundinamarca',
    departamento: 'Cundinamarca',
    centros: ['Centro de Desarrollo Agroempresarial', 'Centro Agroecológico y Empresarial', 'Centro de Tecnología Agroindustrial'],
    url: 'https://cundinamarca.sena.edu.co/'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [learnerType, setLearnerType] = useState<LearnerType>(null);
  const [quizStep, setQuizStep] = useState<number>(1);
  const [quizAnswers, setQuizAnswers] = useState({
    primeraVez: null as boolean | null,
    conocimientoPlataforma: null as boolean | null,
    induccionReciente: null as boolean | null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRegional, setSelectedRegional] = useState<Regional>(REGIONALES_SENA[0]);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});
  
  // Módulo de Datos Básicos del Aprendiz para la Base de Datos
  const [datosAprendiz, setDatosAprendiz] = useState<DatosAprendiz>({
    nombres: '',
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '',
    correo: '',
    regional: REGIONALES_SENA[0].nombre,
    centroFormacion: REGIONALES_SENA[0].centros[0],
    programaFormacion: 'Tecnología en Análisis y Desarrollo de Software',
    modalidad: 'Presencial'
  });
  const [datosGuardados, setDatosGuardados] = useState(false);

  // Interactive Rights Explorer state
  const [rightsCategory, setRightsCategory] = useState<'derechos' | 'deberes' | 'prohibiciones'>('derechos');
  const [searchTerm, setSearchTerm] = useState('');

  // Institutional Module Sub-tab state
  const [institucionalSubTab, setInstitucionalSubTab] = useState<'historia' | 'himno' | 'identidad'>('historia');

  // Interactive Test State with pedagogical reinforcement, database storage & 50-question repository without repetition
  const [testIndex, setTestIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [testScore, setTestScore] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [guardandoDB, setGuardandoDB] = useState(false);
  const [dbGuardadoExitoso, setDbGuardadoExitoso] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);
  const [seenQuestionIds, setSeenQuestionIds] = useState<number[]>([]);

  // DB Records state
  const [evaluacionesDB, setEvaluacionesDB] = useState<any[]>([]);
  const [loadingDB, setLoadingDB] = useState(false);

  useEffect(() => {
    fetchEvaluacionesDB();
    initNewTestSession();
  }, []);

  const initNewTestSession = () => {
    const allQuestions = bancoPreguntas50.preguntas;
    let available = allQuestions.filter(q => !seenQuestionIds.includes(q.id));

    if (available.length < 5) {
      setSeenQuestionIds([]);
      available = allQuestions;
    }

    const shuffledPool = [...available];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    const sessionQuestions = shuffledPool.slice(0, 5);
    const newSeenIds = [...seenQuestionIds, ...sessionQuestions.map(q => q.id)];
    setSeenQuestionIds(newSeenIds);

    const processed = sessionQuestions.map(q => {
      const optionsWithIndex = q.opciones.map((op, idx) => ({ text: op, isCorrect: idx === q.respuestaCorrecta }));
      for (let i = optionsWithIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
      }
      const newOpciones = optionsWithIndex.map(o => o.text);
      const newCorrecta = optionsWithIndex.findIndex(o => o.isCorrect);
      return {
        ...q,
        opciones: newOpciones,
        respuestaCorrecta: newCorrecta
      };
    });

    setShuffledQuestions(processed);
  };

  const fetchEvaluacionesDB = async () => {
    try {
      setLoadingDB(true);
      const res = await fetch('/api/evaluaciones');
      if (res.ok) {
        const data = await res.json();
        setEvaluacionesDB(data);
      }
    } catch (err) {
      console.error('Error al cargar evaluaciones de la base de datos:', err);
    } finally {
      setLoadingDB(false);
    }
  };

  const handleDatosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosAprendiz.nombres || !datosAprendiz.numeroDocumento || !datosAprendiz.correo) {
      alert('Por favor completa los campos obligatorios del aprendiz.');
      return;
    }
    setDatosGuardados(true);
    setActiveTab('prueba-interactiva');
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (answerStatus !== null) return;
    setSelectedOption(optionIndex);
    const currentQ = shuffledQuestions[testIndex];
    const correct = optionIndex === currentQ.respuestaCorrecta;
    if (correct) {
      setAnswerStatus('correct');
      setTestScore(prev => prev + 1);
    } else {
      setAnswerStatus('incorrect');
    }
  };

  const handleNextQuestion = async () => {
    setSelectedOption(null);
    setAnswerStatus(null);
    if (testIndex + 1 < shuffledQuestions.length) {
      setTestIndex(prev => prev + 1);
    } else {
      setTestFinished(true);
      await guardarEvaluacionEnDB(testScore + (selectedOption === shuffledQuestions[testIndex].respuestaCorrecta ? 1 : 0));
    }
  };

  const guardarEvaluacionEnDB = async (finalScore: number) => {
    try {
      setGuardandoDB(true);
      const totalQ = shuffledQuestions.length;
      const payload = {
        aprendiz: datosAprendiz,
        resultado: {
          puntaje: finalScore,
          totalPreguntas: totalQ,
          aprobado: finalScore >= Math.ceil(totalQ * 0.75),
          porcentaje: Math.round((finalScore / totalQ) * 100)
        }
      };
      const res = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDbGuardadoExitoso(true);
        fetchEvaluacionesDB();
      }
    } catch (err) {
      console.error('Error al guardar en DB:', err);
    } finally {
      setGuardandoDB(false);
    }
  };

  const restartTest = () => {
    initNewTestSession();
    setTestIndex(0);
    setSelectedOption(null);
    setAnswerStatus(null);
    setTestScore(0);
    setTestFinished(false);
    setDbGuardadoExitoso(false);
  };

  const currentQ = shuffledQuestions[testIndex];

  // Analytic metrics
  const totalEvaluaciones = evaluacionesDB.length;
  const aprobadosCount = evaluacionesDB.filter(e => e.resultado?.aprobado).length;
  const tasaAprobacion = totalEvaluaciones > 0 ? Math.round((aprobadosCount / totalEvaluaciones) * 100) : 0;
  const promedioPuntaje = totalEvaluaciones > 0 ? (evaluacionesDB.reduce((acc, curr) => acc + (curr.resultado?.porcentaje || 0), 0) / totalEvaluaciones).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-[#39a900] selection:text-white">
      
      {/* GOV.CO TOP BAR */}
      <div className="bg-[#004884] text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
          <span className="font-extrabold tracking-widest text-[#00a8cc]">GOV.CO</span>
          <span className="text-slate-300">| El portal del Estado Colombiano</span>
        </div>
      </div>

      {/* TOP BAR CONTRACT (SENA BRAND) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#39a900] flex items-center justify-center text-white font-extrabold shadow-sm group-hover:bg-[#319200] transition-colors text-lg">
              S
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                Inducción SENA
              </span>
              <span className="text-[10px] text-[#39a900] uppercase tracking-wider block font-bold">
                Modalidad Presencial
              </span>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-700">
            <button onClick={() => setActiveTab('home')} className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'home' ? 'bg-[#39a900]/10 text-[#39a900] font-bold' : 'hover:text-[#39a900] hover:bg-slate-100'}`}>
              Inicio
            </button>
            <button onClick={() => setActiveTab('datos-aprendiz')} className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'datos-aprendiz' ? 'bg-[#39a900]/10 text-[#39a900] font-bold' : 'hover:text-[#39a900] hover:bg-slate-100'}`}>
              <User className="w-3.5 h-3.5 text-[#39a900]" />
              <span>1. Datos Aprendiz</span>
            </button>
            <button onClick={() => setActiveTab('derechos-interactivos')} className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'derechos-interactivos' ? 'bg-[#39a900]/10 text-[#39a900] font-bold' : 'hover:text-[#39a900] hover:bg-slate-100'}`}>
              <BookOpen className="w-3.5 h-3.5 text-[#39a900]" />
              <span>2. Derechos & Deberes</span>
            </button>
            <button onClick={() => setActiveTab('modulo-institucional')} className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'modulo-institucional' ? 'bg-[#39a900]/10 text-[#39a900] font-bold' : 'hover:text-[#39a900] hover:bg-slate-100'}`}>
              <Building2 className="w-3.5 h-3.5 text-[#39a900]" />
              <span>3. Módulo Institucional</span>
            </button>
            <button onClick={() => setActiveTab('prueba-interactiva')} className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'prueba-interactiva' ? 'bg-[#39a900]/10 text-[#39a900] font-bold' : 'hover:text-[#39a900] hover:bg-slate-100'}`}>
              <Shuffle className="w-3.5 h-3.5 text-[#39a900]" />
              <span>4. Test de 50 Preguntas</span>
            </button>
          </nav>

          {/* ZONE 3: Top Right Action Buttons (Including Admin Dashboard Button) */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('admin-dashboard')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${activeTab === 'admin-dashboard' ? 'bg-[#004884] text-white ring-2 ring-[#00a8cc]' : 'bg-[#004884] hover:bg-[#003b6e] text-white'}`}
            >
              <BarChart3 className="w-4 h-4 text-[#00a8cc]" />
              <span>Panel Admin & Analítica</span>
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="xl:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg" aria-label="Abrir menú">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Inicio</button>
            <button onClick={() => { setActiveTab('datos-aprendiz'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#39a900] font-bold hover:bg-slate-100 flex items-center gap-2">
              <User className="w-4 h-4" /><span>1. Datos Básicos Aprendiz</span>
            </button>
            <button onClick={() => { setActiveTab('derechos-interactivos'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#39a900] font-bold hover:bg-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /><span>2. Módulo Derechos y Deberes</span>
            </button>
            <button onClick={() => { setActiveTab('modulo-institucional'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#39a900] font-bold hover:bg-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4" /><span>3. Módulo Institucional (Historia, Himno, Identidad)</span>
            </button>
            <button onClick={() => { setActiveTab('prueba-interactiva'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#39a900] font-bold hover:bg-slate-100 flex items-center gap-2">
              <Shuffle className="w-4 h-4" /><span>4. Test con Banco de 50 Preguntas</span>
            </button>
            <button onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#004884] hover:bg-[#003b6e] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00a8cc]" /><span>Panel Admin & Analítica</span>
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>
            <section className="relative bg-[#004884] text-white overflow-hidden py-20 lg:py-28">
              <div className="absolute inset-0 opacity-25 mix-blend-overlay">
                <img src={heroBanner} alt="SENA Campus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#003b6e] via-[#004884]/90 to-transparent"></div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <span className="inline-block px-3 py-1 bg-[#39a900] text-white font-bold text-xs rounded-full uppercase tracking-widest mb-4">
                    Servicio Nacional de Aprendizaje SENA
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                    Módulo Institucional, Test Aleatorio y Panel de Analítica SENA
                  </h1>
                  <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-2xl">
                    Plataforma oficial con identidad visual Gov.co y SENA, banco de 50 preguntas sin repetición, módulo de derechos y deberes, e historia institucional.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      onClick={() => setActiveTab('modulo-institucional')}
                      className="px-6 py-3.5 bg-[#39a900] hover:bg-[#319200] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 group"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Módulo Institucional</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('admin-dashboard')}
                      className="px-6 py-3.5 bg-[#00a8cc] hover:bg-[#0092b3] text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Panel Admin & Analítica</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#39a900]/10 text-[#39a900] flex items-center justify-center font-bold text-lg mb-6">
                        01
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Módulo Institucional</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Historia, Himno e Identidad Corporativa (logo y escudo oficial) con videos en streaming de YouTube.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('modulo-institucional')} className="inline-flex items-center gap-2 text-sm font-bold text-[#39a900] hover:text-[#319200]">
                      <span>Ver Módulo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#004884]/10 text-[#004884] flex items-center justify-center font-bold text-lg mb-6">
                        02
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Derechos & Deberes</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Navega por los artículos 5, 8 y 9 del Reglamento del Aprendiz extraídos del Acuerdo 009 de 2024.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('derechos-interactivos')} className="inline-flex items-center gap-2 text-sm font-bold text-[#004884] hover:text-[#003b6e]">
                      <span>Explorar Módulo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#00a8cc]/10 text-[#00a8cc] flex items-center justify-center font-bold text-lg mb-6">
                        03
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Banco de 50 Preguntas</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Test dinámico sin repetición entre intentos, opciones barajadas y refuerzo pedagógico automático.
                      </p>
                    </div>
                    <button onClick={() => { initNewTestSession(); setActiveTab('prueba-interactiva'); }} className="inline-flex items-center gap-2 text-sm font-bold text-[#00a8cc] hover:text-[#0092b3]">
                      <span>Iniciar Test</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MÓDULO INSTITUCIONAL (HISTORIA, HIMNO, IDENTIDAD) */}
        {activeTab === 'modulo-institucional' && (
          <div className="py-12 bg-slate-50 min-h-[85vh]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-xs font-bold tracking-wider text-[#39a900] uppercase bg-[#39a900]/10 px-3 py-1 rounded-full">
                  Módulo Institucional SENA
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                  Conoce Nuestra Institución
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Explora la historia, el himno oficial y los elementos de identidad corporativa (logo y escudo) que representan al Servicio Nacional de Aprendizaje.
                </p>
              </div>

              {/* Sub-navigation buttons requested by user */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setInstitucionalSubTab('historia')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${institucionalSubTab === 'historia' ? 'bg-[#39a900] text-white ring-2 ring-[#39a900]/50' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <Video className="w-4 h-4" />
                  <span>Historia del Sena</span>
                </button>
                <button 
                  onClick={() => setInstitucionalSubTab('himno')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${institucionalSubTab === 'himno' ? 'bg-[#39a900] text-white ring-2 ring-[#39a900]/50' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <Play className="w-4 h-4" />
                  <span>Himno del Sena</span>
                </button>
                <button 
                  onClick={() => setInstitucionalSubTab('identidad')}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${institucionalSubTab === 'identidad' ? 'bg-[#39a900] text-white ring-2 ring-[#39a900]/50' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Identidad Corporativa</span>
                </button>
              </div>

              {/* Content display based on sub-tab */}
              {institucionalSubTab === 'historia' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Historia del SENA</h3>
                      <p className="text-xs text-slate-500 mt-1">Video institucional sobre los orígenes y evolución del Servicio Nacional de Aprendizaje.</p>
                    </div>
                    <a 
                      href="https://www.youtube.com/watch?v=B3b7T6-h8i4" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver en YouTube</span>
                    </a>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/B3b7T6-h8i4" 
                      title="Historia del SENA" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="bg-[#39a900]/10 border border-[#39a900]/30 rounded-2xl p-6 text-sm text-[#0c3300] space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#39a900]" />
                      <span>Fundación del SENA</span>
                    </h4>
                    <p className="leading-relaxed text-xs text-slate-700">
                      El SENA fue fundado el 21 de junio de 1957 bajo el decreto 118 de ese mismo año, por iniciativa de Rodolfo Martínez Toncel. Nació como un instituto descentralizado del Estado para proporcionar formación profesional a los trabajadores colombianos en el sector industrial, comercial, agropecuario y minero.
                    </p>
                  </div>
                </div>
              )}

              {institucionalSubTab === 'himno' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Himno del SENA</h3>
                      <p className="text-xs text-slate-500 mt-1">Himno oficial que enaltece la labor y el compromiso de los aprendices y trabajadores.</p>
                    </div>
                    <a 
                      href="https://www.youtube.com/watch?v=ZejiOSVZMyI" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ver en YouTube</span>
                    </a>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/ZejiOSVZMyI" 
                      title="Himno del SENA" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">Coro</h4>
                      <blockquote className="text-xs text-slate-600 italic leading-relaxed">
                        "Estudiantes del SENA adelante<br/>
                        por Colombia luchad con amor<br/>
                        la ciencia y la técnica unidas<br/>
                        crearán los rubros del honor."
                      </blockquote>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">Significado</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        El himno fue compuesto con letra de Luis Alfredo Sarmiento y música de Jesús Briceño. Representa la unión entre la ciencia, el trabajo técnico y el orgullo de pertenecer a la gran familia SENA.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {institucionalSubTab === 'identidad' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-slate-900">Identidad Corporativa (Logo y Escudo)</h3>
                    <p className="text-xs text-slate-500 mt-1">Símbolos patrios institucionales que identifican al Servicio Nacional de Aprendizaje.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LOGO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col justify-between space-y-6">
                      <div>
                        <div className="w-24 h-24 rounded-full bg-[#39a900]/10 p-2 flex items-center justify-center mx-auto shadow-md mb-4 border border-[#39a900]/30">
                          <img src="data:image/svg+xml,%3c?xml%20version=%271.0%27%20encoding=%27utf-8%27?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2026.0.1,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version=%271.1%27%20id=%27Capa_1%27%20xmlns=%27http://www.w3.org/2000/svg%27%20xmlns:xlink=%27http://www.w3.org/1999/xlink%27%20x=%270px%27%20y=%270px%27%20viewBox=%270%200%201000%201000%27%20style=%27enable-background:new%200%200%201000%201000;%27%20xml:space=%27preserve%27%3e%3cstyle%20type=%27text/css%27%3e%20.st0{fill:%2339a900;}%20%3c/style%3e%3cpath%20id=%27path47-5%27%20class=%27st0%27%20d=%27M504.2,20.5c-58.3,0.1-105.6,47.4-105.5,105.8c0.1,58.3,47.4,105.6,105.7,105.6%20c58.3,0,105.6-47.3,105.6-105.7V126C609.9,67.6,562.6,20.4,504.2,20.5z%20M155.6,264.6c-18.6,0.1-37.5,1.1-55.2,5.6%20c-11.7,3-23,7.8-30.3,15.4c-9.2,9.5-10.4,22.3-5.9,33.3c4,9.7,14.8,16.9,26.8,21.1c25.9,8.9,54.6,10.7,81.8,16.3%20c5,1.2,10.6,2.6,13.7,6c3.2,4.1,1.3,9.7-4,12.2c-8.8,4.5-20.1,4.5-30.4,4.4c-9.4-0.4-19.7-1.2-27.2-5.9c-5.5-3.4-6.5-9.1-5.2-14.1%20l-60.6,0c-0.2,9.2,1.6,18.9,8.4,26.8c5.6,6.8,14.8,11.5,24.6,14.4c15.7,4.6,32.7,6,49.4,6.4c22.7,0.4,45.8-0.3,67.6-5.4%20c13-3.2,25.8-8.3,34.1-16.6c14.8-14.8,11.3-38.3-8.3-49.8c-9.8-5.7-21.5-9.2-33.4-11.5c-17.5-3.6-35.3-6.3-52.9-9.2%20c-6.2-1.2-12.8-2.3-18-5.2c-5.5-2.9-5.9-9.8-0.3-12.9c7.2-4.1,16.8-4,25.4-4c9.1,0.2,19,0.7,26.5,5c4.2,2.3,5.9,6.3,5.9,10.1%20l57.6-0.1c-0.2-7.3-1.6-14.9-6.9-21.2c-6.2-7.8-17.1-12.7-28.3-15.5C192.8,265.6,174.1,264.7,155.6,264.6L155.6,264.6z%20M280.6,268.9%20l0,137.7l168.1,0l0-30H342.3v-26.7h94.9v-29.3h-94.9l0-21.9l102.6,0l-0.1-29.7L280.6,268.9z%20M557.5,269c0,0-51.9,0-77.9,0l0,137.7%20l59,0l0-92.7l80.8,92.6l81,0.1l0-137.7l-59.1,0l0.1,92L557.5,269z%20M805.6,269.2c0,0-63.6,91.9-95.6,137.7l61.9,0l14.9-24.8h95.7%20l13.9,24.9l68.8,0L874,269.2L805.6,269.2z%20M836.6,302.1l29.4,49.9l-60.7,0.1L836.6,302.1z%20M10.6,445.6l0.5,75l280.1-1%20c14.3,3.1,22.6,12.4,19.7,33.5L138.6,854.7l56.1,52.5l266.9-461.6L10.6,445.6z%20M545.2,446.2l262.4,459.6l58-52.1L691.3,552.9%20c-2.9-21.2,5.4-30.6,19.7-33.7l280.2,1l-0.1-73.7L545.2,446.2z%20M500.9,522.3L254.8,944.7l65.4,31.9L484.4,699%20c5.7-4.6,11.4-7.1,17.1-7.3c6-0.2,12.2,2,18.3,6.8l163.8,278.4l67.4-35.2L500.9,522.3z%27/%3e%3cg%20id=%27_x23_000000ff-2%27%20transform=%27matrix(0.31570611,0,0,0.23560774,-391.49698,-10.601126)%27%3e%3c/g%3e%3c/svg%3e" alt="SENA Logo" className="w-full h-full object-contain" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">El Logotipo</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          Refleja los tres sectores económicos en los que opera la institución: el piñón representa al <strong>sector industrial</strong>, el caduceo al <strong>sector de comercio y servicios</strong>, y el café al <strong>sector agropecuario</strong>.
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-[#39a900]/10 text-[#39a900] text-[10px] font-bold rounded-full w-fit mx-auto">
                        Símbolo Oficial Institucional
                      </span>
                    </div>

                    {/* ESCUDO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center flex flex-col justify-between space-y-6">
                      <div>
                        <div className="w-24 h-24 rounded-2xl bg-[#39a900]/10 p-2 flex items-center justify-center mx-auto shadow-md mb-4 border border-[#39a900]/30">
                          <img src="https://www.sena.edu.co/assets/escudo-CKAC4aSg.png" alt="SENA Escudo" className="w-full h-full object-contain" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">El Escudo</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          Diseñado junto a la fundación de la entidad, el escudo representa los valores éticos, la libertad, el esfuerzo conjunto y el compromiso con el desarrollo económico y social de Colombia.
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-[#39a900]/10 text-[#39a900] text-[10px] font-bold rounded-full w-fit mx-auto">
                        Heráldica Institucional SENA
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#39a900]/10 border border-[#39a900]/30 rounded-2xl p-6 text-xs text-[#0c3300] space-y-2">
                    <h4 className="font-bold">Uso de la Marca SENA</h4>
                    <p className="text-slate-700 leading-relaxed">
                      El uso del logo, escudo y nombre del SENA está regulado por normativas institucionales de imagen corporativa. Su reproducción debe mantener los colores institucionales (#39a900 y #004884) y respetar las proporciones oficiales.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD TAB */}
        {activeTab === 'admin-dashboard' && (
          <div className="py-12 bg-slate-100 min-h-[85vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#39a900] uppercase bg-[#39a900]/10 px-3 py-1 rounded-full w-fit mb-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Panel de Control Administrativo</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    Analítica y Base de Datos de Evaluaciones
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Visualiza métricas de rendimiento, estadísticas de aprobación y los registros detallados de los aprendices evaluados.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={fetchEvaluacionesDB} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>Actualizar Datos</span>
                  </button>
                  <button onClick={() => { initNewTestSession(); setActiveTab('prueba-interactiva'); }} className="px-4 py-2.5 bg-[#39a900] hover:bg-[#319200] text-white text-xs font-semibold rounded-xl shadow flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    <span>Probar Test</span>
                  </button>
                </div>
              </div>

              {/* ANALYTIC KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Evaluaciones</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalEvaluaciones}</h3>
                    <span className="text-xs text-[#39a900] font-semibold mt-1 inline-block">Registros en servidor</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#39a900]/10 text-[#39a900] flex items-center justify-center font-bold">
                    <Database className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Aprobación</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{tasaAprobacion}%</h3>
                    <span className="text-xs text-[#39a900] font-semibold mt-1 inline-block">{aprobadosCount} aprobados</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#39a900]/10 text-[#39a900] flex items-center justify-center font-bold">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio de Aciertos</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{promedioPuntaje}%</h3>
                    <span className="text-xs text-slate-500 font-semibold mt-1 inline-block">Puntaje global</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#39a900]/10 text-[#39a900] flex items-center justify-center font-bold">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Banco de Preguntas</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">50</h3>
                    <span className="text-xs text-[#39a900] font-semibold mt-1 inline-block">Preguntas oficiales</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#39a900]/10 text-[#39a900] flex items-center justify-center font-bold">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* DETAILED DATABASE RECORDS TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-[#39a900]" />
                    <span>Módulos de Respuestas y Base de Datos de Evaluaciones</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">Mostrando {evaluacionesDB.length} registros</span>
                </div>

                {loadingDB ? (
                  <div className="text-center py-12 text-slate-500 text-sm">Cargando base de datos de respuestas...</div>
                ) : evaluacionesDB.length === 0 ? (
                  <div className="p-12 text-center space-y-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Database className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800">No hay evaluaciones registradas en la base de datos</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Realiza una prueba desde el módulo de test dinámico para almacenar los primeros datos de respuestas.</p>
                    <button onClick={() => { initNewTestSession(); setActiveTab('prueba-interactiva'); }} className="px-4 py-2 bg-[#39a900] text-white text-xs font-semibold rounded-xl">Iniciar Test Ahora</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                          <th className="p-4">ID / Fecha</th>
                          <th className="p-4">Aprendiz</th>
                          <th className="p-4">Documento</th>
                          <th className="p-4">Regional / Centro</th>
                          <th className="p-4">Programa</th>
                          <th className="p-4">Puntaje</th>
                          <th className="p-4">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {evaluacionesDB.slice().reverse().map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-4 font-mono text-[10px] text-slate-500">
                              #{item.id}<br/>{new Date(item.fechaCreacion || item.fecha).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold text-slate-900">
                              {item.aprendiz?.nombres || 'N/A'}
                              <div className="text-[10px] text-slate-500 font-normal">{item.aprendiz?.correo}</div>
                            </td>
                            <td className="p-4">
                              {item.aprendiz?.tipoDocumento}: {item.aprendiz?.numeroDocumento}
                            </td>
                            <td className="p-4">
                              {item.aprendiz?.regional}
                              <div className="text-[10px] text-slate-500">{item.aprendiz?.centroFormacion}</div>
                            </td>
                            <td className="p-4">
                              {item.aprendiz?.programaFormacion}
                            </td>
                            <td className="p-4 font-bold">
                              {item.resultado?.puntaje} / {item.resultado?.totalPreguntas} ({item.resultado?.porcentaje}%)
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.resultado?.aprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {item.resultado?.aprobado ? 'APROBADO' : 'NO APROBADO'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* MODULO DE DATOS BÁSICOS DEL APRENDIZ */}
        {activeTab === 'datos-aprendiz' && (
          <div className="py-12 bg-slate-50 min-h-[85vh]">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <span className="text-xs font-bold tracking-wider text-[#39a900] uppercase bg-[#39a900]/10 px-3 py-1 rounded-full">
                  Módulo de Registro Institucional
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-3">
                  Datos Básicos del Aprendiz
                </h2>
                <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
                  Ingresa tu información para asociar tus calificaciones y respuestas al sistema de base de datos de inducción SENA.
                </p>
              </div>

              <form onSubmit={handleDatosSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombres y Apellidos Completos *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. María Camila Pérez Gómez"
                    value={datosAprendiz.nombres}
                    onChange={e => setDatosAprendiz({ ...datosAprendiz, nombres: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tipo de Documento *</label>
                    <select 
                      value={datosAprendiz.tipoDocumento}
                      onChange={e => setDatosAprendiz({ ...datosAprendiz, tipoDocumento: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                    >
                      <option>Cédula de Ciudadanía</option>
                      <option>Tarjeta de Identidad</option>
                      <option>Cédula de Extranjería</option>
                      <option>Permiso Especial de Permanencia (PEP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Número de Documento *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. 1098765432"
                      value={datosAprendiz.numeroDocumento}
                      onChange={e => setDatosAprendiz({ ...datosAprendiz, numeroDocumento: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Correo Electrónico Institucional / Personal *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Ej. mcperez@sena.edu.co"
                    value={datosAprendiz.correo}
                    onChange={e => setDatosAprendiz({ ...datosAprendiz, correo: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Regional SENA *</label>
                    <select 
                      value={datosAprendiz.regional}
                      onChange={e => {
                        const reg = REGIONALES_SENA.find(r => r.nombre === e.target.value);
                        setDatosAprendiz({ 
                          ...datosAprendiz, 
                          regional: e.target.value,
                          centroFormacion: reg ? reg.centros[0] : datosAprendiz.centroFormacion
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                    >
                      {REGIONALES_SENA.map(r => (
                        <option key={r.id} value={r.nombre}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Centro de Formación *</label>
                    <select 
                      value={datosAprendiz.centroFormacion}
                      onChange={e => setDatosAprendiz({ ...datosAprendiz, centroFormacion: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                    >
                      {REGIONALES_SENA.find(r => r.nombre === datosAprendiz.regional)?.centros.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Programa de Formación *</label>
                  <input 
                    type="text" 
                    required
                    value={datosAprendiz.programaFormacion}
                    onChange={e => setDatosAprendiz({ ...datosAprendiz, programaFormacion: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900]"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-3.5 bg-[#39a900] hover:bg-[#319200] text-white font-bold rounded-xl flex items-center gap-2 shadow"
                  >
                    <span>Guardar e Iniciar Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MÓDULO DE DERECHOS Y DEBERES (ACUERDO 009 DE 2024) */}
        {activeTab === 'derechos-interactivos' && (
          <div className="py-12 bg-slate-50 min-h-[85vh]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <span className="text-xs font-bold tracking-wider text-[#39a900] uppercase bg-[#39a900]/10 px-3 py-1 rounded-full">
                  Marco Normativo Oficial · Acuerdo 009 de 2024
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-3">
                  Módulo de Derechos, Deberes y Prohibiciones del Aprendiz SENA
                </h2>
                <p className="text-slate-600 text-sm mt-2 max-w-2xl mx-auto">
                  Información oficial extraída del Reglamento del Aprendiz SENA. Selecciona una categoría o busca términos específicos para conocer las normativas vigentes.
                </p>
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button 
                  onClick={() => setRightsCategory('derechos')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${rightsCategory === 'derechos' ? 'bg-[#39a900] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Derechos del Aprendiz (Art. 5)</span>
                </button>
                <button 
                  onClick={() => setRightsCategory('deberes')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${rightsCategory === 'deberes' ? 'bg-[#39a900] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Deberes del Aprendiz (Art. 8)</span>
                </button>
                <button 
                  onClick={() => setRightsCategory('prohibiciones')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${rightsCategory === 'prohibiciones' ? 'bg-[#39a900] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prohibiciones (Art. 9)</span>
                </button>
              </div>

              {/* Search bar */}
              <div className="max-w-md mx-auto mb-8">
                <input 
                  type="text" 
                  placeholder="Buscar en derechos, deberes o prohibiciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39a900] shadow-sm"
                />
              </div>

              {/* Content items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(rightsCategory === 'derechos' ? reglamentoJson.capitulos[1].articulos[0].items :
                  rightsCategory === 'deberes' ? reglamentoJson.capitulos[2].articulos[0].items :
                  reglamentoJson.capitulos[2].articulos[1].items
                )
                .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#39a900] transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#39a900]/10 text-[#39a900] border border-[#39a900]/30">
                          {rightsCategory === 'derechos' ? 'Derecho SENA (Art. 5)' : rightsCategory === 'deberes' ? 'Deber Fundamental (Art. 8)' : 'Prohibición Vigente (Art. 9)'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">
                        {item}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Acuerdo 009 de 2024</span>
                      <span className="text-[#39a900] font-bold group-hover:underline">Norma Oficial SENA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRUEBA INTERACTIVA CON BANCO DE 50 PREGUNTAS (SIN REPETIR) */}
        {activeTab === 'prueba-interactiva' && (
          <div className="py-12 bg-slate-50 min-h-[85vh]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {!datosGuardados && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      Aún no has registrado tus datos básicos. Te recomendamos guardarlos para asegurar que tu evaluación quede registrada en la base de datos con tu nombre.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('datos-aprendiz')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl whitespace-nowrap">
                    Registrar Datos
                  </button>
                </div>
              )}

              <div className="mb-8 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#39a900] uppercase bg-[#39a900]/10 px-3 py-1 rounded-full">
                    Banco de 50 Preguntas · Sin Repetición
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-3">
                    Evaluación Dinámica Aleatoria
                  </h2>
                </div>
                <button onClick={initNewTestSession} className="px-4 py-2 bg-[#004884] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#003b6e]">
                  <Shuffle className="w-3.5 h-3.5 text-[#00a8cc]" />
                  <span>Nuevas Preguntas</span>
                </button>
              </div>

              {!testFinished && currentQ ? (
                <div className={`bg-white border rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
                  answerStatus === 'correct' ? 'border-[#39a900] shadow-emerald-100 shadow-lg ring-2 ring-[#39a900]/50' :
                  answerStatus === 'incorrect' ? 'border-rose-400 shadow-rose-100 shadow-lg ring-2 ring-rose-300 animate-shake' :
                  'border-slate-200'
                }`}>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-6 pb-3 border-b border-slate-100">
                    <span>Pregunta {testIndex + 1} de {shuffledQuestions.length} (ID: {currentQ.id})</span>
                    <span>Puntuación: {testScore} aciertos</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    {currentQ.pregunta}
                  </h3>

                  <div className="space-y-3 mb-6">
                    {currentQ.opciones.map((opcion: string, idx: number) => {
                      let btnStyle = 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white';
                      if (selectedOption !== null) {
                        if (idx === currentQ.respuestaCorrecta) {
                          btnStyle = 'border-[#39a900] bg-[#39a900]/10 text-[#0c3300] font-bold ring-2 ring-[#39a900]/50';
                        } else if (idx === selectedOption) {
                          btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                        } else {
                          btnStyle = 'border-slate-200 opacity-60 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={answerStatus !== null}
                          onClick={() => handleAnswerSubmit(idx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm ${btnStyle}`}
                        >
                          <span>{opcion}</span>
                          {selectedOption !== null && idx === currentQ.respuestaCorrecta && (
                            <Check className="w-5 h-5 text-[#39a900] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {answerStatus === 'correct' && (
                    <div className="p-4 bg-[#39a900]/10 border border-[#39a900]/30 rounded-xl mb-6 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#39a900] text-white flex items-center justify-center font-bold shrink-0">✓</div>
                      <div>
                        <h4 className="font-bold text-[#0c3300] text-sm">¡Excelente respuesta!</h4>
                        <p className="text-xs text-slate-700 mt-1">Has comprendido correctamente la normatividad.</p>
                      </div>
                    </div>
                  )}

                  {answerStatus === 'incorrect' && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-6 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">!</div>
                      <div>
                        <h4 className="font-bold text-rose-900 text-sm">¡Respuesta Incorrecta! Refuerzo Pedagógico</h4>
                        <p className="text-xs text-rose-800 mt-1 leading-relaxed">{currentQ.refuerzoPedagogico}</p>
                      </div>
                    </div>
                  )}

                  {answerStatus !== null && (
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button 
                        onClick={handleNextQuestion}
                        className="px-6 py-3 bg-[#39a900] hover:bg-[#319200] text-white font-bold rounded-xl flex items-center gap-2 shadow"
                      >
                        <span>{testIndex + 1 < shuffledQuestions.length ? 'Siguiente Pregunta' : 'Finalizar y Guardar en DB'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              ) : testFinished ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6 relative overflow-hidden">
                  {testScore >= 3 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-4 left-1/4 text-yellow-400 text-2xl star-fall" style={{ animationDelay: '0s' }}>★</div>
                      <div className="absolute top-2 left-1/2 text-yellow-500 text-xl star-fall" style={{ animationDelay: '0.4s' }}>★</div>
                      <div className="absolute top-6 left-3/4 text-yellow-400 text-3xl star-fall" style={{ animationDelay: '0.8s' }}>★</div>
                    </div>
                  )}

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold ${testScore >= 3 ? 'bg-[#39a900]/10 text-[#39a900]' : 'bg-rose-100 text-rose-800'}`}>
                    {testScore >= 3 ? '🏆' : '📚'}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    {testScore >= 3 ? '¡Felicitaciones! Prueba Superada' : '¡Sigue Intentándolo!'}
                  </h3>

                  {guardandoDB ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 animate-pulse">
                      Guardando evaluación en la base de datos del servidor...
                    </div>
                  ) : dbGuardadoExitoso ? (
                    <div className="p-4 bg-[#39a900]/10 border border-[#39a900]/30 rounded-xl text-xs text-[#0c3300] flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#39a900]" />
                      <span>¡Resultado y datos de aprendiz almacenados en la base de datos exitosamente!</span>
                    </div>
                  ) : null}

                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Aciertos: <strong className={testScore >= 3 ? 'text-[#39a900] font-bold' : 'text-rose-600 font-bold'}>{testScore}</strong> de {shuffledQuestions.length}.
                    {datosGuardados && <span className="block text-xs text-slate-500 mt-1">Aprendiz registrado: {datosAprendiz.nombres} ({datosAprendiz.numeroDocumento})</span>}
                  </p>

                  <div className="pt-4 flex flex-wrap justify-center gap-4">
                    <button onClick={restartTest} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl inline-flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /><span>Nuevo Test (Preguntas Sin Repetir)</span>
                    </button>
                    {testScore >= 3 && (
                      <button onClick={() => setActiveTab('db-records')} className="px-6 py-3 bg-[#39a900] hover:bg-[#319200] text-white font-bold rounded-xl inline-flex items-center gap-2 shadow">
                        <Database className="w-4 h-4" /><span>Ver Registros en Base de Datos</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Servicio Nacional de Aprendizaje (SENA) · Base de Datos y Prototipo Interactivo.</p>
          <div className="flex items-center gap-6">
            <span>Resolución 1825 de 2024</span>
            <span>Acuerdo 009 de 2024</span>
            <a href="https://www.sena.edu.co" target="_blank" rel="noopener noreferrer" className="hover:text-[#39a900] font-medium">sena.edu.co</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

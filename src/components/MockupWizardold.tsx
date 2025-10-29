import React, { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { HexColorPicker } from "react-colorful";
import { toPng } from "html-to-image";

// --- shadcn/ui ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Download, Sparkles, Undo2 } from "lucide-react";

/**
 * Yapay Zeka Destekli Ürün Mockup Sihirbazı - Animasyonlu Versiyon
 * 
 * Özellikler:
 * 1) Typewriter animasyonlu hoşgeldin mesajı
 * 2) Tek tek soru akışı (bir soru cevaplandıktan sonra sıradaki gelir)
 * 3) Mockup sadece en sonda gösterilir (sürpriz efekti)
 * 4) Smooth geçişler ve animasyonlar
 */

// ——— Soru Modeli
type QType = "single" | "text";
type Question = {
  id: string;
  type: QType;
  question: string;
  options?: string[];
  placeholder?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "product",
    type: "single",
    question: "Hangi ürün için tasarım yapıyorsunuz?",
    options: ["Rulo Islak Havlu", "Peçete", "Islak Mendil", "Özel (Diğer)"]
  },
  {
    id: "style",
    type: "single",
    question: "Genel görsel stil seçin",
    options: ["Minimal", "Modern", "Klasik", "Sportif"]
  },
  {
    id: "mood",
    type: "single",
    question: "Marka ruhu (mood) nedir?",
    options: ["Taze & Ferah", "Doğal & Sade", "Enerjik", "Premium"]
  },
  {
    id: "notes",
    type: "text",
    question: "Kısa notlar (slogan, ana renk, kısıtlar)…",
    placeholder: "Örn: Mentollü, mavi tonlar, sade yazı tipi"
  }
];

// ——— Typewriter Hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    let i = 0;
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

// ——— Cevapları AI önerilerine çeviren kural seti
function suggestDefaults(answers: Record<string, string>) {
  let color = "#3a6ea5";
  let variant: "pillow" | "flat" = "pillow";

  const mood = (answers["mood"] || "").toLowerCase();
  const style = (answers["style"] || "").toLowerCase();
  const product = (answers["product"] || "").toLowerCase();

  if (mood.includes("ferah") || product.includes("ıslak")) color = "#3A83C1";
  if (mood.includes("doğal")) color = "#4DAA57";
  if (mood.includes("enerjik")) color = "#E86A33";
  if (mood.includes("premium")) color = "#0F172A";

  if (style.includes("minimal")) variant = "flat";
  if (style.includes("klasik")) variant = "pillow";

  return { color, variant };
}

// ——— Yardımcı: Dosyayı Base64 DataURL'a çevir
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// ——— Basit Flow-Pack (Pillow) SVG
function PillowPack({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 900 300" className="w-full h-auto">
      <rect x="0" y="0" width="900" height="300" fill="#f7f7f8" />
      <defs>
        <linearGradient id="crimp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d6d7da" />
          <stop offset="50%" stopColor="#f0f1f3" />
          <stop offset="100%" stopColor="#c7c8cc" />
        </linearGradient>
        <radialGradient id="bodyShade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9eaee" />
        </radialGradient>
      </defs>
      <rect x="80" y="40" width="90" height="220" fill="url(#crimp)" rx="8" />
      <rect x="730" y="40" width="90" height="220" fill="url(#crimp)" rx="8" />
      <g>
        <rect x="120" y="50" width="660" height="200" rx="28" fill="url(#bodyShade)" />
        <rect x="120" y="50" width="660" height="200" rx="28" fill={color} opacity={0.15} />
        <rect x="120" y="50" width="660" height="200" rx="28" fill="#000" opacity={0.06} />
      </g>
      <rect x="220" y="110" width="460" height="80" rx="16" fill="#ffffff" opacity={0.35} />
    </svg>
  );
}

// ——— Düz (Flat) paket
function FlatPack({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 900 300" className="w-full h-auto">
      <rect x="0" y="0" width="900" height="300" fill="#f7f7f8" />
      <defs>
        <linearGradient id="flatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eceef3" />
        </linearGradient>
      </defs>
      <rect x="120" y="70" width="660" height="160" rx="14" fill="url(#flatGrad)" />
      <rect x="120" y="70" width="660" height="160" rx="14" fill={color} opacity={0.18} />
      <rect x="210" y="115" width="480" height="70" rx="10" fill="#ffffff" opacity={0.35} />
    </svg>
  );
}

// ——— Ana Bileşen
export default function MockupWizard() {
  // Ana state'ler
  const [phase, setPhase] = useState<"welcome" | "questions" | "logo" | "preparing" | "mockup">("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  // Mockup kontrolleri
  const [mockupColor, setMockupColor] = useState<string>("#3a6ea5");
  const [mockupType, setMockupType] = useState<"pillow" | "flat">("pillow");

  // Logo kontrolleri
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoOpacity, setLogoOpacity] = useState<number>(100);
  const [logoRotation, setLogoRotation] = useState<number>(0);
  const [logoBlendMultiply, setLogoBlendMultiply] = useState<boolean>(false);
  const [logoSize, setLogoSize] = useState<{ w: number; h: number }>({ w: 280, h: 110 });
  const [logoPos, setLogoPos] = useState<{ x: number; y: number }>({ x: 310, y: 105 });

  const exportRef = useRef<HTMLDivElement>(null);

  // Typewriter animasyonu
  const welcomeText = "Yapay Zeka Destekli Ürün Oluşturma Sihirbazına Hoşgeldiniz";
  const { displayText, isComplete } = useTypewriter(welcomeText, 80);

  // Mevcut soru
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  // Cevap verme
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    // Direk geçiş - bekleme yok
    if (isLastQuestion) {
      // Tüm sorular bitti, logo yükleme aşamasına geç
      const suggestions = suggestDefaults({ ...answers, [currentQuestion.id]: value });
      setMockupColor(suggestions.color);
      setMockupType(suggestions.variant);
      setPhase("logo");
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Hoşgeldin ekranından sorulara geçiş
  const startQuestions = () => {
    setPhase("questions");
  };

  // Logo yükleme
  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataURL(file);
    setLogoDataUrl(url);
  };

  // Logo yüklendikten sonra mockup hazırlama aşamasına geç
  const startMockupPreparation = () => {
    setPhase("preparing");
    setProgress(0);
    
    // Progress bar animasyonu - 10 saniye boyunca
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setPhase("mockup");
          return 100;
        }
        return prev + 1; // Her 100ms'de %1 artır (10 saniye = 10000ms / 100 = 100ms)
      });
    }, 100);
  };

  const resetLogo = () => {
    setLogoDataUrl(null);
    setLogoOpacity(100);
    setLogoRotation(0);
    setLogoBlendMultiply(false);
    setLogoSize({ w: 280, h: 110 });
    setLogoPos({ x: 310, y: 105 });
  };

  const downloadPng = async () => {
    if (!exportRef.current) return;
    const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `mockup_${Date.now()}.png`;
    a.click();
  };

  const Mockup = useMemo(() => (mockupType === "pillow" ? PillowPack : FlatPack), [mockupType]);

  // Logo yüklendiğinde otomatik ortala
  useEffect(() => {
    if (phase === "mockup" && logoDataUrl) {
      // Logo'yu merkeze yerleştir
      setLogoPos({ x: 310, y: 105 });
    }
  }, [phase, logoDataUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        
        {/* HOŞGELDİN EKRANI */}
        {phase === "welcome" && (
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-20 right-16 w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-25 animate-pulse delay-1000"></div>
            <div className="absolute bottom-16 left-20 w-10 h-10 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
            <div className="absolute bottom-20 right-12 w-14 h-14 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-15 animate-pulse delay-500"></div>
            
            <div className="p-8 text-center space-y-6 relative z-10">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <Sparkles className="relative w-16 h-16 mx-auto text-blue-500 animate-bounce" />
                </div>
                
                <div className="min-h-[3rem] flex items-center justify-center">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {displayText}
                    {!isComplete && <span className="animate-pulse text-blue-500">|</span>}
                  </h1>
                </div>
              </div>
              
              {isComplete && (
                <div className="space-y-6 animate-fade-in">
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">Hızlı & Kolay</h3>
                      <p className="text-xs text-gray-600">Sadece birkaç tıkla profesyonel mockup'lar oluşturun</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">AI Destekli</h3>
                      <p className="text-xs text-gray-600">Yapay zeka size en uygun renk ve stili önerir</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 text-sm">Özelleştirilebilir</h3>
                      <p className="text-xs text-gray-600">Logonuzu ekleyin ve istediğiniz gibi düzenleyin</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="flex justify-center">
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed text-center">
                      Size özel ürün mockup'ları oluşturmak için birkaç basit soru soracağım. 
                      Cevaplarınıza göre yapay zeka destekli öneriler sunacağım.
                    </p>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={startQuestions}
                      size="lg"
                      className="start-button px-12 py-6 text-xl font-semibold shadow-xl"
                    >
                      Başlayalım <ChevronRight className="w-6 h-6 ml-3" />
                    </Button>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 pt-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Ücretsiz</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Hızlı</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Profesyonel</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SORULAR EKRANI */}
        {phase === "questions" && (
          <div className="p-8 min-h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-8">
                  {QUESTIONS.map((_, index) => (
                    <div key={index} className="relative">
                      <div
                        className={`w-6 h-6 rounded-full transition-all duration-500 ${
                          index < currentQuestionIndex 
                            ? "bg-gradient-to-r from-green-400 to-green-600 scale-110 shadow-lg" 
                            : index === currentQuestionIndex 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse scale-125 shadow-xl" 
                            : "bg-gray-300"
                        }`}
                      />
                      {index < currentQuestionIndex && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 text-white">✓</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 inline-block">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Soru {currentQuestionIndex + 1} / {QUESTIONS.length}
                  </h2>
                </div>
              </div>

              <div className="text-center space-y-8 animate-slide-in">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">
                    {currentQuestion.question}
                  </h2>

                {currentQuestion.type === "single" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {currentQuestion.options!.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        size="lg"
                        onClick={() => handleAnswer(option)}
                        className="option-button p-6 text-left text-base"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <Input
                      placeholder={currentQuestion.placeholder}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      className="text-lg p-4 border-2 focus:border-blue-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && answers[currentQuestion.id]) {
                          handleAnswer(answers[currentQuestion.id]);
                        }
                      }}
                    />
                    {answers[currentQuestion.id] && (
                      <Button
                        onClick={() => handleAnswer(answers[currentQuestion.id])}
                        className="continue-button w-full"
                        size="lg"
                      >
                        Devam Et <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGO YÜKLEME EKRANI */}
        {phase === "logo" && (
          <div className="p-8 min-h-[500px] flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50">
            <div className="w-full max-w-2xl text-center space-y-8">
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <h2 className="relative text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ✨ Logonuzu Ekleyin ✨
                  </h2>
                </div>
                <p className="text-xl text-gray-600 max-w-lg mx-auto">
                  Son adım! Logonuzu yükleyin ve sürpriz tasarımınızı görün.
                </p>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl p-12 hover:border-purple-500 transition-all duration-300 group-hover:shadow-2xl">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={onLogoChange}
                        className="text-base bg-white/50"
                      />
                      <p className="text-sm text-gray-600">PNG, JPG veya SVG dosyası seçin</p>
                    </div>
                  </div>
                </div>

                {logoDataUrl && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg border bg-gray-50 flex items-center justify-center">
                      <img src={logoDataUrl} alt="Logo önizleme" className="max-h-32 object-contain" />
                    </div>
                    <Button 
                      onClick={startMockupPreparation}
                      className="start-button w-full text-lg py-6"
                      size="lg"
                    >
                      Tasarımımı Göster! ✨
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HAZIRLANMA EKRANI */}
        {phase === "preparing" && (
          <div className="p-8">
            <CardContent className="space-y-6">
              <div className="text-center py-16 space-y-6">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <div className="space-y-4">
                  <p className="text-xl text-gray-600">Tasarımınız hazırlanıyor...</p>
                  <p className="text-sm text-gray-400">Cevaplarınıza göre en uygun renk ve stil seçiliyor</p>
                </div>
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">%{progress} tamamlandı</p>
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <p>🎨 Renk paleti analiz ediliyor...</p>
                  <p>🔧 Mockup şablonu hazırlanıyor...</p>
                  <p>✨ Son rötuşlar yapılıyor...</p>
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* MOCKUP EKRANI */}
        {phase === "mockup" && (
          <div className="p-6">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl text-gray-800 flex items-center justify-center space-x-3">
                <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
                <span>Tasarımınız Hazır!</span>
                <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                  {/* Mockup Önizleme */}
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border-2 p-6 bg-white shadow-xl" ref={exportRef}>
                      <div className="relative">
                        <Mockup color={mockupColor} />
                        
                        {/* Logo Katmanı */}
                        {logoDataUrl && (
                          <Rnd
                            size={{ width: logoSize.w, height: logoSize.h }}
                            position={{ x: logoPos.x, y: logoPos.y }}
                            bounds="parent"
                            onDragStop={(e, d) => setLogoPos({ x: d.x, y: d.y })}
                            onResizeStop={(e, dir, ref, delta, pos) => {
                              setLogoSize({ w: ref.offsetWidth, h: ref.offsetHeight });
                              setLogoPos({ x: pos.x, y: pos.y });
                            }}
                            className="select-none"
                          >
                            <div
                              className="w-full h-full flex items-center justify-center rounded-md shadow-sm border bg-white/0"
                              style={{
                                mixBlendMode: logoBlendMultiply ? ("multiply" as any) : ("normal" as any),
                                opacity: logoOpacity / 100,
                                transform: `rotate(${logoRotation}deg)`
                              }}
                            >
                              <img src={logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain pointer-events-none" />
                            </div>
                          </Rnd>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kontroller */}
                  <div className="space-y-6">
                    {/* Renk Kontrolü */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Renk Paleti</Label>
                      <div className="space-y-4">
                        <HexColorPicker color={mockupColor} onChange={setMockupColor} />
                        <div className="flex flex-wrap gap-3">
                          {["#3A83C1", "#4DAA57", "#E86A33", "#0F172A", "#6B7280", "#F59E0B"].map((c) => (
                            <button
                              key={c}
                              className="w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200"
                              style={{ background: c }}
                              onClick={() => setMockupColor(c)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mockup Tipi */}
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">Mockup Tipi</Label>
                      <Select value={mockupType} onValueChange={(v: any) => setMockupType(v)}>
                        <SelectTrigger className="text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pillow">Flow Pack (Rulo)</SelectItem>
                          <SelectItem value="flat">Flat Pack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Logo Kontrolleri */}
                    {logoDataUrl && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold">Logo Ayarları</Label>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm">Opaklık: {logoOpacity}%</Label>
                            <Slider value={[logoOpacity]} min={0} max={100} step={1} onValueChange={(v) => setLogoOpacity(v[0])} className="mt-2" />
                          </div>
                          <div>
                            <Label className="text-sm">Döndür: {logoRotation}°</Label>
                            <Slider value={[logoRotation]} min={-45} max={45} step={1} onValueChange={(v) => setLogoRotation(v[0])} className="mt-2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Çarp (multiply) karışım</Label>
                            <Switch checked={logoBlendMultiply} onCheckedChange={setLogoBlendMultiply} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* İndir */}
                    <Button onClick={downloadPng} className="download-button w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" /> PNG Olarak İndir
                    </Button>
                  </div>
                </div>
            </CardContent>
          </div>
        )}
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }

        /* Özel hover efektleri */
        .option-button {
          background: white !important;
          border: 2px solid #d1d5db !important;
          color: #374151 !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }
        
        .option-button:hover {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .start-button {
          background: #2563eb !important;
          border: 2px solid #2563eb !important;
          color: white !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .start-button:hover {
          background: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
          transform: scale(1.1) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }

        .continue-button {
          background: #2563eb !important;
          border: 2px solid #2563eb !important;
          color: white !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .continue-button:hover {
          background: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .download-button {
          background: #16a34a !important;
          border: 2px solid #16a34a !important;
          color: white !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .download-button:hover {
          background: #15803d !important;
          border-color: #15803d !important;
          transform: scale(1.05) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .reset-button {
          background: white !important;
          border: 2px solid #d1d5db !important;
          color: #374151 !important;
          transition: all 0.3s ease !important;
        }

        .reset-button:hover {
          background: #fef2f2 !important;
          border-color: #fca5a5 !important;
          color: #dc2626 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        `
      }} />
    </div>
  );
}

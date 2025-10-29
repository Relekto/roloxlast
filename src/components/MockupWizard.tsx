import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ChevronRight, Sparkles, Zap, Heart, Star, Sun, Moon, Download, Mail, MessageCircle, RotateCw } from "lucide-react";

// Typewriter hook
function useTypewriter(text: string, speed: number = 100) {
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

// Sorular
const QUESTIONS = [
  {
    id: 1,
    question: "Şirketinizin adı nedir?",
    type: "text",
    placeholder: "Şirket adınızı yazın..."
  },
  {
    id: 2,
    question: "Test Sorusu 1: Hangi rengi tercih edersiniz?",
    type: "choice",
    options: ["A) Mavi", "B) Kırmızı", "C) Yeşil", "D) Sarı"]
  },
  {
    id: 3,
    question: "Test Sorusu 2: Hangi stili beğenirsiniz?",
    type: "choice",
    options: ["A) Modern", "B) Klasik", "C) Minimalist", "D) Renkli"]
  },
  {
    id: 4,
    question: "Test Sorusu 3: Hangi sektörde çalışıyorsunuz?",
    type: "choice",
    options: ["A) Teknoloji", "B) Sağlık", "C) Eğitim", "D) Finans"]
  },
  {
    id: 5,
    question: "Test Sorusu 4: Hedef kitleniz kimdir?",
    type: "choice",
    options: ["A) Gençler", "B) Yetişkinler", "C) Çocuklar", "D) Hepsi"]
  },
  {
    id: 6,
    question: "Test Sorusu 5: Hangi platform önceliğiniz?",
    type: "choice",
    options: ["A) Web", "B) Mobil", "C) Sosyal Medya", "D) Hepsi"]
  }
];

export default function MockupWizard() {
  const welcomeText = "Yapay Zeka Destekli Ürün Oluşturma Sihirbazına Hoşgeldiniz";
  const { displayText, isComplete } = useTypewriter(welcomeText, 80);
  const [isDark, setIsDark] = useState(false); // Light tema ile başla
  
  // Wizard state'leri
  const [currentPhase, setCurrentPhase] = useState<"welcome" | "questions" | "logo" | "email" | "preparing" | "result">("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  
  // Mockup state'leri
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 }); // Yüzde olarak
  const [logoSize, setLogoSize] = useState(20); // Yüzde olarak
  const [logoRotation, setLogoRotation] = useState(0); // Derece
  const [mockupColor, setMockupColor] = useState("#3A83C1"); // RGB hex
  const mockupRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const startQuestions = () => {
    setCurrentPhase("questions");
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Sonraki soruya geç veya logo ekranına git
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setCurrentPhase("logo");
      }, 300);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Logo'yu base64'e çevir
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoDataUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const goToEmail = () => {
    setCurrentPhase("email");
  };

  const isValidEmail = (email: string) => {
    return email.includes("@") && email.length > 3;
  };

  const handleEmailSubmit = () => {
    if (isValidEmail(email)) {
      setCurrentPhase("preparing");
      setProgress(0);
      
      // 10 saniyelik progress bar animasyonu
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setCurrentPhase("result");
            return 100;
          }
          return prev + 1;
        });
      }, 100); // Her 100ms'de %1 artır (10 saniye toplam)
    }
  };

  // Mockup utility fonksiyonları
  const handleLogoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...logoPosition };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = ((e.clientX - startX) / 400) * 100; // 400px mockup genişliği varsayımı
      const deltaY = ((e.clientY - startY) / 300) * 100; // 300px mockup yüksekliği varsayımı
      
      setLogoPosition({
        x: Math.max(0, Math.min(100, startPos.x + deltaX)),
        y: Math.max(0, Math.min(100, startPos.y + deltaY))
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const downloadMockup = async () => {
    // PNG indirme fonksiyonu (basit implementasyon)
    if (mockupRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 800;
        canvas.height = 600;
        
        // Mockup arka planı
        ctx.fillStyle = mockupColor;
        ctx.fillRect(0, 0, 800, 600);
        
        // Logo ekleme (basit implementasyon)
        if (logoDataUrl) {
          const img = new Image();
          img.onload = () => {
            const logoX = (logoPosition.x / 100) * 800;
            const logoY = (logoPosition.y / 100) * 600;
            const logoW = (logoSize / 100) * 200;
            const logoH = (logoSize / 100) * 200;
            
            ctx.save();
            ctx.translate(logoX + logoW/2, logoY + logoH/2);
            ctx.rotate((logoRotation * Math.PI) / 180);
            ctx.drawImage(img, -logoW/2, -logoH/2, logoW, logoH);
            ctx.restore();
            
            // İndir
            const link = document.createElement('a');
            link.download = 'mockup.png';
            link.href = canvas.toDataURL();
            link.click();
          };
          img.src = logoDataUrl;
        }
      }
    }
  };

  const sendEmail = () => {
    // Email gönderme fonksiyonu (basit implementasyon)
    alert(`Mockup ${email} adresine gönderildi!`);
  };

  const contactUs = () => {
    // İletişim fonksiyonu
    window.open('https://wa.me/905555555555?text=Özel tasarım için iletişime geçmek istiyorum', '_blank');
  };

  // Removed unused finishWizard function

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-[#11224E] to-[#F87B1B]' 
        : 'bg-gradient-to-br from-[#EEEEEE] to-[#CBD99B]'
    }`}>
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-10 ${
        isDark ? 'bg-gradient-to-br from-[#11224E] to-[#F87B1B]' : 'bg-gradient-to-br from-[#EEEEEE] to-[#CBD99B]'
      }`}>
        <div className="flex justify-between items-center p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/hijyenlab-logo70.png" 
              alt="HIJYEN LAB" 
              className="w-10 h-10 object-contain"
            />
            <span className={`font-bold text-lg ${
              isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
            }`}>
              HIJYEN LAB
            </span>
          </div>
          
          {/* Theme Toggle */}
          {currentPhase === "welcome" && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'bg-[#F87B1B] border-[#CBD99B] text-[#EEEEEE] hover:bg-[#CBD99B]' 
                  : 'bg-[#EEEEEE] border-[#F87B1B] text-[#11224E] hover:bg-white'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* HOŞGELDİN EKRANI */}
          {currentPhase === "welcome" && (
            <>
              {/* Main Title */}
              <div className="mb-6">
                <Sparkles className={`w-12 h-12 mx-auto mb-4 animate-pulse ${
                  isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                }`} />
                <h1 className={`text-2xl md:text-4xl font-bold mb-4 leading-tight ${
                  isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                }`}>
                  {displayText}
                  {!isComplete && <span className={`animate-pulse ${
                    isDark ? 'text-[#F87B1B]' : 'text-[#F87B1B]'
                  }`}>|</span>}
                </h1>
              </div>

              {isComplete && (
                <div className="animate-fade-in">
                  {/* Subtitle */}
                  <p className={`text-lg md:text-xl mb-8 leading-relaxed ${
                    isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                  }`}>
                    Birkaç basit soruyla size özel profesyonel mockup'lar oluşturun
                  </p>

                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className={`p-4 hover:shadow-lg transition-shadow ${
                      isDark ? 'bg-[#11224E] border-[#F87B1B]' : 'bg-[#EEEEEE] border-[#CBD99B]'
                    }`}>
                      <CardContent className="text-center">
                        <Zap className={`w-8 h-8 mx-auto mb-3 ${
                          isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                        }`} />
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                        }`}>Hızlı & Kolay</h3>
                        <p className={`text-sm ${
                          isDark ? 'text-[#CBD99B]' : 'text-[#11224E]'
                        }`}>Sadece 2 dakikada profesyonel mockup'lar</p>
                      </CardContent>
                    </Card>

                    <Card className={`p-4 hover:shadow-lg transition-shadow ${
                      isDark ? 'bg-[#11224E] border-[#F87B1B]' : 'bg-[#EEEEEE] border-[#CBD99B]'
                    }`}>
                      <CardContent className="text-center">
                        <Star className={`w-8 h-8 mx-auto mb-3 ${
                          isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                        }`} />
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                        }`}>AI Destekli</h3>
                        <p className={`text-sm ${
                          isDark ? 'text-[#CBD99B]' : 'text-[#11224E]'
                        }`}>Yapay zeka size en uygun tasarımı önerir</p>
                      </CardContent>
                    </Card>

                    <Card className={`p-4 hover:shadow-lg transition-shadow ${
                      isDark ? 'bg-[#11224E] border-[#F87B1B]' : 'bg-[#EEEEEE] border-[#CBD99B]'
                    }`}>
                      <CardContent className="text-center">
                        <Heart className={`w-8 h-8 mx-auto mb-3 ${
                          isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                        }`} />
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                        }`}>Özelleştirilebilir</h3>
                        <p className={`text-sm ${
                          isDark ? 'text-[#CBD99B]' : 'text-[#11224E]'
                        }`}>Logonuzu ekleyin ve istediğiniz gibi düzenleyin</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats */}
                  <div className={`flex justify-center items-center space-x-8 mb-8 ${
                    isDark ? 'text-[#CBD99B]' : 'text-[#11224E]'
                  }`}>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                      }`}>100%</div>
                      <div className="text-xs">Ücretsiz</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                      }`}>2 dk</div>
                      <div className="text-xs">Süre</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                      }`}>HD</div>
                      <div className="text-xs">Kalite</div>
                    </div>
                  </div>

                  {/* CTA Button - En Alta */}
                  <div className="text-center">
                    <Button 
                      size="lg"
                      className={`px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                        isDark 
                          ? 'bg-[#F87B1B] hover:bg-[#CBD99B] text-[#11224E]' 
                          : 'bg-[#11224E] hover:bg-[#F87B1B] text-[#EEEEEE]'
                      }`}
                      onClick={startQuestions}
                    >
                      Hemen Başla <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* SORULAR EKRANI */}
          {currentPhase === "questions" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-[#CBD99B]' : 'text-[#11224E]'
                  }`}>
                    Soru {currentQuestionIndex + 1} / {QUESTIONS.length}
                  </span>
                  <span className={`text-sm ${
                    isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
                  }`}>
                    {Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${
                  isDark ? 'bg-[#11224E]' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isDark ? 'bg-[#F87B1B]' : 'bg-[#11224E]'
                    }`}
                    style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border ${
                isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 text-center ${
                  isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                }`}>
                  {QUESTIONS[currentQuestionIndex].question}
                </h2>

                {QUESTIONS[currentQuestionIndex].type === "text" ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={QUESTIONS[currentQuestionIndex].placeholder}
                      value={answers[QUESTIONS[currentQuestionIndex].id] || ""}
                      onChange={(e) => setAnswers(prev => ({ 
                        ...prev, 
                        [QUESTIONS[currentQuestionIndex].id]: e.target.value 
                      }))}
                      className={`w-full p-4 text-lg rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${
                        isDark 
                          ? 'bg-[#EEEEEE] border-[#CBD99B] focus:border-[#F87B1B] focus:ring-[#F87B1B]/20' 
                          : 'bg-white border-[#CBD99B] focus:border-[#11224E] focus:ring-[#11224E]/20'
                      }`}
                    />
                    {answers[QUESTIONS[currentQuestionIndex].id] && (
                      <Button
                        onClick={() => handleAnswer(answers[QUESTIONS[currentQuestionIndex].id])}
                        className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                          isDark
                            ? 'bg-[#F87B1B] hover:bg-[#CBD99B] text-[#11224E]'
                            : 'bg-[#11224E] hover:bg-[#F87B1B] text-[#EEEEEE]'
                        }`}
                      >
                        Sonraki <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {QUESTIONS[currentQuestionIndex].options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleAnswer(option)}
                        className={`p-6 text-left text-lg font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                          isDark
                            ? 'bg-[#EEEEEE] border-[#CBD99B] text-[#11224E] hover:bg-[#F87B1B] hover:border-[#F87B1B] hover:text-[#EEEEEE]'
                            : 'bg-white border-[#CBD99B] text-[#11224E] hover:bg-[#11224E] hover:border-[#11224E] hover:text-[#EEEEEE]'
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOGO YÜKLEME EKRANI */}
          {currentPhase === "logo" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border ${
                isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
              }`}>
                <h2 className={`text-3xl font-bold mb-6 text-center ${
                  isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                }`}>
                  🎨 Logonuzu Yükleyin
                </h2>
                <p className={`text-lg mb-8 text-center ${
                  isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                }`}>
                  Bilgisayarınızdan veya telefonunuzdan logo dosyanızı seçin
                </p>

                <div className={`border-2 border-dashed rounded-2xl p-12 mb-6 transition-all duration-300 hover:border-solid ${
                  isDark 
                    ? 'border-[#F87B1B] hover:bg-[#F87B1B]/10' 
                    : 'border-[#11224E] hover:bg-[#11224E]/10'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer block text-center"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-[#F87B1B]' : 'bg-[#11224E]'
                    }`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className={`text-lg font-medium ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      {logoFile ? logoFile.name : "Dosya seçmek için tıklayın"}
                    </p>
                    <p className={`text-sm mt-2 ${
                      isDark ? 'text-[#11224E]/70' : 'text-[#11224E]/70'
                    }`}>
                      PNG, JPG, SVG desteklenir
                    </p>
                  </label>
                </div>

                {logoFile && (
                  <Button
                    onClick={goToEmail}
                    className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      isDark
                        ? 'bg-[#F87B1B] hover:bg-[#CBD99B] text-[#11224E]'
                        : 'bg-[#11224E] hover:bg-[#F87B1B] text-[#EEEEEE]'
                    }`}
                  >
                    Devam Et <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* EMAIL EKRANI */}
          {currentPhase === "email" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border ${
                isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
              }`}>
                <h2 className={`text-3xl font-bold mb-6 text-center ${
                  isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                }`}>
                  📧 Email Adresiniz
                </h2>
                <p className={`text-lg mb-8 text-center ${
                  isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                }`}>
                  Lütfen email adresinizi girin
                </p>

                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-4 text-lg rounded-xl border-2 focus:outline-none focus:ring-2 transition-all ${
                      isDark 
                        ? 'bg-[#EEEEEE] border-[#CBD99B] focus:border-[#F87B1B] focus:ring-[#F87B1B]/20' 
                        : 'bg-white border-[#CBD99B] focus:border-[#11224E] focus:ring-[#11224E]/20'
                    }`}
                  />
                  
                  {!isValidEmail(email) && email.length > 0 && (
                    <p className="text-red-500 text-sm">
                      Geçerli bir email adresi girin (@ işareti içermelidir)
                    </p>
                  )}

                  {isValidEmail(email) && (
                    <Button
                      onClick={handleEmailSubmit}
                      className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        isDark
                          ? 'bg-[#F87B1B] hover:bg-[#CBD99B] text-[#11224E]'
                          : 'bg-[#11224E] hover:bg-[#F87B1B] text-[#EEEEEE]'
                      }`}
                    >
                      Tasarımı Oluştur <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HAZIRLANMA EKRANI */}
          {currentPhase === "preparing" && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border ${
                isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
              }`}>
                <div className="text-center space-y-6">
                  {/* Loading Spinner */}
                  <div className="relative">
                    <div className={`w-20 h-20 mx-auto rounded-full border-4 border-t-transparent animate-spin ${
                      isDark ? 'border-[#F87B1B]' : 'border-[#11224E]'
                    }`}></div>
                  </div>

                  <h2 className={`text-3xl font-bold ${
                    isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                  }`}>
                    🎨 Tasarımınız Hazırlanıyor...
                  </h2>
                  
                  <p className={`text-lg ${
                    isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                  }`}>
                    AI teknolojisi ile size özel mockup oluşturuluyor
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className={`w-full h-3 rounded-full overflow-hidden ${
                      isDark ? 'bg-[#11224E]' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ease-out ${
                          isDark ? 'bg-[#F87B1B]' : 'bg-[#11224E]'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className={`text-lg font-semibold ${
                      isDark ? 'text-[#F87B1B]' : 'text-[#11224E]'
                    }`}>
                      %{progress} tamamlandı
                    </p>
                  </div>

                  {/* Loading Messages */}
                  <div className={`text-sm space-y-2 ${
                    isDark ? 'text-[#11224E]/70' : 'text-[#11224E]/70'
                  }`}>
                    <p>🎯 Cevaplarınız analiz ediliyor...</p>
                    <p>🎨 Renk paleti oluşturuluyor...</p>
                    <p>📐 Mockup şablonu hazırlanıyor...</p>
                    <p>✨ Son rötuşlar yapılıyor...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESULT EKRANI - MOCKUP EDİTÖRÜ */}
          {currentPhase === "result" && (
            <div className="max-w-6xl mx-auto animate-fade-in">
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Mockup Önizleme */}
                <div className="lg:col-span-2">
                  <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border ${
                    isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
                  }`}>
                    <h2 className={`text-2xl font-bold mb-4 text-center ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      🎉 Tasarımınız Hazır!
                    </h2>
                    
                    {/* Mockup Container */}
                    <div 
                      ref={mockupRef}
                      className="relative w-full h-80 rounded-2xl overflow-hidden cursor-move"
                      style={{ backgroundColor: mockupColor }}
                    >
                      {/* Logo */}
                      {logoDataUrl && (
                        <div
                          className="absolute cursor-move select-none"
                          style={{
                            left: `${logoPosition.x}%`,
                            top: `${logoPosition.y}%`,
                            width: `${logoSize}%`,
                            height: `${logoSize}%`,
                            transform: `translate(-50%, -50%) rotate(${logoRotation}deg)`,
                            transformOrigin: 'center'
                          }}
                          onMouseDown={handleLogoMouseDown}
                        >
                          <img 
                            src={logoDataUrl} 
                            alt="Logo" 
                            className="w-full h-full object-contain pointer-events-none"
                            draggable={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kontrol Paneli */}
                <div className="space-y-6">
                  
                  {/* Renk Kontrolü */}
                  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border ${
                    isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
                  }`}>
                    <Label className={`text-lg font-semibold mb-3 block ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      🎨 Mockup Rengi
                    </Label>
                    <input
                      type="color"
                      value={mockupColor}
                      onChange={(e) => setMockupColor(e.target.value)}
                      className="w-full h-12 rounded-xl border-2 cursor-pointer"
                    />
                    <p className={`text-sm mt-2 ${
                      isDark ? 'text-[#11224E]/70' : 'text-[#11224E]/70'
                    }`}>
                      RGB: {mockupColor}
                    </p>
                  </div>

                  {/* Logo Boyut Kontrolü */}
                  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border ${
                    isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
                  }`}>
                    <Label className={`text-lg font-semibold mb-3 block ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      📏 Logo Boyutu: {logoSize}%
                    </Label>
                    <Slider
                      value={[logoSize]}
                      onValueChange={(value) => setLogoSize(value[0])}
                      max={50}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Logo Döndürme */}
                  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border ${
                    isDark ? 'border-[#F87B1B]' : 'border-[#CBD99B]'
                  }`}>
                    <Label className={`text-lg font-semibold mb-3 block ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      <RotateCw className="inline w-4 h-4 mr-2" />
                      Döndür: {logoRotation}°
                    </Label>
                    <Slider
                      value={[logoRotation]}
                      onValueChange={(value) => setLogoRotation(value[0])}
                      max={180}
                      min={-180}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="space-y-3">
                    <Button
                      onClick={downloadMockup}
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        isDark
                          ? 'bg-[#F87B1B] hover:bg-[#CBD99B] text-[#11224E]'
                          : 'bg-[#11224E] hover:bg-[#F87B1B] text-[#EEEEEE]'
                      }`}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      PNG İndir
                    </Button>

                    <Button
                      onClick={sendEmail}
                      variant="outline"
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        isDark
                          ? 'bg-[#EEEEEE] border-[#F87B1B] text-[#11224E] hover:bg-[#F87B1B] hover:text-[#EEEEEE]'
                          : 'bg-white border-[#11224E] text-[#11224E] hover:bg-[#11224E] hover:text-[#EEEEEE]'
                      }`}
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Email Gönder
                    </Button>

                    <Button
                      onClick={contactUs}
                      variant="outline"
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        isDark
                          ? 'bg-[#CBD99B] border-[#F87B1B] text-[#11224E] hover:bg-[#F87B1B] hover:text-[#EEEEEE]'
                          : 'bg-[#CBD99B] border-[#11224E] text-[#11224E] hover:bg-[#11224E] hover:text-[#EEEEEE]'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Özel Tasarım İste
                    </Button>
                  </div>

                  {/* Bilgi Kutusu */}
                  <div className={`bg-gradient-to-r p-4 rounded-2xl text-center ${
                    isDark 
                      ? 'from-[#F87B1B]/20 to-[#CBD99B]/20 border border-[#F87B1B]/30' 
                      : 'from-[#11224E]/10 to-[#CBD99B]/20 border border-[#11224E]/20'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-[#11224E]' : 'text-[#11224E]'
                    }`}>
                      💡 Logo'yu sürükleyerek hareket ettirebilirsiniz
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 ${
        isDark ? 'bg-gradient-to-br from-[#11224E] to-[#F87B1B]' : 'bg-gradient-to-br from-[#EEEEEE] to-[#CBD99B]'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${
            isDark ? 'text-[#EEEEEE]' : 'text-[#11224E]'
          }`}>
            © 2025 HIJYEN LAB. Tüm hakları saklıdır. Bu sitede yer alan metin ve görseller başka bir yerde kullanılamaz.
          </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        `
      }} />
    </div>
  );
}

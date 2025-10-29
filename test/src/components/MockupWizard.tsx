import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Sparkles, Zap, Heart, Star, Sun, Moon } from "lucide-react";

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

export default function MockupWizard() {
  const welcomeText = "Yapay Zeka Destekli Ürün Oluşturma Sihirbazına Hoşgeldiniz";
  const { displayText, isComplete } = useTypewriter(welcomeText, 80);
  const [isDark, setIsDark] = useState(false); // Light tema ile başla

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

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
              src="/src/components/hijyenlab-logo70.png" 
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
        </div>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
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
                >
                  Hemen Başla <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
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

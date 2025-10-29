import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Download, ImageUp, RotateCw, Undo2 } from "lucide-react";

/**
 * AI Destekli Ürün Mockup Sihirbazı — Tek Dosya React Bileşeni
 * 
 * Özellikler (şimdilik local, tamamen istemci tarafı):
 * 1) Soru Akışı: Çoktan seçmeli + serbest metin soruları tek tek gösterir.
 * 2) Mockup Önizleme: Basit bir "flow pack" (rulo ıslak havlu) SVG mockup'ı, seçilen renkle boyanır.
 * 3) Logo Yükleme: PNG/JPG/SVG yüklenir; sürükle-bırak, yeniden boyutlandır, döndür, opaklık.
 * 4) Renk Paleti: HEX color picker; ayrıca hazır paletler.
 * 5) İndir: Kompoziti PNG olarak indir.
 * 6) Kurgu "AI" Mantığı: Cevaplara göre varsayılan renk / varyant önerir (basit kural tabanlı).
 *
 * Not: shadcn/ui + Tailwind varsayıldı. İstersen saf React/HTML sürümünü de üretebilirim.
 */

// ——— Soru Modeli
 type QType = "single" | "text";
 type Question = {
  id: string;
  type: QType;
  question: string;
  options?: string[]; // only for single
  placeholder?: string; // only for text
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

// ——— Cevapları basitçe "AI önerilerine" çeviren kural seti
function suggestDefaults(answers: Record<string, string>) {
  let color = "#3a6ea5"; // default mavi
  let variant: "pillow" | "flat" = "pillow"; // mockup tipi

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
      {/* Arkaplan */}
      <rect x="0" y="0" width="900" height="300" fill="#f7f7f8" />

      {/* Kenar kıvrımları */}
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

      {/* Gövde */}
      <g>
        <rect x="120" y="50" width="660" height="200" rx="28" fill="url(#bodyShade)" />
        {/* Renk katmanı */}
        <rect x="120" y="50" width="660" height="200" rx="28" fill={color} opacity={0.15} />
        {/* İç gölge */}
        <rect x="120" y="50" width="660" height="200" rx="28" fill="#000" opacity={0.06} />
      </g>

      {/* Basit rehber çizgisi (logo yerleşimi) */}
      <rect x="220" y="110" width="460" height="80" rx="16" fill="#ffffff" opacity={0.35} />
      <text x="450" y="155" textAnchor="middle" fontSize="20" fill="#5a6b80" opacity={0.8}>
        LOGONUZ BURAYA GELECEK
      </text>
    </svg>
  );
}

// ——— Düz (Flat) paket, alternatif mockup
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
      <text x="450" y="155" textAnchor="middle" fontSize="20" fill="#5a6b80" opacity={0.8}>
        LOGONUZ BURAYA GELECEK
      </text>
    </svg>
  );
}

// ——— Ana Bileşen
export default function MockupWizard() {
  const [step, setStep] = useState<number>(0); // 0: Sorular, 1: Mockup, 2: Logo, 3: Dışa Aktar
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  // Cevaplar girildikçe basit önerileri uygula (ilk mockup ekranına geçince çalışır)
  useEffect(() => {
    if (step === 1) {
      const s = suggestDefaults(answers);
      setMockupColor(s.color);
      setMockupType(s.variant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleAnswer = (id: string, value: string) => {
    setAnswers((p) => ({ ...p, [id]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Logo yükleme
  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataURL(file);
    setLogoDataUrl(url);
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

  // ——— Layout
  return (
    <div className="mx-auto max-w-6xl p-6">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Yapay Zeka Destekli Ürün Mockup Sihirbazı</CardTitle>
          <div className="text-sm text-muted-foreground">Yerel prototip • tek dosya</div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ADIM GÖSTERGESİ */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              "Sorular",
              "Mockup Rengi/Tipi",
              "Logo Yerleşimi",
              "Dışa Aktar"
            ].map((t, i) => (
              <div
                key={t}
                className={`px-3 py-1 rounded-full text-sm border ${
                  i === step ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {i + 1}. {t}
              </div>
            ))}
          </div>

          {/* İÇERİK */}
          {step === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-base">{q.question}</Label>
                    {q.type === "single" ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {q.options!.map((opt) => (
                          <Button
                            key={opt}
                            variant={answers[q.id] === opt ? "default" : "outline"}
                            onClick={() => handleAnswer(q.id, opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Input
                        placeholder={q.placeholder}
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-4 bg-muted/40">
                <div className="text-sm text-muted-foreground mb-2">
                  İpucu: Bu cevaplar, bir sonraki adımda renk ve mockup tipi için akıllı varsayılanlar önerir.
                </div>
                <div className="h-[280px] flex items-center justify-center">
                  <Mockup color={mockupColor} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border p-4 bg-background" ref={exportRef}>
                <div className="relative">
                  <Mockup color={mockupColor} />
                  {/* Logo, sonraki adımda düzenlenecek; burada sadece arkaplan görünür */}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Mockup Tipi</Label>
                  <Select value={mockupType} onValueChange={(v: any) => setMockupType(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pillow">Flow Pack (Rulo)</SelectItem>
                      <SelectItem value="flat">Flat Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Renk (HEX)</Label>
                  <Input value={mockupColor} onChange={(e) => setMockupColor(e.target.value)} />
                  <HexColorPicker color={mockupColor} onChange={setMockupColor} />

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      "#3A83C1",
                      "#4DAA57",
                      "#E86A33",
                      "#0F172A",
                      "#6B7280",
                      "#F59E0B"
                    ].map((c) => (
                      <button
                        key={c}
                        className="w-8 h-8 rounded-full border"
                        style={{ background: c }}
                        onClick={() => setMockupColor(c)}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Renk yoğunluğu ve gölgeler, mockup üstünde hafif bir opaklık katmanı olarak uygulanır.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border p-4 bg-background">
                <div className="relative" ref={exportRef}>
                  <Mockup color={mockupColor} />

                  {/* LOGO Katmanı */}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain pointer-events-none" />
                      </div>
                    </Rnd>
                  )}
                </div>
              </div>

              {/* Kontroller */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Logo Yükle</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={onLogoChange} />
                    <Button variant="outline" onClick={resetLogo} disabled={!logoDataUrl}>
                      <Undo2 className="w-4 h-4 mr-2" /> Sıfırla
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Opaklık: {logoOpacity}%</Label>
                    <Slider value={[logoOpacity]} min={0} max={100} step={1} onValueChange={(v) => setLogoOpacity(v[0])} />
                  </div>
                  <div>
                    <Label>Döndür: {logoRotation}°</Label>
                    <Slider value={[logoRotation]} min={-45} max={45} step={1} onValueChange={(v) => setLogoRotation(v[0])} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Çarp (multiply) karışım</Label>
                    <Switch checked={logoBlendMultiply} onCheckedChange={setLogoBlendMultiply} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    İpucu: Karışım modunu açmak, baskı efekti verir. Her logo için uygun olmayabilir.
                  </div>
                </div>

                {logoDataUrl ? (
                  <div className="text-sm text-muted-foreground">
                    Logoyu doğrudan mockup üzerinde sürükleyebilir ve köşelerinden boyutlandırabilirsiniz.
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Henüz logo eklenmedi. Görsel yüklediğinizde burada düzenleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border p-4 bg-background">
                <div className="relative" ref={exportRef}>
                  <Mockup color={mockupColor} />
                  {logoDataUrl && (
                    <div
                      className="absolute"
                      style={{ left: logoPos.x, top: logoPos.y, width: logoSize.w, height: logoSize.h }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          mixBlendMode: logoBlendMultiply ? ("multiply" as any) : ("normal" as any),
                          opacity: logoOpacity / 100,
                          transform: `rotate(${logoRotation}deg)`
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  PNG indirildiğinde tüm katmanlar tek bir görüntüde birleştirilir.
                </div>
                <Button onClick={downloadPng} className="w-full">
                  <Download className="w-4 h-4 mr-2" /> PNG Olarak İndir
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={back} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Geri
          </Button>

          {step < 3 ? (
            <Button onClick={next}>
              İleri <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">Bitti 🎉 – başka varyasyonlar denemek için geri dönebilirsiniz.</div>
          )}
        </CardFooter>
      </Card>

      {/* Küçük notlar */}
      <div className="mt-4 text-xs text-muted-foreground">
        • Bu dosya tek başına çalışır. shadcn/ui + Tailwind kullandım. <br />
        • Gerçek AI entegrasyonu (ör. renk/kompozisyon önerileri için OpenAI veya benzeri) istersen, bir servis katmanı ekleyebiliriz.
      </div>
    </div>
  );
}

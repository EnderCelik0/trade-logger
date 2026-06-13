import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

interface CorrelationRow {
  indicator: string
  signal: string
  bias: "LONG" | "SHORT" | "NEUTRAL" | "AVOID"
  note: string
}

const CORRELATIONS: CorrelationRow[] = [
  {
    indicator: "Fear & Greed < 25",
    signal: "Extreme Fear",
    bias: "LONG",
    note: "Panik satışı zirvedeyken akıllı para alır. Fiyat yapısı destekliyorsa güçlü long zemini.",
  },
  {
    indicator: "Fear & Greed > 75",
    signal: "Extreme Greed",
    bias: "SHORT",
    note: "Perakende kalabalığı coşkuyla alırken dağıtım yapılır. Take profit veya short bias düşünün.",
  },
  {
    indicator: "BTC.D yükseliyor",
    signal: "Para BTC'ye akıyor",
    bias: "AVOID",
    note: "Altcoin pozisyonlarda dikkatli olun. BTC long bias, altcoin'lerden uzak durun.",
  },
  {
    indicator: "BTC.D düşüyor + TOTAL yükseliyor",
    signal: "Altcoin sezonu başlangıcı",
    bias: "LONG",
    note: "Para altcoinlere yayılıyor. Yüksek beta altcoinlerde long fırsatı olabilir.",
  },
  {
    indicator: "USDT.D > 8% ve yükseliyor",
    signal: "Risk iştahı düşük",
    bias: "NEUTRAL",
    note: "Yatırımcılar stable'a kaçıyor. Piyasa genelinde savunmacı kalın, pozisyon boyutunu küçültün.",
  },
  {
    indicator: "USDT.D düşüyor",
    signal: "Stable'dan kripto'ya geçiş",
    bias: "LONG",
    note: "Stable paralar piyasaya giriyor — yükselen bir dalgayı destekler.",
  },
  {
    indicator: "TOTAL2 / TOTAL oranı artıyor",
    signal: "Altcoin piyasa payı büyüyor",
    bias: "LONG",
    note: "BTC hâkimiyeti azalırken altcoin değeri artıyor. Altcoin long için güçlü makro context.",
  },
  {
    indicator: "24h Hacim düşük + fiyat yukarı",
    signal: "Düşük katılımlı yükseliş",
    bias: "NEUTRAL",
    note: "Trende güvenmeyin. Hacim teyit etmeden açılan long'lar yüksek risktir.",
  },
  {
    indicator: "F&G < 30 + BTC.D düşüyor + TOTAL2 artıyor",
    signal: "Güçlü altcoin long combo",
    bias: "LONG",
    note: "Üç gösterge aynı anda uyum içinde. Yüksek olasılıklı altcoin long zemin.",
  },
  {
    indicator: "F&G > 70 + BTC.D artıyor + USDT.D artıyor",
    signal: "Zirve / dağıtım combo",
    bias: "SHORT",
    note: "Üç gösterge dönüş sinyali veriyor. Uzun pozisyonları kısaltın, short bias belirgin.",
  },
]

const BIAS_COLORS: Record<CorrelationRow["bias"], string> = {
  LONG: "#059669",
  SHORT: "#dc2626",
  NEUTRAL: "#eab308",
  AVOID: "#f97316",
}

export function CorrelationHelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <HelpCircle className="h-3.5 w-3.5" />
          Korelasyon Rehberi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gosterge Korelasyon Rehberi</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Bu sayfadaki gostergeler birbirinden bagımsız degil — birlikte okunduğunda bias net sekilde olusur.
          Hicbir tek gosterge kesin karar vermez; katmanlasmis sinyaller güvenilirlik saglar.
        </p>

        <div className="space-y-2 mt-2">
          {CORRELATIONS.map((row, i) => (
            <div
              key={i}
              className="rounded border border-border bg-card p-3 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{row.indicator}</p>
                  <p className="text-[11px] text-muted-foreground">{row.signal}</p>
                </div>
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-widest"
                  style={{
                    backgroundColor: `${BIAS_COLORS[row.bias]}18`,
                    color: BIAS_COLORS[row.bias],
                    border: `1px solid ${BIAS_COLORS[row.bias]}40`,
                  }}
                >
                  {row.bias}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground border-l-2 border-border pl-2">
                {row.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded border border-border bg-muted/30 p-3">
          <p className="text-[11px] font-semibold text-foreground mb-1">Temel Prensip</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Bu gostergeleri trade entry sebebi olarak degil, <span className="font-semibold text-foreground">bias filtreleyici</span> olarak kullanin.
            Teknik setupiniz varsa ve makro bias uyumluysa pozisyon buyuklugunu artirin.
            Makro karsi ise ya gecin ya da boyutu kucultun. Makro, teknigin yerini almaz — ikisi birlikte calisir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

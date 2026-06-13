import { useMemo } from "react"
import {
  useFearGreed,
  useGlobalMarket,
  useCryptoNews,
  useMarketCapHistory,
  formatMarketCap,
  getFearGreedColor,
} from "@/hooks/useMarketBias"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts"
import { FearGreedGauge } from "./fear-greed-gauge"
import { InfoTooltip } from "./info-tooltip"
import { CorrelationHelpModal } from "./correlation-help-modal"
import { ExternalLink, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className}`}
    />
  )
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  sub,
  positive,
  tooltipTitle,
  tooltipMeaning,
  tooltipUsage,
}: {
  label: string
  value: string
  sub?: string
  positive?: boolean
  tooltipTitle: string
  tooltipMeaning: string
  tooltipUsage: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <InfoTooltip title={tooltipTitle} meaning={tooltipMeaning} usage={tooltipUsage} />
      </div>
      <div className="text-right">
        <span
          className={`text-xs font-semibold tabular-nums ${
            positive === true
              ? "text-emerald-600 dark:text-emerald-400"
              : positive === false
                ? "text-red-500 dark:text-red-400"
                : "text-foreground"
          }`}
        >
          {value}
        </span>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Dominance Bar ────────────────────────────────────────────────────────────

function DominanceBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">{pct.toFixed(2)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsItem({ item }: { item: { title: string; url: string; source: { title: string }; published_at: string; currencies?: { code: string }[] } }) {
  const date = new Date(item.published_at)
  const timeAgo = Math.round((Date.now() - date.getTime()) / 60000)
  const timeStr = timeAgo < 60 ? `${timeAgo}m ago` : `${Math.round(timeAgo / 60)}h ago`

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 border-b border-border py-2.5 last:border-0 hover:no-underline"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-foreground group-hover:text-primary line-clamp-2 transition-colors">
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{item.source.title}</span>
          <span>·</span>
          <span>{timeStr}</span>
          {item.currencies && item.currencies.length > 0 && (
            <>
              <span>·</span>
              <span>{item.currencies.slice(0, 3).map((c) => c.code).join(", ")}</span>
            </>
          )}
        </div>
      </div>
      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
      {message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MarketBias() {
  const fearGreed = useFearGreed()
  const globalMarket = useGlobalMarket()
  const news = useCryptoNews()
  const capHistory = useMarketCapHistory()

  const fgHistory = useMemo(() => {
    if (!fearGreed.data) return []
    return [...fearGreed.data.history]
      .reverse()
      .slice(-14)
      .map((d) => ({
        date: new Date(parseInt(d.timestamp) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: d.value,
      }))
  }, [fearGreed.data])

  const capHistoryFormatted = useMemo(() => {
    if (!capHistory.data) return []
    return capHistory.data
      .filter((_, i) => i % 2 === 0)
      .map((d) => ({
        date: new Date(d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cap: d.marketCap,
      }))
  }, [capHistory.data])

  const fgColor = fearGreed.data ? getFearGreedColor(fearGreed.data.value) : "#6b7280"
  const mcChange = globalMarket.data?.marketCapChangePercentage24h ?? 0
  const mcPositive = mcChange >= 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Live data — refreshes every 5 min
          </p>
        </div>
        <CorrelationHelpModal />
      </div>

      {/* Top row: Fear & Greed + Dominance + Market Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Fear & Greed gauge */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fear & Greed Index
              </CardTitle>
              <InfoTooltip
                title="Crypto Fear & Greed Index"
                meaning="0-100 arasi bir sentiment endeksidir. Dusuk degerler piyasada panik ve satış baskisini, yuksek degerler ise asiri iyimserlik ve alım coşkusunu gosterir. Volatilite, momentum, social media hacmi ve dominans gibi verilerden hesaplanır."
                usage="Extreme Fear (0-25) bölgesinde uzun pozisyon icin bias olusturmak makul — panik satışları fırsat yaratabilir. Extreme Greed (75-100) bölgesinde ise short bias veya risk azaltma düsünülebilir. Trend ile teyit etmeden tek basına kullanmayın."
              />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-3">
            {fearGreed.isLoading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Skeleton className="h-28 w-52" />
                <Skeleton className="h-5 w-24" />
              </div>
            ) : fearGreed.isError ? (
              <ErrorState message="Fear & Greed verisi yuklenemedi" />
            ) : fearGreed.data ? (
              <FearGreedGauge value={fearGreed.data.value} label={fearGreed.data.label} size={200} />
            ) : null}

            {/* 14-day sparkline */}
            {fgHistory.length > 0 && (
              <div className="mt-3 w-full">
                <p className="mb-1 text-[10px] text-muted-foreground">Son 14 gun</p>
                <ChartContainer config={{ value: { color: fgColor } }} className="h-14 w-full">
                  <AreaChart data={fgHistory}>
                    <defs>
                      <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={fgColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={fgColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={fgColor}
                      fill="url(#fgGrad)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dominance */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dominance
              </CardTitle>
              <InfoTooltip
                title="Kripto Dominans"
                meaning="Her büyük varlığın toplam kripto piyasa capitalizasyonundaki yuzde payi. BTC.D yükseldikçe para altcoinlerden Bitcoin'e akıyor demektir. USDT.D yükseldikçe yatırımcılar stable'a kaçıyor — genel risk iştahı düşük anlamına gelir."
                usage="BTC.D yükselirken altcoin long'lardan kaçının. BTC.D zirve yapıp dönmeye başlarsa altcoin sezon için erken sinyal sayılabilir. USDT.D %10'un üzerinde ve yükseliyorsa piyasa genelinde savunmacı bias tercih edin."
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {globalMarket.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7" />)}
              </div>
            ) : globalMarket.isError ? (
              <ErrorState message="Dominans verisi yuklenemedi" />
            ) : globalMarket.data ? (
              <>
                <DominanceBar label="BTC Dominance" pct={globalMarket.data.btcDominance} color="#f97316" />
                <DominanceBar label="ETH Dominance" pct={globalMarket.data.ethDominance} color="#6366f1" />
                <DominanceBar label="USDT Dominance" pct={globalMarket.data.usdtDominance} color="#059669" />

                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Market Caps</p>
                    <InfoTooltip
                      title="TOTAL / TOTAL2 / TOTAL3"
                      meaning="TOTAL: Tum kriptonun toplam market cap'i. TOTAL2: BTC cıkarıldıktan sonra altcoinlerin toplam değeri. TOTAL3: BTC ve ETH cıkarıldıktan sonra kalan smaller altcoinlerin değeri."
                      usage="TOTAL yükseltirken TOTAL2 düşüyorsa para sadece BTC'ye gidiyor — altcoin pozisyonlarda dikkatli olun. TOTAL3 / TOTAL2 oranı artıyorsa small cap sezonu gelebilir."
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "TOTAL", value: formatMarketCap(globalMarket.data.totalMarketCap) },
                      { label: "TOTAL2", value: formatMarketCap(globalMarket.data.total2MarketCap) },
                      { label: "TOTAL3", value: formatMarketCap(globalMarket.data.total3MarketCap) },
                    ].map((item) => (
                      <div key={item.label} className="rounded border border-border bg-muted/40 px-2 py-1.5 text-center">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-xs font-semibold tabular-nums">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Market Overview
              </CardTitle>
              <InfoTooltip
                title="Genel Piyasa Görünümü"
                meaning="24 saatlik hacim, aktif kripto sayısı ve market cap değişimi gibi anlık makro veriler. Bu metrikler piyasanın genel sağlığını ve katılım seviyesini gösterir."
                usage="Yüksek hacim + pozitif market cap değişimi = güçlü trend teyidi. Düşük hacim + yukarı fiyat hareketi = zayıf, güvenilmez hareket. Long bias için hacim ve yön uyumu arayın."
              />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {globalMarket.isLoading ? (
              <div className="space-y-1">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : globalMarket.isError ? (
              <ErrorState message="Piyasa verisi yuklenemedi" />
            ) : globalMarket.data ? (
              <div>
                <StatRow
                  label="24h Volume"
                  value={formatMarketCap(globalMarket.data.totalVolume24h)}
                  tooltipTitle="24 Saatlik İşlem Hacmi"
                  tooltipMeaning="Son 24 saatte tüm kripto borsalarında gerçekleşen toplam işlem hacmi."
                  tooltipUsage="Market cap'in %5-10'u üzerinde hacim güçlü katılımı gösterir. Düşük hacimde trend kırılımlarına ihtiyatla yaklaşın."
                />
                <StatRow
                  label="Market Cap 24h"
                  value={`${mcPositive ? "+" : ""}${mcChange.toFixed(2)}%`}
                  positive={mcPositive}
                  tooltipTitle="Market Cap 24h Değişimi"
                  tooltipMeaning="Toplam kripto market cap'inin son 24 saatte yüzdesel değişimi. Piyasanın genel yönünü en saf haliyle özetler."
                  tooltipUsage="Pozitif ve artıyorsa long biais destekler. Negatif ve büyüyorsa savunmacı kalın. Tek güne bakma, trendi en az 3 gün takip edin."
                />
                <StatRow
                  label="Active Cryptos"
                  value={globalMarket.data.activeCryptocurrencies.toLocaleString()}
                  tooltipTitle="Aktif Kripto Sayısı"
                  tooltipMeaning="Şu anda aktif işlem gören kripto para sayısı. Piyasanın genişliğini ve katılım seviyesini gösterir."
                  tooltipUsage="Bu sayı tek başına karar aracı değildir; context için kullanılır. Çok sayıda token'ın aktif olması likidite dağılımını artırır."
                />
                <StatRow
                  label="DeFi Volume 24h"
                  value={formatMarketCap(globalMarket.data.defiVolume24h)}
                  tooltipTitle="DeFi 24h Hacim"
                  tooltipMeaning="Merkezi olmayan borsalarda (DEX) gerçekleşen 24 saatlik hacim. On-chain aktivitenin göstergesidir."
                  tooltipUsage="DeFi hacmi merkezi borsa hacmine yaklaşıyorsa on-chain aktivite yüksektir — bu genellikle alt coin ve DeFi tokenlarında trend sinyali verebilir."
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Total Market Cap Chart */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
                BTC Market Cap — Son 30 Gun
              </CardTitle>
            <InfoTooltip
              title="Toplam Market Cap Grafiği"
              meaning="Son 30 günlük kripto piyasasının toplam değeri. Trend yönünü, ivmeyi ve önemli kırılım seviyelerini görselleştirir."
              usage="Yükselen trend + yükselen hacim = sağlıklı bull. Düşen trend + yükselen hacim = güçlü satış baskısı. Yatay sıkışma sonrası kırılım yönü kısa vadeli biası belirler."
            />
            {capHistory.isFetching && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {capHistory.isLoading ? (
            <Skeleton className="h-44 w-full" />
          ) : capHistory.isError ? (
            <ErrorState message="Grafik verisi yuklenemedi" />
          ) : capHistoryFormatted.length > 0 ? (
            <ChartContainer config={{ cap: { color: "#3b82f6" } }} className="h-44">
              <AreaChart data={capHistoryFormatted}>
                <defs>
                  <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatMarketCap(v)}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) =>
                    typeof value === "number" ? [formatMarketCap(value), "Market Cap"] : ["", ""]
                  }
                />
                <Area type="monotone" dataKey="cap" stroke="#3b82f6" fill="url(#capGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ChartContainer>
          ) : null}
        </CardContent>
      </Card>

      {/* Bottom row: F&G History bar + News */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Fear & Greed 14-day bar chart */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fear & Greed — Son 14 Gun
              </CardTitle>
              <InfoTooltip
                title="Fear & Greed Geçmişi"
                meaning="Günlük bazda sentiment endeksinin 14 günlük değişimi. Trendin sürekli mi yoksa tek günlük bir spike mı olduğunu gösterir."
                usage="Birkaç gün üst üste Extreme Fear görüyorsanız ve fiyat tutunuyorsa — bu güçlü long setup zemini olabilir. Birkaç gün üst üste Extreme Greed ise take profit veya pozisyon küçültme için dikkat sinyali."
              />
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {fearGreed.isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : fearGreed.isError ? (
              <ErrorState message="Veri yuklenemedi" />
            ) : fgHistory.length > 0 ? (
              <ChartContainer config={{ value: { color: "#6b7280" } }} className="h-44">
                <BarChart data={fgHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {fgHistory.map((entry, i) => (
                      <Cell key={i} fill={getFearGreedColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : null}
          </CardContent>
        </Card>

        {/* Crypto News */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Kripto Haberleri
                </CardTitle>
                <InfoTooltip
                  title="Kripto Haber Akışı"
                  meaning="CryptoPanic'ten çekilen anlık kripto haber akışı. Majör haberler kısa vadeli fiyat hareketlerini doğrudan etkiler."
                  usage="Trade girmeden önce son haberlere bakın. Majör bir haber varsa (FED açıklaması, exchange hack, ETF kararı vb.) pozisyon açmak yerine beklemek genellikle daha rasyoneldir. Haberi analiz etmek değil, var olduğunu bilmek amaçtır."
                />
              </div>
              {news.isFetching && (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {news.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1.5 py-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : news.isError ? (
              <ErrorState message="Haberler yuklenemedi" />
            ) : news.data && news.data.length > 0 ? (
              <div className="max-h-72 overflow-y-auto pr-1">
                {news.data.slice(0, 10).map((item) => (
                  <NewsItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <ErrorState message="Haber bulunamadi" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data source attribution */}
      <p className="text-center text-[10px] text-muted-foreground">
        Kaynaklar: CoinGecko API · Alternative.me · CryptoPanic
      </p>
    </div>
  )
}

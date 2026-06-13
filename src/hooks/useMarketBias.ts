import { useQuery } from "@tanstack/react-query"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FearGreedData {
  value: number
  label: string
  timestamp: string
  history: { value: number; label: string; timestamp: string }[]
}

export interface GlobalMarketData {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  usdtDominance: number
  activeCryptocurrencies: number
  marketCapChangePercentage24h: number
  defiVolume24h: number
  defiMarketCap: number
  // Derived
  total2MarketCap: number // totalMarketCap - BTC market cap
  total3MarketCap: number // total2 - ETH market cap
  btcMarketCap: number
  ethMarketCap: number
}

export interface CryptoNewsItem {
  id: number
  title: string
  url: string
  source: { title: string; domain: string }
  published_at: string
  votes: { positive: number; negative: number; important: number }
  currencies?: { code: string; title: string }[]
  kind: string
}

// ─── Fear & Greed ─────────────────────────────────────────────────────────────

async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch("https://api.alternative.me/fng/?limit=30&format=json")
  if (!res.ok) throw new Error("Failed to fetch Fear & Greed index")
  const json = await res.json()

  const current = json.data[0]
  const history = json.data.map((d: { value: string; value_classification: string; timestamp: string }) => ({
    value: parseInt(d.value),
    label: d.value_classification,
    timestamp: d.timestamp,
  }))

  return {
    value: parseInt(current.value),
    label: current.value_classification,
    timestamp: current.timestamp,
    history,
  }
}

export function useFearGreed() {
  return useQuery({
    queryKey: ["fear-greed"],
    queryFn: fetchFearGreed,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Global Market Data ───────────────────────────────────────────────────────

async function fetchGlobalMarket(): Promise<GlobalMarketData> {
  const res = await fetch("https://api.coingecko.com/api/v3/global")
  if (!res.ok) throw new Error("Failed to fetch global market data")
  const json = await res.json()
  const d = json.data

  const totalMarketCap = d.total_market_cap?.usd ?? 0
  const btcDominance = d.market_cap_percentage?.btc ?? 0
  const ethDominance = d.market_cap_percentage?.eth ?? 0
  const usdtDominance = d.market_cap_percentage?.usdt ?? 0

  const btcMarketCap = (totalMarketCap * btcDominance) / 100
  const ethMarketCap = (totalMarketCap * ethDominance) / 100
  const total2MarketCap = totalMarketCap - btcMarketCap
  const total3MarketCap = total2MarketCap - ethMarketCap

  return {
    totalMarketCap,
    totalVolume24h: d.total_volume?.usd ?? 0,
    btcDominance,
    ethDominance,
    usdtDominance,
    activeCryptocurrencies: d.active_cryptocurrencies ?? 0,
    marketCapChangePercentage24h: d.market_cap_change_percentage_24h_usd ?? 0,
    defiVolume24h: d.defi_volume_24h ?? 0,
    defiMarketCap: d.defi_market_cap ?? 0,
    btcMarketCap,
    ethMarketCap,
    total2MarketCap,
    total3MarketCap,
  }
}

export function useGlobalMarket() {
  return useQuery({
    queryKey: ["global-market"],
    queryFn: fetchGlobalMarket,
    staleTime: 1000 * 60 * 10, // 10 min — CoinGecko free tier rate limit friendly
    gcTime: 1000 * 60 * 30,
  })
}

// ─── Crypto News (CryptoPanic public feed) ────────────────────────────────────

async function fetchCryptoNews(): Promise<CryptoNewsItem[]> {
  // CryptoPanic API has CORS restrictions in browser — use their public RSS feed
  // via allorigins as a CORS proxy, which returns JSON-wrapped RSS XML
  const rssUrl = encodeURIComponent("https://cryptopanic.com/news/rss/")
  const res = await fetch(`https://api.allorigins.win/get?url=${rssUrl}`)
  if (!res.ok) throw new Error("Failed to fetch crypto news")
  const json = await res.json()
  const xml = json.contents ?? ""

  // Parse RSS items from XML string
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, "text/xml")
  const items = Array.from(doc.querySelectorAll("item"))

  return items.slice(0, 15).map((item, i) => ({
    id: i,
    title: item.querySelector("title")?.textContent ?? "",
    url: item.querySelector("link")?.textContent ?? "",
    source: { title: item.querySelector("source")?.textContent ?? "CryptoPanic", domain: "cryptopanic.com" },
    published_at: item.querySelector("pubDate")?.textContent ?? new Date().toISOString(),
    votes: { positive: 0, negative: 0, important: 0 },
    currencies: [],
    kind: "news",
  }))
}

export function useCryptoNews() {
  return useQuery({
    queryKey: ["crypto-news"],
    queryFn: fetchCryptoNews,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Market Cap History (CoinGecko — last 30 days, no key needed for 30d) ────

export interface MarketCapPoint {
  timestamp: number
  marketCap: number
}

async function fetchMarketCapHistory(): Promise<MarketCapPoint[]> {
  // CoinGecko /global/market_cap_chart requires a Pro key; use BTC market chart
  // as a proxy for total market (BTC ~50% dominance, shape is representative)
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily"
  )
  if (!res.ok) throw new Error("Failed to fetch market cap history")
  const json = await res.json()
  // market_caps field: [[timestamp, cap], ...]
  return (json.market_caps ?? []).map(
    ([ts, cap]: [number, number]) => ({ timestamp: ts, marketCap: cap })
  )
}

export function useMarketCapHistory() {
  return useQuery({
    queryKey: ["market-cap-history"],
    queryFn: fetchMarketCapHistory,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── BTC Price (for TOTAL2/3 chart context) ───────────────────────────────────

export interface BtcPricePoint {
  timestamp: number
  price: number
}

async function fetchBtcHistory(): Promise<BtcPricePoint[]> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily"
  )
  if (!res.ok) throw new Error("Failed to fetch BTC history")
  const json = await res.json()
  return (json.prices ?? []).map(([ts, price]: [number, number]) => ({
    timestamp: ts,
    price,
  }))
}

export function useBtcHistory() {
  return useQuery({
    queryKey: ["btc-history"],
    queryFn: fetchBtcHistory,
    staleTime: 1000 * 60 * 10,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
  return `$${value.toFixed(0)}`
}

export function getFearGreedColor(value: number): string {
  if (value <= 25) return "#dc2626"
  if (value <= 45) return "#f97316"
  if (value <= 55) return "#eab308"
  if (value <= 75) return "#84cc16"
  return "#059669"
}

export function getFearGreedBgColor(value: number): string {
  if (value <= 25) return "rgba(220, 38, 38, 0.1)"
  if (value <= 45) return "rgba(249, 115, 22, 0.1)"
  if (value <= 55) return "rgba(234, 179, 8, 0.1)"
  if (value <= 75) return "rgba(132, 204, 22, 0.1)"
  return "rgba(5, 150, 105, 0.1)"
}

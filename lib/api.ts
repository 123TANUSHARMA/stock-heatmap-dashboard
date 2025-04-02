import axios from "axios"
import type { StockData, HistoricalData, SectorData } from "./types"

// Base URL for Polygon API
const BASE_URL = "https://api.polygon.io"

// Create axios instance with API key
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: process.env.POLYGON_API_KEY,
  },
})

// Mock data for development (in case of API limits)
const mockStocks: StockData[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 175.34,
    previousClose: 173.21,
    percentChange: 1.23,
    volume: 65432100,
    marketCap: 2800000000000,
    sector: "Technology",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 325.76,
    previousClose: 320.45,
    percentChange: 1.66,
    volume: 32145600,
    marketCap: 2400000000000,
    sector: "Technology",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.89,
    previousClose: 145.23,
    percentChange: -1.61,
    volume: 28456700,
    marketCap: 1800000000000,
    sector: "Technology",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 132.45,
    previousClose: 135.67,
    percentChange: -2.37,
    volume: 45678900,
    marketCap: 1350000000000,
    sector: "Consumer Cyclical",
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    price: 315.67,
    previousClose: 310.23,
    percentChange: 1.75,
    volume: 25678900,
    marketCap: 800000000000,
    sector: "Technology",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 245.67,
    previousClose: 250.34,
    percentChange: -1.87,
    volume: 78945600,
    marketCap: 780000000000,
    sector: "Consumer Cyclical",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    price: 435.23,
    previousClose: 425.67,
    percentChange: 2.25,
    volume: 56789000,
    marketCap: 1070000000000,
    sector: "Technology",
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 145.67,
    previousClose: 147.89,
    percentChange: -1.5,
    volume: 15678900,
    marketCap: 425000000000,
    sector: "Financial Services",
  },
  {
    ticker: "BAC",
    name: "Bank of America Corp.",
    price: 32.45,
    previousClose: 33.21,
    percentChange: -2.29,
    volume: 45678900,
    marketCap: 260000000000,
    sector: "Financial Services",
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    price: 65.34,
    previousClose: 64.56,
    percentChange: 1.21,
    volume: 12345600,
    marketCap: 520000000000,
    sector: "Consumer Defensive",
  },
  {
    ticker: "PG",
    name: "Procter & Gamble Co.",
    price: 156.78,
    previousClose: 155.43,
    percentChange: 0.87,
    volume: 8765400,
    marketCap: 370000000000,
    sector: "Consumer Defensive",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    price: 165.43,
    previousClose: 167.89,
    percentChange: -1.47,
    volume: 7654300,
    marketCap: 430000000000,
    sector: "Healthcare",
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group Inc.",
    price: 475.67,
    previousClose: 480.23,
    percentChange: -0.95,
    volume: 3456700,
    marketCap: 440000000000,
    sector: "Healthcare",
  },
  {
    ticker: "HD",
    name: "Home Depot Inc.",
    price: 345.67,
    previousClose: 340.23,
    percentChange: 1.6,
    volume: 4567800,
    marketCap: 350000000000,
    sector: "Consumer Cyclical",
  },
  {
    ticker: "PFE",
    name: "Pfizer Inc.",
    price: 32.45,
    previousClose: 33.67,
    percentChange: -3.62,
    volume: 34567800,
    marketCap: 180000000000,
    sector: "Healthcare",
  },
  {
    ticker: "INTC",
    name: "Intel Corp.",
    price: 35.67,
    previousClose: 34.56,
    percentChange: 3.21,
    volume: 56789000,
    marketCap: 150000000000,
    sector: "Technology",
  },
  {
    ticker: "VZ",
    name: "Verizon Communications Inc.",
    price: 40.23,
    previousClose: 41.45,
    percentChange: -2.94,
    volume: 23456700,
    marketCap: 170000000000,
    sector: "Communication Services",
  },
  {
    ticker: "KO",
    name: "Coca-Cola Co.",
    price: 58.67,
    previousClose: 57.89,
    percentChange: 1.35,
    volume: 15678900,
    marketCap: 250000000000,
    sector: "Consumer Defensive",
  },
  {
    ticker: "DIS",
    name: "Walt Disney Co.",
    price: 95.67,
    previousClose: 93.45,
    percentChange: 2.38,
    volume: 12345600,
    marketCap: 175000000000,
    sector: "Communication Services",
  },
  {
    ticker: "MRK",
    name: "Merck & Co. Inc.",
    price: 105.34,
    previousClose: 104.56,
    percentChange: 0.75,
    volume: 8765400,
    marketCap: 265000000000,
    sector: "Healthcare",
  },
]

const mockSectors: SectorData[] = [
  { id: 1, name: "Technology" },
  { id: 2, name: "Financial Services" },
  { id: 3, name: "Healthcare" },
  { id: 4, name: "Consumer Cyclical" },
  { id: 5, name: "Consumer Defensive" },
  { id: 6, name: "Communication Services" },
  { id: 7, name: "Energy" },
  { id: 8, name: "Industrials" },
  { id: 9, name: "Basic Materials" },
  { id: 10, name: "Real Estate" },
  { id: 11, name: "Utilities" },
]

// Generate mock historical data
const generateMockHistoricalData = (ticker: string, timeframe: string): HistoricalData[] => {
  const data: HistoricalData[] = []
  const now = new Date()
  let days = 30

  switch (timeframe) {
    case "1d":
      days = 1
      break
    case "1w":
      days = 7
      break
    case "1m":
      days = 30
      break
    case "3m":
      days = 90
      break
    case "1y":
      days = 365
      break
    default:
      days = 30
  }

  // Generate a starting price between $10 and $500
  const basePrice = Math.random() * 490 + 10

  // Generate data points
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Add some randomness to the price
    const volatility = 0.02 // 2% daily volatility
    const changePercent = (Math.random() * 2 - 1) * volatility

    const prevClose = i === days ? basePrice : data[data.length - 1].close
    const close = prevClose * (1 + changePercent)
    const open = prevClose * (1 + (Math.random() * 0.01 - 0.005))
    const high = Math.max(open, close) * (1 + Math.random() * 0.01)
    const low = Math.min(open, close) * (1 - Math.random() * 0.01)
    const volume = Math.floor(Math.random() * 10000000) + 1000000

    data.push({
      date: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return data
}

// Fetch stock data from Polygon API
export const fetchStockData = async (): Promise<StockData[]> => {
  try {
    // Get list of tickers from S&P 500 (or another index)
    const response = await api.get("/v3/reference/tickers", {
      params: {
        market: "stocks",
        active: true,
        sort: "market_cap",
        order: "desc",
        limit: 100,
      },
    })

    // Extract tickers
    const tickers = response.data.results.map((stock: any) => stock.ticker)

    // Get current price data for each ticker
    const stocksData: StockData[] = await Promise.all(
      tickers.slice(0, 20).map(async (ticker: string) => {
        try {
          // Get current price
          const priceResponse = await api.get(`/v2/last/trade/${ticker}`)
          const price = priceResponse.data.results.p

          // Get previous close
          const prevDate = new Date()
          prevDate.setDate(prevDate.getDate() - 1)
          const prevDateStr = prevDate.toISOString().split("T")[0]

          const prevCloseResponse = await api.get(`/v1/open-close/${ticker}/${prevDateStr}`)
          const previousClose = prevCloseResponse.data.close

          // Get company details
          const detailsResponse = await api.get(`/v3/reference/tickers/${ticker}`)
          const details = detailsResponse.data.results

          return {
            ticker,
            name: details.name,
            price,
            previousClose,
            percentChange: ((price - previousClose) / previousClose) * 100,
            volume: priceResponse.data.results.s,
            marketCap: details.market_cap,
            sector: details.sic_description,
          }
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error)
          return null
        }
      }),
    )

    // Filter out any null values from failed requests
    const validStocksData = stocksData.filter((stock) => stock !== null)

    return validStocksData.length > 0 ? validStocksData : mockStocks
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return mockStocks
  }
}

// Fetch historical data from Polygon API
export const fetchHistoricalData = async (ticker: string, timeframe: string): Promise<HistoricalData[]> => {
  try {
    const now = new Date()
    const fromDate = new Date()

    switch (timeframe) {
      case "1d":
        fromDate.setDate(now.getDate() - 1)
        break
      case "1w":
        fromDate.setDate(now.getDate() - 7)
        break
      case "1m":
        fromDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        fromDate.setMonth(now.getMonth() - 3)
        break
      case "1y":
        fromDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        fromDate.setMonth(now.getMonth() - 1)
    }

    const fromDateStr = fromDate.toISOString().split("T")[0]
    const toDateStr = now.toISOString().split("T")[0]

    const multiplier = timeframe === "1d" ? 1 : 1
    const timespan = timeframe === "1d" ? "hour" : "day"

    const response = await api.get(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDateStr}/${toDateStr}`,
    )

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results.map((item: any) => ({
        date: new Date(item.t).toISOString().split("T")[0],
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v,
      }))
    } else {
      return generateMockHistoricalData(ticker, timeframe)
    }
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error)
    return generateMockHistoricalData(ticker, timeframe)
  }
}

// Fetch sector data from Polygon API
export const fetchSectorData = async (): Promise<SectorData[]> => {
  try {
    // In a real implementation, you would fetch this from an API
    // For now, we'll return mock data
    return mockSectors
  } catch (error) {
    console.error("Error fetching sector data:", error)
    return mockSectors
  }
}


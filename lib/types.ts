export interface StockData {
  ticker: string
  name: string
  price: number
  previousClose: number
  percentChange: number
  volume: number
  marketCap: number
  sector: string
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SectorData {
  id: number
  name: string
}


"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Search, BarChart4, TrendingUp, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StockHeatmap from "@/components/stock-heatmap"
import HistoricalChart from "@/components/historical-chart"
import { fetchStockData, fetchHistoricalData, fetchSectorData } from "@/lib/api"
import type { StockData, HistoricalData, SectorData } from "@/lib/types"

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [stockData, setStockData] = useState<StockData[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1d")
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch top stocks by market cap
        const stocksResponse = await fetchStockData()
        setStockData(stocksResponse)

        // Fetch sector data
        const sectorsResponse = await fetchSectorData()
        setSectors(sectorsResponse)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch stock data. Please try again later.")
        setLoading(false)
        console.error("Error fetching data:", err)
      }
    }

    fetchData()

    // Set up interval for real-time updates (every 60 seconds)
    const intervalId = setInterval(fetchData, 60000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const fetchHistorical = async () => {
      if (selectedStock) {
        try {
          setLoading(true)
          const historicalResponse = await fetchHistoricalData(selectedStock, selectedTimeframe)
          setHistoricalData(historicalResponse)
          setLoading(false)
        } catch (err) {
          setError("Failed to fetch historical data. Please try again later.")
          setLoading(false)
          console.error("Error fetching historical data:", err)
        }
      }
    }

    fetchHistorical()
  }, [selectedStock, selectedTimeframe])

  const filteredStocks = stockData.filter((stock) => {
    const matchesSearch =
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = selectedSector === "all" || stock.sector === selectedSector
    return matchesSearch && matchesSector
  })

  const handleStockSelect = (ticker: string) => {
    setSelectedStock(ticker)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BarChart4 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Stock Heatmap Dashboard
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full h-10 w-10"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks by ticker or name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger>
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by sector" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.name}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select timeframe" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="heatmap" className="mb-6">
        <TabsList className="mb-4 bg-background border">
          <TabsTrigger
            value="heatmap"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Heatmap
          </TabsTrigger>
          <TabsTrigger
            value="historical"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Historical Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="heatmap">
          <Card className="border-none shadow-lg bg-gradient-to-br from-card to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart4 className="h-5 w-5" /> Market Heatmap
              </CardTitle>
              <CardDescription>
                Real-time visualization of stock performance. Green indicates gains, red indicates losses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-[600px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p>Loading stock data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-[600px]">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <StockHeatmap data={filteredStocks} onStockSelect={handleStockSelect} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historical">
          <Card className="border-none shadow-lg bg-gradient-to-br from-card to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Historical Performance
              </CardTitle>
              <CardDescription>
                {selectedStock
                  ? `Historical data for ${selectedStock} over the selected timeframe.`
                  : "Select a stock from the heatmap to view historical data."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStock ? (
                <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-lg border border-dashed">
                  <div className="text-center p-6">
                    <BarChart4 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Select a stock to view historical data</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click on any stock in the heatmap to see its performance over time
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p>Loading historical data...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-[400px]">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <HistoricalChart data={historicalData} ticker={selectedStock} timeframe={selectedTimeframe} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-background hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" /> Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "Loading..." : `${stockData.length} Stocks`}</div>
            <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-background hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Gainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stockData.length > 0 ? stockData.sort((a, b) => b.percentChange - a.percentChange)[0].ticker : "N/A"}
                </div>
                <p className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 inline-block">
                  {stockData.length > 0
                    ? `+${stockData.sort((a, b) => b.percentChange - a.percentChange)[0].percentChange.toFixed(2)}%`
                    : "N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-background hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 rotate-180" /> Top Loser
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stockData.length > 0 ? stockData.sort((a, b) => a.percentChange - b.percentChange)[0].ticker : "N/A"}
                </div>
                <p className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 inline-block">
                  {stockData.length > 0
                    ? `${stockData.sort((a, b) => a.percentChange - b.percentChange)[0].percentChange.toFixed(2)}%`
                    : "N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-background hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart4 className="h-4 w-4" /> Most Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stockData.length > 0 ? stockData.sort((a, b) => b.volume - a.volume)[0].ticker : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stockData.length > 0
                    ? `${(stockData.sort((a, b) => b.volume - a.volume)[0].volume / 1000000).toFixed(2)}M shares`
                    : "N/A"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


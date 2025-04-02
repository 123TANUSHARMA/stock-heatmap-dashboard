"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StockData } from "@/lib/types"

interface StockHeatmapProps {
  data: StockData[]
  onStockSelect: (ticker: string) => void
}

export default function StockHeatmap({ data, onStockSelect }: StockHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    const padding = 2

    // Group data by sector
    const sectorGroups = d3.group(data, (d) => d.sector)

    // Create hierarchical data for treemap
    const root = d3
      .hierarchy({ children: Array.from(sectorGroups, ([key, value]) => ({ name: key, children: value })) })
      .sum((d) => ("volume" in d ? Math.sqrt(d.volume) : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    // Create treemap layout
    const treemap = d3.treemap().size([width, height]).paddingOuter(8).paddingTop(28).paddingInner(padding).round(true)

    treemap(root)

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")

    // Create a zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
        setZoomLevel(event.transform.k)
      })

    // Apply zoom behavior to the SVG
    svg.call(zoom as any)

    // Create a group for all elements that will be zoomed
    const g = svg.append("g")

    // Create color scale for percentage change
    const colorScale = d3
      .scaleLinear<string>()
      .domain([-5, -2, -0.5, 0, 0.5, 2, 5])
      .range([
        "hsl(var(--loss-strong))",
        "hsl(var(--loss-medium))",
        "hsl(var(--loss-light))",
        "hsl(var(--neutral))",
        "hsl(var(--gain-light))",
        "hsl(var(--gain-medium))",
        "hsl(var(--gain-strong))",
      ])
      .clamp(true)

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "50")
      .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)")
      .style("max-width", "300px")

    // Add sector labels
    const sectors = g
      .selectAll("g.sector")
      .data(root.children || [])
      .join("g")
      .attr("class", "sector")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)

    sectors
      .append("rect")
      .attr("fill", "hsl(var(--primary))")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", 28)
      .attr("rx", 4)
      .attr("ry", 4)

    sectors
      .append("text")
      .attr("x", 8)
      .attr("y", 18)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d) => d.data.name)

    // Add leaf nodes (stocks)
    const leaf = g
      .selectAll("g.leaf")
      .data(root.leaves())
      .join("g")
      .attr("class", "leaf stock-node")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)

    // Add background rectangles
    leaf
      .append("rect")
      .attr("id", (d) => (d.leafUid = `leaf-${d.data.ticker}`))
      .attr("fill", (d) => colorScale(d.data.percentChange))
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("stroke", "white").attr("stroke-width", 2)
        tooltip.style("visibility", "visible").html(`
            <div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 16px; margin-right: 8px;">${d.data.ticker}</strong>
                <span style="background-color: ${d.data.percentChange >= 0 ? "hsl(var(--gain-medium))" : "hsl(var(--loss-medium))"}; 
                       color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                  ${d.data.percentChange >= 0 ? "+" : ""}${d.data.percentChange.toFixed(2)}%
                </span>
              </div>
              <div style="font-size: 14px; margin-bottom: 8px;">${d.data.name}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <div style="color: #a0aec0; font-size: 11px;">PRICE</div>
                  <div>$${d.data.price.toFixed(2)}</div>
                </div>
                <div>
                  <div style="color: #a0aec0; font-size: 11px;">PREV CLOSE</div>
                  <div>$${d.data.previousClose.toFixed(2)}</div>
                </div>
                <div>
                  <div style="color: #a0aec0; font-size: 11px;">VOLUME</div>
                  <div>${(d.data.volume / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div style="color: #a0aec0; font-size: 11px;">MARKET CAP</div>
                  <div>$${(d.data.marketCap / 1000000000).toFixed(2)}B</div>
                </div>
              </div>
            </div>
          `)
      })
      .on("mousemove", (event) => {
        tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px")
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).attr("stroke", "none")
        tooltip.style("visibility", "hidden")
      })
      .on("click", (event, d) => {
        onStockSelect(d.data.ticker)
      })

    // Add stock ticker labels
    leaf
      .append("text")
      .attr("clip-path", (d) => `url(#clip-${d.leafUid})`)
      .attr("x", 4)
      .attr("y", 14)
      .attr("fill", (d) => {
        const percentChange = d.data.percentChange
        return Math.abs(percentChange) > 3 ? "white" : "black"
      })
      .attr("font-weight", "bold")
      .attr("font-size", (d) => {
        const width = d.x1 - d.x0
        const height = d.y1 - d.y0
        const size = Math.min(width, height) / 5
        return `${Math.min(Math.max(size, 10), 16)}px`
      })
      .text((d) => d.data.ticker)

    // Add percentage change labels
    leaf
      .append("text")
      .attr("clip-path", (d) => `url(#clip-${d.leafUid})`)
      .attr("x", 4)
      .attr("y", 30)
      .attr("fill", (d) => {
        const percentChange = d.data.percentChange
        return Math.abs(percentChange) > 3 ? "white" : "black"
      })
      .attr("font-size", (d) => {
        const width = d.x1 - d.x0
        const height = d.y1 - d.y0
        const size = Math.min(width, height) / 6
        return `${Math.min(Math.max(size, 9), 14)}px`
      })
      .text((d) => `${d.data.percentChange >= 0 ? "+" : ""}${d.data.percentChange.toFixed(2)}%`)

    // Add clip path for text
    leaf
      .append("clipPath")
      .attr("id", (d) => `clip-${d.leafUid}`)
      .append("use")
      .attr("xlink:href", (d) => `#leaf-${d.data.ticker}`)

    // Clean up tooltip on unmount
    return () => {
      d3.select("body").selectAll("div.tooltip").remove()
    }
  }, [data, onStockSelect])

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const zoom = d3.zoom().scaleExtent([0.5, 5])
      svg.transition().call(zoom.scaleBy as any, 1.2)
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const zoom = d3.zoom().scaleExtent([0.5, 5])
      svg.transition().call(zoom.scaleBy as any, 0.8)
    }
  }

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const zoom = d3.zoom().scaleExtent([0.5, 5])
      svg.transition().call(zoom.transform as any, d3.zoomIdentity)
    }
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="performance-legend">
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--loss-strong))" }}></div>
            <span>-5%+</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--loss-medium))" }}></div>
            <span>-2%</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--loss-light))" }}></div>
            <span>-0.5%</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--neutral))" }}></div>
            <span>0%</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--gain-light))" }}></div>
            <span>+0.5%</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--gain-medium))" }}></div>
            <span>+2%</span>
          </div>
          <div className="performance-legend-item">
            <div className="performance-legend-color" style={{ backgroundColor: "hsl(var(--gain-strong))" }}></div>
            <span>+5%+</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="heatmap-container border rounded-lg bg-card shadow-sm">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}


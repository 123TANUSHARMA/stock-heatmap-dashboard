"use client"

import { useRef, useEffect } from "react"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HistoricalData } from "@/lib/types"

interface HistoricalChartProps {
  data: HistoricalData[]
  ticker: string
  timeframe: string
}

export default function HistoricalChart({ data, ticker, timeframe }: HistoricalChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    const container = containerRef.current
    const margin = { top: 20, right: 30, bottom: 30, left: 60 }
    const width = container.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Set up scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([(d3.min(data, (d) => d.low) as number) * 0.99, (d3.max(data, (d) => d.high) as number) * 1.01])
      .range([height, 0])

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        // Update the scales according to the zoom
        const newXScale = event.transform.rescaleX(x)

        // Update the axes
        xAxis.call(d3.axisBottom(newXScale))

        // Update the line and area
        line.attr(
          "d",
          d3
            .line<HistoricalData>()
            .x((d) => newXScale(new Date(d.date)))
            .y((d) => y(d.close))(data),
        )

        area.attr(
          "d",
          d3
            .area<HistoricalData>()
            .x((d) => newXScale(new Date(d.date)))
            .y0(height)
            .y1((d) => y(d.close))(data),
        )

        // Update the dots
        dots.attr("cx", (d) => newXScale(new Date(d.date)))
      })

    // Apply zoom to the SVG
    svg.call(zoom as any)

    // Add the X axis
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    // Add the Y axis
    svg.append("g").call(d3.axisLeft(y))

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ""),
      )

    // Determine if the trend is positive or negative
    const isPositive = data[0].close < data[data.length - 1].close
    const lineColor = isPositive ? "hsl(var(--gain-medium))" : "hsl(var(--loss-medium))"
    const areaColor = isPositive ? "hsla(var(--gain-medium), 0.2)" : "hsla(var(--loss-medium), 0.2)"

    // Add the line path
    const line = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line<HistoricalData>()
          .x((d) => x(new Date(d.date)))
          .y((d) => y(d.close))
          .curve(d3.curveMonotoneX),
      )

    // Animate the line
    const pathLength = line.node()?.getTotalLength() || 0
    line
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0)

    // Add area under the line
    const area = svg
      .append("path")
      .datum(data)
      .attr("fill", areaColor)
      .attr(
        "d",
        d3
          .area<HistoricalData>()
          .x((d) => x(new Date(d.date)))
          .y0(height)
          .y1((d) => y(d.close))
          .curve(d3.curveMonotoneX),
      )

    // Add dots for each data point
    const dots = svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(new Date(d.date)))
      .attr("cy", (d) => y(d.close))
      .attr("r", 0)
      .attr("fill", lineColor)
      .transition()
      .delay((d, i) => i * 20)
      .duration(500)
      .attr("r", 3)

    // Add tooltip
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

    // Add hover effects
    const focus = svg.append("g").attr("class", "focus").style("display", "none")

    focus.append("circle").attr("r", 6).attr("fill", "white").attr("stroke", lineColor).attr("stroke-width", 2)

    focus
      .append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("y1", 0)
      .attr("y2", height)

    focus
      .append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("x1", 0)
      .attr("x2", width)

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => {
        focus.style("display", null)
        tooltip.style("visibility", "visible")
      })
      .on("mouseout", () => {
        focus.style("display", "none")
        tooltip.style("visibility", "hidden")
      })
      .on("mousemove", mousemove)

    function mousemove(event: MouseEvent) {
      const bisect = d3.bisector((d: HistoricalData) => new Date(d.date)).left
      const x0 = x.invert(d3.pointer(event, this)[0])
      const i = bisect(data, x0, 1)
      const d0 = data[i - 1]
      const d1 = data[i]
      const d = x0.getTime() - new Date(d0.date).getTime() > new Date(d1.date).getTime() - x0.getTime() ? d1 : d0

      focus.attr("transform", `translate(${x(new Date(d.date))},${y(d.close)})`)
      focus.select(".x-hover-line").attr("y2", height - y(d.close))
      focus.select(".y-hover-line").attr("x2", -x(new Date(d.date)))

      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .html(`
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 16px; margin-right: 8px;">${ticker}</strong>
              <span style="font-size: 14px;">${new Date(d.date).toLocaleDateString()}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <div style="color: #a0aec0; font-size: 11px;">OPEN</div>
                <div>$${d.open.toFixed(2)}</div>
              </div>
              <div>
                <div style="color: #a0aec0; font-size: 11px;">CLOSE</div>
                <div>$${d.close.toFixed(2)}</div>
              </div>
              <div>
                <div style="color: #a0aec0; font-size: 11px;">HIGH</div>
                <div>$${d.high.toFixed(2)}</div>
              </div>
              <div>
                <div style="color: #a0aec0; font-size: 11px;">LOW</div>
                <div>$${d.low.toFixed(2)}</div>
              </div>
              <div style="grid-column: span 2;">
                <div style="color: #a0aec0; font-size: 11px;">VOLUME</div>
                <div>${(d.volume / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>
        `)
    }

    // Clean up tooltip on unmount
    return () => {
      d3.select("body").selectAll("div.tooltip").remove()
    }
  }, [data, ticker, timeframe])

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
      <div className="flex justify-end mb-4">
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
      <div ref={containerRef} className="border rounded-lg bg-card shadow-sm p-4">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
    </div>
  )
}


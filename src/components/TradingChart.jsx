import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  CrosshairMode, 
  CandlestickSeries, 
  AreaSeries, 
  LineSeries, 
  HistogramSeries 
} from 'lightweight-charts';
import { Activity, BarChart2, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { formatINR } from '../utils/formatters';

// Helper to calculate Exponential Moving Average
function calculateEMA(candles, period) {
  const k = 2 / (period + 1);
  const emaData = [];
  let ema = candles[0]?.close;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    if (i === 0) {
      ema = c.close;
    } else {
      ema = c.close * k + ema * (1 - k);
    }
    if (i >= period - 1) {
      emaData.push({
        time: c.time,
        value: +ema.toFixed(2)
      });
    }
  }
  return emaData;
}

export default function TradingChart({ 
  symbol, 
  timeframe, 
  setTimeframe, 
  candles, 
  loading,
  currentPrice,
  currency = 'INR'
}) {
  const currencySymbol = currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : '₹'));
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);

  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [hoverData, setHoverData] = useState(null);

  const timeframes = [
    { label: '1m', range: '1d', interval: '1m', title: '1 Minute' },
    { label: '5m', range: '5d', interval: '5m', title: '5 Minutes' },
    { label: '15m', range: '5d', interval: '15m', title: '15 Minutes' },
    { label: '30m', range: '1mo', interval: '30m', title: '30 Minutes' },
    { label: '1h', range: '1mo', interval: '60m', title: '1 Hour' },
    { label: '1D', range: '1y', interval: '1d', title: '1 Day' },
    { label: '1W', range: '5y', interval: '1wk', title: '1 Week' },
    { label: '1M', range: 'max', interval: '1mo', title: '1 Month' }
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartInstanceRef.current = chart;

    // Add Candlestick / Area Series using v5 addSeries API
    if (chartType === 'candles') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      seriesRef.current = candleSeries;
    } else {
      const lineSeries = chart.addSeries(AreaSeries, {
        topColor: 'rgba(6, 182, 212, 0.4)',
        bottomColor: 'rgba(6, 182, 212, 0.0)',
        lineColor: '#06b6d4',
        lineWidth: 2,
      });
      seriesRef.current = lineSeries;
    }

    // Add Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Add EMA 20 (Cyan)
    const ema20 = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1.5,
      priceLineVisible: false,
      lastValueVisible: false,
      title: 'EMA 20',
    });
    ema20SeriesRef.current = ema20;

    // Add EMA 50 (Orange Amber)
    const ema50 = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1.5,
      priceLineVisible: false,
      lastValueVisible: false,
      title: 'EMA 50',
    });
    ema50SeriesRef.current = ema50;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        setHoverData(null);
      } else {
        const candle = param.seriesData.get(seriesRef.current);
        if (candle) {
          setHoverData(candle);
        }
      }
    });

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [chartType]);

  // Update chart data whenever candles change
  useEffect(() => {
    if (!candles || candles.length === 0 || !seriesRef.current) return;

    try {
      if (chartType === 'candles') {
        const formattedCandles = candles.map(c => ({
          time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        seriesRef.current.setData(formattedCandles);
      } else {
        const lineData = candles.map(c => ({
          time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
          value: c.close,
        }));
        seriesRef.current.setData(lineData);
      }

      if (volumeSeriesRef.current) {
        if (showVolume) {
          const volData = candles.map(c => ({
            time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
            value: c.volume || 0,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
          }));
          volumeSeriesRef.current.setData(volData);
        } else {
          volumeSeriesRef.current.setData([]);
        }
      }

      if (ema20SeriesRef.current) {
        if (showEma20 && candles.length >= 20) {
          const emaData = calculateEMA(candles, 20);
          ema20SeriesRef.current.setData(emaData);
        } else {
          ema20SeriesRef.current.setData([]);
        }
      }

      if (ema50SeriesRef.current) {
        if (showEma50 && candles.length >= 50) {
          const emaData = calculateEMA(candles, 50);
          ema50SeriesRef.current.setData(emaData);
        } else {
          ema50SeriesRef.current.setData([]);
        }
      }

      if (chartInstanceRef.current) {
        chartInstanceRef.current.timeScale().fitContent();
      }
    } catch (err) {
      console.warn('Error applying chart series data:', err);
    }
  }, [candles, chartType, showEma20, showEma50, showVolume]);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '560px', position: 'relative' }}>
      {/* Top Chart Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        {/* Timeframe selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          {timeframes.map(tf => (
            <button
              key={tf.label}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe.label === tf.label ? '#2563eb' : 'transparent',
                color: timeframe.label === tf.label ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Style & Indicator Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Candle vs Line */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '2px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setChartType('candles')}
              style={{
                background: chartType === 'candles' ? '#1e293b' : 'transparent',
                color: chartType === 'candles' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              style={{
                background: chartType === 'line' ? '#1e293b' : 'transparent',
                color: chartType === 'line' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Line
            </button>
          </div>

          {/* EMA 20 Toggle */}
          <button
            onClick={() => setShowEma20(!showEma20)}
            style={{
              background: showEma20 ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: showEma20 ? '#06b6d4' : '#64748b',
              border: `1px solid ${showEma20 ? 'rgba(6, 182, 212, 0.3)' : '#1e293b'}`,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            EMA 20
          </button>

          {/* EMA 50 Toggle */}
          <button
            onClick={() => setShowEma50(!showEma50)}
            style={{
              background: showEma50 ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: showEma50 ? '#f59e0b' : '#64748b',
              border: `1px solid ${showEma50 ? 'rgba(245, 158, 11, 0.3)' : '#1e293b'}`,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            EMA 50
          </button>

          {/* Volume Toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            style={{
              background: showVolume ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: showVolume ? '#10b981' : '#64748b',
              border: `1px solid ${showVolume ? 'rgba(16, 185, 129, 0.3)' : '#1e293b'}`,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Vol
          </button>
        </div>
      </div>

      {/* Hover OHLC Bar */}
      {hoverData && (
        <div style={{ 
          position: 'absolute', 
          top: '55px', 
          left: '20px', 
          zIndex: 10, 
          display: 'flex', 
          gap: '12px', 
          fontSize: '0.75rem', 
          background: 'rgba(13, 19, 31, 0.85)', 
          padding: '4px 10px', 
          borderRadius: '6px',
          border: '1px solid #1e293b',
          pointerEvents: 'none'
        }}>
          {hoverData.open !== undefined ? (
            <>
              <span>O: <b className="font-mono" style={{ color: '#f8fafc' }}>₹{hoverData.open}</b></span>
              <span>H: <b className="font-mono" style={{ color: '#10b981' }}>₹{hoverData.high}</b></span>
              <span>L: <b className="font-mono" style={{ color: '#f43f5e' }}>₹{hoverData.low}</b></span>
              <span>C: <b className="font-mono" style={{ color: '#38bdf8' }}>₹{hoverData.close}</b></span>
            </>
          ) : (
            <span>Price: <b className="font-mono" style={{ color: '#38bdf8' }}>₹{hoverData.value}</b></span>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div 
        ref={chartContainerRef} 
        style={{ flex: 1, width: '100%', minHeight: '420px', position: 'relative' }} 
      />

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 13, 22, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#38bdf8',
          fontSize: '0.9rem',
          fontWeight: 600,
          zIndex: 20
        }}>
          <div className="pulse-live" style={{ width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%' }} />
          Loading Live Candlesticks...
        </div>
      )}
    </div>
  );
}

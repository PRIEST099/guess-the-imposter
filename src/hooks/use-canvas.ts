"use client";
import { useEffect, useRef, useCallback } from "react";
import getStroke from "perfect-freehand";
import type { CanvasStroke } from "@/types/socket-events";

interface UseCanvasOptions {
  width: number;
  height: number;
  onStroke?: (stroke: CanvasStroke) => void;
  readOnly?: boolean;
  /** Auto-assigned color for this player (SKETCH_OFF shared canvas) */
  assignedColor?: string;
  /** Fixed brush width (no user choice) */
  fixedBrushWidth?: number;
}

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
}

export function useCanvas({ width, height, onStroke, readOnly = false, assignedColor = "#7dd3fc", fixedBrushWidth = 4 }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<Array<{ x: number; y: number; pressure?: number }>>([]);
  const strokesRef = useRef<CanvasStroke[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
      redrawAll();
    }
  }, [width, height]);

  const redrawAll = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    strokesRef.current.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  }, [width, height]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: CanvasStroke) => {
    if (stroke.points.length === 0) return;

    const outlinePoints = getStroke(stroke.points.map(p => [p.x, p.y, p.pressure || 0.5]), {
      size: stroke.width * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(outlinePoints);
    const path = new Path2D(pathData);

    ctx.fillStyle = stroke.color;
    ctx.fill(path);
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (readOnly) return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    currentPoints.current = [{ x, y, pressure: e.pressure }];
    canvas.setPointerCapture(e.pointerId);
  }, [readOnly, width, height]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing.current || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    currentPoints.current.push({ x, y, pressure: e.pressure });

    // Draw preview
    const ctx = ctxRef.current;
    if (ctx) {
      redrawAll();
      const previewStroke: CanvasStroke = {
        points: currentPoints.current,
        color: assignedColor,
        width: fixedBrushWidth,
        tool: "pen",
      };
      drawStroke(ctx, previewStroke);
    }
  }, [readOnly, assignedColor, fixedBrushWidth, width, height, redrawAll]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current || readOnly) return;
    isDrawing.current = false;

    if (currentPoints.current.length > 0) {
      const stroke: CanvasStroke = {
        points: [...currentPoints.current],
        color: assignedColor,
        width: fixedBrushWidth,
        tool: "pen",
      };
      strokesRef.current.push(stroke);
      onStroke?.(stroke);
    }
    currentPoints.current = [];
  }, [readOnly, assignedColor, fixedBrushWidth, onStroke]);

  const addExternalStroke = useCallback((stroke: CanvasStroke) => {
    strokesRef.current.push(stroke);
    const ctx = ctxRef.current;
    if (ctx) {
      drawStroke(ctx, stroke);
    }
  }, []);

  const clearAll = useCallback(() => {
    strokesRef.current = [];
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }, [width, height]);

  return {
    canvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    addExternalStroke,
    clearAll,
  };
}

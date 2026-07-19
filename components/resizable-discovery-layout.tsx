"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

const preferenceKey = "project-genesis-discovery-tree-width";
const minimumWidth = 220;
const maximumWidth = 440;
const defaultWidth = 256;

function clampWidth(value: number) {
  return Math.min(maximumWidth, Math.max(minimumWidth, Math.round(value)));
}

export function ResizableDiscoveryLayout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, width: defaultWidth });

  useEffect(() => {
    const storedWidth = Number(window.localStorage.getItem(preferenceKey));
    if (Number.isFinite(storedWidth) && storedWidth > 0) setSidebarWidth(clampWidth(storedWidth));
  }, []);

  function saveWidth(width: number) {
    window.localStorage.setItem(preferenceKey, String(clampWidth(width)));
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, width: sidebarWidth };
    setDragging(true);
  }

  function resize(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setSidebarWidth(clampWidth(dragStart.current.width + event.clientX - dragStart.current.x));
  }

  function finishResize(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const width = clampWidth(dragStart.current.width + event.clientX - dragStart.current.x);
    setSidebarWidth(width);
    saveWidth(width);
    setDragging(false);
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    let nextWidth = sidebarWidth;
    if (event.key === "ArrowLeft") nextWidth -= 16;
    else if (event.key === "ArrowRight") nextWidth += 16;
    else if (event.key === "Home") nextWidth = minimumWidth;
    else if (event.key === "End") nextWidth = maximumWidth;
    else return;

    event.preventDefault();
    nextWidth = clampWidth(nextWidth);
    setSidebarWidth(nextWidth);
    saveWidth(nextWidth);
  }

  const layoutStyle = { "--discovery-sidebar-width": `${sidebarWidth}px` } as CSSProperties;

  return (
    <section
      className={`grid grid-cols-1 gap-3 lg:grid-cols-[var(--discovery-sidebar-width)_0.75rem_minmax(0,1fr)] lg:gap-0 ${dragging ? "select-none" : ""}`}
      style={layoutStyle}
    >
      {sidebar}
      <div
        role="separator"
        aria-label="Resize discovery tree"
        aria-orientation="vertical"
        aria-valuemin={minimumWidth}
        aria-valuemax={maximumWidth}
        aria-valuenow={sidebarWidth}
        tabIndex={0}
        onPointerDown={startResize}
        onPointerMove={resize}
        onPointerUp={finishResize}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={resizeWithKeyboard}
        className="group relative hidden cursor-col-resize touch-none items-stretch justify-center lg:flex focus-visible:outline-none"
        title="Drag to resize the discovery tree"
      >
        <span className={`w-px transition-colors ${dragging ? "bg-cyan-200" : "bg-cyan-300/15 group-hover:bg-cyan-300/60 group-focus-visible:bg-cyan-200"}`} />
        <span className={`absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${dragging ? "bg-cyan-200" : "bg-cyan-300/0 group-hover:bg-cyan-300/50 group-focus-visible:bg-cyan-200"}`} />
      </div>
      <div className="min-w-0 lg:pl-3">{children}</div>
    </section>
  );
}

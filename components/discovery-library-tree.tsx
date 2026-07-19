"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Compass, Folder, FolderOpen } from "lucide-react";

export type DiscoveryTreeNode = {
  id: string;
  label: string;
  href: string;
  count: number;
  icon?: "folder" | "curiosity" | "journal";
  children?: DiscoveryTreeNode[];
};

function ancestorIds(nodes: DiscoveryTreeNode[], activeId: string, parents: string[] = []): string[] {
  for (const node of nodes) {
    if (node.id === activeId) return parents;
    const childPath = ancestorIds(node.children ?? [], activeId, [...parents, node.id]);
    if (childPath.length) return childPath;
  }
  return [];
}

function initiallyExpanded(nodes: DiscoveryTreeNode[], activeId: string) {
  return new Set([
    ...nodes.filter((node) => node.children?.length).map((node) => node.id),
    ...ancestorIds(nodes, activeId)
  ]);
}

function TreeIcon({ node, expanded }: { node: DiscoveryTreeNode; expanded: boolean }) {
  if (node.icon === "journal") return <BookOpen className="h-4 w-4 shrink-0 text-cyan-200/70" />;
  if (node.icon === "curiosity") return <Compass className="h-4 w-4 shrink-0 text-cyan-200/70" />;
  return expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-cyan-200/80" /> : <Folder className="h-4 w-4 shrink-0 text-cyan-200/60" />;
}

function TreeItem({
  node,
  activeFolder,
  expandedIds,
  toggle,
  depth = 0
}: {
  node: DiscoveryTreeNode;
  activeFolder: string;
  expandedIds: Set<string>;
  toggle: (id: string) => void;
  depth?: number;
}) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = hasChildren && expandedIds.has(node.id);
  const active = node.id === activeFolder;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={`group flex items-center gap-1 rounded-md text-sm transition ${active ? "bg-cyan-300/14 text-white" : "text-slate-400 hover:bg-cyan-300/8 hover:text-slate-100"}`}
        style={{ paddingLeft: `${0.35 + depth * 0.85}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${node.label}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-500 transition hover:bg-cyan-300/15 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-200"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="grid h-7 w-7 shrink-0 place-items-center" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          </span>
        )}
        <Link
          href={node.href}
          scroll={false}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded py-1.5 pr-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-200"
        >
          <TreeIcon node={node} expanded={expanded} />
          <span className="min-w-0 flex-1 truncate font-semibold">{node.label}</span>
          <span className="rounded border border-cyan-300/10 bg-slate-950/45 px-1.5 py-0.5 text-[0.62rem] font-bold text-slate-500">{node.count}</span>
        </Link>
      </div>
      {expanded ? (
        <div role="group" className="mt-0.5">
          {node.children?.map((child) => (
            <TreeItem key={child.id} node={child} activeFolder={activeFolder} expandedIds={expandedIds} toggle={toggle} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DiscoveryLibraryTree({ nodes, activeFolder }: { nodes: DiscoveryTreeNode[]; activeFolder: string }) {
  const [expandedIds, setExpandedIds] = useState(() => initiallyExpanded(nodes, activeFolder));

  useEffect(() => {
    const activeAncestors = ancestorIds(nodes, activeFolder);
    if (!activeAncestors.length) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      activeAncestors.forEach((id) => next.add(id));
      return next;
    });
  }, [activeFolder, nodes]);

  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div role="tree" aria-label="Discovery Library content folders" className="space-y-0.5">
      {nodes.map((node) => <TreeItem key={node.id} node={node} activeFolder={activeFolder} expandedIds={expandedIds} toggle={toggle} />)}
    </div>
  );
}

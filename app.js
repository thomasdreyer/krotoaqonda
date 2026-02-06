const defaultJson = {
  type: "flowchart",
  nodes: [
    { id: "1", label: "Start", color: "#4f46e5", note: "Input received" },
    { id: "2", label: "Parse Text", color: "#10b981", note: "NLP extracts nodes" },
    { id: "3", label: "Render", color: "#f97316", note: "HTML + SVG" },
    { id: "4", label: "Export", color: "#ef4444", note: "PNG / SVG / PDF" }
  ],
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" }
  ]
};

const textarea = document.querySelector("#json-input");
const renderButton = document.querySelector("#render-btn");
const status = document.querySelector("#status");
const nodesContainer = document.querySelector("#nodes");
const edgesSvg = document.querySelector("#edges");

const diagramPadding = 70;
const nodeSpacing = 120;

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.style.color = isError ? "#dc2626" : "#475569";
};

const clearDiagram = () => {
  nodesContainer.innerHTML = "";
  edgesSvg.innerHTML = "";
};

const renderEdges = (positions, edges, bounds) => {
  edgesSvg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
  edgesSvg.setAttribute("preserveAspectRatio", "none");

  edges.forEach((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) {
      return;
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.setAttribute("stroke", "#64748b");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("marker-end", "url(#arrow)");
    edgesSvg.appendChild(line);
  });
};

const ensureArrowMarker = () => {
  if (edgesSvg.querySelector("#arrow")) {
    return;
  }
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrow");
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "10");
  marker.setAttribute("refY", "5");
  marker.setAttribute("orient", "auto");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  path.setAttribute("fill", "#64748b");
  marker.appendChild(path);
  defs.appendChild(marker);
  edgesSvg.appendChild(defs);
};

const renderDiagram = (data) => {
  clearDiagram();
  ensureArrowMarker();

  const positions = new Map();
  const diagramRect = nodesContainer.getBoundingClientRect();
  const centerX = diagramRect.width / 2;

  data.nodes.forEach((node, index) => {
    const y = diagramPadding + index * nodeSpacing;
    positions.set(node.id, { x: centerX, y });

    const nodeEl = document.createElement("div");
    nodeEl.className = "node";
    nodeEl.style.left = `${centerX}px`;
    nodeEl.style.top = `${y}px`;
    nodeEl.style.background = node.color || "#4f46e5";
    nodeEl.innerHTML = `${node.label}${node.note ? `<small>${node.note}</small>` : ""}`;
    nodesContainer.appendChild(nodeEl);
  });

  const bounds = {
    width: diagramRect.width || 600,
    height: Math.max(
      diagramRect.height || 400,
      diagramPadding * 2 + (data.nodes.length - 1) * nodeSpacing
    )
  };

  renderEdges(positions, data.edges, bounds);
  setStatus("Diagram rendered.");
};

const parseJson = () => {
  try {
    const parsed = JSON.parse(textarea.value);
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("JSON must include nodes and edges arrays.");
    }
    renderDiagram(parsed);
  } catch (error) {
    setStatus(error.message, true);
  }
};

textarea.value = JSON.stringify(defaultJson, null, 2);
renderButton.addEventListener("click", parseJson);

window.addEventListener("load", () => {
  renderDiagram(defaultJson);
});

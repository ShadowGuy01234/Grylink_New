import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { techpreneurApi } from "../../../api";
import { ArrowLeft, Save, Plus, Move, Trash2 } from "lucide-react";

interface TemplateVar {
  name: string;
  x: number; // percentage
  y: number; // percentage
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  align?: string;
}

interface Template {
  _id?: string;
  name: string;
  imageUrl: string;
  variables: TemplateVar[];
  isActive: boolean;
}

const DEFAULT_VARIABLES: TemplateVar[] = [
  { name: "studentName", x: 25, y: 35, fontSize: 18, fontColor: "#1e293b", fontFamily: "Outfit", align: "left" },
  { name: "collegeName", x: 25, y: 38, fontSize: 14, fontColor: "#475569", fontFamily: "Outfit", align: "left" },
  { name: "joiningLetterId", x: 75, y: 15, fontSize: 12, fontColor: "#64748b", fontFamily: "Courier Prime", align: "left" },
  { name: "joiningDate", x: 75, y: 18, fontSize: 12, fontColor: "#64748b", fontFamily: "Outfit", align: "left" },
  { name: "trackPreference", x: 45, y: 45, fontSize: 14, fontColor: "#0f172a", fontFamily: "Inter", align: "left" },
  { name: "qrCode", x: 80, y: 85, fontSize: 70, fontColor: "#000000", fontFamily: "Inter", align: "center" }
];

const FONTS = [
  { value: "Inter", label: "Inter (Sans-Serif)" },
  { value: "Outfit", label: "Outfit (Geometric)" },
  { value: "Playfair Display", label: "Playfair Display (Serif)" },
  { value: "Montserrat", label: "Montserrat (Modern)" },
  { value: "Great Vibes", label: "Great Vibes (Cursive/Signature)" },
  { value: "Courier Prime", label: "Courier Prime (Typewriter)" }
];

export default function JoiningLetterBuilderPage() {
  const [template, setTemplate] = useState<Template>({
    name: "TechPreneur 2026 Selection & Joining Letter",
    imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=1200",
    variables: [...DEFAULT_VARIABLES],
    isActive: true
  });
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [newVarName, setNewVarName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing active template if any
    techpreneurApi.getJoiningLetterTemplates()
      .then(res => {
        const templates = res.data.templates || [];
        const active = templates.find((t: any) => t.isActive) || templates[0];
        if (active) {
          setTemplate({
            _id: active._id,
            name: active.name,
            imageUrl: active.imageUrl,
            variables: active.variables.length > 0 ? active.variables : [...DEFAULT_VARIABLES],
            isActive: active.isActive
          });
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || template.variables.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate click coordinates in relative percentages
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    const updatedVars = [...template.variables];
    updatedVars[selectedVarIndex] = {
      ...updatedVars[selectedVarIndex],
      x,
      y
    };
    
    setTemplate(prev => ({
      ...prev,
      variables: updatedVars
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await techpreneurApi.saveJoiningLetterTemplate({
        id: template._id,
        name: template.name,
        imageUrl: template.imageUrl,
        variables: template.variables,
        isActive: template.isActive
      });
      alert("Joining Letter template saved successfully!");
    } catch (err: any) {
      alert("Failed to save template: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedVar = (fields: Partial<TemplateVar>) => {
    const updatedVars = [...template.variables];
    updatedVars[selectedVarIndex] = {
      ...updatedVars[selectedVarIndex],
      ...fields
    };
    setTemplate(prev => ({ ...prev, variables: updatedVars }));
  };

  const handleAddVariable = () => {
    const name = newVarName.trim();
    if (!name) return;
    if (template.variables.some(v => v.name.toLowerCase() === name.toLowerCase())) {
      alert("A variable with this name already exists.");
      return;
    }
    const newVar: TemplateVar = {
      name,
      x: 50,
      y: 50,
      fontSize: 14,
      fontColor: "#1e293b",
      fontFamily: "Inter"
    };
    const updatedVars = [...template.variables, newVar];
    setTemplate(prev => ({ ...prev, variables: updatedVars }));
    setSelectedVarIndex(updatedVars.length - 1);
    setNewVarName("");
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const selectedVar = template.variables[selectedVarIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin/techpreneur" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Joining Letter Template Builder</h1>
            <p className="text-xs text-gray-500">Design variable placements on the onboarding selection letterhead</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save Template"}
        </button>
      </header>

      {/* Editor Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Parameters Form */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto space-y-6 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Template Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={e => setTemplate(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Background letterhead URL</label>
                <input
                  type="url"
                  value={template.imageUrl}
                  onChange={e => setTemplate(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Link to selection letter layout"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Variables Selection</h2>
            <div className="space-y-1">
              {template.variables.map((v, i) => (
                <div
                  key={v.name}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedVarIndex === i
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "border-transparent hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVarIndex(i)}
                    className="flex-1 text-left text-xs font-semibold focus:outline-none"
                  >
                    <span className="capitalize">{v.name.replace(/([A-Z])/g, " $1")}</span>
                    <span className="block text-[10px] font-mono text-gray-400 font-normal mt-0.5">{v.x}%, {v.y}%</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (template.variables.length <= 1) {
                        alert("You must keep at least one variable on the template.");
                        return;
                      }
                      if (window.confirm(`Are you sure you want to delete the variable "${v.name}"?`)) {
                        const updatedVars = template.variables.filter((_, idx) => idx !== i);
                        setTemplate(prev => ({ ...prev, variables: updatedVars }));
                        setSelectedVarIndex(0);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100/80 transition-colors focus:opacity-100 ml-2"
                    title="Delete variable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Variable Form */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Add Variable</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. salaryCode"
                  value={newVarName}
                  onChange={e => setNewVarName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="inline-flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200"
                  title="Add variable"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 leading-tight">camelCase (alphanumeric only). Custom vars lookup DB values dynamically.</p>
            </div>
          </div>

          {selectedVar && (
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Variable Settings</h2>
              
              <div className="space-y-3">
                {/* X Coordinate */}
                <div>
                  <div className="flex justify-between text-xs text-gray-700 mb-1 font-semibold">
                    <span>X Position (Horizontal)</span>
                    <span className="font-mono">{selectedVar.x}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={selectedVar.x}
                    onChange={e => updateSelectedVar({ x: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Y Coordinate */}
                <div>
                  <div className="flex justify-between text-xs text-gray-700 mb-1 font-semibold">
                    <span>Y Position (Vertical)</span>
                    <span className="font-mono">{selectedVar.y}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100"
                    value={selectedVar.y}
                    onChange={e => updateSelectedVar({ y: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex justify-between text-xs text-gray-700 mb-1 font-semibold">
                    <span>{selectedVar.name === "qrCode" ? "QR Box Size" : "Font Size (px)"}</span>
                    <span className="font-mono">{selectedVar.fontSize}px</span>
                  </div>
                  <input
                    type="range" min="10" max={selectedVar.name === "qrCode" ? "200" : "72"}
                    value={selectedVar.fontSize}
                    onChange={e => updateSelectedVar({ fontSize: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Font Color */}
                {selectedVar.name !== "qrCode" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Font Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedVar.fontColor}
                        onChange={e => updateSelectedVar({ fontColor: e.target.value })}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={selectedVar.fontColor}
                        onChange={e => updateSelectedVar({ fontColor: e.target.value })}
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Font Family */}
                {selectedVar.name !== "qrCode" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Font Family</label>
                    <select
                      value={selectedVar.fontFamily}
                      onChange={e => updateSelectedVar({ fontFamily: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500"
                    >
                      {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text Alignment */}
                {selectedVar.name !== "qrCode" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alignment</label>
                    <select
                      value={selectedVar.align || "center"}
                      onChange={e => updateSelectedVar({ align: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="left">Left Align</option>
                      <option value="center">Center Align</option>
                      <option value="right">Right Align</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Canva Visual Preview Canvas */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-gray-100">
          <div className="max-w-3xl w-full">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1.5">
              <Move className="w-3.5 h-3.5" /> Letter Preview Canvas
            </h3>
            
            {/* Template Container */}
            <div 
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative bg-white shadow-lg border border-gray-300 rounded overflow-hidden select-none cursor-crosshair mx-auto"
              style={{ aspectRatio: "1/1.414" }} // standard A4 portrait letterhead ratio
            >
              <img 
                src={template.imageUrl} 
                alt="Selection letter template background" 
                className="w-full h-full object-fill pointer-events-none"
              />

              {/* Overlaid variables */}
              {template.variables.map((v, i) => {
                const isActive = selectedVarIndex === i;
                
                if (v.name === "qrCode") {
                  return (
                    <div
                      key={v.name}
                      style={{
                        position: "absolute",
                        left: `${v.x}%`,
                        top: `${v.y}%`,
                        width: `${v.fontSize}px`,
                        height: `${v.fontSize}px`,
                        transform: "translate(-50%, -50%)",
                        boxSizing: "border-box"
                      }}
                      className={`bg-white border flex flex-col items-center justify-center text-[10px] font-bold select-none ${
                        isActive ? "border-blue-600 ring-2 ring-blue-500/20 z-20" : "border-gray-800 border-dashed"
                      }`}
                    >
                      <div className="text-[14px]">🏁</div>
                      <span>[QR]</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={v.name}
                    style={{
                      position: "absolute",
                      left: `${v.x}%`,
                      top: `${v.y}%`,
                      fontSize: `${v.fontSize * 0.8}px`,
                      color: v.fontColor,
                      fontFamily: v.fontFamily,
                      transform: v.align === "left" 
                        ? "translateY(-50%)" 
                        : v.align === "right" 
                          ? "translate(-100%, -50%)" 
                          : "translate(-50%, -50%)",
                      textAlign: (v.align || "center") as any,
                      whiteSpace: "nowrap"
                    }}
                    className={`px-1.5 py-0.5 rounded ${
                      isActive ? "bg-blue-100/40 outline outline-2 outline-blue-500 z-20" : ""
                    } ${v.align === "left" ? "text-left" : v.align === "right" ? "text-right" : "text-center"}`}
                  >
                    {v.name === "studentName" && "John Doe"}
                    {v.name === "collegeName" && "IIT Bombay"}
                    {v.name === "joiningLetterId" && "JL-TP26-A8D3F9"}
                    {v.name === "joiningDate" && "July 12, 2026"}
                    {v.name === "trackPreference" && "Full-Stack Web Track"}
                    {!["studentName", "collegeName", "joiningLetterId", "joiningDate", "trackPreference", "qrCode"].includes(v.name) && `[${v.name}]`}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 text-center mt-3">Click on any variable in the left pane, then click anywhere on the selection letter template background image to place it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

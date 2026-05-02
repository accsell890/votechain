import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Upload, ScanFace, CheckCircle2, Loader2, FileCheck2, X, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getUser, setUser } from "@/store/voteStore";
import { Progress } from "@/components/ui/progress";

type IdStatus = "idle" | "processing" | "verified";

interface ExtractedId {
  name: string;
  idNumber: string; // already masked
  type: string;
}

const Verify = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [idStatus, setIdStatus] = useState<IdStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedId | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const uploaded = idStatus === "verified";

  const acceptFile = (f: File) => {
    const okType = /^image\//.test(f.type) || f.type === "application/pdf";
    if (!okType) {
      toast.error("Only image or PDF files are allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5 MB)");
      return;
    }
    setFile(f);
    if (/^image\//.test(f.type)) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    runKyc(f);
  };

  const runKyc = (f: File) => {
    setIdStatus("processing");
    setProgress(8);
    const start = Date.now();
    const tick = () => {
      const p = Math.min(98, 8 + ((Date.now() - start) / 2400) * 92);
      setProgress(p);
      if (p < 98) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    setTimeout(() => {
      setProgress(100);
      const isAadhaar = /aadhaar/i.test(f.name);
      const idNum = isAadhaar
        ? "XXXX XXXX " + Math.floor(1000 + Math.random() * 8999)
        : "ABC" + "XXXXX" + Math.floor(100 + Math.random() * 899);
      setExtracted({
        name: "Govind Sanjay",
        idNumber: idNum,
        type: isAadhaar ? "Aadhaar" : "Voter ID (EPIC)",
      });
      setIdStatus("verified");
      toast.success("Document verified");
    }, 2600);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setExtracted(null);
    setIdStatus("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
      const u = getUser();
      if (u) setUser({ ...u, verified: true });
      toast.success("Identity verified successfully");
      setTimeout(() => navigate("/dashboard"), 1400);
    }, 2800);
  };

  return (
    <AppShell title="Identity Verification" showBack>
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="rounded-2xl bg-card border p-4 shadow-soft animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">1</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Upload Voter ID / Aadhaar</div>
              <div className="text-xs text-muted-foreground">Drag & drop or tap to upload (KYC demo)</div>
            </div>
            {uploaded && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/15 text-accent border border-accent/30">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) acceptFile(f);
            }}
          />

          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) acceptFile(f);
              }}
              className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center transition-smooth ${
                dragOver
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/30 text-primary hover:bg-primary/5"
              }`}
            >
              <Upload className="w-8 h-8 mb-2" />
              <div className="text-sm font-medium">Drag & drop or tap to upload</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">JPG / PNG / PDF · Max 5MB</div>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border bg-muted/40">
                {previewUrl ? (
                  <img src={previewUrl} alt="ID preview" className="w-full max-h-56 object-contain bg-black/5" />
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <FileCheck2 className="w-6 h-6 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · PDF</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur border flex items-center justify-center hover:bg-background"
                  aria-label="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-background/85 border">
                  {idStatus === "processing" && (<><Loader2 className="w-3 h-3 animate-spin" /> Processing</>)}
                  {idStatus === "verified" && (<><CheckCircle2 className="w-3 h-3 text-accent" /> Verified</>)}
                  {idStatus === "idle" && <>Uploaded</>}
                </div>
              </div>

              {idStatus === "processing" && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    AI Verification in progress…
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {idStatus === "verified" && extracted && (
                <div className="rounded-xl bg-accent/5 border border-accent/30 p-3 space-y-1.5 animate-fade-in">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Extracted Details</div>
                  <Row label="Name" value={extracted.name} />
                  <Row label="Document" value={extracted.type} />
                  <Row label="ID Number" value={extracted.idNumber} mono />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-card border p-4 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${uploaded ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>2</div>
            <div>
              <div className="font-semibold text-sm">Face Verification</div>
              <div className="text-xs text-muted-foreground">AI-powered biometric scan</div>
            </div>
          </div>

          <div className="relative mx-auto w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center">
            {done ? (
              <div className="flex flex-col items-center text-accent">
                <CheckCircle2 className="w-16 h-16" />
                <div className="text-xs font-semibold mt-2">Verified</div>
              </div>
            ) : (
              <>
                <ScanFace className={`w-20 h-20 text-primary/60 ${scanning ? "animate-pulse" : ""}`} />
                {scanning && (
                  <>
                    <div className="absolute inset-0 scan-line h-8" />
                    <div className="absolute inset-2 border-2 border-primary/40 rounded-xl animate-pulse" />
                  </>
                )}
              </>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground mt-3">
            {scanning ? "Analyzing facial features…" : done ? "Match confidence: 98.7%" : "Position your face inside the frame"}
          </div>

          <Button
            onClick={startScan}
            disabled={!uploaded || scanning || done}
            className="w-full mt-4 h-11 gradient-hero text-primary-foreground hover:opacity-95 shadow-elegant disabled:opacity-50"
          >
            {scanning ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning…</>)
              : done ? (<><CheckCircle2 className="w-4 h-4 mr-2" /> Verified</>)
              : (<><ScanFace className="w-4 h-4 mr-2" /> Start Face Scan</>)}
          </Button>
        </div>

        <div className="rounded-xl bg-muted/60 border p-3 text-[11px] text-muted-foreground text-center">
          🔐 Your biometric data is encrypted and never stored on our servers.
        </div>
      </div>
    </AppShell>
  );
};

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={mono ? "font-mono" : "font-medium"}>{value}</span>
  </div>
);

export default Verify;

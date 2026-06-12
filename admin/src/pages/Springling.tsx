import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Springling() {
  const [searchParams] = useSearchParams();
  const clientToken = searchParams.get("t") ?? "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/add-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientToken, name: name.trim(), phone: phone.trim(), source: "springling-lp" }),
      });
      if (!r.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f9f6f0] flex flex-col">

      {/* Decorative top stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#c8a97e] via-[#e8c4b8] to-[#a8c5a0]" />

      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 max-w-sm"
            >
              <div className="text-5xl">🌸</div>
              <h2 className="text-2xl font-semibold text-[#2d2d2d]" style={{ letterSpacing: "-0.02em" }}>
                Thank you, {name.split(" ")[0]}!
              </h2>
              <p className="text-[#7a7a6e] text-sm leading-relaxed">
                We'll be in touch shortly to arrange your flowers.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm flex flex-col items-center gap-6"
            >
              {/* Brand */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-3xl">🌷</span>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#a8856a]">Springling</p>
              </div>

              {/* Headline */}
              <div className="flex flex-col gap-2">
                <h1
                  className="text-3xl sm:text-4xl font-semibold text-[#2d2d2d] leading-tight"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Fresh flowers,<br />made for you.
                </h1>
                <p className="text-[#7a7a6e] text-sm leading-relaxed">
                  Hand-picked bouquets delivered to your door. Leave your name and number and we'll sort the rest.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[#e0d8cf] bg-white text-[#2d2d2d] text-sm placeholder:text-[#b5afa6] focus:outline-none focus:ring-2 focus:ring-[#c8a97e]/40 transition-all"
                />
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[#e0d8cf] bg-white text-[#2d2d2d] text-sm placeholder:text-[#b5afa6] focus:outline-none focus:ring-2 focus:ring-[#c8a97e]/40 transition-all"
                />
                {error && <p className="text-xs text-red-500 text-left">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !phone.trim()}
                  className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #c8a97e, #b8956a)" }}
                >
                  {loading ? "Sending…" : "Get my bouquet"}
                </button>
              </form>

              <p className="text-[10px] text-[#b5afa6]">No spam. We only contact you about your order.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="pb-5 text-center">
        <p className="text-[10px] text-[#c8c4bc]">Springling · Fresh flowers, always</p>
      </div>

    </div>
  );
}

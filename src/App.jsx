import React, { useState, useEffect, useRef } from "react";
import { Play, X, Lock, Star, ChevronLeft, ChevronRight, Settings, Film, Clock, Calendar, Trash2 } from "lucide-react";
import { supabase } from "./supabaseClient";

const FONT_DISPLAY = "'Bebas Neue', 'Oswald', sans-serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

const COLORS = {
  bg: "#0B0B0D",
  bgCard: "#16161A",
  text: "#EDEAE3",
  textMuted: "#9A968D",
  accent: "#C8453C",
  gold: "#C9A24B",
  border: "#2A2A2E",
};

const CATEGORIES = ["Released", "Coming Soon", "Trailers", "Wedding Films", "Corporate Films"];

function useFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFilms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("films").select("*").order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      const mapped = data.map((f) => ({
        ...f,
        cast: f.cast_members || [],
        crew: f.crew || [],
        isPrivate: f.is_private,
        videoId: f.video_id,
      }));
      setFilms(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const addFilm = async (film) => {
    const { error } = await supabase.from("films").insert([{
      id: "f" + Date.now(),
      title: film.title,
      category: film.category,
      type: film.type,
      year: film.year,
      duration: film.duration,
      rating: film.rating,
      synopsis: film.synopsis,
      cast_members: film.cast,
      crew: film.crew,
      video_id: film.videoId,
      platform: film.platform,
      featured: film.featured,
      is_private: film.isPrivate,
      password: film.password,
    }]);
    if (error) {
      setError(error.message);
      return false;
    }
    await fetchFilms();
    return true;
  };

  const deleteFilm = async (id) => {
    const { error } = await supabase.from("films").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    await fetchFilms();
  };

  return { films, loading, error, addFilm, deleteFilm, refetch: fetchFilms };
}

function getEmbedUrl(film) {
  if (film.platform === "vimeo") {
    return `https://player.vimeo.com/video/${film.videoId}?color=C8453C&title=0&byline=0&portrait=0`;
  }
  return `https://www.youtube.com/embed/${film.videoId}?rel=0`;
}

function PosterCard({ film, onClick }) {
  return (
    <div onClick={onClick} className="poster-card" style={{ flex: "0 0 auto", width: 240, cursor: "pointer", position: "relative" }}>
      <div style={{
        width: "100%", height: 135, borderRadius: 6,
        background: `linear-gradient(135deg, ${COLORS.bgCard}, #0d0d10)`,
        position: "relative", overflow: "hidden", border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)" }}>
          <Film size={28} color={COLORS.textMuted} style={{ opacity: 0.4 }} />
        </div>
        {film.isPrivate && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: 4 }}>
            <Lock size={12} color={COLORS.gold} />
          </div>
        )}
        {film.featured && (
          <div style={{ position: "absolute", top: 8, left: 8, background: COLORS.gold, color: "#1a1a1a", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: 0.5 }}>FEATURED</div>
        )}
        <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: COLORS.text, letterSpacing: 0.5, lineHeight: 1 }}>{film.title}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: COLORS.textMuted, fontFamily: FONT_BODY }}>
        <span>{film.type}</span><span>{film.year}</span>
      </div>
    </div>
  );
}

function Row({ title, films, onSelect }) {
  const scrollRef = useRef(null);
  if (!films.length) return null;
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <div style={{ marginBottom: 36, position: "relative" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, letterSpacing: 1, color: COLORS.text, marginBottom: 12, paddingLeft: 4, display: "flex", alignItems: "center", gap: 8 }}>
        {title}
        <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>{films.length} {films.length === 1 ? "film" : "films"}</span>
      </div>
      <div style={{ position: "relative" }}>
        <button onClick={() => scroll(-1)} className="row-arrow" style={{ left: -4 }}><ChevronLeft size={20} /></button>
        <div ref={scrollRef} className="hide-scrollbar" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          {films.map((f) => <PosterCard key={f.id} film={f} onClick={() => onSelect(f)} />)}
        </div>
        <button onClick={() => scroll(1)} className="row-arrow" style={{ right: -4 }}><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

function PasswordGate({ film, onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const submit = () => (pw === film.password ? onUnlock() : setError(true));

  return (
    <div style={{ padding: "40px 24px", textAlign: "center" }}>
      <Lock size={32} color={COLORS.gold} style={{ marginBottom: 16 }} />
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: COLORS.text, marginBottom: 6, letterSpacing: 1 }}>PRIVATE DELIVERY</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Enter the password shared with you to view "{film.title}"</div>
      <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setError(false); }} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password" style={{ background: COLORS.bgCard, border: `1px solid ${error ? COLORS.accent : COLORS.border}`, borderRadius: 6, padding: "10px 14px", color: COLORS.text, fontFamily: FONT_BODY, fontSize: 14, width: 220, outline: "none", textAlign: "center" }} />
      {error && <div style={{ color: COLORS.accent, fontSize: 12, marginTop: 8, fontFamily: FONT_BODY }}>Incorrect password — try again.</div>}
      <div style={{ marginTop: 18 }}>
        <button onClick={submit} style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Unlock</button>
      </div>
    </div>
  );
}

function DetailModal({ film, onClose }) {
  const [unlocked, setUnlocked] = useState(!film.isPrivate);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.bgCard, borderRadius: 10, maxWidth: 720, width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1px solid ${COLORS.border}`, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 5, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 32, height: 32, color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        {!unlocked ? <PasswordGate film={film} onUnlock={() => setUnlocked(true)} /> : (
          <>
            <div style={{ aspectRatio: "16/9", width: "100%", background: "#000" }}>
              <iframe src={getEmbedUrl(film)} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={film.title} />
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: COLORS.text, letterSpacing: 0.5, lineHeight: 1.1 }}>{film.title}</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10, marginBottom: 16, fontFamily: FONT_BODY, fontSize: 12, color: COLORS.textMuted, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{film.year}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{film.duration}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={12} color={COLORS.gold} />{film.rating}</span>
                <span style={{ background: COLORS.bg, padding: "2px 10px", borderRadius: 4, border: `1px solid ${COLORS.border}` }}>{film.category}</span>
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: COLORS.text, lineHeight: 1.6, marginBottom: 20 }}>{film.synopsis}</div>
              {film.cast?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Featuring</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.text }}>{film.cast.join(", ")}</div>
                </div>
              )}
              {film.crew?.length > 0 && (
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Crew</div>
                  {film.crew.map((c, i) => <div key={i} style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.text, marginBottom: 2 }}><span style={{ color: COLORS.textMuted }}>{c.role}:</span> {c.name}</div>)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ films, addFilm, deleteFilm, onClose }) {
  const blank = { title: "", category: CATEGORIES[0], type: "Full Film", year: "2026", duration: "", rating: "All Ages", synopsis: "", cast: "", crewRole: "", crewName: "", videoId: "", platform: "youtube", featured: false, isPrivate: false, password: "" };
  const [form, setForm] = useState(blank);
  const [tab, setTab] = useState("add");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title || !form.videoId) return;
    setSaving(true);
    const ok = await addFilm({
      ...form,
      cast: form.cast ? form.cast.split(",").map((s) => s.trim()) : [],
      crew: form.crewName ? [{ role: form.crewRole || "Director", name: form.crewName }] : [],
    });
    setSaving(false);
    if (ok) setForm(blank);
  };

  const inputStyle = { width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "9px 12px", color: COLORS.text, fontFamily: FONT_BODY, fontSize: 13, outline: "none", marginBottom: 12 };
  const labelStyle = { fontFamily: FONT_BODY, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.bgCard, borderRadius: 10, maxWidth: 560, width: "100%", maxHeight: "88vh", overflowY: "auto", border: `1px solid ${COLORS.border}`, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: COLORS.text, letterSpacing: 1 }}>STUDIO ADMIN</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["add", "manage"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", background: tab === t ? COLORS.accent : "transparent", color: tab === t ? "#fff" : COLORS.textMuted, border: `1px solid ${tab === t ? COLORS.accent : COLORS.border}`, borderRadius: 6, fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }}>{t === "add" ? "Add Film" : `Manage (${films.length})`}</button>
          ))}
        </div>
        {tab === "add" ? (
          <>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sharma Wedding — Goa" />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Full Film</option><option>Trailer</option><option>Teaser</option><option>Highlight Reel</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Year</label><input style={inputStyle} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Duration</label><input style={inputStyle} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 15 min" /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Rating</label><input style={inputStyle} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="All Ages" /></div>
            </div>
            <label style={labelStyle}>Synopsis</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
            <label style={labelStyle}>Cast / Featuring (comma separated)</label>
            <input style={inputStyle} value={form.cast} onChange={(e) => setForm({ ...form, cast: e.target.value })} placeholder="The Sharma Family" />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Crew Role</label><input style={inputStyle} value={form.crewRole} onChange={(e) => setForm({ ...form, crewRole: e.target.value })} placeholder="Director" /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Crew Name</label><input style={inputStyle} value={form.crewName} onChange={(e) => setForm({ ...form, crewName: e.target.value })} placeholder="Safal Choudhary" /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Platform</label>
                <select style={inputStyle} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option></select>
              </div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Video ID *</label><input style={inputStyle} value={form.videoId} onChange={(e) => setForm({ ...form, videoId: e.target.value })} placeholder="e.g. dQw4w9WgXcQ" /></div>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY, fontSize: 12, color: COLORS.text, cursor: "pointer" }}><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />Featured in hero banner</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY, fontSize: 12, color: COLORS.text, cursor: "pointer" }}><input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} />Private (password protected)</label>
            </div>
            {form.isPrivate && (<><label style={labelStyle}>Password for this film</label><input style={inputStyle} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password to share with the client" /></>)}
            <button onClick={submit} disabled={saving} style={{ width: "100%", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 6, padding: "11px 0", fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: saving ? "wait" : "pointer", marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5, opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Add to Library"}</button>
          </>
        ) : (
          <div>
            {films.length === 0 && <div style={{ color: COLORS.textMuted, fontFamily: FONT_BODY, fontSize: 13 }}>No films yet.</div>}
            {films.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: COLORS.bg, borderRadius: 6, marginBottom: 8, border: `1px solid ${COLORS.border}` }}>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{f.title}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: COLORS.textMuted, display: "flex", gap: 6, alignItems: "center" }}>{f.category} · {f.year} {f.isPrivate && <Lock size={10} color={COLORS.gold} />}</div>
                </div>
                <button onClick={() => deleteFilm(f.id)} style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", padding: 6 }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { films, loading, error, addFilm, deleteFilm } = useFilms();
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const featured = films.find((f) => f.featured) || films[0];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: FONT_BODY, color: COLORS.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .poster-card:hover { transform: scale(1.06); z-index: 2; }
        .row-arrow { position: absolute; top: 35%; transform: translateY(-50%); background: rgba(11,11,13,0.85); border: 1px solid ${COLORS.border}; color: ${COLORS.text}; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 3; backdrop-filter: blur(4px); }
        .row-arrow:hover { background: ${COLORS.accent}; border-color: ${COLORS.accent}; }
        .sprocket { background-image: radial-gradient(circle, ${COLORS.border} 1.5px, transparent 1.5px); background-size: 16px 16px; height: 6px; opacity: 0.5; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 32px", position: "sticky", top: 0, zIndex: 50, background: "linear-gradient(180deg, rgba(11,11,13,0.95), rgba(11,11,13,0.7))", backdropFilter: "blur(8px)", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: COLORS.accent, letterSpacing: 1 }}>THE CANDID FILMS</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Studio</div>
        </div>
        <button onClick={() => setShowAdmin(true)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 14px", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY, fontSize: 12 }}><Settings size={14} /> Manage Library</button>
      </div>

      {error && (
        <div style={{ background: "#3a1515", color: "#ff8a80", padding: "10px 32px", fontSize: 13, fontFamily: FONT_BODY }}>
          Connection error: {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: COLORS.textMuted }}>Loading library…</div>
      ) : (
        <>
          {featured && (
            <div style={{ position: "relative", height: 360, display: "flex", alignItems: "flex-end", background: `linear-gradient(180deg, rgba(11,11,13,0.2) 0%, ${COLORS.bg} 95%), linear-gradient(135deg, #1a1015, #0B0B0D)`, padding: "0 32px 32px", marginBottom: 8 }}>
              <div style={{ maxWidth: 560 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: COLORS.gold, color: "#1a1a1a", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 3, letterSpacing: 0.5 }}>FEATURED</span>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{featured.category}</span>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, lineHeight: 0.95, color: COLORS.text, letterSpacing: 0.5, marginBottom: 12 }}>{featured.title}</div>
                <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 18, maxWidth: 480 }}>{featured.synopsis}</div>
                <button onClick={() => setSelectedFilm(featured)} style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 6, padding: "11px 24px", fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}><Play size={16} fill="#fff" /> Watch Now</button>
              </div>
            </div>
          )}
          <div className="sprocket" />
          <div style={{ padding: "28px 32px 60px" }}>
            {CATEGORIES.map((cat) => <Row key={cat} title={cat} films={films.filter((f) => f.category === cat)} onSelect={setSelectedFilm} />)}
            {films.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.textMuted }}>
                <Film size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: 1 }}>YOUR LIBRARY IS EMPTY</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Click "Manage Library" to add your first film.</div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedFilm && <DetailModal film={selectedFilm} onClose={() => setSelectedFilm(null)} />}
      {showAdmin && <AdminPanel films={films} addFilm={addFilm} deleteFilm={deleteFilm} onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

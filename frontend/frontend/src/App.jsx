import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

// MUST match your Supabase table name
const TABLE = "guestbook_messages";

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");

  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const nameRef = useRef(null);

  const totalMessages = messages.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => {
      const blob = `${m.name} ${m.mood || ""} ${m.message}`.toLowerCase();
      return blob.includes(q);
    });
  }, [messages, query]);

  function showToast(text) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1000);
  }

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch failed:", error);
      alert("Fetch failed: " + error.message);
      setLoading(false);
      return;
    }

    setMessages(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const n = name.trim();
    const msg = message.trim();
    const md = mood.trim();

    if (!n || !msg) return;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{ name: n, mood: md || null, message: msg }])
      .select("*")
      .single();

    if (error) {
      console.error("Insert failed:", error);
      alert("Insert failed: " + error.message);
      return;
    }

    setMessages((prev) => [data, ...prev]);
    setMood("");
    setMessage("");
    showToast("Saved");
  }

  function onClear() {
    setName("");
    setMood("");
    setMessage("");
    nameRef.current?.focus();
  }

  async function onDeleteOne(id) {
    if (!confirm("Delete this entry?")) return;

    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) {
      console.error("Delete failed:", error);
      alert("Delete failed: " + error.message);
      return;
    }

    setMessages((prev) => prev.filter((m) => m.id !== id));
    showToast("Deleted");
  }

  return (
    <div className="page">
      <div className="wrap">
        <header className="header">
          <div className="brand">
            <div className="mark" aria-hidden="true" />
            <div>
              <h1 className="title">Maku's Guestbook</h1>
            </div>
          </div>
        </header>

        <main className="stack">
          {/* Stats */}
          <section className="card">
            <div className="cardHead">
              <h2 className="cardTitle">Overview</h2>
              <button className="btn btnGhost" type="button" onClick={fetchMessages}>
                Refresh
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="statLabel">Total entries</div>
                <div className="statValue">{totalMessages}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Showing</div>
                <div className="statValue">{filtered.length}</div>
              </div>
            </div>
          </section>

          {/* Form */}
          <section className="card">
            <div className="cardHead">
              <h2 className="cardTitle">Leave a message</h2>
              <div className={`toast ${toast ? "show" : ""}`}>{toast || " "}</div>
            </div>

            <form className="form" onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  ref={nameRef}
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={40}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="mood">Tag (optional)</label>
                <input
                  id="mood"
                  className="input"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g. friend, classmate"
                  maxLength={24}
                />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message"
                  maxLength={280}
                  required
                />
                <div className="hint">{message.length} / 280</div>
              </div>

              <div className="actions">
                <button className="btn btnPrimary" type="submit">
                  Submit
                </button>
                <button className="btn btnGhost" type="button" onClick={onClear}>
                  Clear
                </button>
              </div>
            </form>
          </section>

          {/* Friends Guest List */}
          <section className="card">
            <div className="cardHead">
              <h2 className="cardTitle">Friends guest list</h2>
              <input
                className="input search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or message"
              />
            </div>

            {loading ? (
              <div className="empty">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="empty">No entries found.</div>
            ) : (
              <div className="list">
                {filtered.map((m) => (
                  <article className="item" key={m.id}>
                    <div className="itemTop">
                      <div className="who">
                        <div className="whoName">{m.name}</div>
                        {m.mood ? <div className="pill">{m.mood}</div> : null}
                      </div>
                      <div className="time">{formatDate(m.created_at)}</div>
                    </div>

                    <div className="msg">{m.message}</div>

                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="footer">
  <div className="marquee-wrapper">
    <div className="marquee marquee-fade">
      <div className="marquee-track">
        <img src="https://cdn.simpleicons.org/react/ffffff" alt="React" />
        <img src="https://cdn.simpleicons.org/vue.js/ffffff" alt="Vue" />
        <img src="https://cdn.simpleicons.org/nestjs/ffffff" alt="NestJS" />

        {/* duplicate for seamless loop */}
        <img src="https://cdn.simpleicons.org/react/ffffff" alt="React" />
        <img src="https://cdn.simpleicons.org/vue.js/ffffff" alt="Vue" />
        <img src="https://cdn.simpleicons.org/nestjs/ffffff" alt="NestJS" />
      </div>
    </div>
  </div>
</footer>
      </div>
    </div>
  );
}
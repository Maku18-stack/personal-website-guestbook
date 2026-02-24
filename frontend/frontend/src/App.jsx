import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE}/guestbook`;

export default function App() {
  const [posts, setPosts] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await axios.get(API);
    setPosts(res.data);
  };

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(API, { name, message });
    setName("");
    setMessage("");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Guestbook</h1>

      <form onSubmit={submit}>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <br /><br />
        <button>Post</button>
      </form>

      <hr />

      {posts.map((p) => (
        <div key={p.id}>
          <b>{p.name}</b>
          <p>{p.message}</p>
        </div>
      ))}
    </div>
  );
}
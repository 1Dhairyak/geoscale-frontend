import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { friendService } from "../services/gameServices";

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const [addStatus, setAddStatus] = useState(null); // null | "sending" | "sent" | "error"
  const [error, setError] = useState(null);

  function loadFriends() {
    setLoading(true);
    Promise.all([friendService.list(), friendService.pending()])
      .then(([fr, pend]) => {
        setFriends(Array.isArray(fr.data) ? fr.data : []);
        setPending(Array.isArray(pend.data) ? pend.data : []);
      })
      .catch(() => setError("Failed to load friends."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadFriends(); }, []);

  async function handleAdd() {
    if (!searchVal.trim()) return;
    setAddStatus("sending");
    try {
      await friendService.sendRequest(searchVal.trim());
      setAddStatus("sent");
      setSearchVal("");
      setTimeout(() => setAddStatus(null), 3000);
    } catch (e) {
      setAddStatus("error");
      setTimeout(() => setAddStatus(null), 3000);
    }
  }

  async function handleAccept(friendshipId) {
    await friendService.accept(friendshipId);
    loadFriends();
  }

  async function handleReject(friendshipId) {
    await friendService.reject(friendshipId);
    loadFriends();
  }

  async function handleChallenge(username) {
    try {
      await friendService.challenge(username);
    } catch (e) {
      alert("Could not send challenge.");
    }
  }

  async function handleRemove(username) {
    await friendService.remove(username);
    loadFriends();
  }

  // Friends are returned as Friendship objects; normalise to get the "other" user
  function getFriendName(f) {
    // Backend may return { friendUsername, username, friend: { username } } depending on DTO
    return f.friendUsername ?? f.friend?.username ?? f.username ?? "Unknown";
  }

  function getFriendElo(f) {
    return f.friendElo ?? f.friend?.eloRating ?? f.eloRating ?? null;
  }

  function isOnline(f) {
    return f.online ?? false;
  }

  const online  = friends.filter(f => isOnline(f));
  const offline = friends.filter(f => !isOnline(f));

  return (
    <div style={{ padding: "32px 36px", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Social</p>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 26, color: "#1a1a2e", margin: 0 }}>Friends</h1>
      </div>

      {/* Add friend */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Search username to add..."
          style={{
            flex: 1, maxWidth: 280, padding: "9px 14px", borderRadius: 8,
            border: "1px solid #e8eaed", fontFamily: "DM Sans, sans-serif",
            fontSize: 13, color: "#1a1a2e", outline: "none",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={addStatus === "sending"}
          style={{
            padding: "9px 20px", borderRadius: 8, border: "none",
            background: "#7c3aed", color: "#fff", fontFamily: "DM Sans, sans-serif",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          {addStatus === "sending" ? "Sending..." : "Add Friend"}
        </button>
        {addStatus === "sent"  && <span style={{ fontSize: 13, color: "#16a34a", alignSelf: "center" }}>Request sent!</span>}
        {addStatus === "error" && <span style={{ fontSize: 13, color: "#dc2626", alignSelf: "center" }}>Failed — user not found?</span>}
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Pending Requests ({pending.length})
          </div>
          <div style={{ background: "#fff", border: "1px solid #e8eaed", borderRadius: 12 }}>
            {pending.map((p, i) => (
              <div key={p.id ?? i} style={{
                display: "flex", alignItems: "center", padding: "14px 20px",
                borderBottom: i < pending.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#6b7280", marginRight: 12,
                }}>
                  {(p.senderUsername ?? p.username ?? "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
                  {p.senderUsername ?? p.username}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleAccept(p.id)} style={{
                    padding: "6px 14px", borderRadius: 7, border: "none",
                    background: "#7c3aed", color: "#fff", fontWeight: 600,
                    fontSize: 12, cursor: "pointer",
                  }}>Accept</button>
                  <button onClick={() => handleReject(p.id)} style={{
                    padding: "6px 14px", borderRadius: 7, border: "1px solid #e8eaed",
                    background: "#fff", color: "#6b7280", fontWeight: 600,
                    fontSize: 12, cursor: "pointer",
                  }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "40px 0" }}>Loading...</div>}
      {error   && <div style={{ color: "#dc2626", fontSize: 14, textAlign: "center", padding: "40px 0" }}>{error}</div>}

      {/* Online */}
      {!loading && online.length > 0 && (
        <FriendSection
          title={`Online (${online.length})`}
          friends={online}
          getFriendName={getFriendName}
          getFriendElo={getFriendElo}
          online={true}
          onChallenge={handleChallenge}
          onRemove={handleRemove}
        />
      )}

      {/* Offline */}
      {!loading && offline.length > 0 && (
        <FriendSection
          title={`Offline (${offline.length})`}
          friends={offline}
          getFriendName={getFriendName}
          getFriendElo={getFriendElo}
          online={false}
          onChallenge={handleChallenge}
          onRemove={handleRemove}
        />
      )}

      {!loading && !error && friends.length === 0 && pending.length === 0 && (
        <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "60px 0" }}>
          No friends yet. Search for a username above to add one!
        </div>
      )}
    </div>
  );
}

function FriendSection({ title, friends, getFriendName, getFriendElo, online, onChallenge, onRemove }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ background: "#ffffff", border: "1px solid #e8eaed", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {friends.map((f, i) => {
          const name = getFriendName(f);
          const elo  = getFriendElo(f);
          return (
            <div key={f.id ?? i} style={{
              display: "flex", alignItems: "center", padding: "14px 20px",
              borderBottom: i < friends.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <div style={{ position: "relative", marginRight: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#6b7280",
                }}>
                  {name[0].toUpperCase()}
                </div>
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 9, height: 9, borderRadius: "50%",
                  background: online ? "#22c55e" : "#d1d5db",
                  border: "1.5px solid #fff",
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{name}</div>
                {elo != null && <div style={{ fontSize: 11, color: "#9ca3af" }}>ELO {elo}</div>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {online && (
                  <button onClick={() => onChallenge(name)} style={{
                    padding: "6px 14px", borderRadius: 7,
                    border: "1px solid #ddd6fe", background: "#faf5ff",
                    color: "#7c3aed", fontWeight: 600, fontSize: 12, cursor: "pointer",
                  }}>Challenge</button>
                )}
                <button onClick={() => onRemove(name)} style={{
                  padding: "6px 10px", borderRadius: 7,
                  border: "1px solid #fecaca", background: "#fff5f5",
                  color: "#dc2626", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

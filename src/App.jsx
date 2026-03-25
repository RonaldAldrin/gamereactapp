import {useEffect,useState } from 'react'
import "./index.css"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'


const getSentiment = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("good") || lower.includes("great") || lower.includes("positive"))
    return "Positive";
  if (lower.includes("bad") || lower.includes("negative") || lower.includes("controversy"))
    return "Negative";
  return "Neutral";
};

const categorize = (text) => {
  const lower = text.toLowerCase();

  // filter non-gaming
  if (
    lower.includes("movie") ||
    lower.includes("film") ||
    lower.includes("hollywood") ||
    lower.includes("actor") ||
    lower.includes("actress")
  ) {
    return { genre: "Non-Gaming", platform: "N/A", theme: "N/A" };
  }

  let genre =
    lower.includes("rpg") ? "RPG" :
    lower.includes("fps") ? "FPS" :
    lower.includes("strategy") ? "Strategy" :
    lower.includes("mmo") ? "MMO" :
    "General";

  let platform =
    lower.includes("pc") ? "PC" :
    lower.includes("playstation") ? "PlayStation" :
    lower.includes("xbox") ? "Xbox" :
    lower.includes("nintendo") ? "Nintendo" :
    "Unknown";

  let theme =
    lower.includes("microtransaction") || lower.includes("dlc")
      ? "Monetization"
      : lower.includes("patch")
      ? "Updates"
      : lower.includes("community")
      ? "Community"
      : lower.includes("gameplay")
      ? "Gameplay"
      : "General";

  return { genre, platform, theme };
};

const Card = ({ item }) => {
  const sentiment = getSentiment(item.description || "");
  const { genre, platform, theme } = categorize(item.title + item.description);

  return (
    <div className="card">
      <h3>{item.title}</h3>
      <p className="desc">{item.description}</p>

      <div className="tags">
        <span className={`tag ${sentiment.toLowerCase()}`}>{sentiment}</span>
        <span className="tag">{genre}</span>
        <span className="tag">{platform}</span>
        <span className="tag">{theme}</span>
      </div>

      <div className="players">👥 {item.players.toLocaleString()}</div>
    </div>
  );
};

function App() {
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const queries = [
      "video game",
      "game release",
      "playstation",
      "xbox",
      "steam",
      "games news",
      "multiplayer games",
      "rpg games",
      "games"
    ];

    Promise.all(
      queries.map((q) =>
        fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=5&apiKey=0687046664d5479181839dcd463d2721`
        ).then((res) => res.json())
      )
    ).then((results) => {
      let combined = [];

      results.forEach((data) => {
        if (data.articles) {
          combined = combined.concat(data.articles);
        }
      });

      // ✅ FILTER GAMING ONLY
      const filtered = combined.filter((item) => {
        const text = (
          item.title +
          " " +
          (item.description || "")
        ).toLowerCase();

        // MUST contain gaming keywords
      const isGaming =
      text.includes("games") ||
      text.includes("vr gaming") ||
      text.includes("playstation") ||
      text.includes("xbox") ||
      text.includes("steam") ||
      text.includes("nintendo") ||
      text.includes("mmorpg game") ||
      text.includes("pc game");
     

      // exclude obvious non-gaming topics
      const isMovie =
      text.includes("dating") ||
      text.includes("nba") ||
      text.includes("basketball") ||
      text.includes("peacock") ||
      text.includes("sports") ||
      text.includes("tv") ||
      text.includes("movie") ||
      text.includes("film") ||
      text.includes("hollywood");
        return isGaming && !isMovie;
      });

      // ✅ REMOVE DUPLICATES
      const uniqueMap = new Map();

      filtered.forEach((item) => {
        const key = item.url || item.title;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const articles = Array.from(uniqueMap.values()).map((item) => ({
        title: item.title,
        description: item.description || "",
        players: Math.floor(Math.random() * 100000),
      }));

      setNews(articles);

      // ✅ TRENDING
      const words = {};

      articles.forEach((item) => {
        const text = (
          item.title +
          " " +
          item.description
        )
          .toLowerCase()
          .split(" ");

        text.forEach((word) => {
          if (word.length > 4) {
            words[word] = (words[word] || 0) + 1;
          }
        });
      });

      const sorted = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

      setTrending(sorted);
    });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>🎮 Gaming News Dashboard</h1>
        <p>Latest insights, trends, and player activity</p>
      </header>

      <section className="top-section">
        <div className="trending">
          <h2>🔥 Trending Topics</h2>
          <ul>
            {trending.map(([word, count], i) => (
              <li key={i}>
                {word} <span>({count})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid">
        {news.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </section>
    </div>
  );
}

export default App;

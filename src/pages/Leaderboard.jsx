import React from "react";
import LeaderboardTable from "../components/LeaderboardTable";

/**
 * Leaderboard page (UI only).
 * No fetching logic here — App.jsx still loads leaderboardRows before navigating here.
 */
export default function Leaderboard({
  theme = "dark",
  rows = [],
  title = "Leaderboard",
}) {
  return (
    <div>
      <h3 style={{ marginTop: 12 }}>{title}</h3>
      <LeaderboardTable rows={rows} theme={theme} />
    </div>
  );
}

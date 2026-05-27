export function getMatchNumber(match) {
  const raw =
    match.group_name ??
    match.match_number ??
    match.matchNumber ??
    match.code ??
    match.name ??
    "";

  const found = String(raw).match(/\d+/);

  return found ? Number(found[0]) : null;
}

export function getAdvancingTeam(match, prediction) {
  if (!match || !prediction) return "";

  const home = prediction.home;
  const away = prediction.away;

  if (home === "" || away === "") return "";

  const homeGoals = parseInt(home, 10);
  const awayGoals = parseInt(away, 10);

  if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) {
    return "";
  }

  if (homeGoals > awayGoals) return match.home_team;
  if (awayGoals > homeGoals) return match.away_team;

  return prediction.advancing || "";
}
export const KNOCKOUT_PROPAGATION = {
  89: [74, 77],
  90: [73, 75],
  93: [83, 84],
  94: [81, 82],

  91: [76, 78],
  92: [79, 80],
  95: [86, 88],
  96: [85, 87],

  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],

  101: [97, 98],
  102: [99, 100],

  103: [101, 102],
  104: [101, 102],
};
export function buildPropagatedTeams(matches, predictions) {
  const result = {};

  const matchesByNumber = {};

  matches.forEach(match => {
    const num = getMatchNumber(match);

    if (num !== null) {
      matchesByNumber[num] = match;
    }
  });

  Object.entries(KNOCKOUT_PROPAGATION).forEach(([target, sources]) => {
    const [homeSource, awaySource] = sources;

    const homeMatch = matchesByNumber[homeSource];
    const awayMatch = matchesByNumber[awaySource];

    const homePrediction = homeMatch
      ? predictions[homeMatch.id]
      : null;

    const awayPrediction = awayMatch
      ? predictions[awayMatch.id]
      : null;

    result[target] = {
      homeTeam: getAdvancingTeam(homeMatch, homePrediction),
      awayTeam: getAdvancingTeam(awayMatch, awayPrediction),
    };
  });

  return result;
}
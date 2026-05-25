import React from "react";

export default function RulesPage() {
  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: "1100px",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: 32, fontSize: "2.2rem" }}>
        Information and Rules
      </h1>

      <p><strong>Only one entrant per person is allowed</strong></p>

      <p>The competition will be in two parts</p>

      <p>
        <strong>Part 1:</strong> Predict the score of the first 72 group games,
        Groups A-L. Use the “Load Group Stage Matches” button
      </p>

      <p>
        <strong>Part 2.</strong> Each contestant will be given the remaining
        32 teams, (the “Load Knockout Phase Matches” button) and asked to
        predict the ladder all the way through to the World Cup Champions.
      </p>

      <p style={{ marginTop: 32 }}>
        Winner will be the person with the most points after their scores from
        Part 1 <strong>AND</strong> Part 2 have been added together.
      </p>

      <p style={{ marginTop: 32 }}>
        In the event of a tie, the Final league placings of the teams as
        predicted from your scores in Part 1 will be compared to the actual
        final league placings.
      </p>

      <p>
        The contestant with the most number of teams in the right position,
        then the right number of points, then goals scores, then goals against
        will be used to determine an outright winner - (ten points for each
        correct variable)
      </p>

      <p style={{ marginTop: 32 }}>
        Cost is USD$25 per entry (and must be received by noon on Wednesday
        10th June 2026) and the winnings will be split:{" "}
        <strong>1st place 60%, 2nd place 25%, 3rd place 15%</strong>.
      </p>

      <p>
        $1 from each payment will be taken to pay for the server fees, so
        USD$24 will be added to the prize pool.
      </p>

      <p>Payment instructions are in "Payment" menu.</p>
            <hr style={{ margin: "36px 0", opacity: 0.35 }} />

      <h2>Instructions for Part 1</h2>

      <ol>
        <li>Predict the score for each of the first 72 games.</li>
        <li>You have up until 2 hours before each kick-off to alter the scores.</li>
        <li>
          As you enter the score, the team ranking will be updated until you get
          a final ranking for all teams in each group. This will be used in the
          event of a tie-breaker as outlined above.
        </li>
        <li>
          As results of the games are known, I will push out the final scores
          and your points will automatically be calculated.
        </li>
      </ol>

            <h2 style={{ marginTop: 36 }}>Instructions for Part 2</h2>

      <ol>
        <li>
          By 29 June you will receive the names of the 32 teams remaining in the
          knockout stage. These will be pre-populated in the Knockout Stage
          bracket.
        </li>

        <li>
          Predict the score you expect at the{" "}
          <strong>end of regulation time</strong>, before extra time is played
          and/or penalty shoot-outs, in the Knockout Stage bracket.
        </li>

        <li>
          Place the team that you think will progress to the next knockout stage
          in the next part of the ladder.
        </li>

        <li>
          Please remember that for each game{" "}
          <strong>there must be a winner.</strong> However, you can predict
          that it will be a draw after the normal 90 minutes are up.
        </li>

        <li>
          Scoring is the same as described below for Part 1, with the exception
          that you get extra points for each team correctly placed in the ladder.
        </li>

        <li>
          <strong>
            The bracket must be completed throughout by MIDNIGHT on 29 June.
          </strong>{" "}
          PLEASE NOTE THE TIGHT TIMING OF THIS 2ND PART. Don&apos;t blame me,
          blame FIFA!
        </li>

        <li>
          <strong>
            The advancing team in your brackets will be locked at this point.
          </strong>
        </li>

        <li>
          <strong>
            Entries received after this deadline cannot be accepted.
          </strong>
        </li>

        <li>
          Scores in the bracket can still be changed up to{" "}
          <strong>2 hours before kick-off</strong>, but you cannot change the
          scores in such a way that would{" "}
          <strong>change the advancing teams.</strong>
        </li>

        <li>
          For example, if you had Mexico beating Japan 2-1, with Mexico
          advancing to the next round, you cannot change the score to Japan
          beating Mexico.
        </li>
      </ol>
            <hr style={{ margin: "36px 0", opacity: 0.35 }} />
      <p style={{ marginTop: 32 }}>
        In order to get the 10 points for the correct spread, you need at
        least one of the teams you predicted to{" "}
        <strong>ACTUALLY play in that game</strong>.
      </p>

      <p>
        Obviously in the knockout stages, games{" "}
        <strong>AT THE END OF REGULATION TIME</strong> can end in ties, so if
        you correctly predict the winner after extra time and/or a penalty
        shoot-out, you can still get points for predicting the correct score
        (maximum 40 points as above), plus the additional bonus points for the
        correct advancing team.
      </p>

      <p style={{ marginTop: 24 }}>
        Bonus points for correctly predicting the advancing team:
      </p>

      <ul>
        <li><strong>Round of 32</strong> – 10 points</li>
        <li><strong>Round of 16</strong> – 20 points</li>
        <li><strong>Quarter-final</strong> – 40 points</li>
        <li><strong>Semi-final</strong> – 80 points</li>
        <li><strong>3rd place play-off</strong> – 120 points</li>
        <li><strong>World Cup champion</strong> – 160 points</li>
      </ul>
      <h2>Knockout scoring example</h2>
      <hr style={{ margin: "36px 0", opacity: 0.35 }} />

      <h2>Knockout scoring example</h2>

      <p>
        The examples below show how points can be awarded in the knockout stage
        when your predicted teams and the actual teams are not always the same.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 28,
          alignItems: "start",
          marginTop: 24,
        }}
      >
        <div>
          {[
            {
              round: "Round of 32",
              teams: (
                <>
                  Ukraine v Wales
                </>
              ),
              pred: "3 - 3",
              act: "3 - 3",
              advancing: "Ukraine",
              points: 50,
              highlight: false,
            },
            {
              round: "Round of 32",
              teams: (
                <>
                  England v <span style={{ color: "#ef4444" }}>France</span>
                </>
              ),
              pred: "0 - 0",
              act: "4 - 1",
              advancing: "England",
              points: 0,
              highlight: false,
            },
            {
              round: "Round of 16",
              teams: (
                <>
                  Ukraine v <span style={{ color: "#ef4444" }}>France</span>
                </>
              ),
              pred: "3 - 1",
              act: "3 - 1",
              advancing: "Ukraine",
              points: 40,
              highlight: true,
            },
          ].map((game, index) => (
            <div
              key={index}
              style={{
                border: game.highlight
                  ? "1px solid rgba(34, 197, 94, 0.8)"
                  : "1px solid rgba(148, 163, 184, 0.35)",
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 12,
                background: "rgba(15, 23, 42, 0.45)",
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.75 }}>{game.round}</div>

              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {game.teams}
              </div>

              <div style={{ marginTop: 12 }}>
                Pred score: <strong>{game.pred}</strong>
              </div>

              <div style={{ marginTop: 4 }}>
                Act score: <strong>{game.act}</strong>
              </div>

              <hr style={{ margin: "10px 0", opacity: 0.25 }} />

              <div>
                Advancing team:{" "}
                <strong style={{ color: "#22c55e" }}>{game.advancing}</strong>
              </div>

              <div style={{ marginTop: 4 }}>
                Your points:{" "}
                <strong style={{ color: "#22c55e" }}>{game.points}</strong>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p style={{ marginTop: 0 }}>
            In the first game of Ukraine v Wales, you predicted a 3-3 draw with
            Ukraine winning the penalty shoot-out. In the actual game, the score
            was 3-3 and Ukraine won in extra time. You get ten points for
            predicting Ukraine would score 3, ten points for predicting Wales
            would score 3, ten points for the correct result, ten points for the
            correct spread, plus the <strong>10 bonus points</strong> for
            correctly predicting Ukraine would advance to the next round.
          </p>

          <p style={{ marginTop: 28 }}>
            In the second game, England v France, you get zero points as you got
            nothing right. However, you predicted that France would win, so they
            are placed in the next round.
          </p>

          <p style={{ marginTop: 28 }}>
            In the next round, you predicted Ukraine v France, with Ukraine
            winning 3-1. The actual score was Ukraine 3 England 1, so you get
            ten points for the number of goals Ukraine scored, ten points for the
            correct spread, and the <strong>20 bonus points</strong> for
            correctly predicting Ukraine would make it to the next round. You do
            not get ten points for saying France would score 1 goal, as it was
            England that scored that goal.
          </p>
        </div>
      </div>
    </div>
  );
}
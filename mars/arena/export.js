import { CHARACTERS, ARENAS } from "./engine.js";
import { ARENA_BACKGROUNDS } from "./renderer.js";

function wrap(context, text, x, y, width, lineHeight) {
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > width && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = next;
  }
  context.fillText(line, x, y);
  return y;
}

async function image(src) {
  const result = new Image();
  result.src = src;
  await result.decode();
  return result;
}

export async function resultPNG(state, { medal, mode, assist, gauntlet } = {}) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const c = canvas.getContext("2d");
  const winner = state.fighters[state.winner],
    character = CHARACTERS.find((character) => character.id === winner.id),
    arena = ARENAS.find((arena) => arena.id === state.arena);
  const [background, victory] = await Promise.all([
    image(ARENA_BACKGROUNDS[state.arena]),
    image(`assets/${winner.id}-victory.webp`),
  ]);
  c.fillStyle = "#112735";
  c.fillRect(0, 0, 1200, 1500);
  c.drawImage(background, 0, 0, 1200, 675);
  const shade = c.createLinearGradient(0, 0, 0, 850);
  shade.addColorStop(0, "#11273522");
  shade.addColorStop(1, "#112735");
  c.fillStyle = shade;
  c.fillRect(0, 0, 1200, 850);
  c.fillStyle = "#f2ebdc";
  c.font = "600 54px Condensed,sans-serif";
  c.fillText("// MARS", 70, 100);
  c.font = "16px Barlow,sans-serif";
  c.fillText("VICTORY WINDOW / OFFICIAL RESULT", 650, 91);
  c.font = "italic 600 175px Condensed,sans-serif";
  c.fillText("OUT OF", 62, 296);
  c.fillStyle = "#ed7850";
  c.fillText("ORBIT.", 62, 452);
  const spriteScale = 490 / victory.height;
  c.drawImage(
    victory,
    890 - (victory.width * spriteScale) / 2,
    200,
    victory.width * spriteScale,
    490,
  );
  c.fillStyle = "#f2ebdc";
  c.font = "600 78px Condensed,sans-serif";
  c.fillText(`${character.name.toUpperCase()} TAKES THE GLORY.`, 70, 730);
  c.fillStyle = "#d9be7d";
  c.font = "600 34px Condensed,sans-serif";
  wrap(c, medal, 72, 793, 1050, 39);
  c.fillStyle = "#f2ebdc";
  c.fillRect(0, 905, 1200, 595);
  c.fillStyle = "#112735";
  c.font = "15px Barlow,sans-serif";
  c.fillText(
    `${arena.name.toUpperCase()} / ${gauntlet ? "SIXFOLD GAUNTLET" : mode.toUpperCase()}${assist ? " / ASSISTED" : ""}`,
    72,
    956,
  );
  c.font = "13px Barlow,sans-serif";
  c.fillStyle = "#65766e";
  c.fillText("CREW", 120, 1020);
  c.fillText(state.rule === "timed" ? "NET SCORE" : "RING-OUTS", 760, 1020);
  c.fillText(
    state.rule === "timed" ? "OWN RECOVERIES" : "RECOVERIES LEFT",
    947,
    1020,
  );
  state.rankings.forEach((index, rank) => {
    const fighter = state.fighters[index],
      y = 1075 + rank * 65;
    c.fillStyle = rank === 0 ? "#b84d30" : "#112735";
    c.font = "600 35px Condensed,sans-serif";
    c.fillText(String(rank + 1), 73, y);
    c.fillText(
      CHARACTERS.find(
        (character) => character.id === fighter.id,
      ).name.toUpperCase(),
      120,
      y,
    );
    c.fillText(
      String(
        state.rule === "timed"
          ? fighter.score - fighter.stats.recoveries
          : fighter.score,
      ),
      800,
      y,
    );
    c.fillText(
      String(
        state.rule === "timed" ? fighter.stats.recoveries : fighter.stocks,
      ),
      1040,
      y,
    );
    c.strokeStyle = "#b8c0b0";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(72, y + 18);
    c.lineTo(1128, y + 18);
    c.stroke();
  });
  c.fillStyle = "#112735";
  c.font = "500 20px Barlow,sans-serif";
  c.fillText(
    `${state.stats.hits} training hits. ${state.stats.ringouts} recoveries. Everyone comes back.`,
    72,
    1375,
  );
  c.font = "15px Barlow,sans-serif";
  c.fillText("© Tim Mecklenburg", 72, 1440);
  c.fillText("MARS / OUT OF ORBIT", 885, 1440);
  c.fillStyle = "#65766e";
  c.font = "12px Barlow,sans-serif";
  c.fillText("AI-ASSISTED ART & GAME / LOCAL MATCH RECORD", 72, 1475);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(Error("PNG export unavailable")),
      "image/png",
    ),
  );
}

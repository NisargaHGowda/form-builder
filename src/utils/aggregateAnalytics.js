function isAnswered(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function completionRatePercent(form, responses) {
  if (!responses.length) return 0;
  const requiredIds = form.questions.filter((q) => q.required).map((q) => q.id);
  let complete = 0;
  for (const r of responses) {
    const ok = requiredIds.every((id) => isAnswered(r.answers?.[id]));
    if (ok) complete += 1;
  }
  return Math.round((complete / responses.length) * 100);
}

export function averageDurationLabel(responses) {
  const withDur = responses.filter(
    (r) => typeof r.durationMs === "number" && r.durationMs > 0
  );
  if (!withDur.length) return "—";
  const avg = withDur.reduce((s, r) => s + r.durationMs, 0) / withDur.length;
  const totalSec = Math.round(avg / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function responsesByDaySeries(responses) {
  const counts = {};
  for (const r of responses) {
    const d = r.submittedAt?.toDate?.();
    if (!d || Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    days.push({
      day: dt.toLocaleDateString("en-US", { weekday: "short" }),
      responses: counts[key] || 0,
    });
  }
  return days;
}

export function multipleChoiceBreakdown(form, responses) {
  const mc = form.questions.find((q) => q.type === "multipleChoice");
  if (!mc) return [];
  const tally = {};
  for (const opt of mc.options || []) tally[opt] = 0;
  for (const r of responses) {
    const v = r.answers?.[mc.id];
    if (v && Object.prototype.hasOwnProperty.call(tally, v)) tally[v] += 1;
    else if (v) tally[v] = (tally[v] || 0) + 1;
  }
  return Object.entries(tally).map(([name, value]) => ({ name, value }));
}

export function averageRating(form, responses) {
  const rq = form.questions.find((q) => q.type === "rating");
  if (!rq) return null;
  let sum = 0;
  let n = 0;
  for (const r of responses) {
    const v = r.answers?.[rq.id];
    if (typeof v === "number" && !Number.isNaN(v)) {
      sum += v;
      n += 1;
    }
  }
  if (!n) return null;
  return (sum / n).toFixed(1);
}

/** Per-question answer rate (% of submissions with any answer), in form order */
export function answerRateByQuestion(form, responses) {
  if (!responses.length) {
    return form.questions.map((q) => ({
      step: q.title.length > 18 ? `${q.title.slice(0, 18)}…` : q.title,
      completion: 0,
    }));
  }
  return form.questions.map((q) => {
    let answered = 0;
    for (const r of responses) {
      if (isAnswered(r.answers?.[q.id])) answered += 1;
    }
    return {
      step: q.title.length > 22 ? `${q.title.slice(0, 22)}…` : q.title,
      completion: Math.round((answered / responses.length) * 100),
    };
  });
}

export function buildInsights(form, responses) {
  const out = [];
  const mc = form.questions.find((q) => q.type === "multipleChoice");
  if (mc && responses.length) {
    const tally = {};
    for (const r of responses) {
      const v = r.answers?.[mc.id];
      if (typeof v === "string" && v) tally[v] = (tally[v] || 0) + 1;
    }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    if (top) out.push(`${top[0]} is the most common team (${top[1]} responses).`);
  }
  const avg = averageRating(form, responses);
  const rq = form.questions.find((q) => q.type === "rating");
  if (avg && rq) {
    out.push(
      `Average ${rq.title.toLowerCase().replace(/\?$/, "")}: ${avg} (scale 1–${rq.scale || 5}).`
    );
  }
  const optionalLong = form.questions.find(
    (q) => q.type === "longText" && !q.required
  );
  if (optionalLong && responses.length) {
    let skipped = 0;
    for (const r of responses) {
      if (!isAnswered(r.answers?.[optionalLong.id])) skipped += 1;
    }
    const pct = Math.round((skipped / responses.length) * 100);
    out.push(`${pct}% of respondents skipped the optional long-text question.`);
  }
  if (!out.length) {
    out.push("Submit a few responses to see automated insights here.");
  }
  return out;
}

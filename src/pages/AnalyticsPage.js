import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Link, useParams } from "react-router-dom";
import { getFormById } from "../data/formData";
import { subscribeToResponses } from "../services/submissions";
import {
  answerRateByQuestion,
  averageDurationLabel,
  averageRating,
  buildInsights,
  completionRatePercent,
  multipleChoiceBreakdown,
  responsesByDaySeries,
} from "../utils/aggregateAnalytics";

const chartColors = ["#ff6b6b", "#ffd166", "#06d6a0", "#118ab2"];

/** Fixed height avoids ResponsiveContainer measuring 0×0 inside CSS grid (Recharts width/height -1 warnings). */
const CHART_PX = 280;

function AnalyticsPage() {
  const { id } = useParams();
  const form = id ? getFormById(id) : null;

  const [responses, setResponses] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!form?.id) {
      setReady(true);
      return undefined;
    }
    setLoadError(null);
    setReady(false);
    const unsub = subscribeToResponses(
      form.id,
      (docs) => {
        setResponses(docs);
        setReady(true);
      },
      (err) => {
        setLoadError(
          err?.message ||
            "Could not load analytics. Check Firestore rules and your connection."
        );
        setReady(true);
      }
    );
    return unsub;
  }, [form?.id]);

  const summary = useMemo(() => {
    if (!form) return null;
    const total = responses.length;
    const completion = completionRatePercent(form, responses);
    const avgTime = averageDurationLabel(responses);
    const ratingQ = form.questions.find((q) => q.type === "rating");
    const avgR = averageRating(form, responses);
    const urgency =
      avgR && ratingQ ? `${avgR} / ${ratingQ.scale || 5}` : "—";

    const byDay = responsesByDaySeries(responses);
    const mcBreakdown = multipleChoiceBreakdown(form, responses);
    const dropOff = answerRateByQuestion(form, responses);
    const insights = buildInsights(form, responses);

    return {
      total,
      completion,
      avgTime,
      urgency,
      byDay,
      mcBreakdown,
      dropOff,
      insights,
    };
  }, [form, responses]);

  if (!form) {
    return (
      <main className="app-shell">
        <section className="hero-card compact">
          <span className="eyebrow">Not found</span>
          <h1>Unknown form</h1>
          <p>No form is registered for this link.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/">
              Back to builder
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="app-shell">
        <section className="hero-card compact">
          <span className="eyebrow">Analytics</span>
          <h1>Loading…</h1>
          <p>Fetching response data from Firestore.</p>
        </section>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="app-shell">
        <section className="hero-card compact">
          <span className="eyebrow">Analytics</span>
          <h1>Could not load data</h1>
          <p>{loadError}</p>
          <div className="hero-actions">
            <Link className="secondary-btn" to="/">
              Back to builder
            </Link>
            <Link className="primary-btn" to={`/form/${form.id}`}>
              Open form
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero-card compact">
        <div>
          <span className="eyebrow">Analytics Engine</span>
          <h1>{form.title}</h1>
          <p>
            Live metrics from Firestore: totals, segments, and answer rates by
            question.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="secondary-btn" to="/">
            Back to builder
          </Link>
          <Link className="primary-btn" to={`/form/${form.id}`}>
            Open form
          </Link>
        </div>
      </section>

      <section className="stats-row analytics">
        <div className="stat-card">
          <strong>{summary.total}</strong>
          <span>Total responses</span>
        </div>
        <div className="stat-card">
          <strong>{summary.completion}%</strong>
          <span>Completion rate</span>
        </div>
        <div className="stat-card">
          <strong>{summary.avgTime}</strong>
          <span>Avg. time</span>
        </div>
        <div className="stat-card">
          <strong>{summary.urgency}</strong>
          <span>Urgency score</span>
        </div>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Weekly traffic</span>
              <h2>Responses by day</h2>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={CHART_PX} minWidth={0}>
              <AreaChart data={summary.byDay}>
                <defs>
                  <linearGradient id="responseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#243645" />
                <XAxis dataKey="day" stroke="#8ea3b5" />
                <YAxis stroke="#8ea3b5" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#ff6b6b"
                  fill="url(#responseFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Audience split</span>
              <h2>Team breakdown</h2>
            </div>
          </div>
          <div className="chart-wrap">
            {summary.mcBreakdown.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={CHART_PX} minWidth={0}>
                <PieChart>
                  <Pie
                    data={summary.mcBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {summary.mcBreakdown.map((entry, index) => (
                      <Cell
                        fill={chartColors[index % chartColors.length]}
                        key={entry.name}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="chart-empty">No multiple-choice responses yet.</p>
            )}
          </div>
        </article>

        <article className="panel chart-panel span-two">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Engagement</span>
              <h2>Answer rate by question</h2>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={CHART_PX} minWidth={0}>
              <BarChart data={summary.dropOff}>
                <CartesianGrid strokeDasharray="4 4" stroke="#243645" />
                <XAxis dataKey="step" stroke="#8ea3b5" />
                <YAxis stroke="#8ea3b5" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="completion" radius={[10, 10, 0, 0]} fill="#118ab2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Insights</span>
              <h2>What the data says</h2>
            </div>
          </div>
          <ul className="feature-list">
            {summary.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default AnalyticsPage;

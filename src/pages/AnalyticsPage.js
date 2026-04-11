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
import { Link } from "react-router-dom";
import { analyticsSummary, demoForm } from "../data/formData";

const chartColors = ["#ff6b6b", "#ffd166", "#06d6a0", "#118ab2"];

function AnalyticsPage() {
  return (
    <main className="app-shell">
      <section className="hero-card compact">
        <div>
          <span className="eyebrow">Analytics Engine</span>
          <h1>{demoForm.title}</h1>
          <p>
            Track engagement, identify where respondents drop off, and see how
            different audience groups answer your form.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="secondary-btn" to="/">
            Back to builder
          </Link>
          <Link className="primary-btn" to={`/form/${demoForm.id}`}>
            Open form
          </Link>
        </div>
      </section>

      <section className="stats-row analytics">
        <div className="stat-card">
          <strong>{demoForm.totalResponses}</strong>
          <span>Total responses</span>
        </div>
        <div className="stat-card">
          <strong>{demoForm.completionRate}%</strong>
          <span>Completion rate</span>
        </div>
        <div className="stat-card">
          <strong>{demoForm.avgTime}</strong>
          <span>Avg. time</span>
        </div>
        <div className="stat-card">
          <strong>4.1 / 5</strong>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsSummary.responsesByDay}>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsSummary.multipleChoiceBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {analyticsSummary.multipleChoiceBreakdown.map((entry, index) => (
                    <Cell
                      fill={chartColors[index % chartColors.length]}
                      key={entry.name}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel span-two">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Conversion health</span>
              <h2>Completion drop-off</h2>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsSummary.dropOff}>
                <CartesianGrid strokeDasharray="4 4" stroke="#243645" />
                <XAxis dataKey="step" stroke="#8ea3b5" />
                <YAxis stroke="#8ea3b5" />
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
            {analyticsSummary.insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default AnalyticsPage;

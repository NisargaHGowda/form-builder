import { Link } from "react-router-dom";
import { demoForm } from "../data/formData";

const questionTypeLabel = {
  shortText: "Short text",
  email: "Email",
  multipleChoice: "Multiple choice",
  rating: "Rating",
  longText: "Long answer",
};

function BuilderPage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Custom Form Builder</span>
          <h1>{demoForm.title}</h1>
          <p>{demoForm.subtitle}</p>
        </div>
        <div className="hero-actions">
          <Link className="primary-btn" to={`/form/${demoForm.id}`}>
            Open live form
          </Link>
          <Link className="secondary-btn" to={`/analytics/${demoForm.id}`}>
            View analytics
          </Link>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-accent">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Builder overview</span>
              <h2>Form structure</h2>
            </div>
            <span className="status-pill">{demoForm.status}</span>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <strong>{demoForm.questions.length}</strong>
              <span>Questions</span>
            </div>
            <div className="stat-card">
              <strong>{demoForm.completionRate}%</strong>
              <span>Completion rate</span>
            </div>
            <div className="stat-card">
              <strong>{demoForm.avgTime}</strong>
              <span>Avg. completion</span>
            </div>
          </div>

          <div className="question-list">
            {demoForm.questions.map((question, index) => (
              <article className="question-card" key={question.id}>
                <div className="question-meta">
                  <span className="question-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="type-chip">
                    {questionTypeLabel[question.type]}
                  </span>
                </div>
                <div className="question-body">
                  <h3>{question.title}</h3>
                  <p>{question.description}</p>
                  {question.options ? (
                    <div className="option-row">
                      {question.options.map((option) => (
                        <span className="option-chip" key={option}>
                          {option}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Project fit</span>
              <h2>Why this matches your topic</h2>
            </div>
          </div>

          <ul className="feature-list">
            <li>Multi-step form builder experience with multiple question types</li>
            <li>Dedicated respondent-facing form route for live submission flow</li>
            <li>Analytics dashboard with completion, drop-off, and segment insights</li>
            <li>Clear product-style UI instead of a basic classroom prototype</li>
          </ul>

          <div className="preview-card">
            <span className="panel-kicker">Next upgrades</span>
            <p>
              Firebase is configured, so the next step would be saving forms and
              responses to Firestore instead of using demo data.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default BuilderPage;

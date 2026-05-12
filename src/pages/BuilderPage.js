import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { demoForm } from "../data/formData";
import { firebaseProjectId } from "../services/firebase";
import { subscribeToResponses } from "../services/submissions";
import {
  averageDurationLabel,
  completionRatePercent,
} from "../utils/aggregateAnalytics";

const RULES_SAMPLE = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /forms/{formId}/responses/{responseId} {
      allow read, write: if true;
    }
  }
}`;

const questionTypeLabel = {
  shortText: "Short text",
  email: "Email",
  multipleChoice: "Multiple choice",
  rating: "Rating",
  longText: "Long answer",
};

function BuilderPage() {
  const [responses, setResponses] = useState([]);
  const [firestoreError, setFirestoreError] = useState(null);

  useEffect(() => {
    const unsub = subscribeToResponses(
      demoForm.id,
      setResponses,
      (err) => {
        setFirestoreError(
          err?.message ||
            "Could not sync live stats. Check Firestore rules in the Firebase console."
        );
      }
    );
    return unsub;
  }, []);

  const liveStats = useMemo(() => {
    const total = responses.length;
    const completionRate = completionRatePercent(demoForm, responses);
    const avgTime = averageDurationLabel(responses);
    return { total, completionRate, avgTime };
  }, [responses]);

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

      {firestoreError ? (
        <div
          className="form-error form-error-banner"
          role="status"
        >
          <strong>Database:</strong> {firestoreError}
          {/permission|insufficient/i.test(firestoreError) ? (
            <div className="firestore-help">
              <p>
                This almost always means Firestore <strong>security rules</strong> in
                the Firebase project are still blocking reads/writes. Rules in your
                repo file <code className="inline-code">firestore.rules</code> are
                not active until you publish them.
              </p>
              <ol>
                <li>
                  Open{" "}
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseProjectId}/firestore/rules`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Firestore → Rules
                  </a>{" "}
                  for project <code className="inline-code">{firebaseProjectId}</code>.
                </li>
                <li>
                  Replace the rules with the block below (demo only — lock down before
                  production).
                </li>
                <li>Click <strong>Publish</strong>, then refresh this app.</li>
                <li>
                  Optional: from this folder run{" "}
                  <code className="inline-code">
                    npx firebase-tools login
                  </code>{" "}
                  then{" "}
                  <code className="inline-code">
                    npx firebase-tools deploy --only firestore:rules
                  </code>
                  .
                </li>
              </ol>
              <pre className="firestore-rules-sample">{RULES_SAMPLE}</pre>
            </div>
          ) : null}
        </div>
      ) : null}

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
              <strong>
                {responses.length ? `${liveStats.completionRate}%` : "—"}
              </strong>
              <span>Completion rate</span>
            </div>
            <div className="stat-card">
              <strong>{liveStats.avgTime}</strong>
              <span>Avg. completion</span>
            </div>
            <div className="stat-card">
              <strong>{liveStats.total}</strong>
              <span>Responses (live)</span>
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
            <span className="panel-kicker">Data layer</span>
            <p>
              Responses are stored in Cloud Firestore under{" "}
              <code className="inline-code">
                forms/{demoForm.id}/responses
              </code>
              . Analytics updates in real time.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default BuilderPage;

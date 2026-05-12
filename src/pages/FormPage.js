import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFormById } from "../data/formData";
import { saveResponse } from "../services/submissions";

function validateRequired(form, answers) {
  for (const q of form.questions) {
    if (!q.required) continue;
    const v = answers[q.id];
    if (q.type === "multipleChoice" || q.type === "rating") {
      if (v === undefined || v === null || v === "") {
        return `Please answer: ${q.title}`;
      }
    } else if (!v || (typeof v === "string" && !v.trim())) {
      return `Please answer: ${q.title}`;
    }
  }
  return null;
}

function FormPage() {
  const { id } = useParams();
  const form = id ? getFormById(id) : null;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [savedDocId, setSavedDocId] = useState(null);
  const openedAtRef = useRef(null);

  useEffect(() => {
    openedAtRef.current = Date.now();
  }, [id]);

  const updateAnswer = (questionId, value) => {
    setFieldError(null);
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    if (!form) return;

    const validationError = validateRequired(form, answers);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    const durationMs =
      openedAtRef.current != null
        ? Math.max(0, Date.now() - openedAtRef.current)
        : undefined;

    setSubmitting(true);
    try {
      const docRef = await saveResponse(form.id, {
        answers,
        durationMs,
      });
      setSavedDocId(docRef.id);
      setSubmitted(true);
    } catch (err) {
      setSavedDocId(null);
      setSubmitError(
        err?.code === "permission-denied"
          ? "Firestore blocked this write (permission-denied). Check Rules and App Check for your web app."
          : err?.message ||
              "Could not save your response. Check Firestore rules and your connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

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

  if (submitted) {
    return (
      <main className="app-shell">
        <section className="hero-card compact">
          <span className="eyebrow">Submission captured</span>
          <h1>Response recorded</h1>
          <p>
            Your answers were saved to Firestore. In the console, open the{" "}
            <strong>responses</strong> subcollection under{" "}
            <code className="inline-code">{form.id}</code>, then refresh if you
            don’t see the new row yet.
          </p>
          {savedDocId ? (
            <p className="saved-doc-hint">
              Document id:{" "}
              <code className="inline-code">{savedDocId}</code>
            </p>
          ) : null}
          <div className="hero-actions">
            <Link className="primary-btn" to={`/analytics/${form.id}`}>
              Review analytics
            </Link>
            <Link className="secondary-btn" to="/">
              Back to builder
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="form-shell">
      <section className="form-stage">
        <div className="form-intro">
          <span className="eyebrow">Live form preview</span>
          <h1>{form.title}</h1>
          <p>{form.subtitle}</p>
        </div>

        {(fieldError || submitError) && (
          <p className="form-error" role="alert">
            {fieldError || submitError}
          </p>
        )}

        <form className="form-stack" onSubmit={handleSubmit}>
          {form.questions.map((question) => (
            <label className="response-card" key={question.id}>
              <div className="response-copy">
                <span className="type-chip subtle">
                  {question.required ? "Required" : "Optional"}
                </span>
                <h2>{question.title}</h2>
                <p>{question.description}</p>
              </div>

              {question.type === "shortText" || question.type === "email" ? (
                <input
                  className="response-input"
                  type={question.type === "email" ? "email" : "text"}
                  placeholder={
                    question.type === "email"
                      ? "name@company.com"
                      : "Type your answer here"
                  }
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    updateAnswer(question.id, event.target.value)
                  }
                  required={question.required}
                />
              ) : null}

              {question.type === "longText" ? (
                <textarea
                  className="response-input textarea"
                  rows="5"
                  placeholder="Share the details"
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    updateAnswer(question.id, event.target.value)
                  }
                  required={question.required}
                />
              ) : null}

              {question.type === "multipleChoice" ? (
                <div className="choice-grid">
                  {question.options.map((option) => (
                    <button
                      className={`choice-pill ${
                        answers[question.id] === option ? "selected" : ""
                      }`}
                      key={option}
                      onClick={(event) => {
                        event.preventDefault();
                        updateAnswer(question.id, option);
                      }}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}

              {question.type === "rating" ? (
                <div className="rating-row">
                  {Array.from({ length: question.scale }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        className={`rating-pill ${
                          answers[question.id] === value ? "selected" : ""
                        }`}
                        key={value}
                        onClick={(event) => {
                          event.preventDefault();
                          updateAnswer(question.id, value);
                        }}
                        type="button"
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </label>
          ))}

          <div className="form-actions">
            <Link className="secondary-btn" to="/">
              Back to builder
            </Link>
            <button
              className="primary-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit response"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default FormPage;

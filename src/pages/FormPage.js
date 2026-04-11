import { useState } from "react";
import { Link } from "react-router-dom";
import { demoForm } from "../data/formData";

function FormPage() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="app-shell">
        <section className="hero-card compact">
          <span className="eyebrow">Submission captured</span>
          <h1>Response recorded</h1>
          <p>
            This demo currently stores answers in local state. The next step is
            to send them to Firestore for real analytics.
          </p>
          <div className="hero-actions">
            <Link className="primary-btn" to={`/analytics/${demoForm.id}`}>
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
          <h1>{demoForm.title}</h1>
          <p>{demoForm.subtitle}</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          {demoForm.questions.map((question) => (
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
            <button className="primary-btn" type="submit">
              Submit response
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default FormPage;

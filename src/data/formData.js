export const demoForm = {
  id: "customer-discovery",
  title: "Product Discovery Intake",
  subtitle:
    "A Typeform-style flow for collecting early customer feedback, team context, and launch readiness.",
  status: "Draft",
  completionRate: 82,
  totalResponses: 148,
  avgTime: "02:34",
  questions: [
    {
      id: "q1",
      type: "shortText",
      title: "What should we call you?",
      description: "This helps personalize the follow-up report.",
      required: true,
    },
    {
      id: "q2",
      type: "email",
      title: "What is your work email?",
      description: "We will only use this to share the results.",
      required: true,
    },
    {
      id: "q3",
      type: "multipleChoice",
      title: "Which team are you representing?",
      description: "Choose the closest fit for your role.",
      required: true,
      options: ["Product", "Marketing", "Operations", "Founders Office"],
    },
    {
      id: "q4",
      type: "rating",
      title: "How urgent is this workflow problem?",
      description: "1 means low priority, 5 means urgent this quarter.",
      required: true,
      scale: 5,
    },
    {
      id: "q5",
      type: "longText",
      title: "Describe the biggest friction in your current process.",
      description: "A few sentences are enough.",
      required: false,
    },
  ],
};

export function getFormById(id) {
  if (id === demoForm.id) return demoForm;
  return null;
}

export const analyticsSummary = {
  responsesByDay: [
    { day: "Mon", responses: 12 },
    { day: "Tue", responses: 19 },
    { day: "Wed", responses: 24 },
    { day: "Thu", responses: 31 },
    { day: "Fri", responses: 28 },
    { day: "Sat", responses: 18 },
    { day: "Sun", responses: 16 },
  ],
  dropOff: [
    { step: "Welcome", completion: 100 },
    { step: "Identity", completion: 93 },
    { step: "Team", completion: 86 },
    { step: "Urgency", completion: 79 },
    { step: "Detail", completion: 68 },
  ],
  multipleChoiceBreakdown: [
    { name: "Product", value: 46 },
    { name: "Marketing", value: 33 },
    { name: "Operations", value: 22 },
    { name: "Founders Office", value: 15 },
  ],
  insights: [
    "Operations respondents spend the longest time on the long-answer question.",
    "The urgency score averages 4.1, which suggests the problem is more than a nice-to-have.",
    "The final open-text question has the highest drop-off, so adding progress cues would likely help.",
  ],
};

import normalizeReview from "../normalizer.js";

const cases = [
  // happy path
  `{"risk":"HIGH","issues":["no error handling on auth"],"summary":"Changes retry logic"}`,

  // model wrapped it in fences anyway
  '```json\n{"risk":"LOW","issues":[],"summary":"Updates readme"}\n```',

  // model used lowercase
  `{"risk":"medium","issues":["missing validation"],"summary":"Adds user endpoint"}`,

  // should throw — missing field
  `{"risk":"LOW","summary":"Oops no issues field"}`,

  // should throw — bad risk value
  `{"risk":"CRITICAL","issues":[],"summary":"Something"}`,

  // should throw — not JSON at all
  `Looks good to me! Ship it.`,
];

for (const c of cases) {
  try {
    console.log("OK:", normalizeReview(c));
  } catch (err) {
    console.log("CAUGHT:", err.message);
  }
}

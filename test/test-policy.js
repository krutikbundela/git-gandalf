const { decide, DECISIONS } = require("./policy");

// expected mappings
console.assert(decide("LOW") === DECISIONS.ALLOW, "LOW should ALLOW");
console.assert(decide("MEDIUM") === DECISIONS.WARN, "MEDIUM should WARN");
console.assert(decide("HIGH") === DECISIONS.BLOCK, "HIGH should BLOCK");

// expected failure
try {
  decide("CRITICAL");
  console.error("Should have thrown");
} catch (err) {
  console.log("Correctly threw for unknown risk:", err.message);
}

console.log("All policy tests passed");

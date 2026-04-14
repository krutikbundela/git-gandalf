import callLLM from "../llmRunner.js";

const result = await callLLM("hi there, how are you?");

console.log(result);

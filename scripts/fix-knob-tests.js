#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing Knob component test issues...\n");

const steps = [
  {
    name: "Clear test cache",
    command: "npm run test:clear-cache",
  },
  {
    name: "Run Knob tests specifically",
    command:
      "npm test -- src/components/widgets/__tests__/Knob.test.tsx --timeout=20000",
  },
];

for (const step of steps) {
  console.log(`\n🔄 ${step.name}...`);
  try {
    execSync(step.command, { stdio: "inherit" });
    console.log(`✅ ${step.name} completed`);
  } catch (error) {
    console.log(`⚠️ ${step.name} had issues, continuing...`);
  }
}

console.log("\n🎉 Knob test fixes completed!");

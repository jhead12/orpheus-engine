// Test file to isolate the Lane import issue
console.log("Starting import test...");

try {
  console.log("Attempting to import Lane component...");
  const Lane = await import("../src/screens/workstation/components/Lane.tsx");
  console.log("✅ Lane imported successfully!", Lane);
} catch (error) {
  console.log("❌ Failed to import Lane:", error.message);
  console.log("Full error:", error);
}

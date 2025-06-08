import { promises as fs } from "fs";
import path from "path";
import { getAllConfigs, getConfigByName, GenerationPriority } from "./configs";
import { generateTestFile } from "./generate-test";
import { AgentConfig } from "./types";

/**
 * Default agent configuration
 */
const defaultConfig: AgentConfig = {
  testOutputDir: path.join(process.cwd(), "src", "components", "__tests__"),
  gifOutputDir: path.join(process.cwd(), "__snapshots__", "gifs"),
  defaultContainerStyle: `
    width: 500px;
    height: 300px;
    background: #1e1e1e;
    padding: 20px;
    position: relative;
  `,
  defaultAnimationDuration: 2000,
};

/**
 * Run the visual test agent CLI
 */
export async function runCLI(
  args: string[] = process.argv.slice(2)
): Promise<void> {
  console.log("🎨 OEW Visual Testing Agent 🧪");

  // Parse arguments
  const command = args[0] || "help";
  const componentName = args[1];

  // Create directories if they don't exist
  await fs.mkdir(defaultConfig.testOutputDir, { recursive: true });
  await fs.mkdir(defaultConfig.gifOutputDir, { recursive: true });

  // Handle commands
  switch (command) {
    case "generate":
      if (componentName) {
        await generateTestsForComponent(componentName);
      } else {
        await generateAllTests();
      }
      break;

    case "list":
      listAvailableComponents();
      break;

    case "help":
    default:
      showHelp();
      break;
  }
}

/**
 * Generate tests for a specific component
 */
async function generateTestsForComponent(componentName: string): Promise<void> {
  const config = getConfigByName(componentName);

  if (!config) {
    console.error(
      `❌ Component "${componentName}" not found in configurations.`
    );
    console.log("Available components:");
    listAvailableComponents();
    return;
  }

  console.log(`🧪 Generating visual test for ${componentName}...`);

  try {
    const filePath = await generateTestFile(
      config,
      defaultConfig.testOutputDir
    );
    console.log(`✅ Test generated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error generating test for ${componentName}:`, error);
  }
}

/**
 * Generate tests for all components in priority order
 */
async function generateAllTests(): Promise<void> {
  console.log("🧪 Generating visual tests for all components...");

  // Get all configs
  const allConfigs = getAllConfigs();

  // Sort configs by priority
  const sortedConfigs = [...allConfigs].sort((a, b) => {
    const priorityA = GenerationPriority.indexOf(a.componentName);
    const priorityB = GenerationPriority.indexOf(b.componentName);

    if (priorityA === -1 && priorityB === -1) return 0;
    if (priorityA === -1) return 1;
    if (priorityB === -1) return -1;
    return priorityA - priorityB;
  });

  // Generate tests for each component
  for (const config of sortedConfigs) {
    try {
      console.log(`🧪 Generating test for ${config.componentName}...`);
      const filePath = await generateTestFile(
        config,
        defaultConfig.testOutputDir
      );
      console.log(`✅ Test generated: ${filePath}`);
    } catch (error) {
      console.error(
        `❌ Error generating test for ${config.componentName}:`,
        error
      );
    }
  }

  console.log("✅ All tests generated!");
}

/**
 * List all available components
 */
function listAvailableComponents(): void {
  const allConfigs = getAllConfigs();

  console.log("📋 Available components:");
  allConfigs.forEach((config, index) => {
    const priority = GenerationPriority.indexOf(config.componentName);
    const priorityLabel = priority !== -1 ? `(Priority: ${priority + 1})` : "";
    console.log(`${index + 1}. ${config.componentName} ${priorityLabel}`);
  });
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
📚 OEW Visual Testing Agent Help 📚

Commands:
  node scripts/visual-agent.js generate [component]  Generate visual tests (for a specific component or all)
  node scripts/visual-agent.js list                  List available components
  node scripts/visual-agent.js help                  Show this help message

Examples:
  node scripts/visual-agent.js generate DNR          Generate visual test for DNR component
  node scripts/visual-agent.js generate              Generate visual tests for all components
  `);
}

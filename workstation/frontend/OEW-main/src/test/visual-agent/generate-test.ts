import { promises as fs } from "fs";
import path from "path";
import { VisualTestConfig } from "./types";

/**
 * Generates a test file from a component test configuration
 */
export async function generateTestFile(
  config: VisualTestConfig,
  outputDir: string
): Promise<string> {
  const {
    componentName,
    importPath,
    states,
    containerStyle,
    animationDuration,
    captureGif,
    additionalImports,
    contextProviders,
  } = config;

  const testFilePath = path.join(outputDir, `${componentName}.visual.test.tsx`);

  // Build imports
  let imports = `
import { describe, it } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { expectScreenshot } from '../../test/helpers';
import { ${componentName} } from '${importPath}';
${captureGif ? "import { recordGif } from '../visual-agent/gif-recorder';" : ""}
${additionalImports?.join("\n") || ""}
`;

  // Build context provider wrapper if needed
  let contextWrapper = "";
  let contextWrapperStart = "";
  let contextWrapperEnd = "";

  if (contextProviders && contextProviders.length > 0) {
    contextWrapper = `
  // Wrap component in context providers
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
`;

    contextProviders.forEach((provider, index) => {
      const indent = "    ".repeat(index + 1);
      contextWrapper += `${indent}<${provider.import}${
        provider.props ? " " + JSON.stringify(provider.props) : ""
      }>\n`;
      contextWrapperEnd =
        `${indent}</${provider.import.split(" ")[0]}>\n` + contextWrapperEnd;
    });

    contextWrapper += `${"    ".repeat(
      contextProviders.length
    )}  {children}\n${contextWrapperEnd}  );\n`;
    contextWrapperStart = "<TestWrapper>";
    contextWrapperEnd = "</TestWrapper>";
  }

  // Build test cases
  const testCases = states
    .map((state) => {
      const stateName = state.name;
      const stateProps = state.props
        ? `{ ...baseProps, ...${JSON.stringify(state.props)} }`
        : "baseProps";
      const interactions = state.interactions || [];

      let interactionCode = "";
      if (interactions.length > 0) {
        interactionCode = interactions
          .map((interaction) => {
            const delay = interaction.delay || 100;
            let code = "";

            switch (interaction.type) {
              case "click":
                code = `fireEvent.click(screen.getByTestId('${interaction.target}'));`;
                break;
              case "hover":
                code = `fireEvent.mouseOver(screen.getByTestId('${interaction.target}'));`;
                break;
              case "drag":
                code = `
    // Simulate drag operation
    fireEvent.mouseDown(screen.getByTestId('${interaction.target}'));
    fireEvent.mouseMove(document, ${
      interaction.value
        ? JSON.stringify(interaction.value)
        : "{ clientX: 100, clientY: 100 }"
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    fireEvent.mouseUp(document);`;
                break;
              case "input":
                code = `fireEvent.change(screen.getByTestId('${
                  interaction.target
                }'), { target: { value: ${JSON.stringify(
                  interaction.value
                )} } });`;
                break;
              case "mousedown":
                code = `fireEvent.mouseDown(screen.getByTestId('${
                  interaction.target
                }')${
                  interaction.value
                    ? ", " + JSON.stringify(interaction.value)
                    : ""
                });`;
                break;
              case "mouseup":
                code = `fireEvent.mouseUp(document${
                  interaction.value
                    ? ", " + JSON.stringify(interaction.value)
                    : ""
                });`;
                break;
              case "mousemove":
                code = `fireEvent.mouseMove(document${
                  interaction.value
                    ? ", " + JSON.stringify(interaction.value)
                    : ""
                });`;
                break;
            }

            return `
    // ${interaction.type} interaction
    ${code}
    await new Promise(resolve => setTimeout(resolve, ${delay}));`;
          })
          .join("\n");
      }

      return `
  it('visual test: renders ${componentName} in ${stateName} state @visual${
        captureGif ? "-gif" : ""
      }', async () => {
    const container = document.createElement('div');
    container.style.cssText = \`
      ${
        containerStyle ||
        "width: 500px; height: 300px; background: #1e1e1e; position: relative;"
      }
    \`;
    document.body.appendChild(container);

    const baseProps = ${JSON.stringify(config.props)};

    const { rerender } = render(${contextWrapperStart}<${componentName} {...${stateProps}} />${contextWrapperEnd}, { container });
    ${interactionCode}

    ${
      captureGif
        ? `// Record a GIF of any animations or state changes
    await recordGif(container, '${componentName.toLowerCase()}-${stateName}', ${
            animationDuration || 2000
          });`
        : `// Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    await expectScreenshot(container, '${componentName.toLowerCase()}-${stateName}');`
    }

    document.body.removeChild(container);
  });`;
    })
    .join("\n");

  // Assemble the full test file
  const testFileContent = `${imports}
${contextWrapper}
describe('${componentName} Visual Tests', () => {${testCases}
});
`;

  // Write the file
  await fs.writeFile(testFilePath, testFileContent, "utf-8");
  return testFilePath;
}

export const recordGif = async (
  container: HTMLElement,
  filename: string,
  duration: number = 2000
): Promise<void> => {
  // Mock implementation for gif recording
  await new Promise((resolve) => setTimeout(resolve, duration));
  console.log(`Recording gif for ${filename} with duration ${duration}ms`);
};

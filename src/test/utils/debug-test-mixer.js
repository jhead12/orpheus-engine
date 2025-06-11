// Debug script to print the HTML structure during the tests
export function debugElement(elementName, element) {
  console.log(`DEBUG ${elementName}:`, element ? element.outerHTML : 'Not found');
}

export function debugAllInContainer(container) {
  console.log('DEBUG ALL HTML:', container.innerHTML);
}

export function countByClassName(container, className) {
  const elements = container.getElementsByClassName(className);
  console.log(`DEBUG count of ${className}:`, elements.length);
  return elements.length;
}

export function countByTestId(container, testId) {
  const elements = container.querySelectorAll(`[data-testid="${testId}"]`);
  console.log(`DEBUG count of data-testid=${testId}:`, elements.length);
  return elements.length;
}

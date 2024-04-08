export const navigateToObjectProperty = (object, propertyPath: string) => {
  const parts = propertyPath.split('.');
  let current = object;
  for (const part of parts) {
    if (current && Object.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
};

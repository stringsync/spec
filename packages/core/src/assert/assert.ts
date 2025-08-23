export function validId(id: string) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(id)) {
    throw new Error(
      `Invalid id: "${id}". Only alphanumeric characters, hyphens, and underscores are allowed.`,
    );
  }
}

export const assert = {
  validId,
};

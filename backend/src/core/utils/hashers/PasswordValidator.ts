export const validatePassword = async (
  password: string,
  storedPassword: string
): Promise<boolean> => {
  try {
    return await Bun.password.verify(password, storedPassword);
  } catch (error) {
    const e = error as Error;
    throw new Error(
      `An error has occurred during password validation: ${e.message}`
    );
  }
};

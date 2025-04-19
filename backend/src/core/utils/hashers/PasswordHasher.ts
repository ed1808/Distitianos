export const makePassword = async (password: string): Promise<string> => {
  try {
    return await Bun.password.hash(password);
  } catch (error) {
    const e = error as Error;
    throw new Error(
      `An error has occurred creating the password hash: ${e.message}`
    );
  }
};

import bcrypt from "bcrypt";

const compareHash = (pass: string, hashPass: string): Promise<boolean> => {
  return bcrypt.compare(pass, hashPass);
};

export default compareHash;

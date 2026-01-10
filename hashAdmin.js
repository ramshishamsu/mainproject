import bcrypt from "bcryptjs";

const password = "admin123";

const generateHash = async () => {
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
};

generateHash();

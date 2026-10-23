const crypto = require("crypto");

const generateResetToken = () => {
  // Token yang dikirim ke user
  const token = crypto.randomBytes(32).toString("hex");

  // Token yang disimpan di database
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return {
    token,
    tokenHash,
  };
};

module.exports = {
  generateResetToken,
};
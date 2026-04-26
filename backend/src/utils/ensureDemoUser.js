const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ensureDemoUser = async () => {
    const demoEmail = (process.env.DEMO_EMAIL || "demo@pica.app").trim().toLowerCase();
    const demoPassword = process.env.DEMO_PASSWORD || "Pica@12345";
    const demoName = (process.env.DEMO_NAME || "Pica Demo").trim();

    const existingUser = await User.findOne({ email: demoEmail });
    if (existingUser) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPassword, salt);

    await User.create({
        name: demoName,
        email: demoEmail,
        password: hashedPassword,
    });

    console.log(`Demo user ready: ${demoEmail}`);
};

module.exports = ensureDemoUser;
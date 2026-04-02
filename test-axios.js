const axios = require('axios');

const test = async () => {
    try {
        const response = await axios.post("https://med-mate-lqkw.vercel.app/api/auth/signup", {
            firstName: "John",
            lastName: "Doe",
            email: `test_${Date.now()}@example.com`,
            password: "password123",
            dateOfBirth: "1990-01-01",
            gender: "Male",
            phoneNumber: "+923331234567",
            role: "patient"
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
        console.error("Message:", err.message);
    }
};

test();

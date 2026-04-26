const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");
const Expense = require("../src/models/Expense");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test_secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe("Auth and Expense API", () => {
    it("registers and logs in a user", async () => {
        const registerRes = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        });

        expect(registerRes.statusCode).toBe(201);
        expect(registerRes.body).toHaveProperty("token");

        const loginRes = await request(app).post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123",
        });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body).toHaveProperty("token");
    });

    it("creates, updates, lists, summarizes, and deletes an expense", async () => {
        const registerRes = await request(app).post("/api/auth/register").send({
            name: "Flow User",
            email: "flow@example.com",
            password: "password123",
        });

        const token = registerRes.body.token;

        const createRes = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 250,
                category: "Food",
                date: new Date().toISOString(),
                note: "Dinner",
            });

        expect(createRes.statusCode).toBe(201);
        expect(createRes.body.category).toBe("Food");

        const expenseId = createRes.body._id;

        const updateRes = await request(app)
            .put(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 300,
                category: "Food",
                date: new Date().toISOString(),
                note: "Dinner with dessert",
            });

        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.amount).toBe(300);

        const listRes = await request(app)
            .get("/api/expenses")
            .set("Authorization", `Bearer ${token}`);

        expect(listRes.statusCode).toBe(200);
        expect(listRes.body.length).toBe(1);

        const summaryRes = await request(app)
            .get("/api/expenses/summary")
            .set("Authorization", `Bearer ${token}`);

        expect(summaryRes.statusCode).toBe(200);
        expect(summaryRes.body[0].category).toBe("Food");
        expect(summaryRes.body[0].totalAmount).toBe(300);

        const deleteRes = await request(app)
            .delete(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.statusCode).toBe(200);
    });
});

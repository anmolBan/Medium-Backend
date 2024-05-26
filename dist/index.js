"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const zod = require('zod');
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
app.use(express.json());
// Welcome route
app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Hello world!"
    });
});
// Get all posts route
app.get("/blog/bulk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany();
        return res.status(200).json({ posts });
    }
    catch (error) {
        console.error(error);
        res.json({
            error
        });
    }
}));
// Schema for signup input data validation
const schema1 = zod.object({
    email: zod.string(),
    name: zod.string(),
    password: zod.string()
});
// Signup route
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedPayload = schema1.safeParse(body);
    if (!parsedPayload.success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }
    try {
        const newUser = yield prisma.user.create({
            data: {
                email: body.email,
                name: body.name,
                password: body.password
            },
        });
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
        return res.status(200).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(403).json({ error });
    }
}));
// Schema for signin input data validation
const schema2 = zod.object({
    email: zod.string(),
    password: zod.string()
});
// Signin route
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedPayload = schema2.safeParse(body);
    if (!parsedPayload.success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: body.email
            },
        });
        if (!user) {
            return res.status(403).json({
                message: "User not found"
            });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        return res.status(200).json({ token });
    }
    catch (error) {
        console.error(error);
        res.json({ error });
    }
}));
// Schema for blog input data validation
const schema3 = zod.object({
    title: zod.string(),
    content: zod.string()
});
// Blog post route
app.post("/blog", middleware_1.signinVerfication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedPayload = schema3.safeParse({ title: req.body.title, content: req.body.content });
    if (!parsedPayload.success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }
    try {
        const post = yield prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                authorId: req.id
            },
        });
        return res.status(200).json({
            id: post.id
        });
    }
    catch (error) {
        console.error(error);
        res.json({ error });
    }
}));
// Schema for blog input data validation
const schema4 = zod.object({
    id: zod.string(),
    title: zod.string(),
    content: zod.string()
});
// Blog update route
app.put("/blog", middleware_1.signinVerfication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedPayload = schema4.safeParse({ id: req.body.id, title: req.body.title, content: req.body.content });
    if (!parsedPayload.success) {
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }
    try {
        yield prisma.post.update({
            where: {
                id: req.body.id
            },
            data: {
                title: req.body.title,
                content: req.body.content
            }
        });
        return res.status(200).json({
            Message: "Post Updated"
        });
    }
    catch (error) {
        console.error(error);
        res.json({ error });
    }
}));
// Get a post route
app.get("/blog/:id", middleware_1.signinVerfication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield prisma.post.findUnique({
            where: {
                id: req.params.id
            }
        });
        return res.status(200).json({
            post
        });
    }
    catch (error) {
        console.error(error);
        res.json({ error });
    }
}));
const PORT = 3000;
app.listen(PORT, function () {
    console.log("Sever is running on port:", PORT);
});

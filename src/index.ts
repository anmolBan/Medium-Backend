const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const zod = require('zod');
import { PrismaClient } from '@prisma/client';
import { signinVerfication } from './middleware';

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
});

app.use(express.json());

// Welcome route

app.get("/", (req: any, res: any) => {
    return res.status(200).json({
        message: "Hello world!"
    });
});

// Get all posts route

app.get("/blog/bulk", async (req: any, res: any) => {
    try{
        const posts = await prisma.post.findMany();

        return res.status(200).json({posts});
    } catch(error){
        console.error(error);
        res.json({
            error
        });
    }
});

// Schema for signup input data validation

const schema1 = zod.object({
    email: zod.string(),
    name: zod.string(),
    password: zod.string()
});

// Signup route

app.post("/signup", async (req: any, res: any) => {
    const body = req.body;
    const parsedPayload = schema1.safeParse(body);
    if(!parsedPayload.success){
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    try{
        const newUser = await prisma.user.create({
            data:{
                email: body.email,
                name: body.name,
                password: body.password
            },
        });

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET);
        return res.status(200).json({token});

    } catch(error){
        console.error(error);
        res.status(403).json({error});
    }
});

// Schema for signin input data validation

const schema2 = zod.object({
    email: zod.string(),
    password: zod.string()
});

// Signin route

app.post("/signin", async(req: any, res: any) => {
    const body = req.body;
    const parsedPayload = schema2.safeParse(body);

    if(!parsedPayload.success){
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            },
        });

        if(!user){
            return res.status(403).json({
                message: "User not found"
            });
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
        return res.status(200).json({token});
    } catch(error){
        console.error(error);
        res.json({error});
    }
});

// Schema for blog input data validation

const schema3 = zod.object({
    title: zod.string(),
    content: zod.string()
});

// Blog post route

app.post("/blog", signinVerfication, async (req: any, res: any) => {

    const parsedPayload = schema3.safeParse({title: req.body.title, content: req.body.content});
    if(!parsedPayload.success){
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    try{
        const post = await prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                authorId: req.id
            },
        });
    
        return res.status(200).json({
            id: post.id
        });
    } catch(error){
        console.error(error);
        res.json({error});
    }

});

// Schema for blog input data validation

const schema4 = zod.object({
    id: zod.string(),
    title: zod.string(),
    content: zod.string()
});

// Blog update route

app.put("/blog", signinVerfication, async (req: any, res: any) => {
    const parsedPayload = schema4.safeParse({id: req.body.id, title: req.body.title, content: req.body.content});
    if(!parsedPayload.success){
        return res.status(403).json({
            message: "Incorrect inputs"
        });
    }

    try{
        await prisma.post.update({
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
    }catch(error){
        console.error(error);
        res.json({error});
    }

});

// Get a post route

app.get("/blog/:id", signinVerfication, async (req: any, res: any) => {
    try{
        const post = await prisma.post.findUnique({
            where: {
                id: req.params.id
            }
        });
        return res.status(200).json({
            post
        });
    } catch(error){
        console.error(error);
        res.json({error});
    }
});


const PORT = 3000;
app.listen(PORT, function(){
    console.log("Sever is running on port:", PORT);
});
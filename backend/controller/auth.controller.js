import { PrismaClient } from "@prisma/client";
import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'

const prismaClient = new PrismaClient()

export const signup = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return next(errorHandler(400, 'all field required'))
        }

        const existing_user = await prismaClient.user.findUnique({
            where: {
                name: username
            }
        })

        if (existing_user) {
            return next(errorHandler(400, 'user already exists'))
        }

        const hashedPassword = bcryptjs.hashSync(password, 10)
        const newUser = await prismaClient.user.create({
            data: {
                name: username,
                password: hashedPassword
            }
        })
        // const useradd = await newUser.save();
        return res.status(201).json({
            message: 'success',
            newUser
        })
    }
    catch (e) {
        next(e)
    }
}

export const signin = async (req, res, next) => {
    const { username, password } = req.body;
    const str = process.env.JWT_SECRET;
    console.log(str)
    if (!username || !password) {
        return next(errorHandler(400, 'All fields are required'));
    }
    try {
        const validUser = await prismaClient.user.findFirst({
            where: {
                name: username
            },
        });
        if (!validUser) {
            return next(errorHandler(404, 'Not a valid user'));
        }
        const validPwd = bcryptjs.compareSync(password, validUser.password);
        if (!validPwd) {
            return next(errorHandler(400, 'Invalid password'));
        }
        const token = jwt.sign(
            { user: validUser },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200)
            .cookie('access_token', token, { httpOnly: true })
            .json({
                validUser,
                token,
                message: 'Successful signin',
            });
    } catch (e) {
        console.log(e);
        next(e);
    }
};

// Signout controller
export const signout = (req, res, next) => {
    try {
        console.log(req.cookies); // Check if cookies are being logged
        res.clearCookie('access_token')
            .status(200)
            .json('User has been signed out');
    } catch (error) {
        next(error);
    }
};


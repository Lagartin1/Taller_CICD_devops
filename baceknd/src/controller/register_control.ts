

import express, { Request, Response } from 'express';
import { prisma } from '../models/postgres';
import userSchema from '../schemas/user';
import bcrypt from 'bcrypt';
import type { User } from '../schemas/user';


export const registerControl = async (req: Request, res: Response) => {
 //validar formato json

  if (typeof req.body !== 'object' || req.body === null) {
    return res.status(400).json({
      message: 'Invalid JSON format',
    });
  }

  const new_user = req.body as User;

  // Validate the request body against the user schema
  const schema = new userSchema();
  const validationErrors = schema.validate(new_user);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors,
    });
  } 


  try {
    // Check if the username or email already exists in the database
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { username: new_user.username },
          { email: new_user.email },
        ],
      },
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email already exists',
      });
    }
    const hashedPassword = await bcrypt.hash(new_user.password, 10);
  
    // Create a new user in the database
    const newUser = await prisma.usuario.create({
      data: {
        username: new_user.username,
        password: hashedPassword,
        email: new_user.email,
        name: new_user.name,
        user_type: new_user.user_type,
      },
    });
  
    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });



  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }

}

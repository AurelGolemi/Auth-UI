import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/auth';
import { registerSchema } from '@/app/lib/validations/auth';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with zod
    const validatedData = registerSchema.parse(body);

    // Create user
    const user = await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Return success (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Zod validation Errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle duplicate user
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
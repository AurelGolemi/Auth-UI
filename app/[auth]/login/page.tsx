'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Github, Chrome } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { LoginForm } from '@/app/components/auth/login-form';
import { RegisterForm } from '@/app/components/auth/register-form';
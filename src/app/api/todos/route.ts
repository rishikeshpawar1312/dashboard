// src/app/api/todos/route.ts
import { NextResponse } from 'next/server';
import {prisma }from '@/lib/prisma';

// GET all todos
export async function GET() {
  const todos = await prisma.todo.findMany();
  return NextResponse.json(todos);
}

// POST a new todo
export async function POST(req: Request) {
  const { title } = await req.json();
  const newTodo = await prisma.todo.create({ data: { title } });
  return NextResponse.json(newTodo);
}

// PUT to update a todo
export async function PUT(req: Request) {
  const { id, completed } = await req.json();
  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { completed },
  });
  return NextResponse.json(updatedTodo);
}

// DELETE a todo
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ message: 'Todo deleted' });
}

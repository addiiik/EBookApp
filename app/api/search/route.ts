import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const limit = searchParams.get('limit');

  if (!query) {
    return NextResponse.json([]);
  }

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [
      { rating: 'desc' },
      { title: 'asc' }
    ],
    ...(limit && { take: parseInt(limit) }),
  });

  return NextResponse.json(books);
}
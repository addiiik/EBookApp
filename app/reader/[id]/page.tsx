import { getUserFromToken } from '@/app/actions/auth';
import { checkBookPurchased, getBookReader } from '@/app/actions/book';
import { redirect } from 'next/navigation';
import ReaderBookClient from './readerClient';
import { checkReadingProgress } from '@/app/actions/reader';

export default async function ReaderBookPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const book = await getBookReader(id);

  if (!book) redirect('/');
  const payload = await getUserFromToken();
  if (!payload) redirect('/');

  const isPurchased = await checkBookPurchased(payload.id, book.id);
  if (!isPurchased) redirect(`/book/${book.id}`);

  const progress = await checkReadingProgress(payload.id, book.id);
  if (!progress) redirect('/reader');

  const seed = `book-${book.id}`;

  return (
    <ReaderBookClient
      bookId={book.id}
      title={book.title}
      author={book.author}
      seed={seed}
      pages={book.pages}
      currentPage={progress.page}
      finished={progress.finished}
    />
  );
}

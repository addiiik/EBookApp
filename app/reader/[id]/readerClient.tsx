'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { faker } from '@faker-js/faker';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  RotateCcw,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  updateReadingProgress,
  resetReadingProgress,
  finishBook,
} from '@/app/actions/reader';
import { toast } from 'sonner';
import Link from 'next/link';

interface Chapter {
  number: number;
  title: string;
  startPage: number;
}

interface ReaderClientProps {
  bookId: string;
  title: string;
  author: string;
  seed: string;
  pages: number;
  currentPage: number;
  finished: boolean;
}

function generateChapters(seed: string, totalPages: number): Chapter[] {
  faker.seed(hashString(seed + '-chapters'));

  const chapterCount = Math.min(Math.max(Math.floor(totalPages / 10), 5), 15);
  const chapters: Chapter[] = [];

  const pagesPerChapter = Math. floor(totalPages / chapterCount);

  for (let i = 0; i < chapterCount; i++) {
    chapters.push({
      number: i + 1,
      title: faker.company.catchPhrase(),
      startPage: i === 0 ? 1 : i * pagesPerChapter + 1,
    });
  }

  return chapters;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generatePageContent(
  seed: string,
  page: number,
  chapters: Chapter[],
): {
  content: string[];
  chapterStart?: Chapter;
} {
  faker.seed(hashString(`${seed}-page-${page}`));

  const chapterStart = chapters.find((ch) => ch.startPage === page);

  const paragraphCount = chapterStart ? 3 : faker.number.int({ min: 4, max: 6 });
  const paragraphs: string[] = [];

  for (let i = 0; i < paragraphCount; i++) {
    const sentenceCount = faker.number.int({ min: 3, max: 8 });
    const sentences: string[] = [];

    for (let j = 0; j < sentenceCount; j++) {
      sentences.push(faker.lorem.sentence({ min: 8, max: 30 }));
    }

    paragraphs.push(sentences. join(' '));
  }

  return { content: paragraphs, chapterStart };
}

export default function ReaderBookClient({
  bookId,
  title,
  author,
  seed,
  pages,
  currentPage,
  finished: initialFinished,
}: ReaderClientProps) {
  const [page, setPage] = useState(() =>
    Math.max(1, Math.min(pages, currentPage || 1)),
  );

  const [pendingPage, setPendingPage] = useState<number | null>(() =>
    Math.max(1, Math.min(pages, currentPage || 1)),
  );

  const [isFinished, setIsFinished] = useState(initialFinished);
  const [isResetting, setIsResetting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    const safe = Math.max(1, Math.min(pages, currentPage || 1));
    setPage(safe);
    setPendingPage(safe);
    setIsFinished(initialFinished);
  }, [currentPage, pages, initialFinished]);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [page]);

  const chapters = useMemo(() => generateChapters(seed, pages), [seed, pages]);

  const { content: pageContent, chapterStart } = useMemo(() => {
    return generatePageContent(seed, page, chapters);
  }, [page, seed, chapters]);

  const currentChapter = useMemo(() => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (page >= chapters[i].startPage) {
        return chapters[i];
      }
    }
    return chapters[0];
  }, [page, chapters]);

  useEffect(() => {
    if (pendingPage == null) return;

    const timeout = setTimeout(async () => {
      try {
        const result = await updateReadingProgress(bookId, pendingPage);
        if (! result.success) {
          toast.error(result.message);
        }
      } catch (error) {
        toast. error('Network error, progress will not save');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingPage, bookId]);

  const goToPage = (pageNum: number) => {
    const nextPage = Math.max(1, Math.min(pages, pageNum));

    setPage(nextPage);
    setPendingPage(nextPage);
    setShowToc(false);
  };

  const handlePrevious = () => {
    if (page === 1) return;
    goToPage(page - 1);
  };

  const handleNext = () => {
    if (page === pages) return;
    goToPage(page + 1);
  };

  const handleFinishBook = async () => {
    setIsFinishing(true);
    try {
      const result = await finishBook(bookId);
      if (result.success) {
        setIsFinished(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Could not finish book');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleReadAgain = async () => {
    setIsResetting(true);
    try {
      const result = await resetReadingProgress(bookId);
      if (result.success) {
        setPage(1);
        setPendingPage(1);
        setIsFinished(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Could not reset progress');
    } finally {
      setIsResetting(false);
    }
  };

  if (isFinished) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-serif font-bold mb-2 text-stone-800">
            Finished!
          </h2>
          <p className="text-stone-600 mb-6">
            You&apos;ve completed <span className="font-medium">{title}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleReadAgain}
              disabled={isResetting}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Read Again
            </Button>
            <Link href="/reader">
              <Button variant="outline">Back to Reader</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowToc(!showToc)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-serif text-sm font-medium text-stone-800">
                {title}
              </h1>
              <p className="text-xs text-stone-500">by {author}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-stone-500 hidden md:block">
              Chapter {currentChapter. number}: {currentChapter.title}
            </div>
            <Link href="/reader">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {showToc && (
          <aside className="absolute inset-y-0 left-0 w-72 bg-white border-r z-10 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-serif text-lg font-semibold mb-4 text-stone-800">
                Table of Contents
              </h2>
              <nav className="space-y-1">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.number}
                    onClick={() => goToPage(chapter.startPage)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentChapter.number === chapter.number
                        ? 'bg-primary text-white'
                        : 'text-stone-600 hover:bg-accent'
                    }`}
                  >
                    <span className="font-medium">Chapter {chapter.number}</span>
                    <span className="block text-xs opacity-75 capitalize">
                      {chapter.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <main
          className="flex-1 flex flex-col overflow-hidden min-h-0"
          onClick={() => showToc && setShowToc(false)}
        >
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-4 py-3 md:px-6 lg:px-8 min-h-0"
          >
            <article className="max-w-4xl mx-auto font-serif text-stone-800 h-full">
              {chapterStart && (
                <header className="mb-4 text-center">
                  <p className="text-sm uppercase tracking-widest text-stone-500 mb-1">
                    Chapter {chapterStart.number}
                  </p>
                  <h2 className="text-xl md:text-2xl font-medium capitalize">
                    {chapterStart.title}
                  </h2>
                  <div className="mt-2 flex justify-center">
                    <div className="w-16 h-px bg-stone-300" />
                  </div>
                </header>
              )}

              <div className="space-y-2">
                {pageContent.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed text-base md:text-lg text-justify ${
                      i === 0 && chapterStart
                        ? 'first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-0. 5 first-letter:leading-none first-letter:text-stone-700'
                        : ''
                    }`}
                    style={{
                      textIndent: i === 0 && chapterStart ? '0' : '1.5em',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </div>

          <footer className="shrink-0 border-t backdrop-blur-sm">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
              {page > 1 ?  (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-stone-600 hover:text-stone-900"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-4">
                <span className="text-sm text-stone-500 font-mono">
                  {page} / {pages}
                </span>
              </div>

              {page < pages ?  (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-stone-600 hover:text-stone-900"
                  onClick={handleNext}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={handleFinishBook}
                  disabled={isFinishing}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Finish Book</span>
                </Button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
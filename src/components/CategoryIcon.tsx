const paths: Record<string, string> = {
  dating: 'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12Z',
  secrets: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5ZM12 14v3',
  funny: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 14q4 5 8 0M8 8v2M16 8v2',
  chaos: 'M14 2 4 14h7l-1 8 10-12h-7Z',
  spicy: 'M12 2c2 6 8 8 8 13a8 8 0 0 1-16 0c0-3 2-5 4-7 0 4 2 5 3 5 2-3 2-7 1-11Z',
};

export default function CategoryIcon({ categoryId }: { categoryId: string }) {
  const path = paths[categoryId];
  return path ? <svg className="category-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
    fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg> : null;
}

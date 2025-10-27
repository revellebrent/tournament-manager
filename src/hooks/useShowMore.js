import { useEffect, useMemo, useState } from 'react';

export default function useShowMore(list = [], initial = 3, step = 3) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    setCount(initial);
  }, [initial, list]);

  const items = useMemo(() => list.slice(0, count), [list, count]);
  const canShowMore = count < list.length;

  function showMore() {
    setCount((c) => Math.min(c + step, list.length));
  }

  return { items, canShowMore, showMore, count, total: list.length };
}
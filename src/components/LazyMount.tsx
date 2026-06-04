import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
};

export default function LazyMount({ children, placeholder, rootMargin = "200px" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : placeholder}</div>;
}

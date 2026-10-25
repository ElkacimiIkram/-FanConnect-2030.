/**
 * Lightweight motion shim when framer-motion is not installed.
 * Run `npm install framer-motion` and remove the vite alias for full features.
 */
import React, {
  createElement,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const MOTION_TAGS = [
  'div', 'span', 'article', 'section', 'header', 'button', 'a',
  'p', 'h1', 'h2', 'h3', 'circle', 'svg',
];

function resolveVariant(variants, name) {
  if (!variants || !name || typeof name !== 'string') return undefined;
  return variants[name];
}

function buildTransition(transition, delay = 0) {
  if (!transition) return `all 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;
  if (transition.type === 'spring') {
    return `all ${0.3 + (transition.damping || 24) / 100}s cubic-bezier(0.22, 1, 0.36, 1)`;
  }
  const duration = transition.duration ?? 0.45;
  const ease = Array.isArray(transition.ease)
    ? `cubic-bezier(${transition.ease.join(',')})`
    : 'cubic-bezier(0.22, 1, 0.36, 1)';
  const d = (transition.delay ?? delay) || 0;
  return `all ${duration}s ${ease} ${d}s`;
}

function toCssTransform(props) {
  if (!props || Array.isArray(props)) return undefined;
  const parts = [];
  if (props.x != null) {
    parts.push(`translateX(${typeof props.x === 'number' ? `${props.x}px` : props.x})`);
  }
  if (props.y != null) {
    parts.push(`translateY(${typeof props.y === 'number' ? `${props.y}px` : props.y})`);
  }
  if (props.scale != null) parts.push(`scale(${props.scale})`);
  if (props.rotate != null) parts.push(`rotate(${props.rotate}deg)`);
  return parts.length ? parts.join(' ') : undefined;
}

function toCssStyle(motionProps) {
  if (!motionProps || Array.isArray(motionProps)) return {};
  const style = {};
  if (motionProps.opacity != null) style.opacity = motionProps.opacity;
  if (motionProps.strokeDashoffset != null) style.strokeDashoffset = motionProps.strokeDashoffset;
  const transform = toCssTransform(motionProps);
  if (transform) style.transform = transform;
  if (motionProps.width != null) {
    style.width = typeof motionProps.width === 'number' ? `${motionProps.width}%` : motionProps.width;
  }
  return style;
}

function parseInlineStyle(style) {
  if (!style) return {};
  const { y, x, scale, rotate, ...rest } = style;
  return mergeStyle(toCssStyle({ y, x, scale, rotate }), rest);
}

function mergeStyle(a, b) {
  if (!a && !b) return {};
  const out = { ...(a || {}), ...(b || {}) };
  const t = [a?.transform, b?.transform].filter(Boolean).join(' ');
  if (t) out.transform = t;
  return out;
}

function createMotionComponent(tag) {
  const Component = forwardRef(function MotionComponent(
    {
      initial,
      animate,
      exit: _exit,
      transition,
      variants,
      whileHover,
      whileTap: _whileTap,
      whileInView,
      viewport,
      style,
      onMouseEnter,
      onMouseLeave,
      onClick,
      children,
      className,
      ...rest
    },
    ref
  ) {
    const innerRef = useRef(null);
    const combinedRef = ref || innerRef;
    const [hovered, setHovered] = useState(false);
    const [inView, setInView] = useState(true);

    const resolvedInitial = initial === false ? undefined : (
      typeof initial === 'string' ? resolveVariant(variants, initial) : initial
    );
    const resolvedAnimate = typeof animate === 'string' ? resolveVariant(variants, animate) : animate;
    const resolvedWhileInView = typeof whileInView === 'string'
      ? resolveVariant(variants, whileInView)
      : whileInView;

    useEffect(() => {
      if (!whileInView || !combinedRef.current) return undefined;
      const el = combinedRef.current;
      const observer = new IntersectionObserver(
        ([entry]) => { setInView(entry.isIntersecting); },
        { rootMargin: viewport?.margin || '0px', threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, [whileInView, viewport, combinedRef]);

    const activeMotion = useMemo(() => {
      if (whileInView && resolvedWhileInView) {
        return inView ? resolvedWhileInView : (resolvedInitial || { opacity: 1 });
      }
      if (resolvedAnimate) return resolvedAnimate;
      if (resolvedInitial) {
        const hidden = resolvedInitial.opacity === 0 || resolvedInitial.opacity === '0';
        return hidden ? { opacity: 1, y: 0, scale: 1 } : resolvedInitial;
      }
      return { opacity: 1 };
    }, [inView, resolvedWhileInView, resolvedAnimate, resolvedInitial, whileInView]);

    const computedStyle = useMemo(() => {
      let s = toCssStyle(activeMotion);
      if (hovered && whileHover) s = mergeStyle(s, toCssStyle(whileHover));
      s = mergeStyle(s, parseInlineStyle(style));
      if (resolvedAnimate || resolvedWhileInView) {
        s.transition = buildTransition(transition, transition?.delay);
      }
      return s;
    }, [activeMotion, hovered, whileHover, style, resolvedAnimate, resolvedWhileInView, transition]);

    return createElement(
      tag,
      {
        ...rest,
        ref: combinedRef,
        className,
        style: computedStyle,
        onMouseEnter: (e) => { setHovered(true); onMouseEnter?.(e); },
        onMouseLeave: (e) => { setHovered(false); onMouseLeave?.(e); },
        onClick,
      },
      children
    );
  });
  Component.displayName = `motion.${tag}`;
  return Component;
}

export const motion = MOTION_TAGS.reduce((acc, tag) => {
  acc[tag] = createMotionComponent(tag);
  return acc;
}, {});

export function AnimatePresence({ children }) {
  return children;
}

export function useScroll({ target } = {}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = target?.current;
    if (!el) return undefined;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const scrolled = window.innerHeight - rect.top;
      setProgress(Math.min(1, Math.max(0, scrolled / total)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [target]);

  return { scrollYProgress: progress };
}

export function useTransform(value, inputRange, outputRange) {
  const inMin = inputRange[0];
  const inMax = inputRange[1];
  const outStart = outputRange[0];
  const outEnd = outputRange[1];

  return useMemo(() => {
    const progress = typeof value === 'number' ? value : 0;
    const t = inMax === inMin ? 0 : (progress - inMin) / (inMax - inMin);
    const clamped = Math.min(1, Math.max(0, t));

    const outMin = parseFloat(outStart);
    const outMax = parseFloat(outEnd);
    const isPercent = String(outStart).includes('%');

    if (isPercent) {
      return `${outMin + (outMax - outMin) * clamped}%`;
    }
    return outMin + (outMax - outMin) * clamped;
  }, [value, inMin, inMax, outStart, outEnd]);
}
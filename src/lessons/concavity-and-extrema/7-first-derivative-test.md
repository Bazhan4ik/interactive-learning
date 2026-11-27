Critical points are where local extrema *can* happen. The **first derivative test** decides what actually happens there.

### The test

Let $c$ be an interior input where $f$ is continuous, and suppose $f$ is differentiable just to each side of $c$. The derivative *at* $c$ may fail to exist.

| $f'$ left of $c$ | $f'$ right of $c$ | at $c$ |
| :-: | :-: | :-- |
| $+$ | $-$ | local maximum |
| $-$ | $+$ | local minimum |
| $+$ | $+$ | neither |
| $-$ | $-$ | neither |

Here $+$ and $-$ mean strictly positive and strictly negative on the corresponding intervals, and the first two cases give **strict** local extrema. With weak signs ($f' \ge 0$ on the left, $f' \le 0$ on the right) you still get a local maximum, possibly not strict: flat stretches can create ties.

### Why it works

Suppose $f' > 0$ just left of $c$ and $f' < 0$ just right of it. For $x < c$ close to $c$, the Mean Value Theorem on $[x, c]$ gives

$$
f(c) - f(x) = f'(\xi)(c - x) > 0, \qquad x < \xi < c,
$$

and for $x > c$, on $[c, x]$,

$$
f(x) - f(c) = f'(\eta)(x - c) < 0, \qquad c < \eta < x.
$$

So $f(x) < f(c)$ on both sides: a strict local maximum. Continuity at $c$ is what makes the two MVT applications legal.

### Example: $f(x) = \frac{x^3}{3} - \frac{3x^2}{2} + 2x + 1$

$$
f'(x) = x^2 - 3x + 2 = (x - 1)(x - 2).
$$

The derivative exists everywhere and vanishes only at $1$ and $2$. Its sign chart is $+,\, -,\, +$:

- at $x = 1$ the sign goes $+ \to -$: **local maximum** $\left(1, \tfrac{11}{6}\right)$
- at $x = 2$ it goes $- \to +$: **local minimum** $\left(2, \tfrac{5}{3}\right)$

Drag the point in the diagram. The tangent is green while $f' > 0$ and red while $f' < 0$, and it lies flat exactly at the two critical points.

These extrema are only **local**. The cubic tends to $-\infty$ as $x \to -\infty$ and to $+\infty$ as $x \to \infty$, so it has no global maximum or minimum on $\mathbb{R}$.

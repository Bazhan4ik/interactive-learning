### Definition

The point $(c, f(c))$ is an **inflection point** if $f$ is continuous at $c$ and the concavity **changes** across $c$, from up to down or from down to up.

The key word is *change*, not *zero*.

### Finding them

1. Find where $f'' = 0$ and where $f''$ does not exist. These are only **candidates**.
2. Check that $c$ is in the domain and $f$ is continuous at $c$.
3. Test the concavity on **both sides**. A genuine change is essential.
4. Evaluate $f(c)$ and report the point.

### Worked example: $f(x) = x^4 - 6x^2$

$$
f'(x) = 4x^3 - 12x, \qquad f''(x) = 12x^2 - 12 = 12(x - 1)(x + 1).
$$

The sign chart of $f''$ is $+,\, -,\, +$ across $-1$ and $1$, so $f$ is concave up outside $[-1, 1]$ and concave down between. Both candidates are genuine changes, and $f(\pm 1) = -5$:

$$
\text{inflection points: } (-1, -5) \text{ and } (1, -5).
$$

### Two traps

Use the switch in the diagram to see each one.

- **$f(x) = x^4$:** $f''(x) = 12x^2$, so $f''(0) = 0$. But $f'' > 0$ on both sides: no change, so $(0, 0)$ is **not** an inflection point. Solving $f'' = 0$ only produces candidates.
- **$f(x) = 1/x$:** $f''(x) = 2/x^3$ is negative for $x < 0$ and positive for $x > 0$, so the concavity does change across $0$. But $0$ is not in the domain and there is no point $(0, f(0))$, so there is **no** inflection point.

### A necessary condition

If $f''$ exists near $c$ and is continuous at $c$, then an inflection point at $c$ forces $f''(c) = 0$.

**Proof.** If $f''(c) > 0$, continuity keeps $f'' > 0$ near $c$, so the graph is concave up on both sides and nothing changes. The same argument rules out $f''(c) < 0$.

This condition is **necessary, not sufficient**, as $x^4$ shows. And when $f''(c)$ doesn't exist, don't reject $c$ automatically: check continuity and the two sides directly.

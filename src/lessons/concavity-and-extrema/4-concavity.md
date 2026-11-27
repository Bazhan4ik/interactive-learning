The first derivative tells us how the **values** of $f$ change. The second derivative tells us how the **slopes** change. That is what concavity is about.

### Concave up and concave down

On an interval, $f$ is

- **concave up** if every chord lies on or above the graph. For differentiable $f$, this means $f'$ is increasing.
- **concave down** if every chord lies on or below the graph. For differentiable $f$, this means $f'$ is decreasing.

In the diagram, drag the yellow point along $f(x) = \frac{x^3 - 9x}{6}$.

- On the purple part the slopes **decrease** as you move right, so $f'$ (bottom graph) goes down. The dashed chord sits **below** the curve.
- On the teal part the slopes **increase**, $f'$ goes up, and the chord sits **above** the curve.

Concavity is independent of whether $f$ is going up or down. A function can be increasing and concave down, like $\sqrt{x}$, or decreasing and concave up, like $e^{-x}$. Find a spot in the diagram where $f$ falls but is concave up.

### The concavity test

Suppose $f$ is continuous on an interval $I$ and twice differentiable at its interior points.

- If $f'' > 0$ throughout the interior, then $f'$ is strictly increasing and $f$ is **concave up** on $I$.
- If $f'' < 0$ throughout the interior, then $f'$ is strictly decreasing and $f$ is **concave down** on $I$.

Non-strict signs ($\ge 0$, $\le 0$) give the non-strict conclusions.

**Why:** apply last lecture's derivative sign theorem to $f'$ instead of $f$. Since $(f')' = f''$, a positive $f''$ forces the slopes to increase. Here $f''(x) = x$, which is exactly why the colours switch at $0$.

**Reporting intervals:** split at zeros of $f''$, at points where $f''$ fails to exist, and at excluded inputs. List separate intervals separately.

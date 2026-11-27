Last time we used the sign of $f'$ to decide where a function increases or decreases. Derivatives can do more: they can **compare two functions**.

### The comparison theorem

Suppose $f(a) = g(a)$, both functions are continuous on an interval containing $a$ and differentiable at its interior points, and

$$
f'(x) \le g'(x)
$$

there. Then

$$
f(x) \le g(x) \quad (x > a), \qquad f(x) \ge g(x) \quad (x < a).
$$

If $f' < g'$ strictly, the conclusions are strict for every $x \ne a$.

**Why it works.** Let $H = f - g$. Then $H(a) = 0$ and $H' = f' - g' \le 0$, so $H$ is decreasing. To the right of $a$, $H(x) \le H(a) = 0$; to the left, $H(x) \ge H(a) = 0$. Notice that the direction **reverses to the left of the anchor**.

### The anchor is essential

In the diagram $f' \le g'$ everywhere: $g$ always climbs at least as fast as $f$. The shaded gap is green where $f \le g$ and red where $f > g$.

- Drag the anchor $a$. However you move it, the ordering flips exactly at $a$: red to the left, green to the right.
- Now move the slider so that $g(a) \ne f(a)$. The flip happens somewhere else, and just to the right of $a$ you can find $f > g$.

The derivatives only describe how the **gap changes**. Without a common starting value they say nothing about which function is bigger. For example, $f(x) = x$ and $g(x) = 100$ have $f' > g'$, yet $f(0) = 0 < 100 = g(0)$.

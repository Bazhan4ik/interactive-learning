Here is the comparison theorem at work. We'll prove the two-sided bound

$$
x - \frac{x^2}{2} < \ln(1 + x) < x \qquad (x > 0).
$$

### Step 1: a shared anchor

For $x \ge 0$ all three functions are defined and continuous, they are differentiable for $x > 0$, and all three equal $0$ at $x = 0$. That common starting value is the anchor.

### Step 2: the upper bound

Compare derivatives:

$$
\frac{d}{dx}\ln(1+x) = \frac{1}{1+x} < 1 = \frac{d}{dx}\,x \qquad (x > 0).
$$

Since the functions agree at $0$, strict comparison to the right of $0$ gives $\ln(1+x) < x$.

### Step 3: the lower bound

The derivative of $x - \tfrac{x^2}{2}$ is $1 - x$, and

$$
\frac{1}{1+x} - (1 - x) = \frac{1 - (1-x)(1+x)}{1+x} = \frac{x^2}{1+x} > 0 \qquad (x > 0).
$$

So $(x - \tfrac{x^2}{2})' < (\ln(1+x))'$, and with the same anchor, $x - \tfrac{x^2}{2} < \ln(1+x)$. No sign restriction on $1 - x$ is needed.

### See the proof

Switch the diagram between **values** and **slopes**. The slopes are ordered for every $x > 0$, and all three functions start together at the origin, so the values end up ordered the same way. Drag the marker on the $x$-axis: at $x = 1$ you get $0.5 < 0.693 < 1$.

The faint part left of $0$ is outside what we proved. There the comparison theorem runs in the opposite direction.

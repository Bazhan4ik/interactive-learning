The logarithm bounds give a clean proof of a famous limit:

$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^{n} = e.
$$

### Step 1: substitute $x = 1/n$

For each positive integer $n$, the bounds from the previous section give

$$
\frac{1}{n} - \frac{1}{2n^2} < \ln\!\left(1 + \frac{1}{n}\right) < \frac{1}{n}.
$$

### Step 2: multiply by $n > 0$

$$
1 - \frac{1}{2n} < n \ln\!\left(1 + \frac{1}{n}\right) < 1.
$$

Both outer expressions tend to $1$, so by the squeeze theorem $n\ln(1 + 1/n) \to 1$.

### Step 3: undo the logarithm

The exponential is continuous, so

$$
\left(1 + \frac{1}{n}\right)^{n} = \exp\!\Big(n \ln\big(1 + \tfrac{1}{n}\big)\Big) \longrightarrow e^1 = e.
$$

### In the diagram

Exponentiating the squeeze traps every term between $e^{1 - 1/(2n)}$ (purple) and $e$ (green). Move the slider and watch the gap close. Notice how **slowly** it closes: even at $n = 40$ the term is still about $0.03$ below $e$, roughly $\tfrac{e}{2n}$.

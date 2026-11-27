A capacitor charges through a resistor. In the ideal model the charge is

$$
Q(t) = Q_\infty\left(1 - e^{-t/\tau}\right), \qquad Q_\infty > 0,\; \tau > 0,\; t \ge 0,
$$

where $Q$ is in coulombs, $t$ and the **time constant** $\tau$ are in seconds, and $Q_\infty$ is the limiting charge.

### Increasing or decreasing?

$$
Q'(t) = \frac{Q_\infty}{\tau}\, e^{-t/\tau} > 0 \;\; \text{C/s}.
$$

The charge is strictly increasing. Physically, $Q'$ is the **current**: $I(t) = Q'(t)$.

### Concavity

$$
Q''(t) = -\frac{Q_\infty}{\tau^2}\, e^{-t/\tau} < 0 \;\; \text{C/s}^2.
$$

The charge is **concave down**: it keeps rising while its rate of increase falls. The current $I = Q'$ is positive but decreasing, because $I' = Q'' < 0$.

In the diagram, the dashed line touching the blue curve is the tangent to $Q$. Its slope **is** the current, and you can see it flatten as the orange current curve dies away. Change $\tau$ with the slider: a larger time constant means slower charging.

### Long-time behaviour

As $t \to \infty$, $Q(t) \to Q_\infty$ and $I(t) \to 0$. The limiting charge is approached but never reached at any finite time. After one time constant,

$$
Q(\tau) = Q_\infty\left(1 - e^{-1}\right) \approx 0.63\, Q_\infty.
$$

There is no change of concavity and no interior critical point, so there is no inflection point and no interior local extremum. On $[0, \infty)$ the global minimum is $Q(0) = 0$; there is no attained global maximum.

Keep the two quantities apart: **charge** and its **rate of change** (current) are different physical things, with different graphs and different units.

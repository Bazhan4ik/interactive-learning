The **dot product** multiplies two vectors and produces a *number*. Multiply matching components and add:

$$
\mathbf{a} \cdot \mathbf{b} = a_x b_x + a_y b_y
$$

For example, $(3, 2) \cdot (4, -1) = 12 - 2 = 10$.

### What it means

The same number can be computed from the lengths and the angle $\theta$ between the vectors:

$$
\mathbf{a} \cdot \mathbf{b} = |\mathbf{a}|\,|\mathbf{b}|\cos\theta
$$

So the dot product measures how much two vectors **point the same way**:

- **positive** when $\theta < 90^\circ$
- **zero** when they are perpendicular, $\theta = 90^\circ$
- **negative** when $\theta > 90^\circ$

### Projection

The dashed line drops $\mathbf{a}$ straight onto the line of $\mathbf{b}$, like a shadow cast by a light shining directly above it. The highlighted segment is the **projection** of $\mathbf{a}$ onto $\mathbf{b}$, and

$$
\mathbf{a} \cdot \mathbf{b} = |\mathbf{b}| \times (\text{signed length of the shadow})
$$

Drag the vectors and watch the shadow shrink to nothing as $\theta$ reaches $90^\circ$, then flip to the other side.

The dot product shows up everywhere: in physics, the work done by a force is $W = \mathbf{F} \cdot \mathbf{d}$. In graphics, it decides how brightly light hits a surface.

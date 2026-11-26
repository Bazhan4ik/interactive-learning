Some quantities are fully described by a single number: a temperature of $21^\circ\text{C}$, a mass of $3\,\text{kg}$. Others need a **direction** as well. Saying a car moves at $50\,\text{km/h}$ is incomplete. Saying it moves at $50\,\text{km/h}$ *heading north* describes its **velocity**.

A **vector** is a quantity with both a **magnitude** (size) and a **direction**. Plain numbers are called **scalars**.

### Drawing vectors

We draw a vector as an arrow. Its length shows the magnitude, and the way it points shows the direction.

Position doesn't matter: two arrows with the same length and the same direction are the *same* vector, wherever they are drawn. That freedom is what makes the next sections work.

### Notation

Vectors are usually written in bold, $\mathbf{v}$, or with an arrow on top, $\vec{v}$. In two dimensions a vector is described by its **components**: how far it reaches along the $x$-axis and along the $y$-axis.

$$
\mathbf{v} = \begin{pmatrix} 3 \\ 2 \end{pmatrix} = (3, 2)
$$

means "$3$ units to the right and $2$ units up".

### Magnitude

The magnitude of $\mathbf{v} = (x, y)$ is written $|\mathbf{v}|$. The components form a right triangle with the arrow, so by Pythagoras:

$$
|\mathbf{v}| = \sqrt{x^2 + y^2}
$$

For $\mathbf{v} = (3, 2)$, that gives $|\mathbf{v}| = \sqrt{9 + 4} = \sqrt{13} \approx 3.61$.

A vector with magnitude $1$ is called a **unit vector**. It carries direction only. Any nonzero vector can be turned into one by dividing it by its length:

$$
\hat{\mathbf{v}} = \frac{\mathbf{v}}{|\mathbf{v}|}
$$

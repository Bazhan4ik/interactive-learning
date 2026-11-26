/**
 * Introduction to vectors: definition and notation, addition and
 * subtraction, scalar multiplication, and the dot product. Each section ends
 * with a short quiz, and a review quiz closes the lesson.
 *
 * Prompts use String.raw so LaTeX backslashes need no escaping.
 */
import { defineLesson } from '#lesson';
import definition from './1-what-is-a-vector.md?raw';
import addition from './2-addition.md?raw';
import additionScene from './2-addition.scene';
import sumDirectionScene from './2-quiz-sum-direction.scene';
import scaling from './3-scaling.md?raw';
import scalingScene from './3-scaling.scene';
import dotProduct from './4-dot-product.md?raw';
import dotProductScene from './4-dot-product.scene';
import perpendicularScene from './4-quiz-perpendicular.scene';
import combinationScene from './5-quiz-combination.scene';

export default defineLesson({
	title: 'Introduction to vectors',
	sections: [
		{
			title: 'Vector definition and notation',
			text: definition,
			quiz: [
				{
					type: 'choice',
					prompt: 'Which of these quantities is a vector?',
					options: ['The temperature of a room', 'The mass of a ball', 'The velocity of a plane', 'The duration of a race'],
					answer: 2,
					explanation: 'Velocity has a size *and* a direction. The others are fully described by a single number: they are scalars.'
				},
				{
					type: 'number',
					prompt: String.raw`What is the magnitude of $\mathbf{v} = (6, 8)$?`,
					answer: 10,
					explanation: String.raw`$|\mathbf{v}| = \sqrt{6^2 + 8^2} = \sqrt{100} = 10$`
				}
			]
		},
		{
			title: 'Vector addition and subtraction',
			text: addition,
			scene: additionScene,
			quiz: [
				{
					type: 'choice',
					prompt: String.raw`What is $(2, -1) + (-3, 4)$?`,
					options: ['$(-1, 3)$', '$(5, -5)$', '$(-1, -5)$', '$(-6, -4)$'],
					answer: 0,
					explanation: String.raw`Add matching components: $(2 + (-3),\; -1 + 4) = (-1, 3)$.`
				},
				{
					type: 'number',
					prompt: String.raw`Let $\mathbf{a} = (3, 1)$ and $\mathbf{b} = (1, 2)$. What is the $y$-component of $\mathbf{a} - \mathbf{b}$?`,
					answer: -1,
					explanation: String.raw`$\mathbf{a} - \mathbf{b} = (3 - 1,\; 1 - 2) = (2, -1)$, so the $y$-component is $-1$.`
				},
				{
					type: 'scene',
					prompt: String.raw`A small vector $\mathbf{a}$ with positive components is added to a bigger vector $\mathbf{b}$ with negative components. Drag the yellow arrow so it points roughly where $\mathbf{a} + \mathbf{b}$ points.`,
					scene: sumDirectionScene,
					check: 'inThirdQuadrant',
					explanation: String.raw`$\mathbf{b}$ is bigger in both directions, so it wins: $\mathbf{a} + \mathbf{b} = (1, 0.6) + (-3, -2.2) = (-2, -1.6)$. That points down and to the left, into the third quadrant.`
				}
			]
		},
		{
			title: 'Scalar multiplication',
			text: scaling,
			scene: scalingScene,
			quiz: [
				{
					type: 'number',
					prompt: String.raw`Let $\mathbf{v} = (2, -1)$. What is the $x$-component of $-3\mathbf{v}$?`,
					answer: -6,
					explanation: String.raw`$-3\mathbf{v} = (-3 \cdot 2,\; -3 \cdot (-1)) = (-6, 3)$.`
				},
				{
					type: 'choice',
					prompt: String.raw`If $|\mathbf{v}| = 5$, what is $|-2\mathbf{v}|$?`,
					options: ['$-10$', '$10$', '$5$', String.raw`$\tfrac{5}{2}$`],
					answer: 1,
					explanation: String.raw`Lengths are never negative: $|-2\mathbf{v}| = |-2|\,|\mathbf{v}| = 2 \cdot 5 = 10$. The minus sign only flips the direction.`
				}
			]
		},
		{
			title: 'The dot product',
			text: dotProduct,
			scene: dotProductScene,
			quiz: [
				{
					type: 'number',
					prompt: String.raw`Compute $(1, 2) \cdot (3, -1)$.`,
					answer: 1,
					explanation: String.raw`$1 \cdot 3 + 2 \cdot (-1) = 3 - 2 = 1$`
				},
				{
					type: 'scene',
					prompt: String.raw`Drag $\mathbf{b}$ so that it is **perpendicular** to $\mathbf{a}$.`,
					scene: perpendicularScene,
					explanation: String.raw`Perpendicular means $\mathbf{a} \cdot \mathbf{b} = 0$. With $\mathbf{a} = (2, 1)$ that's $2b_x + b_y = 0$, so for example $\mathbf{b} = (-1, 2)$ or $(1, -2)$.`
				}
			]
		},
		{
			title: 'Review',
			text: 'A few questions that mix everything from this lesson.',
			quiz: [
				{
					type: 'choice',
					prompt: 'Which of these are **unit vectors**?',
					options: ['$(1, 0)$', '$(0.6, 0.8)$', '$(1, 1)$', String.raw`$\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)$`],
					answer: [0, 1, 3],
					explanation: String.raw`A unit vector has length $1$. $|(0.6, 0.8)| = \sqrt{0.36 + 0.64} = 1$ and $\left|\left(\tfrac{1}{\sqrt{2}}, \tfrac{1}{\sqrt{2}}\right)\right| = \sqrt{\tfrac12 + \tfrac12} = 1$, but $|(1, 1)| = \sqrt{2}$.`
				},
				{
					type: 'number',
					prompt: String.raw`What is the angle between $(1, 0)$ and $(1, 1)$, in degrees?`,
					answer: 45,
					tolerance: 0.5,
					unit: '°',
					explanation: String.raw`$\cos\theta = \dfrac{(1,0) \cdot (1,1)}{|(1,0)|\,|(1,1)|} = \dfrac{1}{\sqrt{2}}$, so $\theta = 45^\circ$.`
				},
				{
					type: 'scene',
					prompt: String.raw`Drag $\mathbf{w}$ to the vector $2\mathbf{a} - \mathbf{b}$.`,
					scene: combinationScene,
					explanation: String.raw`$2\mathbf{a} - \mathbf{b} = 2(1, 1) - (2, -1) = (2 - 2,\; 2 + 1) = (0, 3)$.`
				}
			]
		}
	]
});

/**
 * Lesson authoring API (`#lesson`), imported by `src/lessons/<id>/lesson.ts`.
 * App-side helpers (registry, markdown, results, views) are imported from their files.
 */
export { defineLesson, isLesson, lessonQuestions } from './lesson';
export type { Lesson, LessonDefinition, Section, SectionDefinition } from './lesson';
export type {
	ChoiceQuestionDefinition,
	NumberQuestionDefinition,
	Question,
	QuestionDefinition,
	SceneQuestionDefinition
} from './quiz/questions';

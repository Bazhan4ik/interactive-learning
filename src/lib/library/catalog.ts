/**
 * Machine-readable view of the library: every exported object with its meta.
 * Used by tests (every object is smoke-rendered) and to describe the library
 * to the lesson-writing LLM.
 */
import { describeObjects, isObjectFactory, type ObjectFactory } from '#engine';
import * as library from './index';

export const catalog: readonly ObjectFactory<any>[] = Object.values(library).filter(isObjectFactory);

/** Markdown reference of all library objects, for inclusion in an LLM prompt. */
export const describeLibrary = (): string => describeObjects(catalog);

/**
 * Helper function to check if obeject has property
 */
export function hasOwnProperty<T extends { [key: string]: any }, K extends keyof T>(obj: T, prop: K): boolean {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

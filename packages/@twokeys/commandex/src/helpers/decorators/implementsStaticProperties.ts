/**
 * Decorator to implement static properties on a class.
 * From https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface/43674389#43674389
 */
export default function implementsStaticProperties<T>() {
	return <U extends T>(constructor: U): U => constructor;
}

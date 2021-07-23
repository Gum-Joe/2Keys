/**
 * Copied from protobufjs index.d.ts
 * Modified for our own purposes as some properties are missing
 */

import { Writer, Reader, IConversionOptions } from "protobufjs";

/** Abstract runtime message. */
export abstract class Message<T extends object = object> {

	/**
	 * Constructs a new message instance.
	 * @param [properties] Properties to set
	 */
	constructor(properties?: unknown);

	/** Removed these as not present in compiled stuff */
	/** Reference to the reflected type. */
	// public static readonly $type: Type;

	/** Reference to the reflected type. */
	// public readonly $type: Type;

	/**
	 * Creates a new message of this type using the specified properties.
	 * @param [properties] Properties to set
	 * @returns Message instance
	 */
	public static create<T extends Message<T>>(properties?: { [k: string]: any }): Message<T>;

	/**
	 * Encodes a message of this type.
	 * @param message Message to encode
	 * @param [writer] Writer to use
	 * @returns Writer
	 */
	public static encode<T extends Message<T>>(message: (T | { [k: string]: any }), writer?: Writer): Writer;

	/**
	 * Encodes a message of this type preceeded by its length as a varint.
	 * @param message Message to encode
	 * @param [writer] Writer to use
	 * @returns Writer
	 */
	public static encodeDelimited<T extends Message<T>>(message: (T | { [k: string]: any }), writer?: Writer): Writer;

	/**
	 * Decodes a message of this type.
	 * @param reader Reader or buffer to decode
	 * @returns Decoded message
	 */
	public static decode<T extends Message<T>>(reader: (Reader | Uint8Array)): unknown; // T

	/**
	 * Decodes a message of this type preceeded by its length as a varint.
	 * @param reader Reader or buffer to decode
	 * @returns Decoded message
	 */
	public static decodeDelimited<T extends Message<T>>(reader: (Reader | Uint8Array)): unknown; // T

	/**
	 * Verifies a message of this type.
	 * @param message Plain object to verify
	 * @returns `null` if valid, otherwise the reason why it is not
	 */
	public static verify(message: { [k: string]: any }): (string | null);

	/**
	 * Creates a new message of this type from a plain object. Also converts values to their respective internal types.
	 * @param object Plain object
	 * @returns Message instance
	 */
	public static fromObject<T extends Message<T>>(object: { [k: string]: any }): unknown; // T

	/**
	 * Creates a plain object from a message of this type. Also converts values to other types if specified.
	 * @param message Message instance
	 * @param [options] Conversion options
	 * @returns Plain object
	 */
	public static toObject<T extends Message<T>>(message: unknown, options?: IConversionOptions): { [k: string]: any };

	/**
	 * Converts this message to JSON.
	 * @returns JSON object
	 */
	public toJSON(): { [k: string]: any };
}
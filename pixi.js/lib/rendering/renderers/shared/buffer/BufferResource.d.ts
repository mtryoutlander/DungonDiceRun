import EventEmitter from 'eventemitter3';
import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from './Buffer';
/**
 * A resource that can be bound to a bind group and used in a shader.
 * Whilst a buffer can be used as a resource, this class allows you to specify an offset and size of the buffer to use.
 * This is useful if you have a large buffer and only part of it is used in a shader.
 *
 * This resource, will listen for changes on the underlying buffer and emit a itself if the buffer changes shape.
 * @example
 *
 * const buffer = new Buffer({
 *     data: new Float32Array(1000),
 *    usage: BufferUsage.UNIFORM,
 * });
 * // Create a buffer resource that uses the first 100 bytes of a buffer
 * const bufferResource = new BufferResource({
 *    buffer,
 *    offset: 0,
 *    size: 100,
 * });
 * @memberof rendering
 */
export declare class BufferResource extends EventEmitter<{
    change: BindResource;
}> implements BindResource {
    /**
     * emits when the underlying buffer has changed shape (i.e. resized)
     * letting the renderer know that it needs to discard the old buffer on the GPU and create a new one
     * @event change
     */
    /** a unique id for this uniform group used through the renderer */
    readonly uid: number;
    /**
     * a resource type, used to identify how to handle it when its in a bind group / shader resource
     * @internal
     * @ignore
     */
    readonly _resourceType = "bufferResource";
    /**
     * used internally to know if a uniform group was used in the last render pass
     * @internal
     * @ignore
     */
    _touched: number;
    /**
     * the resource id used internally by the renderer to build bind group keys
     * @internal
     * @ignore
     */
    _resourceId: number;
    /** the underlying buffer that this resource is using */
    buffer: Buffer;
    /** the offset of the buffer this resource is using. If not provided, then it will use the offset of the buffer. */
    readonly offset: number;
    /** the size of the buffer this resource is using. If not provided, then it will use the size of the buffer. */
    readonly size: number;
    /**
     * A cheeky hint to the GL renderer to let it know this is a BufferResource
     * @internal
     * @ignore
     */
    readonly _bufferResource = true;
    /**
     * Has the Buffer resource been destroyed?
     * @readonly
     */
    destroyed: boolean;
    /**
     * Create a new Buffer Resource.
     * @param options - The options for the buffer resource
     * @param options.buffer - The underlying buffer that this resource is using
     * @param options.offset - The offset of the buffer this resource is using.
     * If not provided, then it will use the offset of the buffer.
     * @param options.size - The size of the buffer this resource is using.
     * If not provided, then it will use the size of the buffer.
     */
    constructor({ buffer, offset, size }: {
        buffer: Buffer;
        offset?: number;
        size?: number;
    });
    protected onBufferChange(): void;
    /**
     * Destroys this resource. Make sure the underlying buffer is not used anywhere else
     * if you want to destroy it as well, or code will explode
     * @param destroyBuffer - Should the underlying buffer be destroyed as well?
     */
    destroy(destroyBuffer?: boolean): void;
}

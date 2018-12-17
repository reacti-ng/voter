import {isChildOfOrEqualToPointer, isParentOfOrEqualToPointer, JsonPointer, jsonPointerToArray, jsonPointerToString} from './json-pointer';

export class JsonPointerMap<V> extends Map<JsonPointer, V> {
  constructor(entries?: Iterable<[JsonPointer, V]>) {
    super(
      [...(entries || [])].map(([pointer, value]) => [jsonPointerToString(pointer), value] as [string, V])
    );
  }

  get(pointer: JsonPointer): V | undefined {
    return super.get(jsonPointerToString(pointer));
  }
  set(pointer: JsonPointer, value: V): this {
    super.set(jsonPointerToString(pointer), value);
    return this;
  }
  delete(pointer: JsonPointer): boolean {
    return super.delete(jsonPointerToString(pointer));
  }

  /**
   * A JsonPointerMap which contains all entries in this map
   * where the key of the entry is Representation child of the given pointer.
   *
   * The comparison is non-strict, so any values associated with
   * the pointer will be included
   *
   * e.g. Given the map
   *
   *    const map = new JsonPointerMap([
   *      ['', 0]
   *      ['/foo/bar', 1],
   *      ['/foo/bar/2', 2],
   *      ['/bar/baz', 3]
   *      ['/foo', 4],
   *      ['/bar/qax/qx', 5]
   *    ]);
   *
   * Then the restriction associated with '/foo' would be
   *
   *    const mapRestriction = new JsonPointerMap([
   *      ['/foo/bar', 1],
   *      ['/foo/bar/2', 2],
   *      ['/foo', 4],
   *    ]);
   *
   * @param pointer
   */
  restrictToChildrenOf(pointer: JsonPointer): JsonPointerMap<V> {
    // tiny optimisation, ensure that pointer is only parsed once for all the comparisons.
    pointer = jsonPointerToArray(pointer);
    return new JsonPointerMap(
      [...this.entries()]
        .filter(([maybeChild, _]) => isChildOfOrEqualToPointer(maybeChild, pointer))
    );
  }
/**
   * A JsonPointerMap which contains all entries in this map
   * where the key of the entry is Representation parent of the given pointer.
   *
   * The comparison is non-strict, so any values associated with
   * the pointer will be included
   *
   * e.g. Given the map
   *
   *    const map = new JsonPointerMap([
   *      ['', 0]
   *      ['/foo/bar', 1],
   *      ['/foo/bar/2', 2],
   *      ['/bar/baz', 3]
   *      ['/foo', 4],
   *      ['/bar/qax/qx', 5]
   *    ]);
   *
   * Then the restriction associated with '/foo/bar' would be
   *
   *    const mapRestriction = new JsonPointerMap([
   *      ['', 0]
   *      ['/foo/bar', 1],
   *      ['/foo', 4],
   *    ]);
   *
   * @param pointer
   */
  restrictToParentsOf(pointer: JsonPointer): JsonPointerMap<V> {
    pointer = jsonPointerToArray(pointer);
    return new JsonPointerMap(
      [...this.entries()]
        .filter(([maybeParent, _]) => isParentOfOrEqualToPointer(maybeParent, pointer))
    )
  }

}

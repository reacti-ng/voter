import {JsonPointerMap} from './json-pointer-map';

describe('json-pointer-map', () => {
  describe('JsonPointerMap', () => {
    let map: JsonPointerMap<number>;

    beforeEach(() => {
      map = new JsonPointerMap([
        ['', 0],
        ['/foo/bar', 1],
        ['/foo/bar/2', 2],
        ['/bar/baz', 3],
        ['/foo', 4],
        ['/bar/qax', 5]
      ]);
    });

    it('should be creatable from an interable of json pointers', () => {
      const emptyMap = new JsonPointerMap([]);
      expect(emptyMap.size).toEqual(0);

      const nonemptyMap = new JsonPointerMap([
        ['/dream/on', 1],
        [['teenage', 'queen'], 2],
      ]);
      expect(nonemptyMap.size).toEqual(2);
      expect([...nonemptyMap.entries()]).toEqual([
        ['/dream/on', 1],
        ['/teenage/queen', 2]
      ]);
    });

    it('should be gettable/settable/deletable by json pointers', () => {

      map.set('/by/string/path', 6);
      map.set(['by', 'array', 'path'], 7);

      expect(map.get(['by', 'array', 'path'])).toEqual(7);
      expect(map.get('/by/string/path')).toEqual(6);

      expect(map.get('')).toEqual(0);
      map.set('', 9);
      expect(map.get('')).toEqual(9);

      const isFooDeleted = map.delete('/foo');
      expect(isFooDeleted).toEqual(true);
      const isNonExistentDeleted = map.delete('/non-existent');
      expect(isNonExistentDeleted).toEqual(false);

      map.set('/bar/baz', 8);
      map.delete(['foo', 'bar', '2']);

      expect([...map.entries()]).toEqual([
        ['', 9],
        ['/foo/bar', 1],
        ['/bar/baz', 8],
        ['/bar/qax', 5],
        ['/by/string/path', 6],
        ['/by/array/path', 7]
      ]);
    });

    it('should be possible to restrict the map to only the entries which are children of the given key', () => {
      const restriction = map.restrictToChildrenOf('/foo');
      // It should return Representation copy of foo
      expect(restriction).not.toBe(map);

      expect([...restriction.entries()]).toEqual([
        ['/foo/bar', 1],
        ['/foo/bar/2', 2],
        ['/foo', 4],
      ]);
    });

    it('should be possible to restrict the map to only the entries which are parents of the given key', () => {
      const restriction = map.restrictToParentsOf('/foo/bar');
      // It should return Representation shallow copy
      expect(restriction).not.toBe(map);
      expect([...restriction.entries()]).toEqual([
        ['', 0],
        ['/foo/bar', 1],
        ['/foo', 4]
      ]);
    });
  });
});

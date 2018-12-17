/* tslint:disable: max-line-length */
import {
  compareJsonPointers,
  escapeJsonPathSegment,
  getJsonPointer, isChildOfOrEqualToPointer, isChildOfPointer, isEqualPointers,
  isJsonPointer, isParentOfOrEqualToPointer, isParentOfPointer, JsonPointer,
  jsonPointerToArray,
  jsonPointerToString, PointerComparison, PointerError, PointerSettable, setJsonPointer,
  unescapeJsonPathSegment
} from './json-pointer';


describe('json-pointer', () => {
  describe('isJsonPointer', () => {
    it('should match only strings and arrays of strings', () => {
      expect(isJsonPointer(null)).toBeFalsy();
      expect(isJsonPointer({})).toBeFalsy();

      expect(isJsonPointer('')).toBeTruthy();
      expect(isJsonPointer('/foo/bar/1/he$')).toBeTruthy();
      expect(isJsonPointer('/fo~0')).toBeTruthy();

      expect(isJsonPointer('/foo~3')).toBeFalsy('invalid escape sequence');
      expect(isJsonPointer('abc')).toBeFalsy('must be empty or start with Representation leading \'/\'');

      expect(isJsonPointer([])).toBeTruthy();
      expect(isJsonPointer(['a', 'quiet', 'summer', 'day'])).toBeTruthy();
      expect(isJsonPointer(['b', 1])).toBeFalsy('contains number');
      expect(isJsonPointer(['b', ['a', '1']])).toBeFalsy('contains nested array');
    });
  });

  describe('jsonPointerToString', () => {
    it('should format Representation string-like pointer', () => {
      expect(jsonPointerToString('/Representation/b/c')).toEqual('/Representation/b/c');
      expect(jsonPointerToString('/Representation~0/b~1/c')).toEqual('/Representation~0/b~1/c');
    });

    it('should format an array-like pointer, escaping \'~\' and \'/\' characters', () => {
      expect(jsonPointerToString([])).toEqual('');
      expect(jsonPointerToString(['/~'])).toEqual('/~1~0');

      expect(jsonPointerToString(['foo', 'bar', '3'])).toEqual('/foo/bar/3');
    });
  });

  describe('jsonPointerToArray', () => {
    it('should parse Representation string-like pointer', () => {
      expect(() => jsonPointerToArray('/abc~def'))
        .toThrow(jasmine.any(Error));
      expect(() => jsonPointerToArray('helloWorld'))
        .toThrow(jasmine.any(Error));

      expect(jsonPointerToArray('/Representation/b/c')).toEqual(['a', 'b', 'c']);
      expect(jsonPointerToArray('/Representation~0/b~1/c'))
        .toEqual(['Representation~', 'b/', 'c'], 'unescape segments');
    });

    it('should copy an array-like pointer', () => {
      const x = ['an', 'array-like', 'pointer'];
      expect(jsonPointerToArray(x)).toEqual(x);
      expect(jsonPointerToArray(x)).not.toBe(x);
    });
  });

  describe('PointerComparison', () => {
    const model = {} as any;
    model.one = model.two = {'buckle': 'my shoe'};
    model.three = model.four = {'knock_at': 'my door'};
    model.five = model.six = {'pick_up': 'sticks'};
    model.seven = model.eight = {'$(sticks).lay': 'straight'};
    model.nine = model.ten = {'go': ['home', 'home' /* again */]};

    describe('compareJsonPointer', () => {
      it('should (partially) order json-paths by ancestry', () => {
        expect(compareJsonPointers('', '')).toEqual(PointerComparison.IsSame);
        expect(compareJsonPointers('/six/pick_up', '/six/pick_up')).toEqual(PointerComparison.IsSame);

        expect(compareJsonPointers('', '/ten/go/0')).toEqual(PointerComparison.IsParentOf);
        expect(compareJsonPointers('/ten', '/ten/go')).toEqual(PointerComparison.IsParentOf);

        expect(compareJsonPointers('/ten/go/0', '')).toEqual(PointerComparison.IsChildOf);
        expect(compareJsonPointers('/ten/go', '/ten')).toEqual(PointerComparison.IsChildOf);

        expect(compareJsonPointers('/one', '/seven/$(sticks).lay')).toEqual(PointerComparison.NotComparable);
        expect(compareJsonPointers('/three', '/go`')).toEqual(PointerComparison.NotComparable);
      });

      it('should compare pointers of different types', () => {
        expect(compareJsonPointers('/one', ['one'])).toEqual(PointerComparison.IsSame);
        expect(compareJsonPointers('', ['ten', 'go', '0'])).toEqual(PointerComparison.IsParentOf);
        expect(compareJsonPointers(['ten', 'go', '0'], '')).toEqual(PointerComparison.IsChildOf);
        expect(compareJsonPointers('/three', ['go'])).toEqual(PointerComparison.NotComparable);

        expect(compareJsonPointers('/Representation~0b', ['Representation~b'])).toEqual(PointerComparison.IsSame, 'segments are unescaped');
        expect(compareJsonPointers('/c~1d', ['c/d'])).toEqual(PointerComparison.IsSame);
      });
    });

    describe('isEqualPointers, isParentOfPointer, isParentOfOrEqualToPointer, isChildOfPointer, isChildOfOrEqualToPointer', () => {
      it('should make the appropriate comparison', () => {


        function expectComparison(comparisonFn: Function, expectations: [PointerComparison, boolean][]) {
          function expectationFor(comparison: PointerComparison) {
            const expectation = expectations.find(([comp, _]) => comp === comparison);
            if (expectation === undefined) {
              throw new Error('Expectation was undefined');
            }
            return expectation[1];
          }

          expect(comparisonFn('/one', ['one'])).toEqual(expectationFor(PointerComparison.IsSame), `${comparisonFn.name}: '/one === /one`);
          expect(comparisonFn('', ['ten', 'go', '0'])).toEqual(expectationFor(PointerComparison.IsParentOf), `${comparisonFn.name}: '' < /ten/go/0`);
          expect(comparisonFn(['ten', 'go', '0'], '')).toEqual(expectationFor(PointerComparison.IsChildOf), `${comparisonFn.name}: /ten/go/0 < ''`);
          expect(comparisonFn('/three', ['go'])).toEqual(expectationFor(PointerComparison.NotComparable), `${comparisonFn.name}: /three || /go`);

          expect(comparisonFn('/Representation~0b', ['Representation~b'])).toEqual(expectationFor(PointerComparison.IsSame), `${comparisonFn.name}: '~' is unescaped in array-like pointer`);
          expect(comparisonFn('/c~1d', ['c/d'])).toEqual(expectationFor(PointerComparison.IsSame), `R{comparisonFn.name}: '/' is unescaped in array-like pointer`);
        }

        expectComparison(isEqualPointers, [
          [PointerComparison.IsSame, true],
          [PointerComparison.IsParentOf, false],
          [PointerComparison.IsChildOf, false],
          [PointerComparison.NotComparable, false]
        ]);

        expectComparison(isParentOfPointer, [
          [PointerComparison.IsSame, false],
          [PointerComparison.IsParentOf, true],
          [PointerComparison.IsChildOf, false],
          [PointerComparison.NotComparable, false]
        ]);

        expectComparison(isChildOfPointer, [
          [PointerComparison.IsSame, false],
          [PointerComparison.IsParentOf, false],
          [PointerComparison.IsChildOf, true],
          [PointerComparison.NotComparable, false]
        ]);

        expectComparison(isParentOfOrEqualToPointer, [
          [PointerComparison.IsSame, true],
          [PointerComparison.IsParentOf, true],
          [PointerComparison.IsChildOf, false],
          [PointerComparison.NotComparable, false]
        ]);

        expectComparison(isChildOfOrEqualToPointer, [
          [PointerComparison.IsSame, true],
          [PointerComparison.IsParentOf, false],
          [PointerComparison.IsChildOf, true],
          [PointerComparison.NotComparable, false]
        ]);
      });
    });
  });

  describe('escapeJsonPathSegment', () => {
    it('should escape any special characters in source.', () => {
      expect(escapeJsonPathSegment('abcdef12345')).toEqual('abcdef12345');

      expect(escapeJsonPathSegment('~')).toEqual('~0');
      expect(escapeJsonPathSegment('/')).toEqual('~1');

      expect(escapeJsonPathSegment('~/~/~/~')).toEqual('~0~1~0~1~0~1~0');
      expect(escapeJsonPathSegment('foo/123')).toEqual('foo~1123');
      expect(escapeJsonPathSegment('foo~123')).toEqual('foo~0123');
    });
  });

  describe('unescapeJsonPathSegment', () => {
    it('should replace any escape sequences in source', () => {
      expect(unescapeJsonPathSegment('abcdef12345')).toEqual('abcdef12345');

      expect(unescapeJsonPathSegment('~0')).toEqual('~');
      expect(unescapeJsonPathSegment('~1')).toEqual('/');

      expect(unescapeJsonPathSegment('~0~1~0~1~0~1~0')).toEqual('~/~/~/~');
      expect(unescapeJsonPathSegment('foo~1123')).toEqual('foo/123');
      expect(unescapeJsonPathSegment('foo~0123')).toEqual('foo~123');

    });

    it('should error if the source contains an invalid escape sequence', () => {

      expect(() => unescapeJsonPathSegment('foo~223'))
        .toThrow(new Error('Segment \'foo~223\' contains invalid escape sequence \'~2\'.'));

      expect(() => unescapeJsonPathSegment('bar~'))
        .toThrow(new Error('Segment \'bar~\' contains invalid escape sequence \'~\'.'));
    });
  });

  describe('getJsonPointer', () => {
    it('should be an identity function if the pointer is empty', () => {
      const obj = {};
      expect(getJsonPointer(obj, '')).toBe(obj);
      expect(getJsonPointer(obj, [])).toBe(obj);
    });

    it('should get Representation value from an object', () => {
      // Object tests from RFC 6901
      const obj = {
        'foo': ['bar', 'baz'],
        '': 0,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        'g|h': 4,
        'i\\j': 5,
        'k\"l': 6,
        ' ': 7,
        'm~n': 8
      };

      expect(getJsonPointer(obj, '')).toBe(obj);
      expect(getJsonPointer(obj, '/foo')).toEqual(['bar', 'baz']);
      expect(getJsonPointer(obj, '/foo/0')).toEqual('bar');
      expect(getJsonPointer(obj, '/')).toEqual(0);
      expect(getJsonPointer(obj, '/Representation~1b')).toEqual(1);
      expect(getJsonPointer(obj, '/c%d')).toEqual(2);
      expect(getJsonPointer(obj, '/e^f')).toEqual(3);
      expect(getJsonPointer(obj, '/g|h')).toEqual(4);
      expect(getJsonPointer(obj, '/i\\j')).toEqual(5);
      expect(getJsonPointer(obj, '/k\"l')).toEqual(6);
      expect(getJsonPointer(obj, '/ ')).toEqual(7);
      expect(getJsonPointer(obj, '/m~0n')).toEqual(8);

    });

    it('should get Representation value from an array', () => {
      const arr = ['a', 'b', 'c', 'd', 'e', ['f', 'g', 'h'], 'i', 'j', 'k', 'l', 'm', 'n', ['o', 'p', 'q']];
      expect(getJsonPointer(arr, '')).toEqual(arr);
      expect(getJsonPointer(arr, '/1')).toEqual('b');

      expect(getJsonPointer(arr, '/5')).toEqual(['f', 'g', 'h']);
      expect(getJsonPointer(arr, '/5/2')).toEqual('h');

      expect(getJsonPointer(arr, '/10')).toEqual('m');
      expect(getJsonPointer(arr, '/12/0')).toEqual('o');

      expect(getJsonPointer(arr, '/-')).toBeUndefined();
    });

    it('should be able to access Representation value at any level of nesting', () => {
      const nestedArr = [[[[['value']]]]];
      expect(getJsonPointer(nestedArr, '')).toEqual([[[[['value']]]]]);
      expect(getJsonPointer(nestedArr, '/0')).toEqual([[[['value']]]]);
      expect(getJsonPointer(nestedArr, '/0/0')).toEqual([[['value']]]);
      expect(getJsonPointer(nestedArr, '/0/0/0')).toEqual([['value']]);
      expect(getJsonPointer(nestedArr, '/0/0/0/0')).toEqual(['value']);
      expect(getJsonPointer(nestedArr, '/0/0/0/0/0')).toEqual('value');

      expect(() => getJsonPointer(nestedArr, '/0/0/0/0/0/0'))
        .toThrow(new PointerError(
          'Invalid pointer \'/0/0/0/0/0/0\': Cannot get segment \'0\' from primitive (\'value\').'
        ));

      const nestedObj = {a: {b: {c: {d: {e: 20}}}}};
      expect(getJsonPointer(nestedObj, '')).toEqual({a: {b: {c: {d: {e: 20}}}}});
      expect(getJsonPointer(nestedObj, '/Representation')).toEqual({b: {c: {d: {e: 20}}}});
      expect(getJsonPointer(nestedObj, '/Representation/b')).toEqual({c: {d: {e: 20}}});
      expect(getJsonPointer(nestedObj, '/Representation/b/c')).toEqual({d: {e: 20}});
      expect(getJsonPointer(nestedObj, '/Representation/b/c/d')).toEqual({e: 20});
      expect(getJsonPointer(nestedObj, '/Representation/b/c/d/e')).toEqual(20);
      expect(() => getJsonPointer(nestedObj, '/Representation/b/c/d/e/f'))
        .toThrow(new PointerError(
          'Invalid pointer \'/Representation/b/c/d/e/f\': Cannot get segment \'f\' from primitive (20).'
        ));
    });

    it('should error if the pointer is invalid', () => {
      expect(() => getJsonPointer({}, 'abcdef')).toThrow(
        new PointerError('Invalid pointer \'abcdef\': Must be empty or start with leading \'/\'')
      );
      expect(() => getJsonPointer([], '/00432')).toThrow(
        new PointerError('Invalid pointer \'/00432\': Array indexes may not contain leading zeroes.')
      );
      expect(() => getJsonPointer([], '/foo')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Array indexes must be base-10 integers or \'-\'.')
      );
      expect(() => getJsonPointer(null, '/foo')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Cannot get segment \'foo\' from primitive (null).')
      );
      expect(() => getJsonPointer(false, '/foo')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Cannot get segment \'foo\' from primitive (false).')
      );
      expect(() => getJsonPointer({}, '/foo~bar')).toThrow(
        new PointerError('Invalid pointer \'/foo~bar\': Segment \'foo~bar\' contains invalid escape sequence \'~b\'.')
      );
    });

  });

  describe('setJsonPointer', () => {
    it('should always return the value parameter if the pointer is empty', () => {
      const value = {};
      expect(setJsonPointer({}, '', value)).toBe(value);
      expect(setJsonPointer({}, [], value)).toBe(value);
    });

    it('should return Representation copy of the object, the field having the specified value', () => {

      // Object tests from RFC 6901
      const objs = [
        {'foo': ['bar', 'baz']},
        {'': 0},
        {'a/b': 1},
        {'c%d': 2},
        {'e^f': 3},
        {'g|h': 4},
        {'i\\j': 5},
        {'k\"l': 6},
        {' ': 7},
        {'m~n': 8},
      ];

      function expectNoMutations(obj: any, cb: (obj: any) => void) {
        // first copy the object
        const objCopy = {...obj};
        // then call the callback
        cb(objCopy);
        // Finally, ensure that none of the keys of objCopy has changed from obj.
        for (const  key in objCopy) {
          if (obj.hasOwnProperty(key)) { expect(obj[key]).toBe(objCopy[key]); }
        }
      }

      expectNoMutations(objs[0], (obj) => {
        const _self = {};
        expect(setJsonPointer(obj, '', _self)).toBe(_self);

        expect(setJsonPointer(obj, '/foo/0', 'ump')).toEqual({'foo': ['ump', 'baz']});
        expect(setJsonPointer(obj, '/foo', ['baz', 'quz'])).toEqual({'foo': ['baz', 'quz']});
        expect(setJsonPointer(obj, '/foo/-', 'car')).toEqual({foo: ['bar', 'baz', 'car']});
      });

      expectNoMutations(objs[1], (obj) => {
        expect(setJsonPointer(obj, '', 'badly')).toEqual('badly');
        expect(setJsonPointer(obj, '/', 'badly')).toEqual({'': 'badly'});
      });

      expectNoMutations(objs[2], (obj) => {
        expect(setJsonPointer(obj, '/Representation~1b', 'nimbus')).toEqual({'a/b': 'nimbus'});
        expect(() => setJsonPointer(obj, '/Representation/b', 'any'))
          .toThrow(jasmine.any(Error));
      });

      expectNoMutations(objs[3], (obj) => expect(setJsonPointer(obj, '/c%d', 'gary')            ).toEqual({'c%d': 'gary'}));
      expectNoMutations(objs[4], (obj) => expect(setJsonPointer(obj, '/e^f', {'hello': 'world'})).toEqual({'e^f': {'hello': 'world'}}));
      expectNoMutations(objs[5], (obj) => expect(setJsonPointer(obj, '/g|h', 'feeble')          ).toEqual({'g|h': 'feeble'}));
      expectNoMutations(objs[6], (obj) => expect(setJsonPointer(obj, '/i\\j', 'balloon')        ).toEqual({'i\\j': 'balloon'}));
      expectNoMutations(objs[7], (obj) => expect(setJsonPointer(obj, '/k\"l', undefined)        ).toEqual({}));
      expectNoMutations(objs[8], (obj) => expect(setJsonPointer(obj, '/ ', 7)                   ).toEqual({' ': 7}));

      expectNoMutations(objs[9], (obj) => {
        expect(setJsonPointer(obj, '/m~0n', 'leopold')).toEqual({'m~n': 'leopold'});
        expect(() => setJsonPointer(obj, '/m~n', 'any'))
          .toThrow(jasmine.any(Error));
      });
    });

    it('should be able to update Representation path value at any level of nesting', () => {
      const nestedArr = [[[[['value']]]]];
      expect(setJsonPointer(nestedArr, '',           null)).toEqual(null);
      expect(setJsonPointer(nestedArr, '/0',         null)).toEqual([null]);
      expect(setJsonPointer(nestedArr, '/0/0',       null)).toEqual([[null]]);
      expect(setJsonPointer(nestedArr, '/0/0/0',     null)).toEqual([[[null]]]);
      expect(setJsonPointer(nestedArr, '/0/0/0/0',   null)).toEqual([[[[null]]]]);
      expect(setJsonPointer(nestedArr, '/0/0/0/0/0', null)).toEqual([[[[[null]]]]]);
      expect(() => setJsonPointer(nestedArr, '/0/0/0/0/0/0', null))
        .toThrow(new PointerError(
          'Invalid pointer \'/0/0/0/0/0/0\': Cannot set segment \'0\' on primitive (\'value\').'
        ));

      const nestedObj = {a: {b: {c: {d: {e: 20}}}}};
      expect(setJsonPointer(nestedObj, '',           null)).toEqual(null);
      expect(setJsonPointer(nestedObj, '/Representation',         null)).toEqual({a: null});
      expect(setJsonPointer(nestedObj, '/Representation/b',       null)).toEqual({a: {b: null}});
      expect(setJsonPointer(nestedObj, '/Representation/b/c',     null)).toEqual({a: {b: {c: null}}});
      expect(setJsonPointer(nestedObj, '/Representation/b/c/d',   null)).toEqual({a: {b: {c: {d: null}}}});
      expect(setJsonPointer(nestedObj, '/Representation/b/c/d/e', null)).toEqual({a: {b: {c: {d: {e: null}}}}});
      expect(() => setJsonPointer(nestedObj, '/Representation/b/c/d/e/f', null))
        .toThrow(new PointerError(
          'Invalid pointer \'/Representation/b/c/d/e/f\': Cannot set segment \'f\' on primitive (20).'
        ));
    });

    it('should delgate to the \'setPointer\` method on the object, if one exists', () => {
      class Obj implements PointerSettable<Obj> {
        setPointer(pointer: JsonPointer, value: any): PointerSettable<Obj> {
          throw new Error('not implemented');
        }
      }

      const obj = new Obj();
      const setPointerSpy = spyOn(obj, 'setPointer').and.returnValue({});

      setJsonPointer(obj, '/path/to/smthng', 'the value');

      expect(setPointerSpy).toHaveBeenCalledWith('/path/to/smthng', 'the value');
      expect(setPointerSpy).toHaveBeenCalledTimes(1);
    });


    it('should error if the pointer contains an invalid segment', () => {
      expect(() => setJsonPointer({}, 'abcdef', 'any')).toThrow(
        new PointerError('Invalid pointer \'abcdef\': Must be empty or start with leading \'/\'')
      );
      expect(() => setJsonPointer([], '/00432', 'any')).toThrow(
        new PointerError('Invalid pointer \'/00432\': Array indexes may not contain leading zeroes.')
      );
      expect(() => setJsonPointer([], '/foo', 'any')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Array indexes must be base-10 integers or \'-\'.')
      );
      expect(() => setJsonPointer(null, '/foo', 'any')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Cannot set segment \'foo\' on primitive (null).')
      );
      expect(() => setJsonPointer(false, '/foo', 'any')).toThrow(
        new PointerError('Invalid pointer \'/foo\': Cannot set segment \'foo\' on primitive (false).')
      );
      expect(() => setJsonPointer({}, '/foo~bar', 'any')).toThrow(
        new PointerError('Invalid pointer \'/foo~bar\': Segment \'foo~bar\' contains invalid escape sequence \'~b\'.')
      );
    });
  });

});


import { describe, it, expect } from 'bun:test';
import { parse } from '~/parsing/parse';
import { CommentStyle } from '~/util/comment-style';
import { File } from '~/util/file';

describe('parse', () => {
  describe('behavior', () => {
    it('parses tags without a body', () => {
      const file = new File(
        'test.ts',
        `
        // spec(foo.bar)
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBeEmpty();
      expect(tags[0].getLocation()).toBe('test.ts:2:12');
    });

    it('parses tags with a body', () => {
      const file = new File(
        'test.ts',
        `
        // spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:2:12');
    });

    it('parses multiple tags in the same file', () => {
      const file = new File(
        'test.ts',
        `
        // spec(foo.one): one
        // spec(foo.two): two
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(2);

      expect(tags[0].getSpecName()).toBe('foo.one');
      expect(tags[0].getContent()).toBe('one');
      expect(tags[0].getLocation()).toBe('test.ts:2:12');

      expect(tags[1].getSpecName()).toBe('foo.two');
      expect(tags[1].getContent()).toBe('two');
      expect(tags[1].getLocation()).toBe('test.ts:3:12');
    });

    it('ignores non-tag comments', () => {
      const file = new File(
        'test.ts',
        `
        // not an tag
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toBeEmpty();
    });

    it('ignores tag text that is not inside comments', () => {
      const file = new File(
        'test.ts',
        `
        spec(foo.bar)
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toBeEmpty();
    });

    it('parses tags after non-tags', () => {
      const file = new File(
        'test.ts',
        `
        // not an tag
        // spec(foo.bar)
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBeEmpty();
      expect(tags[0].getLocation()).toBe('test.ts:3:12');
    });

    it('parses block comment tags', () => {
      const file = new File(
        'test.ts',
        `
        /**
         * spec(foo.bar): baz
         */
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:12');
    });

    it('parses block comment and single line comment tags in the same file', () => {
      const file = new File(
        'test.ts',
        `
        /**
         * spec(foo.bar): baz
         */
        // spec(foo.qux): qux
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(2);

      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:12');

      expect(tags[1].getSpecName()).toBe('foo.qux');
      expect(tags[1].getContent()).toBe('qux');
      expect(tags[1].getLocation()).toBe('test.ts:5:12');
    });

    it('ignores tags with invalid tags', () => {
      const file = new File(
        'test.ts',
        `
        // specification(foo.bar)
        // im_a_spec(foo.bar): spoiler - not a spec
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toBeEmpty();
    });

    it('parses specs in the middle a of comment', () => {
      const file = new File(
        'test.ts',
        `
        // This is a spec(foo.bar) without a body comment.
        // This is a spec(foo.baz): with a body comment.
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(2);

      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBeEmpty();
      expect(tags[0].getLocation()).toBe('test.ts:2:22');

      expect(tags[1].getSpecName()).toBe('foo.baz');
      expect(tags[1].getContent()).toBe('with a body comment.');
      expect(tags[1].getLocation()).toBe('test.ts:3:22');
    });

    it('parses tags with a multi line body', () => {
      const file = new File(
        'test.ts',
        `
        // not this line
        //
        // spec(foo.bar): one
        // two
        // three
        //
        // not this line
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe(`one\ntwo\nthree`);
      expect(tags[0].getLocation()).toBe('test.ts:4:12');
    });

    it('parses block tags with a multi line body', () => {
      const file = new File(
        'test.ts',
        `
        /**
         * not this line
         *
         * spec(foo.bar): one
         * two
         * three
         *
         * not this line
         */
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe(`one\ntwo\nthree`);
      expect(tags[0].getLocation()).toBe('test.ts:5:12');
    });

    it('parses multiple tags on the same line', () => {
      const file = new File(
        'test.ts',
        `
        /* spec(foo.one): one */ /* spec(foo.two): two */
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(2);

      expect(tags[0].getSpecName()).toBe('foo.one');
      expect(tags[0].getContent()).toBe('one');
      expect(tags[0].getLocation()).toBe('test.ts:2:12');

      expect(tags[1].getSpecName()).toBe('foo.two');
      expect(tags[1].getContent()).toBe('two');
      expect(tags[1].getLocation()).toBe('test.ts:2:37');
    });

    it('parses multiple tags in the same block comment', () => {
      const file = new File(
        'test.ts',
        `
        /**
         * spec(foo.one): one
         * spec(foo.two): two
         */
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toHaveLength(2);

      expect(tags[0].getSpecName()).toBe('foo.one');
      expect(tags[0].getContent()).toBe('one');
      expect(tags[0].getLocation()).toBe('test.ts:3:12');

      expect(tags[1].getSpecName()).toBe('foo.two');
      expect(tags[1].getContent()).toBe('two');
      expect(tags[1].getLocation()).toBe('test.ts:4:12');
    });

    it('ignores irrelevant comment styles', () => {
      const file = new File(
        'test.ts',
        `
        <!-- spec(foo.bar): baz -->
        `,
      );

      const tags = parse('spec', file);

      expect(tags).toBeEmpty();
    });
  });

  describe('styles', () => {
    it('any text', () => {
      const file = new File(
        'test.txt',
        `
        spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.Any]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.txt:2:9');
    });

    it('//', () => {
      const file = new File(
        'test.ts',
        `
        // spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.DoubleSlash]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:2:12');
    });

    it('///', () => {
      const file = new File(
        'test.cs',
        `
        /// spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.TripleSlash]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.cs:2:13');
    });

    it('/* */ (single line)', () => {
      const file = new File(
        'test.ts',
        `
        /* spec(foo.bar): baz */
        `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashSingleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:2:12');
    });

    it('/* */ (multi line)', () => {
      const file = new File(
        'test.ts',
        `
        /*
         * spec(foo.bar): baz
         */
        `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashSingleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:12');
    });

    it('/* */ (multi line, no middle)', () => {
      const file = new File(
        'test.ts',
        `
        /*
        spec(foo.bar): baz
        */
        `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashSingleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:9');
    });

    it('/** */ (single line)', () => {
      const file = new File(
        'test.ts',
        `
        /** spec(foo.bar): baz */
        `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashDoubleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:2:13');
    });

    it('/** */ (multi line)', () => {
      const file = new File(
        'test.ts',
        `
        /**
         * spec(foo.bar): baz
         */
        `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashDoubleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:12');
    });

    it('/** */ (multi line, no middle)', () => {
      const file = new File(
        'test.ts',
        `
      /**
      spec(foo.bar): baz
      */
      `,
      );

      const tags = parse('spec', file, [CommentStyle.SlashDoubleStarBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ts:3:7');
    });

    it('#', () => {
      const file = new File(
        'test.py',
        `
        # spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.Hash]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.py:2:11');
    });

    it("''' (single line)", () => {
      const file = new File(
        'test.py',
        `
        '''spec(foo.bar): baz'''
        `,
      );

      const tags = parse('spec', file, [CommentStyle.TripleSingleQuote]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.py:2:12');
    });

    it("''' (multi line)", () => {
      const file = new File(
        'test.py',
        `
        '''
        spec(foo.bar): baz
        '''
        `,
      );

      const tags = parse('spec', file, [CommentStyle.TripleSingleQuote]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.py:3:9');
    });

    it('""" (single line)', () => {
      const file = new File(
        'test.py',
        `
        """spec(foo.bar): baz"""
        `,
      );

      const tags = parse('spec', file, [CommentStyle.TripleDoubleQuote]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.py:2:12');
    });

    it('""" (multi line)', () => {
      const file = new File(
        'test.py',
        `
        """
        spec(foo.bar): baz
        """
        `,
      );

      const tags = parse('spec', file, [CommentStyle.TripleDoubleQuote]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.py:3:9');
    });

    it('--', () => {
      const file = new File(
        'test.sql',
        `
        -- spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.DoubleDash]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.sql:2:12');
    });

    it('<!-- --> (single line)', () => {
      const file = new File(
        'test.html',
        `
        <!-- spec(foo.bar): baz -->
        `,
      );

      const tags = parse('spec', file, [CommentStyle.AngleBracketBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.html:2:14');
    });

    it('<!-- --> (multi line)', () => {
      const file = new File(
        'test.html',
        `
        <!--
        spec(foo.bar): baz
        -->
        `,
      );

      const tags = parse('spec', file, [CommentStyle.AngleBracketBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.html:3:9');
    });

    it(';', () => {
      const file = new File(
        'test.ini',
        `
        ; spec(foo.bar): baz
        `,
      );

      const tags = parse('spec', file, [CommentStyle.Semicolon]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.ini:2:11');
    });

    it('--[[ ]] (single line)', () => {
      const file = new File(
        'test.lua',
        `
        --[[spec(foo.bar): baz]]
        `,
      );

      const tags = parse('spec', file, [CommentStyle.LuaBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.lua:2:13');
    });

    it('--[[ ]] (multi line)', () => {
      const file = new File(
        'test.lua',
        `
        --[[
        spec(foo.bar): baz
        ]]
        `,
      );

      const tags = parse('spec', file, [CommentStyle.LuaBlock]);

      expect(tags).toHaveLength(1);
      expect(tags[0].getSpecName()).toBe('foo.bar');
      expect(tags[0].getContent()).toBe('baz');
      expect(tags[0].getLocation()).toBe('test.lua:3:9');
    });
  });
});

'use strict';

import test from 'ava';

import objectPathMatcher from '../../src/util/objectPathMatcher'

test('util:objectPathMatcher:createEmpty', t => {
	const service = objectPathMatcher();
	t.falsy(service.obj);
});

test('util:objectPathMatcher:createWithObj', t => {
	const obj = {};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
});

test('util:objectPathMatcher:noMatchEmptyObj', t => {
	const obj = {};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(/foo=bar)'));
});

test('util:objectPathMatcher:simpleMatch', t => {
	const obj = {foo:'bar'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/foo=bar)'));
});

test('util:objectPathMatcher:simpleNoMatchingProp', t => {
	const obj = {foo:'bar'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(/bar=bam)'));
});

test('util:objectPathMatcher:simpleNoMatchingProp', t => {
	const obj = {foo:{bim:{bam:'baz'}}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(/foo/bim/no=bam)'));
});

test('util:objectPathMatcher:singleAndMatch', t => {
	const obj = {foo:'bar'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(/foo=bar))'));
});

test('util:objectPathMatcher:multiAndMatch', t => {
	const obj = {foo:'bar', ping:'pong'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(/foo=bar)(ping=pong)'));
});

test('util:objectPathMatcher:multiAndNoMatch', t => {
	const obj = {foo:'bar', ping:'pong'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(&(/foo=NO)(ping=pong)'));
	t.false(service.matches('(&(/foo=bar)(ping=NO)'));
});

test('util:objectPathMatcher:nestedPathMultiAndMatch', t => {
	const obj = {foo:{ping:'pong'}, bam:'mab'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(/foo/ping=pong)(/bam=mab)'));
});

test('util:objectPathMatcher:nestedPathMultiAndNoMatch', t => {
	const obj = {foo:{ping:'pong'}, bam:'mab'};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(&(/foo/ping=pong)(/bam=NO)'));
	t.false(service.matches('(&(/foo/ping=NO)(/bam=mab)'));
});

test('util:objectPathMatcher:wildPathMatch', t => {
	const obj = {foo:{a:'boo', b:'bar', c:'nah'}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/foo/*=boo)'));
	t.true(service.matches('(/foo/*=bar)'));
	t.true(service.matches('(/foo/*=nah)'));
	t.false(service.matches('(/foo/*=NO)'));
});

test('util:objectPathMatcher:wildPathMatchWithAnd', t => {
	const obj = {foo:{a:'boo', b:'bar', c:'nah'}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(/foo/*=boo)(/foo/*=bar)(/foo/*=nah))'));
	t.false(service.matches('(&(/foo/*=boo)(/foo/*=bar)(/foo/*=NO))'));
});

test('util:objectPathMatcher:wildPathMatchWithOr', t => {
	const obj = {foo:{a:'boo', b:'bar', c:'nah'}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(|(/foo/*=NO)(/foo/*=bar)(/foo/*=NOPE))'));
	t.false(service.matches('(|(/foo/*=NO)(/foo/*=NADDA)(/foo/*=NOPE))'));
});

test('util:objectPathMatcher:anyPathWildMatch', t => {
	const obj = {foo:{a:{foo:'boo'}, b:{foo:'bar'}, c:{foo:'nah'}}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/**/foo=boo)'));
	t.true(service.matches('(/**/foo=bar)'));
	t.true(service.matches('(/**/foo=nah)'));
	t.false(service.matches('(/**/foo=NO)'));
});

test('util:objectPathMatcher:anyPathWildAndWildMatch', t => {
	const obj = {foo:{a:{foo:'boo'}, b:{foo:'bar'}, c:{foo:'nah'}}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/**/*=boo)'));
	t.true(service.matches('(/**/*=bar)'));
	t.true(service.matches('(/**/*=nah)'));
	t.false(service.matches('(/**/*=NO)'));
});

test('util:objectPathMatcher:andWithNestedOr', t => {
	const obj = {boo:'ya', foo:{a:{foo:'boo', bim:'bam'}, b:{foo:'bar'}, c:{foo:'nah'}}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(|(/foo/a/bim=bam)(/boo=NO))(/foo/c/foo=nah))'));
	t.true(service.matches('(&(|(/foo/a/bim=NO)(/boo=ya))(/foo/c/foo=nah))'));
	t.false(service.matches('(&(|(/foo/a/bim=NO)(/boo=NOPE))(/foo/c/foo=nah))'));
	t.false(service.matches('(&(|(/foo/a/bim=bam)(/boo=NO))(/foo/c/foo=NO))'));
});

test('util:objectPathMatcher:andWithNestedOrNestedAnd', t => {
	const obj = {boo:'ya', foo:{a:{foo:'boo', bim:'bam'}, b:{foo:'bar'}, c:{foo:'nah'}}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(|(/foo/a/bim=NO)(&(/boo=ya)(/foo/a/foo=boo)))(/foo/c/foo=nah))'));
	t.false(service.matches('(&(|(/foo/a/bim=NO)(&(/boo=ya)(/foo/a/foo=NO)))(/foo/c/foo=nah))'));
	t.false(service.matches('(&(|(/foo/a/bim=NO)(&(/boo=ya)(/foo/a/foo=boo)))(/foo/c/foo=NO))'));
});

test('util:objectPathMatcher:arrayMatchSingle', t => {
	const obj = {foo:['one', 'two', 'three']};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/foo=one)'));
	t.true(service.matches('(/foo=two)'));
	t.true(service.matches('(/foo=three)'));
	t.false(service.matches('(/foo=NO)'));
});

test('util:objectPathMatcher:arrayMatchNested', t => {
	const obj = {foo:{bar:['one', 'two', 'three']}};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(/foo/bar=one)'));
	t.true(service.matches('(/foo/bar=two)'));
	t.true(service.matches('(/foo/bar=three)'));
	t.false(service.matches('(/foo/bar=NO)'));
});

test('util:objectPathMatcher:arrayTryWalk', t => {
	const obj = {foo:['one', 'two', 'three']};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.false(service.matches('(/foo/bar=one)'));
});

test('util:objectPathMatcher:arrayMatchAnd', t => {
	const obj = {foo:['one', 'two', 'three']};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(&(/foo=one)(/foo=two))'));
	t.true(service.matches('(&(/foo=one)(/foo=two)(/foo=three))'));
	t.false(service.matches('(&(/foo=one)(/foo=NO)(/foo=three))'));
});

test('util:objectPathMatcher:arrayMatchOr', t => {
	const obj = {foo:['one', 'two', 'three']};
	const service = objectPathMatcher(obj);
	t.is(service.obj, obj);
	t.true(service.matches('(|(/foo=A)(/foo=two))'));
	t.true(service.matches('(|(/foo=A)(/foo=two)(/foo=three))'));
	t.false(service.matches('(|(/foo=A)(/foo=B)(/foo=C))'));
});

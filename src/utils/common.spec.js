import { vi } from 'node_modules/vitest/dist/index';

import { pick, debounce } from './common';

describe('pick util 단위테스트', () => {
  it('단일 인자로 전달된 키의 값을 객체에 담아 반환한다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj, 'a')).toEqual({ a: 'A' });
  });

  it('2개 이상의 인자로 전달된 키의 값을 객체에 담아 반환한다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj, 'a', 'b')).toEqual({ a: 'A', b: { c: 'C' } });
  });

  it('대상 객체로 아무 것도 전달 하지 않을 경우 빈 객체가 반환된다', () => {
    expect(pick()).toEqual({});
  });

  it('propNames를 지정하지 않을 경우 빈 객체가 반환된다', () => {
    const obj = {
      a: 'A',
      b: { c: 'C' },
      d: null,
    };

    expect(pick(obj)).toEqual({});
  });
});

describe('debounce', () => {
  // 타이머 모킹 -> 0.3초 흐른 것으로 타이머 조작 -> spy 함수 호출 확인
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-18'));
  });
  afterEach(() => {
    // teardown에서 모킹 초기화 -> 다른 테스트에 영향이 없어야 함.
    // 3rd 파티 라이브러리, 전역의 teardown에서 타이머에 의존하는 로직 -> fakeTimer로 인해 제대로 동작하지 않음.
    vi.useRealTimers();
  });

  // 테스트 코드는 비동기 타이머와 무관하게 동기적으로 실행
  // -> 비동기 함수가 실행되기 전 단언이 실행 됨.
  // 타이머 모킹!
  it('특정 시간이 지난 후 함수가 호출된다', () => {
    const spy = vi.fn();
    const debounceFn = debounce(spy, 300);
    debounceFn();

    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalled();
  });

  it('연이어 호출해도 마지막 호출 기준으로 지정된 타이머 시간이 지난 경우에만 함수가 호출된다.', () => {
    const spy = vi.fn();
    const debounceFn = debounce(spy, 300);

    // 최초 호출
    debounceFn();

    // 최초 호출 후 0.2초 후 호출
    vi.advanceTimersByTime(200);
    debounceFn();

    // 두 번째 호출 후 0.1초 후 호출
    vi.advanceTimersByTime(100);
    debounceFn();

    // 세 번째 호출 후 0.2초 후 호출
    vi.advanceTimersByTime(200);
    debounceFn();

    // 네 번째 호출 후 0.3초 후 호출
    vi.advanceTimersByTime(300);
    debounceFn();

    // 다섯번을 호출했지만, 실제 spy함수는 단 한번만 호출
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

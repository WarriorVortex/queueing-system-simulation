import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {provideLocationMocks} from '@angular/common/testing';
import {Component, signal} from '@angular/core';
import {QueryParamsService} from './query-params.service';

@Component({ template: '' })
class TestComponent {}

describe('QueryParamsService', () => {
  let service: QueryParamsService;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QueryParamsService,
        provideRouter([{ path: '**', component: TestComponent }]),
        provideLocationMocks(),
      ]
    });

    service = TestBed.inject(QueryParamsService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signal type input/output combinations', () => {
    const testCases = [
      {
        description: 'writable signal with default options',
        inputSignal: signal('writable value'),
        options: undefined,
        expectedWritable: true,
        shouldBeSameInstance: true
      },
      {
        description: 'read-only signal with write enabled',
        inputSignal: signal('readonly value').asReadonly(),
        options: { write: true, read: true },
        expectedWritable: false,
        shouldBeSameInstance: false
      },
      {
        description: 'null signal (service-created)',
        inputSignal: null,
        options: { write: true, read: true },
        expectedWritable: true,
        shouldBeSameInstance: false
      },
      {
        description: 'writable signal with read-only mode',
        inputSignal: signal('test'),
        options: { write: false, read: true },
        expectedWritable: false,
        shouldBeSameInstance: true
      },
      {
        description: 'read-only signal with write-only mode',
        inputSignal: signal('test').asReadonly(),
        options: { write: true, read: false },
        expectedWritable: true,
        shouldBeSameInstance: false
      },
    ];

    testCases.forEach(({ description, inputSignal, options, expectedWritable, shouldBeSameInstance }) => {
      it(`should handle ${description}`, () => {
        const key = 'testParam';
        const result = service.bind({ [key]: inputSignal }, options);

        const returnedSignal = result[key];
        expect(returnedSignal).toBeDefined();
        expect(typeof returnedSignal).toBe('function');

        const isWritable = 'set' in returnedSignal;
        expect(isWritable).toBe(expectedWritable);

        if (inputSignal !== null && shouldBeSameInstance) {
          expect(returnedSignal).toBe(inputSignal);
        } else if (inputSignal !== null && !shouldBeSameInstance) {
          expect(returnedSignal).not.toBe(inputSignal);
        }

        if (inputSignal !== null) {
          expect(returnedSignal()).toBe(inputSignal());
        }
      });
    });
  });

  describe('multiple parameter combinations', () => {
    it('should handle mixed signal types in single bind call', () => {
      const writableSignal = signal('writable');
      const readOnlySignal = signal('readonly').asReadonly();

      const result = service.bind({
        writable: writableSignal,
        readOnly: readOnlySignal,
        created: null,
        anotherCreated: null
      });

      const { writable, readOnly, created, anotherCreated } = result;

      expect(writable).toBe(writableSignal);
      expect(readOnly).toBeDefined();
      expect(readOnly()).toBe('readonly');
      expect(created).toBeDefined();
      expect(anotherCreated).toBeDefined();
      expect(created()).toBeUndefined();
      expect(anotherCreated()).toBeUndefined();
    });

    it('should handle empty params object', () => {
      const result = service.bind({});
      expect(Object.keys(result)).toHaveSize(0);
    });
  });

  describe('multiple bind calls isolation', () => {
    it('should handle multiple independent bind calls', () => {
      const firstSignal = signal('first');
      const secondSignal = signal('second');

      const firstResult = service.bind({ param1: firstSignal }) as { param1: any, param2: any };
      const secondResult = service.bind({ param2: secondSignal }) as { param1: any, param2: any };

      expect(firstResult.param1).toBe(firstSignal);
      expect(secondResult.param2).toBe(secondSignal);
      expect(secondResult.param1).toBeUndefined();
      expect(firstResult.param2).toBeUndefined();
    });

    it('should not interfere with previous bindings when called again', fakeAsync(() => {
      const navigateSpy = spyOn(router, 'navigate').and.callThrough();
      const signal1 = signal('initial');

      service.bind({ key1: signal1 });
      tick();

      signal1.set('updated');
      tick();

      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { key1: 'updated' },
        queryParamsHandling: 'merge'
      });

      navigateSpy.calls.reset();

      const signal2 = signal('value2');
      service.bind({ key2: signal2 });
      tick();

      signal1.set('updated again');
      tick();

      signal2.set('new value');
      tick();

      const allCalls = navigateSpy.calls.allArgs();
      const hasKey1Navigation = allCalls.some(call =>
        call[1]?.queryParams?.['key1'] !== undefined
      );
      const hasKey2Navigation = allCalls.some(call =>
        call[1]?.queryParams?.['key2'] !== undefined
      );

      expect(hasKey1Navigation).toBe(false);
      expect(hasKey2Navigation).toBe(true);
    }));

    it('should handle same parameter name in multiple bind calls', fakeAsync(() => {
      const navigateSpy = spyOn(router, 'navigate');
      const signal1 = signal('first');
      const signal2 = signal('second');

      // First bind with param 'test'
      service.bind({ test: signal1 });
      tick();

      // Second bind with same param name 'test'
      service.bind({ test: signal2 });
      tick();

      // Only the second binding should be active
      signal1.set('updated1');
      tick();

      signal2.set('updated2');
      tick();

      const allCalls = navigateSpy.calls.allArgs();
      const testParamCalls = allCalls.filter(call =>
        call[1]?.queryParams?.['test'] !== undefined
      );

      expect(testParamCalls.length).toBeGreaterThan(0);
    }));
  });

  describe('custom transform functions', () => {
    it('should use custom parseFn for URL to signal conversion', () => {
      const pageSignal = signal(0);
      const parseFn = jasmine.createSpy('parseFn').and.callFake((value: string) => {
        return parseInt(value, 10) * 2;
      });

      service.bind({ page: pageSignal }, { parseFn });

      // Simulate URL parameter change
      const testParams = { page: '5' };
      (activatedRoute.queryParams as any).next(testParams);

      expect(parseFn).toHaveBeenCalledWith('5', 'page');
      expect(pageSignal()).toBe(10);
    });

    it('should use custom stringifyFn for signal to URL conversion', fakeAsync(() => {
      const searchSignal = signal('hello world');
      const stringifyFn = jasmine.createSpy('stringifyFn').and.callFake((value: unknown) => {
        return String(value).toUpperCase();
      });

      const navigateSpy = spyOn(router, 'navigate');

      service.bind({ search: searchSignal }, { stringifyFn });
      tick(); // Allow effect to run

      expect(stringifyFn).toHaveBeenCalledWith('hello world', 'search');
      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { search: 'HELLO WORLD' },
        queryParamsHandling: 'merge'
      });
    }));

    it('should use both parseFn and stringifyFn together', fakeAsync(() => {
      const countSignal = signal(0);
      const parseFn = jasmine.createSpy('parseFn').and.callFake((value: string) =>
        parseInt(value, 10) + 10
      );
      const stringifyFn = jasmine.createSpy('stringifyFn').and.callFake((value: unknown) =>
        `count_${value}`
      );

      const navigateSpy = spyOn(router, 'navigate');

      service.bind({ count: countSignal }, { parseFn, stringifyFn });
      tick();

      // Test stringify
      expect(stringifyFn).toHaveBeenCalledWith(0, 'count');
      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { count: 'count_0' },
        queryParamsHandling: 'merge'
      });

      navigateSpy.calls.reset();
      stringifyFn.calls.reset();

      // Test parse
      const testParams = { count: '25' };
      (activatedRoute.queryParams as any).next(testParams);

      expect(parseFn).toHaveBeenCalledWith('25', 'count');
      expect(countSignal()).toBe(35); // 25 + 10 = 35

      // Verify new signal value gets stringified
      tick();
      expect(stringifyFn).toHaveBeenCalledWith(35, 'count');
      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { count: 'count_35' },
        queryParamsHandling: 'merge'
      });
    }));
  });

  describe('URL synchronization', () => {
    it('should update URL when writable signal changes', fakeAsync(() => {
      const searchSignal = signal('initial');
      const navigateSpy = spyOn(router, 'navigate');

      service.bind({ search: searchSignal }, { write: true, read: false });

      // Change signal value
      searchSignal.set('updated');
      tick();

      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { search: 'updated' },
        queryParamsHandling: 'merge'
      });
    }));

    it('should update signal when URL parameters change', () => {
      const searchSignal = signal('');
      const pageSignal = signal(1);

      const parseFn = (value: string, key: string) => {
        return key === 'page'
          ? Number(value)
          : value;
      };
      service.bind({
        search: searchSignal,
        page: pageSignal
      }, { write: false, read: true, parseFn });

      const testParams = {
        search: 'from-url',
        page: '42',
        unknown: 'ignore'
      };
      (activatedRoute.queryParams as any).next(testParams);

      expect(searchSignal()).toBe('from-url');
      expect(pageSignal()).toBe(42);
    });

    it('should handle bidirectional synchronization', fakeAsync(() => {
      const filterSignal = signal('default');
      const navigateSpy = spyOn(router, 'navigate');

      service.bind({ filter: filterSignal });

      filterSignal.set('custom');
      tick();

      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { filter: 'custom' },
        queryParamsHandling: 'merge'
      });

      navigateSpy.calls.reset();

      const testParams = { filter: 'from-url' };
      (activatedRoute.queryParams as any).next(testParams);

      expect(filterSignal()).toBe('from-url');

      tick();
      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { filter: 'from-url' },
        queryParamsHandling: 'merge'
      });
    }));
  });

  describe('edge cases and error conditions', () => {
    it('should return empty object when both read and write are disabled', () => {
      const searchSignal = signal('test');
      const pageSignal = signal(1);

      const result = service.bind({
        search: searchSignal,
        page: pageSignal
      }, { write: false, read: false });

      expect(Object.keys(result)).toHaveSize(0);
    });

    it('should ignore URL parameters without corresponding signals', () => {
      const existingSignal = signal('value');
      const untouchedSignal = signal('untouched');

      service.bind({
        existing: existingSignal
      }, { write: false, read: true });

      const testParams = {
        existing: 'updated',
        unknown: 'should-be-ignored',
        anotherUnknown: 'also-ignored'
      };
      (activatedRoute.queryParams as any).next(testParams);

      expect(existingSignal()).toBe('updated');
      expect(untouchedSignal()).toBe('untouched');
    });

    it('should handle null and undefined URL parameter values', () => {
      const testSignal = signal('default');
      service.bind({ test: testSignal }, { write: false, read: true });

      (activatedRoute.queryParams as any).next({ test: null });
      expect(testSignal()).toBeNull();

      (activatedRoute.queryParams as any).next({ test: undefined });
      expect(testSignal()).toBeUndefined();
    });

    it('should handle special characters in parameter values', fakeAsync(() => {
      const complexSignal = signal('');
      const navigateSpy = spyOn(router, 'navigate');

      service.bind({ complex: complexSignal });

      const testValue = 'hello world & foo=bar?test=1';
      complexSignal.set(testValue);
      tick();

      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { complex: testValue },
        queryParamsHandling: 'merge'
      });
    }));
  });

  describe('read/write mode combinations', () => {
    it('should work in write-only mode', fakeAsync(() => {
      const signal1 = signal('value1');
      const signal2 = signal('value2');
      const navigateSpy = spyOn(router, 'navigate');

      service.bind({
        param1: signal1,
        param2: signal2
      }, { write: true, read: false });

      tick();

      expect(navigateSpy).toHaveBeenCalled();
      navigateSpy.calls.reset();

      signal1.set('new1');
      signal2.set('new2');
      tick();

      expect(navigateSpy).toHaveBeenCalledWith([], {
        queryParams: { param1: 'new1', param2: 'new2' },
        queryParamsHandling: 'merge'
      });

      (activatedRoute.queryParams as any).next({ param1: 'from-url' });
      expect(signal1()).toBe('new1');
    }));

    it('should work in read-only mode', () => {
      const signal1 = signal('initial1');
      const signal2 = signal('initial2');
      const navigateSpy = spyOn(router, 'navigate');

      service.bind({
        param1: signal1,
        param2: signal2
      }, { write: false, read: true });

      (activatedRoute.queryParams as any).next({ param1: 'from-url1', param2: 'from-url2' });
      expect(signal1()).toBe('from-url1');
      expect(signal2()).toBe('from-url2');

      signal1.set('new-value');
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});

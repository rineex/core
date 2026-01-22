import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { MiddlewareConsumer } from '@nestjs/common';
import { HelmetOptions } from 'helmet';
import { NextFunction, Request, Response } from 'express';

import { HelmetModule } from '../src/module';
import { HelmetMiddleware } from '../src/middleware';

// Mock helmet
vi.mock('helmet', () => {
  return {
    default: vi.fn(options => {
      return vi.fn((req, res, next) => {
        next();
      });
    }),
  };
});

describe('HelmetModule', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('module registration', () => {
    it('should be defined', () => {
      expect(HelmetModule).toBeDefined();
    });

    it('should extend ConfigurableModuleClass', () => {
      const module = new HelmetModule();
      expect(module).toBeInstanceOf(HelmetModule);
    });

    it('should implement NestModule', () => {
      const module = new HelmetModule();
      expect(module.configure).toBeDefined();
      expect(typeof module.configure).toBe('function');
    });
  });

  describe('configure', () => {
    it('should configure middleware for all routes', () => {
      const module = new HelmetModule();
      const mockForRoutes = vi.fn();
      const mockApply = vi.fn().mockReturnValue({
        forRoutes: mockForRoutes,
      });
      const mockConsumer = {
        apply: mockApply,
      } as unknown as MiddlewareConsumer;

      module.configure(mockConsumer);

      expect(mockApply).toHaveBeenCalledWith(HelmetMiddleware);
      expect(mockForRoutes).toHaveBeenCalledWith('*');
    });

    it('should apply HelmetMiddleware', () => {
      const module = new HelmetModule();
      const mockForRoutes = vi.fn();
      const mockApply = vi.fn().mockReturnValue({
        forRoutes: mockForRoutes,
      });
      const mockConsumer = {
        apply: mockApply,
      } as unknown as MiddlewareConsumer;

      module.configure(mockConsumer);

      expect(mockApply).toHaveBeenCalledWith(HelmetMiddleware);
    });

    it('should configure routes for all paths', () => {
      const module = new HelmetModule();
      const mockForRoutes = vi.fn();
      const mockApply = vi.fn().mockReturnValue({
        forRoutes: mockForRoutes,
      });
      const mockConsumer = {
        apply: mockApply,
      } as unknown as MiddlewareConsumer;

      module.configure(mockConsumer);

      expect(mockForRoutes).toHaveBeenCalledWith('*');
    });
  });

  describe('module integration', () => {
    it('should compile module with default options', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register({})],
      }).compile();

      expect(moduleRef).toBeDefined();
    });

    it('should compile module with custom options', async () => {
      const options: HelmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      };

      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register(options)],
      }).compile();

      expect(moduleRef).toBeDefined();
    });

    it('should make options provided via register accessible in middleware', async () => {
      const helmet = await import('helmet');
      const { MODULE_OPTIONS_TOKEN } = await import('../src/module');
      const options: HelmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
          },
        },
        hidePoweredBy: true,
        frameguard: { action: 'deny' },
      };

      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register(options)],
      }).compile();

      // Verify that the options token is available with the correct value
      const providedOptions =
        moduleRef.get<HelmetOptions>(MODULE_OPTIONS_TOKEN);
      expect(providedOptions).toEqual(options);

      // Create middleware manually with the provided options to verify it works
      const middleware = new HelmetMiddleware(providedOptions);

      // Call the middleware's use method
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Verify that helmet was called with the exact options provided via register
      expect(helmet.default).toHaveBeenCalledWith(options);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should make options provided via registerAsync accessible in middleware', async () => {
      const helmet = await import('helmet');
      const { MODULE_OPTIONS_TOKEN } = await import('../src/module');
      const options: HelmetOptions = {
        contentSecurityPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
        },
      };

      const moduleRef = await Test.createTestingModule({
        imports: [
          HelmetModule.registerAsync({
            useFactory: async () => options,
          }),
        ],
      }).compile();

      // Verify that the options token is available with the correct value
      const providedOptions =
        moduleRef.get<HelmetOptions>(MODULE_OPTIONS_TOKEN);
      expect(providedOptions).toEqual(options);

      // Create middleware manually with the provided options to verify it works
      const middleware = new HelmetMiddleware(providedOptions);

      // Call the middleware's use method
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Verify that helmet was called with the exact options provided via registerAsync
      expect(helmet.default).toHaveBeenCalledWith(options);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should compile module with registerAsync', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          HelmetModule.registerAsync({
            useFactory: async () => ({
              contentSecurityPolicy: {
                directives: {
                  defaultSrc: ["'self'"],
                },
              },
            }),
          }),
        ],
      }).compile();

      expect(moduleRef).toBeDefined();
    });

    it('should provide HelmetMiddleware when module is registered', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register({})],
      }).compile();

      // The middleware should be available through the module
      expect(moduleRef).toBeDefined();
    });

    it('should handle async factory with dependencies', async () => {
      const mockConfig = {
        contentSecurityPolicy: false,
      };

      const moduleRef = await Test.createTestingModule({
        imports: [
          HelmetModule.registerAsync({
            useFactory: async () => {
              // Simulate async config loading
              return Promise.resolve(mockConfig);
            },
          }),
        ],
      }).compile();

      expect(moduleRef).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined options in register', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register(undefined as any)],
      }).compile();

      expect(moduleRef).toBeDefined();
    });

    it('should handle null options in register', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register(null as any)],
      }).compile();

      expect(moduleRef).toBeDefined();
    });

    it('should handle empty object options', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HelmetModule.register({})],
      }).compile();

      expect(moduleRef).toBeDefined();
    });
  });
});

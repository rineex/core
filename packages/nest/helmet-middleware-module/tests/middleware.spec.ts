import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NextFunction, Request, Response } from 'express';
import { HelmetOptions } from 'helmet';

import { HelmetMiddleware } from '../src/middleware';
import { MODULE_OPTIONS_TOKEN } from '../src/module';

// Mock helmet
vi.mock('helmet', () => {
  return {
    default: vi.fn((options) => {
      return vi.fn((req, res, next) => {
        next();
      });
    }),
  };
});

describe('HelmetMiddleware', () => {
  let middleware: HelmetMiddleware;
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

  describe('constructor', () => {
    it('should create middleware instance with default options', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: {},
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      expect(middleware).toBeInstanceOf(HelmetMiddleware);
    });

    it('should create middleware instance with custom options', async () => {
      const customOptions: HelmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: customOptions,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      expect(middleware).toBeInstanceOf(HelmetMiddleware);
    });
  });

  describe('use', () => {
    it('should call helmet middleware with provided options', async () => {
      const helmet = await import('helmet');
      const options: HelmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: options,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(helmet.default).toHaveBeenCalledWith(options);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call helmet middleware with empty options', async () => {
      const helmet = await import('helmet');
      const options: HelmetOptions = {};

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: options,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(helmet.default).toHaveBeenCalledWith(options);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call helmet middleware with undefined options', async () => {
      const helmet = await import('helmet');

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: undefined,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(helmet.default).toHaveBeenCalledWith(undefined);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass request, response, and next to helmet middleware', async () => {
      const helmet = await import('helmet');
      const options: HelmetOptions = {};

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: options,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Verify helmet was called and returned a middleware function
      expect(helmet.default).toHaveBeenCalled();
      const helmetMiddleware = helmet.default(options);
      expect(typeof helmetMiddleware).toBe('function');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle complex helmet options', async () => {
      const helmet = await import('helmet');
      const complexOptions: HelmetOptions = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        dnsPrefetchControl: { allow: true },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: { policy: 'no-referrer' },
        xssFilter: true,
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: complexOptions,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(helmet.default).toHaveBeenCalledWith(complexOptions);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle multiple consecutive calls', async () => {
      const helmet = await import('helmet');
      const options: HelmetOptions = {};

      const moduleRef = await Test.createTestingModule({
        providers: [
          HelmetMiddleware,
          {
            provide: MODULE_OPTIONS_TOKEN,
            useValue: options,
          },
        ],
      }).compile();

      middleware = moduleRef.get<HelmetMiddleware>(HelmetMiddleware);

      // First call
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Second call
      const mockNext2 = vi.fn();
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext2,
      );

      expect(helmet.default).toHaveBeenCalledTimes(2);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext2).toHaveBeenCalled();
    });
  });
});

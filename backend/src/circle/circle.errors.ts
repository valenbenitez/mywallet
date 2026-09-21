import { BadGatewayException, HttpException } from '@nestjs/common';

function extractCircleMessage(error: unknown): string {
  if (isAxiosLike(error)) {
    const data = error.response?.data;
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string' &&
      data.message.length > 0
    ) {
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Upstream Circle request failed';
}

function isAxiosLike(
  error: unknown,
): error is { message?: string; response?: { data?: unknown } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

/**
 * Maps Circle SDK / HTTP failures to Nest exceptions.
 * Secrets must never appear in messages.
 */
export function mapCircleError(error: unknown): never {
  if (error instanceof HttpException) {
    throw error;
  }

  const message = extractCircleMessage(error);
  throw new BadGatewayException({
    statusCode: 502,
    error: 'Bad Gateway',
    message: `Circle upstream error: ${message}`,
  });
}

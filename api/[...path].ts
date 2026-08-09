export const maxDuration = 60;

export default async function handler(request: any, response: any) {
  try {
    const { default: app } = await import('../backend');
    return app(request, response);
  } catch (error) {
    console.error('DOCWISE_API_BOOT_FAILED', error);
    return response.status(500).json({
      status: 'error',
      code: 'API_BOOT_FAILED',
      message: error instanceof Error ? error.message : 'The API failed to initialize.',
    });
  }
}

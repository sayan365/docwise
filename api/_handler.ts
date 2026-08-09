export async function handleApiRequest(request: any, response: any) {
  try {
    const { default: app } = await import('./_backend');
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      response.once('finish', finish);
      response.once('close', finish);
      (app as any)(request, response, (error?: unknown) => {
        if (error) {
          reject(error);
        } else if (!response.headersSent) {
          response.status(404).json({ error: 'API route not found' });
        }
      });
    });
  } catch (error) {
    console.error('DOCWISE_API_BOOT_FAILED', error);
    if (!response.headersSent) {
      return response.status(500).json({
        status: 'error',
        code: 'API_BOOT_FAILED',
        message: error instanceof Error ? error.message : 'The API failed to initialize.',
      });
    }
    response.end();
  }
}

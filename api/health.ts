export const maxDuration = 10;

export default function healthHandler(_request: any, response: any) {
  return response.status(200).json({
    status: 'ok',
    service: 'DocWise',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    runtime: 'vercel',
  });
}

import { handleApiRequest } from './_handler';

export const maxDuration = 60;
export default function handler(request: any, response: any) {
  return handleApiRequest(request, response);
}

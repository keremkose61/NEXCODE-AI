import http from 'http';

export function makeHttpRequest<T>(
  options: http.RequestOptions,
  postData?: any
): Promise<{ success: boolean; data?: T; status?: number; error?: string }> {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: parsed });
        } catch {
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: body as any });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Request timed out' });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

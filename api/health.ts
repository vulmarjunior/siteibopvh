export default function handler(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  return res.status(200).json({ status: 'ok', message: 'IBO API is running' });
}

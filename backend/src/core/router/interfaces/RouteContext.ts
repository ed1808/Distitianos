export interface RouteContext {
  req: Request;
  params: Record<string, string>;
  url: URL;
  query: Record<string, string>;
  [key: string]: any;
}

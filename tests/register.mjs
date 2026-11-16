// Lets Node run the app's TypeScript files directly in tests: relative imports
// in src/ are written without extensions ("./utils"), so try "<path>.ts"; JSON imports get the
// import attribute Node wants.
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (specifier.startsWith('.') && !/\\.[cm]?[jt]sx?$/.test(specifier)) {
            return next(specifier + '.ts', context);
          }
          throw err;
        }
      }
      // The app imports JSON the bundler way (no "with { type: 'json' }"): add that for Node.
      export async function load(url, context, next) {
        if (url.endsWith('.json')) return next(url, { ...context, importAttributes: { ...context.importAttributes, type: 'json' } });
        return next(url, context);
      }
    `),
  import.meta.url,
);

// Lets Node run the app's TypeScript files directly in tests: relative imports
// in src/ are written without extensions ("./utils"), so try "<path>.ts".
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
    `),
  import.meta.url,
);

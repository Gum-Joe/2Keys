# Development notes
## Compiling
- Do not compile on a per project bases
- Instead, run one command from the root to build everything: `yarn build` (use `yarn build -v` to get logged output)
- To watch files: `yarn watch`
- To clean all `lib` files and then build from scratch: `yarn clean`

## Testing
- To test everything: `yarn workspaces run test`	
- To run all tests together, excluding those in `@twokeys/server`: `yarn test:all`
- To get coverage per package: `yarn workspaces run coverage`

## Adding monorepo dependencies
Say I want to add `@twokeys/addons` to the package `@twokeys/common-hi` (assuming both are in the `packages` dir):@
1. Add `"@twokeys/addons": "^1.0.0"` as an entry to `common-hi`'s `package.json
2. Add a TS reference.  Under `references` in `commom-hi`'s `tsconfig.json` add this: ```json
{
	"path": "../addons",
	"prepend": false
}
	1. This way, when `common-hi` is compiled `addons` is automatically compiled first

## Creating a new package
1. Copy the contents of `misc/template` to a new package dir (e.g `package/@twokeys/a-package`)
2. Change the package name and description in `package.json` and `README.md`
3. In the package's `tsconfig.json` under the `tsBuildInfoFile` entry, change `package` to whatever the name of the package (minus the scope) is, e.g `"tsBuildInfoFile": "../../../.build-cache/a-package.tsbuildinfo"`
4. Add a new references under `tsconfig.json` in the __root__ of the repo to the package path, e.g { "path": "./packages/@twokeys/a-package", "prepend": false }
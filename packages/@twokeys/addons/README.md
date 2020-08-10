# @twokeys/addons
Contains code for the management of add-ons in 2Keys.

The way this works is by having a central registry that indexes installed add-ons (which are installed via `npm`) and the software that goes with them (such as AHK; this is set by add-ons themselves).
The code for managing the registry is stored in `src/registry.ts` and `src/software.ts` and `src/software-query-provider.ts`.

Also this package contains the definitons of what function should be exported per add-on type; see `src/module-interfaces`.
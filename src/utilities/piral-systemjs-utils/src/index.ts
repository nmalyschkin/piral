import { isfunc, Pilet } from 'piral-base';
import { PiletMetadata, extendSharedDependencies, AvailableDependencies } from 'piral-core';
import { getImportMaps, convertToMetadata, appendImportMaps } from './utils';

/**
 * Feeds the existing shared dependencies into SystemJS
 * for further use in the SystemJS powered pilets.
 * @param additionalDependencies More dependencies to register, if any.
 */
export function registerSharedDependencies(additionalDependencies: AvailableDependencies = {}) {
  const deps = extendSharedDependencies(additionalDependencies)();
  const depNames = Object.keys(deps);
  appendImportMaps(
    depNames.reduce((prev, name) => {
      prev[name] = `app:${name}`;
      return prev;
    }, {}),
  );
  depNames.forEach(name => {
    System.set(`app:${name}`, deps[name]);
  });
}

/**
 * Resolves a pilet from the given metadata using SystemJS.
 * The pilet must have been derived from the import maps.
 * @param meta The pilet's metadata.
 */
export function loadPilet(meta: PiletMetadata): Promise<Pilet> {
  return System.import(meta.name)
    .catch(err => {
      console.error('Could not load the pilet.', meta, err);
      return {};
    })
    .then(moduleContent => ({
      ...meta,
      ...moduleContent,
    }))
    .then((pilet: Pilet) => {
      if (!isfunc(pilet.setup)) {
        pilet.setup = () => {};
      }

      return pilet;
    });
}

/**
 * Resolves the pilets from the specified import maps.
 * Note that here all modules from the import maps are considered pilets.
 */
export function requestPilets(): Promise<Array<PiletMetadata>> {
  return (System as any)
    .prepareImport()
    .then(getImportMaps)
    .then(convertToMetadata);
}

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface ClientSideProjectsMap {
  /**
   * Contains information about what this config is for
   */
  twokeys: {
    /**
     * Version of 2Keys
     */
    version: string;
    /**
     * Tells us this is a PROJECT_MAP config.  PROJECT_MAP must be given for this value so we know we are parsing the right config
     */
    type: "PROJECT_MAP";
    /**
     * Tells us who created this config: CONTROLLER means server side, DETECTOR means the detector that runs on the client created this config
     */
    createdBy: "CONTROLLER" | "DETECTOR";
  };
  /**
   * Contains a map of project UUIDs to directories on the detectpr
   */
  projects: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^.*$".
     */
    [k: string]: {
      /**
       * Local path to project, relative to the projects root (which is set in configs/client-side-config)
       */
      localPath: string;
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}
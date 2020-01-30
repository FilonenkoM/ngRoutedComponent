import {
  Rule,
  Tree,
  apply,
  url,
  move,
  chain,
  mergeWith,
  SchematicsException,
  applyTemplates
} from '@angular-devkit/schematics';
import { RoutedComponentOptions } from './schema';
import { strings, experimental } from '@angular-devkit/core';
import { normalize } from 'path';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function routedComponent(options: RoutedComponentOptions): Rule {
  return (tree: Tree) => {

    const workspaceConfig = tree.read('/angular.json');
    if (!workspaceConfig) {
      throw new SchematicsException('Could not find Angular workspace configuration');
    }
    const workspaceContent = workspaceConfig.toString();
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(workspaceContent);
    if (!options.project) {
      options.project = workspace.defaultProject;
    }
    const projectName = options.project as string;
    const project = workspace.projects[projectName];
    const projectType = project.projectType === 'application' ? 'app' : 'lib';
    if (options.path === undefined) {
      options.path = `${project.sourceRoot}/${projectType}`;
    }
    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name
      }),
      move(normalize(options.path as string))
    ]);
    return chain([
      mergeWith(templateSource)
    ]);
  };
}

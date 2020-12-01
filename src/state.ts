import {workspace, WorkspaceFolder} from "vscode";

import { allProviderClasses, pruner } from '@pruner/cli';
import _ from "lodash";

export async function getNormalizedWorkspacePaths() {
    if(!workspace.workspaceFolders)
        return [];

    
}

export async function getStatesInWorkspace() {
    const allProviderNames = allProviderClasses.map(x => x.name);

    const allStates = await Promise.all(_.flatMap(
        workspace.workspaceFolders || new Array<WorkspaceFolder>(),
        folder => allProviderNames
            .map(async providerName => await pruner.readState(
                providerName, 
                folder.uri.fsPath))));

    return allStates;
}
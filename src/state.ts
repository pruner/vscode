import {workspace, WorkspaceFolder} from "vscode";

import { io, pruner } from '@pruner/cli';
import _ from "lodash";

export async function getNormalizedWorkspacePaths() {
    if(!workspace.workspaceFolders)
        return [];

    
}

export async function getStatesInWorkspace() {
    const settings = pruner.readSettings(folder.uri.fsPath);

    const allStates = await Promise.all(_.flatMap(
        workspace.workspaceFolders || new Array<WorkspaceFolder>(),
        folder => allProviderNames
            .map(async providerName => await pruner.readState(
                providerName, 
                folder.uri.fsPath))));

    return allStates;
}
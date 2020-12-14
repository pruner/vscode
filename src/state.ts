import {workspace, WorkspaceFolder} from "vscode";

import { io, pruner } from '@pruner/cli';
import _ from "lodash";
import { ProviderState } from "@pruner/cli/dist/src/providers/types";

let currentStates: Promise<ProviderState[]> | null = null;

export function resetStateCache() {
    currentStates = null;
}

export async function getStatesInWorkspace() {
    if(currentStates) {
        return await currentStates;
    }

    currentStates = (async () => _.flatMap(
        await Promise.all(_.flatMap(
            workspace.workspaceFolders || new Array<WorkspaceFolder>(),
            async folder => {
                const settings = await pruner.readSettings(folder.uri.fsPath);
                if(!settings) {
                    return [];
                }

                return await Promise.all(settings
                    .providers
                    .map(async provider => 
                        await pruner.readState(provider.id, folder.uri.fsPath)));
            }))))();

    return currentStates;
}